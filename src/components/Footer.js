/**
 * GAMBIT'S GLITCH - Swiss Editorial Footer
 */

import { eventConfig } from '../config/eventConfig.js';

export class Footer {
  render() {
    return `
      <footer class="bg-paper border-t border-line pt-16 pb-12 font-mono text-xs text-muted relative z-10">
        <div class="container mx-auto px-4">
          
          <div class="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-line">
            
            <!-- Column 1: Brand & Spirit -->
            <div class="md:col-span-1 flex flex-col gap-4">
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 bg-ink text-canvas font-bold flex items-center justify-center text-sm font-sans">G</div>
                <span class="font-sans font-bold text-lg text-ink tracking-tight">GAMBIT’S GLITCH</span>
              </div>
              <p class="text-xs text-muted leading-relaxed">
                ${eventConfig.proposition}
              </p>
              <div class="text-[10px] text-accent font-bold tracking-widest uppercase">
                ${eventConfig.tagline}
              </div>
            </div>

            <!-- Column 2: Pipelines -->
            <div class="flex flex-col gap-3">
              <div class="text-ink font-bold uppercase tracking-widest mb-1 border-b border-line pb-2">01 / PIPELINES</div>
              <a href="#" data-route="register" class="nav-link text-ink hover:text-accent transition-colors">TEAM REGISTRATION</a>
              <a href="#" data-route="payment" class="nav-link text-ink hover:text-accent transition-colors">PAYMENT SUBMISSION</a>
              <a href="#" data-route="submit-ppt" class="nav-link text-ink hover:text-accent transition-colors">PPT SUBMISSION GATE</a>
              <a href="#" data-route="status" class="nav-link text-ink hover:text-accent transition-colors">STATUS TRACKER</a>
              <a href="#" data-route="admin" class="nav-link text-accent-dark font-bold hover:underline">ADMIN CONTROL PANEL</a>
            </div>

            <!-- Column 3: Event Intel -->
            <div class="flex flex-col gap-3">
              <div class="text-ink font-bold uppercase tracking-widest mb-1 border-b border-line pb-2">02 / EVENT INTEL</div>
              <div>DATE: <strong class="text-ink">${eventConfig.dates.displayDateRange}</strong></div>
              <div>FORMAT: <strong class="text-ink">10-HOUR BUILD</strong></div>
              <div>VENUE: <strong class="text-ink">${eventConfig.venue.name}, ${eventConfig.venue.city}</strong></div>
              <div>FEE: <strong class="text-accent-dark font-bold">${eventConfig.teamPolicy.feeType}</strong></div>
              <div>DEADLINE: <strong class="text-ink">${eventConfig.dates.displayDeadline}</strong></div>
            </div>

            <!-- Column 4: Connect -->
            <div class="flex flex-col gap-3">
              <div class="text-ink font-bold uppercase tracking-widest mb-1 border-b border-line pb-2">03 / CONNECT</div>
              <div>EMAIL: <a href="mailto:${eventConfig.contact.email}" class="text-ink hover:text-accent font-bold">${eventConfig.contact.email}</a></div>
              <div>HOTLINE: <strong class="text-ink">${eventConfig.contact.phone}</strong></div>
              <div>TEAM SIZE: <strong class="text-ink">${eventConfig.teamPolicy.minMembers}–${eventConfig.teamPolicy.maxMembers} MEMBERS</strong></div>
            </div>

          </div>

          <!-- Bottom Footer -->
          <div class="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px]">
            <div>
              © 2026 GAMBIT’S GLITCH. SWISS EDITORIAL MINIMALISM DISRUPTED BY CONTROLLED DIGITAL CHAOS.
            </div>
            <div class="flex items-center gap-3">
              <span class="w-2 h-2 bg-accent rounded-full inline-block"></span>
              <span>ENGINE: <strong class="text-ink">EXPRESS + VITE + SUPABASE</strong></span>
            </div>
          </div>

        </div>
      </footer>
    `;
  }
}
