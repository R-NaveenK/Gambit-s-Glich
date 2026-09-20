/**
 * Reference-led monochrome intro: one compact ribbon group, not two canvases.
 * Original renderer. Each glyph is projected from a tangent on a 3D band.
 * The percentage describes intro progress, not network/download progress.
 */
import gsap from 'gsap';
import '../styles/loader.css';

const TAU = Math.PI * 2;
const COPY = {
  ribbon: 'IDEAS THAT CHANGE THE WORLD · ',
  orbit: 'BUILD · BREAK · DEBUG · DEPLOY · '.repeat(3),
  title: 'GAMBIT’S GLITCH',
};
const KEY = 'gg_loader_completed_v2';
const PROGRESS = [[0, 0], [1.15, 0], [1.65, 8], [2.2, 27], [2.75, 55], [3.25, 79], [3.75, 94], [4.2, 100]];

export class Loader {
  constructor(onComplete) {
    this.onComplete = onComplete;
    this.container = null;
    this.timeline = null;
    this.frameId = null;
    this.finished = false;
    this.notified = false;
    this.started = false;
    this.elapsed = 0;
    this.state = { reveal: 0, fade: 1 };
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.replay = new URLSearchParams(window.location.search).get('intro') === 'replay';
    try { this.hasVisited = sessionStorage.getItem(KEY) === 'true'; }
    catch { this.hasVisited = false; }
    this.handleResize = () => this.resize();
    this.handleKey = (event) => { if (event.key === 'Escape') this.finish(true); };
    this.handleMotion = () => { if (this.motionQuery.matches) this.finish(true); };
  }

  render() {
    // Rendering must not invoke the callback: that previously mounted the home twice.
    if (this.motionQuery.matches || (this.hasVisited && !this.replay)) return '';
    return `
      <div id="gg-loader" class="gg-intro" data-phase="preparing" aria-label="Gambit's Glitch introduction">
        <span class="gg-intro__sr">Opening Gambit's Glitch. Press Escape to skip the introduction.</span>
        <button class="gg-intro__skip" type="button">Skip introduction</button>
        <canvas class="gg-intro__canvas" aria-hidden="true"></canvas>
        <div class="gg-intro__counter" role="progressbar" aria-label="Introduction progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">0%</div>
        <div class="gg-intro__reveal" aria-hidden="true">
          <div class="gg-intro__title-mask"><div class="gg-intro__title">${Array.from(COPY.title).map((letter) => `<span class="gg-intro__letter">${letter === ' ' ? '&nbsp;' : letter}</span>`).join('')}</div></div>
          <div class="gg-intro__caption">HACKATHON / 2026</div>
          <div class="gg-intro__verbs">/BUILD<br>/BREAK<br>/DEBUG<br>/DEPLOY</div>
        </div>
      </div>`;
  }

  async startSequence() {
    if (this.started || this.finished) return;
    this.started = true;
    this.container = document.getElementById('gg-loader');
    if (!this.container) { this.finish(true); return; }
    this.canvas = this.container.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.counter = this.container.querySelector('.gg-intro__counter');
    if (!this.ctx) { this.finish(true); return; }
    document.documentElement.classList.add('gg-intro-active');
    document.body.classList.add('gg-intro-active');
    this.app = document.getElementById('app');
    this.appWasInert = this.app?.inert || false;
    if (this.app) this.app.inert = true;
    this.container.querySelector('button').addEventListener('click', () => this.finish(true));
    window.addEventListener('keydown', this.handleKey);
    window.addEventListener('resize', this.handleResize);
    this.motionQuery.addEventListener('change', this.handleMotion);

    // Local fonts normally resolve immediately. Failure must never trap visitors.
    let fontTimeout;
    await Promise.race([
      Promise.allSettled([
        document.fonts.load('650 78px "Sofia Sans Condensed"'),
        document.fonts.load('850 120px "Sofia Sans Condensed"'),
        document.fonts.load('400 14px "Spline Sans Mono"'),
      ]),
      new Promise((resolve) => { fontTimeout = setTimeout(resolve, 1500); }),
    ]);
    clearTimeout(fontTimeout);
    if (this.finished) return;
    if (this.motionQuery.matches) { this.finish(true); return; }

    this.bands = [
      this.makeBand(COPY.ribbon, 158, -15, 78, 650, 'Sofia Sans Condensed', 0),
      this.makeBand(COPY.orbit, 168, 68, 15, 400, 'Spline Sans Mono', 1.1),
    ];
    this.resize();
    this.container.dataset.phase = 'loading';
    this.buildTimeline();
    const tick = () => {
      if (this.finished) return;
      this.elapsed = this.timeline.time();
      this.paint(this.elapsed);
      this.updateCounter(this.elapsed);
      this.frameId = requestAnimationFrame(tick);
    };
    tick();
  }

  makeBand(text, radius, y, fontSize, weight, family, phase) {
    this.ctx.font = `${weight} ${fontSize}px "${family}"`;
    const glyphs = Array.from(text).map((char) => ({ char, width: this.ctx.measureText(char).width }));
    const total = glyphs.reduce((sum, glyph) => sum + glyph.width + 0.5, 0);
    let cursor = 0;
    for (const glyph of glyphs) {
      glyph.angle = (cursor + glyph.width / 2) / total * TAU;
      glyph.span = glyph.width / total * TAU;
      cursor += glyph.width + 0.5;
    }
    return { glyphs, radius, y, fontSize, weight, family, phase };
  }

  resize() {
    if (!this.canvas || this.finished) return;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    const objectWidth = Math.min(360, Math.max(200, this.width * 0.19));
    this.objectScale = objectWidth / 340;
    this.fitTitle();
    if (this.bands) this.paint(this.elapsed);
  }

  fitTitle() {
    const title = this.container.querySelector('.gg-intro__title');
    this.ctx.font = '850 100px "Sofia Sans Condensed"';
    const naturalWidth = this.ctx.measureText(COPY.title).width;
    title.style.fontSize = `${this.width * 0.92 / naturalWidth * 100}px`;
  }

  project(x, y, z, time) {
    const tilt = (-18 + Math.sin(time * 0.55) * 4) * Math.PI / 180;
    const lean = (-8 + Math.sin(time * 0.3) * 2) * Math.PI / 180;
    const yy = y * Math.cos(tilt) - z * Math.sin(tilt);
    const zz = y * Math.sin(tilt) + z * Math.cos(tilt);
    const xx = x * Math.cos(lean) - yy * Math.sin(lean);
    const yyy = x * Math.sin(lean) + yy * Math.cos(lean);
    const perspective = 1100 / (1100 - zz);
    return {
      x: this.width / 2 + xx * perspective * this.objectScale,
      y: this.height * 0.465 + yyy * perspective * this.objectScale + this.state.reveal * this.height * 0.48,
      z: zz,
    };
  }

  paint(time) {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);
    if (!this.bands || this.state.fade <= 0) return;
    const glyphs = [];
    for (const band of this.bands) {
      const spin = -0.3 - time * (band.fontSize > 30 ? 0.34 : 0.24) + band.phase;
      for (const glyph of band.glyphs) {
        if (glyph.char === ' ') continue;
        const angle = glyph.angle + spin;
        const point = (delta, dy) => this.project(
          Math.sin(angle + delta) * band.radius,
          band.y + dy + this.state.reveal * (band.fontSize > 30 ? -25 : 35),
          Math.cos(angle + delta) * band.radius,
          time,
        );
        glyphs.push({ glyph, band, centre: point(0, 0), left: point(-glyph.span / 2, 0), right: point(glyph.span / 2, 0), top: point(0, -band.fontSize / 2), bottom: point(0, band.fontSize / 2) });
      }
    }
    // Paint back to front, including the reversed back surface of the ribbon.
    glyphs.sort((a, b) => a.centre.z - b.centre.z);
    for (const { glyph, band, centre, left, right, top, bottom } of glyphs) {
      const a = (right.x - left.x) / glyph.width;
      const b = (right.y - left.y) / glyph.width;
      const c = (bottom.x - top.x) / band.fontSize;
      const d = (bottom.y - top.y) / band.fontSize;
      if (Math.abs(a * d - b * c) < 0.008) continue;
      ctx.save();
      ctx.translate(centre.x, centre.y);
      ctx.transform(a, b, c, d, 0, 0);
      ctx.font = `${band.weight} ${band.fontSize}px "${band.family}"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#101010';
      ctx.globalAlpha = this.state.fade * Math.min(1, time / 0.3);
      ctx.fillText(glyph.char, 0, 0);
      ctx.restore();
    }
  }

  updateCounter(time) {
    let value = 100;
    for (let i = 1; i < PROGRESS.length; i++) {
      const [end, next] = PROGRESS[i];
      const [start, previous] = PROGRESS[i - 1];
      if (time < end) {
        value = Math.floor(previous + (next - previous) * Math.max(0, (time - start) / (end - start)));
        break;
      }
    }
    if (value !== this.lastValue) {
      this.counter.textContent = `${value}%`;
      this.counter.setAttribute('aria-valuenow', String(value));
      this.lastValue = value;
    }
  }

  buildTimeline() {
    const reveal = this.container.querySelector('.gg-intro__reveal');
    const letters = this.container.querySelectorAll('.gg-intro__letter');
    const meta = this.container.querySelectorAll('.gg-intro__caption, .gg-intro__verbs');
    this.timeline = gsap.timeline({ onComplete: () => this.finish() });
    this.timeline.to(this.counter, { autoAlpha: 0, duration: 0.22 }, 5.85);
    this.timeline.call(() => { this.container.dataset.phase = 'revealing'; }, [], 6.12);
    this.timeline.to(this.state, { reveal: 1, duration: 1.0, ease: 'power3.in' }, 6.12);
    this.timeline.to(this.state, { fade: 0, duration: 0.3 }, 6.82);
    this.timeline.set(reveal, { autoAlpha: 1 }, 6.65);
    this.timeline.fromTo(letters, {
      yPercent: (i) => 110 + Math.abs(i - letters.length / 2) * 6,
      rotation: (i) => (i - letters.length / 2) * 0.6,
      scaleY: 1.08,
    }, {
      yPercent: 0, rotation: 0, scaleY: 1, duration: 1.1,
      stagger: { amount: 0.25, from: 'center' }, ease: 'power4.out',
    }, 6.65);
    this.timeline.fromTo(meta, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }, 7.5);
    this.timeline.to({}, { duration: 0.5 }, 8.2);
  }

  skip() { this.finish(true); }

  notify() {
    if (this.notified) return;
    this.notified = true;
    this.onComplete?.();
  }

  finish(immediate = false) {
    if (this.finished) return;
    this.finished = true;
    this.timeline?.kill();
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('keydown', this.handleKey);
    this.motionQuery.removeEventListener('change', this.handleMotion);
    try { sessionStorage.setItem(KEY, 'true'); } catch { /* Storage is optional. */ }
    if (this.container) this.container.dataset.phase = 'handoff';

    const cleanup = () => {
      this.container?.remove();
      document.documentElement.classList.remove('gg-intro-active');
      document.body.classList.remove('gg-intro-active');
      if (this.app) {
        this.app.inert = this.appWasInert;
      }
    };
    try { this.notify(); }
    finally {
      if (immediate || !this.container || this.motionQuery.matches) cleanup();
      else setTimeout(cleanup, 400);
    }
  }
}
