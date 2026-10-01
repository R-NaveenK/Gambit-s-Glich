/**
 * GAMBIT'S GLITCH 2026 - Problem Statement Briefing View
 * Note: PPT submissions are removed. Problem statements are revealed ON SPOT on hackathon morning.
 */

import { eventConfig } from '../config/eventConfig.js';
import { soundFx } from '../utils/audio.js';

export class SubmitPptPage {
  constructor(navigate) {
    this.navigate = navigate;
  }

  render() {
    return `
      <div class="py-16 font-mono bg-canvas">
        <div class="container mx-auto px-4 max-w-4xl">
          
          <!-- Header -->
          <div class="border-b border-line pb-8 mb-10">
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-xs text-accent-dark tracking-widest uppercase font-bold">// 06 / ARENA CHALLENGE BRIEFING</span>
              <span class="px-2.5 py-0.5 text-[10px] font-bold border border-accent bg-accent/15 text-accent-dark font-mono uppercase">
                NO ADVANCE PPT REQUIRED
              </span>
            </div>
            <h1 class="font-serif text-5xl sm:text-7xl font-normal italic text-ink">
              On-Spot Problem Statements
            </h1>
            <p class="text-sm text-muted mt-4 leading-relaxed font-sans">
              Gambit's Glitch 2026 does not require any advance deck, presentation file, or pre-built prototype submissions. All challenge statements will be revealed <strong class="text-ink font-bold">strictly ON SPOT</strong> at the venue on event day!
            </p>
          </div>

          <!-- Master Intelligence Card -->
          <div class="tech-card p-6 md:p-10 border-2 border-accent bg-paper space-y-6 shadow-sm">
            <div class="flex items-center justify-between border-b border-line pb-4">
              <div>
                <div class="text-[10px] text-accent-dark font-mono font-bold uppercase tracking-widest">// LIVE ARENA FORMAT</div>
                <h2 class="font-sans text-2xl sm:text-3xl font-bold text-ink uppercase">Real-Time Technical Disruption</h2>
              </div>
              <div class="text-right">
                <div class="text-xs text-accent font-mono font-bold">RELEASE TIME</div>
                <div class="font-mono text-sm text-ink font-bold">09:00 AM IST</div>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div class="p-4 bg-canvas border border-line space-y-1">
                <div class="text-muted text-[10px]">EVENT DATE</div>
                <div class="font-bold text-ink">${eventConfig.dates.displayDateRange}</div>
              </div>
              <div class="p-4 bg-canvas border border-line space-y-1">
                <div class="text-muted text-[10px]">VENUE LOCATION</div>
                <div class="font-bold text-ink">Auditorium, VSBCETC</div>
              </div>
              <div class="p-4 bg-canvas border border-line space-y-1">
                <div class="text-muted text-[10px]">EVENT CAPACITY</div>
                <div class="font-bold text-accent-dark">40 TEAMS ONLY (FCFS)</div>
              </div>
            </div>

            <div class="space-y-4 text-xs font-sans text-muted leading-relaxed">
              <p>
                To preserve technical integrity, prevent pre-coded boilerplate advantage, and simulate real-world high-pressure engineering sprints, <strong class="text-ink">all official problem statements across the 5 domains will be unveiled simultaneously at 09:00 AM IST</strong>.
              </p>
              <div class="p-4 bg-canvas border border-line font-mono text-xs text-ink space-y-2">
                <div class="text-accent-dark font-bold">// THE 5 DOMAINS REVEALED ON SPOT:</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>01. Health care Technology</div>
                  <div>02. Smart Agriculture & Supply</div>
                  <div>03. Next-Gen Fintech & Payments</div>
                  <div>04. Defensive Cybersecurity</div>
                  <div>05. Interactive Education Systems</div>
                </div>
              </div>
            </div>

            <div class="pt-2 flex flex-wrap gap-4 font-mono">
              <a href="#" data-route="register" class="nav-link btn-primary py-3.5 px-6 text-xs font-bold uppercase tracking-wider">
                ⚡ REGISTER SQUAD & PAY FEE (FCFS) →
              </a>
              <a href="#" data-route="status" class="nav-link btn-secondary py-3.5 px-6 text-xs font-bold uppercase tracking-wider">
                VIEW STATUS TRACKER →
              </a>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  attachEvents() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const route = link.getAttribute('data-route');
        if (route) {
          e.preventDefault();
          soundFx.playClick();
          this.navigate(route);
        }
      });
    });
  }
}
