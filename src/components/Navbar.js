/**
 * GAMBIT'S GLITCH - Phase 1B Monumental Swiss Navigation
 */

import { eventConfig } from '../config/eventConfig.js';
import { soundFx } from '../utils/audio.js';

export class Navbar {
  constructor(currentRoute, navigate) {
    this.currentRoute = currentRoute;
    this.navigate = navigate;
  }

  render() {
    return `
      <header id="gg-navbar" class="sticky top-0 z-40 bg-canvas/95 border-b border-line transition-all duration-300">
        <div class="w-full px-4 sm:px-6 md:px-12 h-16 md:h-20 flex items-center justify-between font-mono text-nav backdrop-blur-md">
          
          <!-- Left: Brand Code -->
          <a href="#" data-route="home" class="nav-link font-bold text-ink tracking-widest text-sm sm:text-base whitespace-nowrap hover:text-signal transition-colors flex items-center gap-2">
            <span>GG / 26</span>
          </a>

          <!-- Centre: Navigation Links (Desktop) -->
          <nav class="hidden lg:flex items-center gap-8 tracking-widest uppercase font-semibold text-muted text-xs">
            <a href="#" data-route="home" class="nav-link transition-colors hover:text-ink ${this.currentRoute === 'home' ? 'text-ink font-bold border-b-2 border-ink pb-1' : ''}">HOME</a>
            <a href="#" data-route="about" class="nav-link transition-colors hover:text-ink ${this.currentRoute === 'about' ? 'text-ink font-bold border-b-2 border-ink pb-1' : ''}">ABOUT</a>
            <a href="#" data-route="themes" class="nav-link transition-colors hover:text-ink ${this.currentRoute === 'themes' ? 'text-ink font-bold border-b-2 border-ink pb-1' : ''}">TRACKS</a>
            <a href="#" data-route="timeline" class="nav-link transition-colors hover:text-ink ${this.currentRoute === 'timeline' ? 'text-ink font-bold border-b-2 border-ink pb-1' : ''}">TIMELINE</a>
            <a href="#" data-route="rules" class="nav-link transition-colors hover:text-ink ${this.currentRoute === 'rules' ? 'text-ink font-bold border-b-2 border-ink pb-1' : ''}">RULES</a>
            <a href="#" data-route="contact" class="nav-link transition-colors hover:text-ink ${this.currentRoute === 'contact' ? 'text-ink font-bold border-b-2 border-ink pb-1' : ''}">FAQ</a>
          </nav>

          <!-- Right: Actions -->
          <div class="flex items-center gap-2 sm:gap-4">
            
            <a href="#" data-route="status" class="nav-link hidden sm:inline-block text-xs font-mono font-bold text-muted hover:text-ink tracking-widest uppercase">
              STATUS
            </a>

            <!-- Register Action: Black background, turns gold on hover -->
            <a href="#" data-route="register" class="nav-link btn-register-nav uppercase">
              REGISTER ↗
            </a>

            <!-- Mobile Menu Toggle Button -->
            <button id="mobile-menu-toggle" type="button" aria-controls="mobile-drawer" aria-expanded="false" aria-label="Open navigation" class="lg:hidden p-2 text-ink border border-line text-xs sm:text-base whitespace-nowrap font-bold cursor-pointer sm:ml-2">
              ≡ MENU
            </button>

          </div>

        </div>

        <!-- Full-Screen Editorial Mobile Overlay Menu -->
        <div id="mobile-drawer" role="dialog" aria-modal="true" aria-label="Navigation" data-lenis-prevent class="hidden fixed inset-0 z-50 bg-canvas p-8 flex-col justify-between overflow-y-auto overscroll-contain font-mono text-sm tracking-wider uppercase">
          <div class="flex items-center justify-between pb-6 border-b border-line">
            <span class="font-bold text-ink text-lg">GG / 26</span>
            <button id="mobile-drawer-close" type="button" aria-label="Close navigation" class="text-ink text-2xl font-bold p-2 cursor-pointer">✕</button>
          </div>

          <div class="flex flex-col gap-6 py-8">
            <a href="#" data-route="home" class="nav-link text-3xl font-serif text-ink hover:text-signal">HOME</a>
            <a href="#" data-route="about" class="nav-link text-3xl font-serif text-ink hover:text-signal">ABOUT</a>
            <a href="#" data-route="themes" class="nav-link text-3xl font-serif text-ink hover:text-signal">TRACKS</a>
            <a href="#" data-route="timeline" class="nav-link text-3xl font-serif text-ink hover:text-signal">TIMELINE</a>
            <a href="#" data-route="rules" class="nav-link text-3xl font-serif text-ink hover:text-signal">RULES</a>
            <a href="#" data-route="contact" class="nav-link text-3xl font-serif text-ink hover:text-signal">FAQ</a>
            <a href="#" data-route="status" class="nav-link text-3xl font-serif text-ink hover:text-signal">STATUS TRACKER</a>
          </div>
          
          <div class="pt-6 border-t border-line flex flex-col gap-3">
            <a href="#" data-route="register" class="nav-link btn-hero-primary w-full text-center justify-center py-4">REGISTER YOUR TEAM ↗</a>
          </div>
        </div>
      </header>
    `;
  }

  attachEvents() {
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');
    const mobileClose = document.getElementById('mobile-drawer-close');

    const closeMenu = () => {
      mobileDrawer.classList.add('hidden');
      mobileDrawer.classList.remove('flex');
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.focus();
    };

    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', () => {
        soundFx.playClick();
        mobileDrawer.classList.remove('hidden');
        mobileDrawer.classList.add('flex');
        mobileToggle.setAttribute('aria-expanded', 'true');
        mobileClose?.focus();
      });
    }

    if (mobileClose && mobileDrawer) {
      mobileClose.addEventListener('click', closeMenu);
      mobileDrawer.addEventListener('click', (event) => {
        if (event.target.closest('.nav-link')) closeMenu();
      });
      mobileDrawer.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') { event.preventDefault(); closeMenu(); return; }
        if (event.key !== 'Tab') return;
        const controls = Array.from(mobileDrawer.querySelectorAll('a, button'));
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault(); first.focus();
        }
      });
    }
  }
}
