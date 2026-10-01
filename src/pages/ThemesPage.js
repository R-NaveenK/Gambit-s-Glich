/**
 * GAMBIT'S GLITCH - 02 / CHOOSE YOUR DISRUPTION (Themes View)
 */

import { eventConfig } from '../config/eventConfig.js';

export class ThemesPage {
  render() {
    return `
      <div class="py-16 font-mono bg-canvas">
        <div class="container mx-auto px-4 max-w-4xl">
          
          <!-- Page Header -->
          <div class="border-b border-line pb-8 mb-8">
            <div class="text-xs text-accent-dark tracking-widest uppercase mb-2">02 / CHOOSE YOUR DISRUPTION</div>
            <h1 class="font-serif text-5xl sm:text-7xl font-normal italic text-ink">
              Hackathon Tracks
            </h1>
            <p class="text-sm text-muted mt-4 leading-relaxed font-sans">
              Choose your domain during registration. <strong class="text-accent-dark font-bold">Important: Concrete problem statements are strictly revealed ON SPOT at 09:30 AM IST on October 13, 2026 (Inauguration at 09:00 AM). No prior PPT required.</strong>
            </p>
          </div>

          <!-- On-Spot Problem Statement Callout Banner -->
          <div class="tech-card p-6 border-2 border-accent bg-paper mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div class="space-y-1">
              <div class="text-xs text-accent-dark font-bold font-mono">// REAL-TIME ARENA CHALLENGE</div>
              <h2 class="font-sans text-xl font-bold text-ink uppercase">Exact Problem Statements Revealed On-Spot</h2>
              <p class="text-xs text-muted font-sans max-w-xl leading-relaxed">
                Select your track during registration. On hackathon morning at 09:00 AM IST (Auditorium, VSBCETC), official challenge statements will be unveiled live. All brainstorming, system architecture, and code development are executed in real time.
              </p>
            </div>
            <div class="px-4 py-2 border border-accent bg-accent/20 text-accent-dark font-mono font-bold text-xs uppercase whitespace-nowrap shrink-0">
              ⚡ ON-SPOT RELEASE
            </div>
          </div>

          <!-- Themes Grid -->
          <div class="grid grid-cols-1 gap-6">
            ${eventConfig.themes.map(theme => `
              <div class="tech-card p-6 md:p-8 border-line bg-paper hover:border-accent transition-all">
                <div class="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-3 mb-4">
                  <div class="flex items-center gap-3">
                    <span class="text-xs font-bold text-muted uppercase">TRACK ${theme.number}</span>
                    <span class="text-xs px-2.5 py-0.5 border border-accent bg-accent/20 text-ink font-bold font-mono uppercase">OPEN FOR REGISTRATION</span>
                  </div>
                  <a href="#" data-route="register" data-track="${theme.id}" class="nav-link btn-primary text-xs py-2.5 px-5 border border-accent bg-accent text-ink font-mono font-bold uppercase tracking-wider hover:bg-ink hover:text-canvas hover:border-ink transition-all shadow-xs">
                    REGISTER FOR THIS TRACK →
                  </a>
                </div>

                <h2 class="font-sans text-2xl font-bold text-ink uppercase mb-3">
                  ${theme.name}
                </h2>

                <p class="text-sm text-muted leading-relaxed font-sans">
                  ${theme.shortDesc}
                </p>
              </div>
            `).join('')}
          </div>

        </div>
      </div>
    `;
  }
}

