/**
 * GAMBIT'S GLITCH - 04 / RULES OF ENGAGEMENT (Rules View)
 */

import { eventConfig } from '../config/eventConfig.js';

export class RulesPrizesPage {
  render() {
    return `
      <div class="py-16 font-mono bg-canvas">
        <div class="container mx-auto px-4 max-w-5xl">
          
          <!-- Page Header -->
          <div class="border-b border-line pb-8 mb-12">
            <div class="text-xs text-accent-dark tracking-widest uppercase mb-2">04 / RULES OF ENGAGEMENT</div>
            <h1 class="font-serif text-5xl sm:text-7xl font-normal italic text-ink">
              Governance & Event Rules
            </h1>
            <p class="text-sm text-muted mt-4 max-w-2xl leading-relaxed font-sans">
              Review team eligibility criteria, registration policies, PPT submission rules, and evaluation benchmarks.
            </p>
          </div>

          <!-- RULES SECTION (04 / RULES OF ENGAGEMENT) -->
          <div>
            <h2 class="font-sans text-3xl font-extrabold uppercase text-ink border-b border-line pb-4 mb-8">
              04 / OFFICIAL RULES & GUIDELINES
            </h2>

            <div class="space-y-8">
              ${eventConfig.rules.map(section => `
                <div class="tech-card p-6 border-line bg-paper">
                  <h3 class="font-mono text-base font-bold text-accent-dark uppercase mb-4 border-b border-line pb-2">
                    // ${section.category}
                  </h3>
                  <ul class="space-y-3 text-xs text-muted font-sans">
                    ${section.items.map(item => `
                      <li class="flex items-start gap-3">
                        <span class="text-accent font-bold">✔</span>
                        <span class="leading-relaxed text-ink">${item}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="mt-12 text-center">
            <a href="#" data-route="register" class="nav-link btn-primary py-4 px-8 text-xs font-bold tracking-widest uppercase">
              ⚡ REGISTER YOUR TEAM NOW →
            </a>
          </div>

        </div>
      </div>
    `;
  }
}

