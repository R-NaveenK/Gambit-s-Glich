/**
 * GAMBIT'S GLITCH - Phase 1C Monumental Swiss Hero Viewport (100dvh)
 */

import { eventConfig } from '../config/eventConfig.js';
import { Countdown } from '../components/Countdown.js';

export class HomePage {
  constructor(navigate) {
    this.navigate = navigate;
    this.countdown = new Countdown('hero-countdown');
  }

  render() {
    const isRegOpen = eventConfig.teamPolicy.isRegistrationOpen;

    return `
      <!-- MONUMENTAL HERO VIEWPORT (100dvh) -->
      <section class="relative min-h-[calc(100dvh-5rem)] flex flex-col justify-between py-8 px-6 md:px-12 bg-canvas overflow-hidden select-none">
        
        <!-- Top Small Upper Label -->
        <div class="flex items-center justify-between font-mono text-meta text-muted pb-4 border-b border-line">
          <div class="flex items-center gap-3">
            <span class="w-2 h-2 bg-signal inline-block"></span>
            <span class="font-bold text-ink tracking-widest uppercase">AN INTER-COLLEGIATE HACKATHON</span>
          </div>
          <div class="hidden sm:block">
            <span>EDITION: <strong class="text-ink">2026</strong></span>
          </div>
        </div>

        <!-- Central Composition Grid -->
        <div class="my-auto py-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <!-- Dominating Title & Layered Serif Overlay -->
          <div class="lg:col-span-8 flex flex-col gap-6">
            
            <div class="relative">
              <h1 class="text-hero-title text-ink font-black tracking-tighter">
                GAMBIT’S<br />
                <span class="text-signal glitch-text" data-text="GLITCH">GLITCH</span>
              </h1>

              <!-- Layered Editorial Serif Statement -->
              <div class="text-hero-serif text-ink font-normal italic tracking-tight -mt-4 sm:-mt-10 ml-2 sm:ml-12 opacity-95">
                Make the move no one expects.
              </div>
            </div>

            <!-- Supporting Copy & Tagline -->
            <div class="space-y-3 max-w-2xl mt-2">
              <div class="font-mono text-sm sm:text-base font-bold text-ink uppercase tracking-wider">
                ${eventConfig.tagline}
              </div>
              <p class="text-hero-desc font-sans leading-relaxed">
                A high-intensity build challenge for teams prepared to question assumptions, prototype rapidly, and turn unstable ideas into working technology.
              </p>
            </div>

            <!-- Primary Actions -->
            <div class="flex flex-wrap items-center gap-4 pt-4 font-mono">
              <a href="#" data-route="register" class="nav-link btn-hero-primary">
                REGISTER YOUR TEAM ↗
              </a>
              <a href="#" data-route="about" class="nav-link btn-hero-secondary">
                EXPLORE THE EVENT
              </a>
            </div>

          </div>

          <!-- Right Baseline Countdown Rail -->
          <div class="lg:col-span-4 flex flex-col justify-end gap-6 border-l-0 lg:border-l border-line lg:pl-8">
            
            <div class="font-mono text-xs text-muted tracking-widest uppercase pb-2 border-b border-line">
              // COUNTDOWN TO REGISTRATION DEADLINE (05/10/2026)
            </div>

            <!-- Large Monospace Numerals Aligned on One Baseline -->
            ${this.countdown.render()}

            <div class="pt-4 border-t border-line font-mono text-meta text-muted flex justify-between items-center">
              <span>DEADLINE: <strong class="text-ink">${eventConfig.dates.displayDeadline}</strong></span>
              <span class="text-signal font-bold">FEE: ${eventConfig.teamPolicy.feeType.toUpperCase()}</span>
            </div>

          </div>

        </div>

        <!-- Bottom Horizontal Metadata Rail -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-meta text-muted pt-4 border-t border-line">
          <div>DATE &nbsp;<strong class="text-ink">${eventConfig.dates.displayDateRange}</strong></div>
          <div>FORMAT &nbsp;<strong class="text-ink">10-HOUR BUILD</strong></div>
          <div>VENUE &nbsp;<strong class="text-ink">${eventConfig.venue.name}, ${eventConfig.venue.city}</strong></div>
          <div class="text-right sm:text-left">STATUS &nbsp;<strong class="text-signal uppercase">${isRegOpen ? 'REGISTRATIONS OPEN' : 'CLOSED'}</strong></div>
        </div>

      </section>
    `;
  }

  attachEvents() {
    this.countdown.start();
  }
}
