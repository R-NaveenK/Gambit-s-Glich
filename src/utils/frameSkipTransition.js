/**
 * GAMBIT'S GLITCH - Frame Skip Signal-Glitch Transition
 * Handles the ~550ms digital signal interruption exit transition between
 * loading screen and homepage.
 */

import gsap from 'gsap';

/**
 * Executes the Frame Skip signal-glitch transition.
 * 
 * @param {Object} options
 * @param {HTMLElement} options.container - The outgoing loader DOM container (#gg-loader)
 * @param {Function} options.onMountHomepage - Callback to render/mount homepage behind loader
 * @param {Function} options.onComplete - Callback when transition finishes and cleanup completes
 */
export function playFrameSkipTransition({ container, onMountHomepage, onComplete }) {
  // Check prefers-reduced-motion
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || !container) {
    if (onMountHomepage) onMountHomepage();
    cleanupImmediate(container, onComplete);
    return;
  }

  // 1. Mount homepage underneath outgoing screen
  if (onMountHomepage) {
    onMountHomepage();
  }

  const app = document.getElementById('app');
  if (app) {
    app.inert = true;
  }

  // 2. Setup cleanup logic & safety mechanisms
  let isCleanedUp = false;
  let timeline = null;
  let fallbackTimer = null;

  const cleanup = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;

    if (fallbackTimer) clearTimeout(fallbackTimer);
    window.removeEventListener('resize', handleResize);
    if (timeline) timeline.kill();

    // Remove transition overlay layer
    const overlay = document.getElementById('gg-frame-skip-transition');
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
    }

    // Remove original loader container
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }

    // Restore page scrolling and interactivity
    document.documentElement.classList.remove('gg-intro-active');
    document.body.classList.remove('gg-intro-active');

    if (app) {
      app.inert = false;
      app.removeAttribute('aria-hidden');
      app.style.transform = '';
    }

    if (onComplete) onComplete();
  };

  const handleResize = () => {
    cleanup();
  };

  window.addEventListener('resize', handleResize);
  fallbackTimer = setTimeout(cleanup, 750);

  try {
    // 3. Create transition overlay container
    const overlay = document.createElement('div');
    overlay.id = 'gg-frame-skip-transition';
    overlay.className = 'gg-glitch-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.inert = true;

    // 4. Create 4 horizontal bands with vertical clip ranges:
    // Band 1: 0–32%   (inset: 0% 0% 68% 0%)
    // Band 2: 32–48%  (inset: 32% 0% 52% 0%)
    // Band 3: 48–76%  (inset: 48% 0% 24% 0%)
    // Band 4: 76–100% (inset: 76% 0% 0% 0%)
    const bandRanges = [
      { id: 1, clip: 'inset(0% 0% 68% 0%)' },
      { id: 2, clip: 'inset(32% 0% 52% 0%)' },
      { id: 3, clip: 'inset(48% 0% 24% 0%)' },
      { id: 4, clip: 'inset(76% 0% 0% 0%)' },
    ];

    const originalCanvas = container.querySelector('canvas');
    const bandEls = [];

    bandRanges.forEach((range) => {
      const bandWrapper = document.createElement('div');
      bandWrapper.className = `gg-glitch-band gg-glitch-band-${range.id}`;
      bandWrapper.style.clipPath = range.clip;

      // Clone original composition
      const clone = container.cloneNode(true);
      clone.removeAttribute('id');
      clone.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));
      clone.setAttribute('aria-hidden', 'true');
      clone.inert = true;

      // Copy HTML5 Canvas bitmap if present
      const clonedCanvas = clone.querySelector('canvas');
      if (originalCanvas && clonedCanvas) {
        clonedCanvas.width = originalCanvas.width;
        clonedCanvas.height = originalCanvas.height;
        const ctx = clonedCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(originalCanvas, 0, 0);
        }
      }

      bandWrapper.appendChild(clone);
      overlay.appendChild(bandWrapper);
      bandEls.push(bandWrapper);
    });

    // 5. Create up to 3 thin gold interference streaks
    const streaks = [];
    const streakConfigs = [
      { top: '24%', left: '12%', width: '38%', height: '2px', color: '#D8971F' },
      { top: '51%', left: '42%', width: '46%', height: '1.5px', color: '#DCBC58' },
      { top: '78%', left: '20%', width: '34%', height: '2px', color: '#D8971F' },
    ];

    streakConfigs.forEach((cfg) => {
      const streak = document.createElement('div');
      streak.className = 'gg-gold-streak';
      streak.style.top = cfg.top;
      streak.style.left = cfg.left;
      streak.style.width = cfg.width;
      streak.style.height = cfg.height;
      streak.style.background = `linear-gradient(90deg, transparent, ${cfg.color} 30%, ${cfg.color} 70%, transparent)`;
      overlay.appendChild(streak);
      streaks.push(streak);
    });

    document.body.appendChild(overlay);

    // Hide original container now that snapshot layers are active
    container.style.visibility = 'hidden';

    // 6. Mobile scale calculation (roughly 60% of desktop values)
    const isMobile = window.innerWidth <= 768;
    const scale = isMobile ? 0.6 : 1.0;

    // Overall screen jumps: 0px -> +8px -> -13px -> +4px -> 0px
    // Independent band offsets alternating direction: ±14px, ±29px
    // Band 1: +14px -> -29px -> +14px -> -14px -> 0px
    // Band 2: -29px -> +14px -> -29px -> +14px -> 0px
    // Band 3: +29px -> -14px -> +29px -> -29px -> 0px
    // Band 4: -14px -> +29px -> -14px -> +29px -> 0px

    const screenJumps = [
      { time: 0.10, jump: 8 },
      { time: 0.16, jump: -13 },
      { time: 0.22, jump: 4 },
      { time: 0.28, jump: -5 },
      { time: 0.34, jump: 0 },
    ];

    const bandOffsets = [
      [14, -29, 14, -14, 0],   // Band 1
      [-29, 14, -29, 14, 0],   // Band 2
      [29, -14, 29, -29, 0],   // Band 3
      [-14, 29, -14, 29, 0],   // Band 4
    ];

    // Build timeline using GSAP stepped timing
    timeline = gsap.timeline({
      onComplete: cleanup,
    });

    // Animate jumps for each band (screen jump + independent band offset)
    screenJumps.forEach((step, idx) => {
      bandEls.forEach((bandEl, bIdx) => {
        const totalX = (step.jump + bandOffsets[bIdx][idx]) * scale;
        timeline.set(bandEl, { x: totalX }, step.time);
      });
    });

    // Gold interference streaks toggles during jumps
    timeline.set(streaks[0], { display: 'block', opacity: 0.9 }, 0.12);
    timeline.set(streaks[0], { display: 'none', opacity: 0 }, 0.17);

    timeline.set(streaks[1], { display: 'block', opacity: 0.85 }, 0.19);
    timeline.set(streaks[1], { display: 'none', opacity: 0 }, 0.25);

    timeline.set(streaks[2], { display: 'block', opacity: 0.9 }, 0.26);
    timeline.set(streaks[2], { display: 'none', opacity: 0 }, 0.31);

    // Homepage horizontal correction: +6px -> -8px -> 0px between 320ms and 500ms
    if (app) {
      timeline.set(app, { x: 6 * scale }, 0.32);
      timeline.set(app, { x: -8 * scale }, 0.39);
      timeline.set(app, { x: 0 }, 0.46);
    }

    // Hard cuts for bands in exact order:
    // Band 1 cut at 350ms
    // Band 3 cut at 385ms
    // Band 4 cut at 415ms
    // Band 2 cut at 440ms
    timeline.set(bandEls[0], { display: 'none' }, 0.35);
    timeline.set(bandEls[2], { display: 'none' }, 0.385);
    timeline.set(bandEls[3], { display: 'none' }, 0.415);
    timeline.set(bandEls[1], { display: 'none' }, 0.44);

    // Finish sequence by 550ms
    timeline.to({}, { duration: 0.05 }, 0.50);

  } catch (err) {
    console.error('Frame skip transition error:', err);
    cleanup();
  }
}

function cleanupImmediate(container, onComplete) {
  if (container && container.parentNode) {
    container.parentNode.removeChild(container);
  }
  document.documentElement.classList.remove('gg-intro-active');
  document.body.classList.remove('gg-intro-active');
  const app = document.getElementById('app');
  if (app) {
    app.inert = false;
    app.removeAttribute('aria-hidden');
    app.style.transform = '';
  }
  if (onComplete) onComplete();
}
