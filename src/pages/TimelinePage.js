/**
 * GAMBIT'S GLITCH - 03 / EXECUTION SEQUENCE (Timeline View)
 */

import { eventConfig } from '../config/eventConfig.js';

export class TimelinePage {
  render() {
    return `
      <div class="py-16 font-mono bg-canvas">
        <div class="container mx-auto px-4 max-w-4xl">
          
          <!-- Page Header -->
          <div class="border-b border-line pb-8 mb-12">
            <div class="text-xs text-accent-dark tracking-widest uppercase mb-2">03 / EXECUTION SEQUENCE</div>
            <h1 class="font-serif text-5xl sm:text-7xl font-normal italic text-ink">
              Schedule & Milestones
            </h1>
            <p class="text-sm text-muted mt-4 leading-relaxed font-sans">
              Track the exact progression of registration, screening, physical sprint check-ins, and final judging.
            </p>
          </div>

          <!-- Timeline Sequence -->
          <div class="relative border-l-2 border-line ml-4 md:ml-8 pl-6 md:pl-10 space-y-10">
            ${eventConfig.timeline.map(step => {
              const isCompleted = step.status === 'COMPLETED';
              const isActive = step.status === 'ACTIVE';
              
              const badgeClass = isCompleted
                ? 'bg-paper text-muted border-line'
                : isActive
                ? 'bg-accent/15 text-accent-dark border-accent font-bold'
                : 'bg-paper text-ink border-line';

              const dotClass = isCompleted
                ? 'bg-line border-canvas'
                : isActive
                ? 'bg-accent border-canvas ring-4 ring-accent/20'
                : 'bg-ink border-canvas';

              return `
                <div class="relative group">
                  
                  <!-- Timeline Node Indicator -->
                  <div class="absolute -left-[31px] md:-left-[47px] top-1.5 w-5 h-5 border-2 ${dotClass}"></div>

                  <!-- Content Box -->
                  <div class="tech-card p-6 border-line bg-paper">
                    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3 mb-4">
                      <div class="flex items-center gap-3">
                        <span class="text-xs font-bold text-muted">PHASE ${step.phase}</span>
                        <span class="text-xs px-2.5 py-0.5 border ${badgeClass} uppercase">${step.status}</span>
                      </div>
                      <div class="text-xs text-accent-dark font-bold">${step.date} // ${step.time}</div>
                    </div>

                    <h3 class="font-sans text-2xl font-bold text-ink uppercase mb-2">
                      ${step.title}
                    </h3>

                    <p class="text-xs text-muted leading-relaxed font-sans">
                      ${step.details}
                    </p>
                  </div>

                </div>
              `;
            }).join('')}
          </div>

        </div>
      </div>
    `;
  }
}
