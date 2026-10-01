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
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span class="text-xs text-accent-dark tracking-widest uppercase font-bold">// 03 / EXECUTION SEQUENCE</span>
              <span class="px-2.5 py-0.5 text-[10px] font-bold border border-accent bg-accent/15 text-accent-dark font-mono uppercase">
                8-HOUR LIVE BUILD (09:00 AM – 06:45 PM)
              </span>
            </div>
            <h1 class="font-serif text-5xl sm:text-7xl font-normal italic text-ink">
              Schedule & Milestones
            </h1>
            <p class="text-sm text-muted mt-4 leading-relaxed font-sans">
              Complete hourly breakdown for October 13, 2026 at Auditorium, VSBCETC. From 09:00 AM inauguration to 06:45 PM grand prize distribution.
            </p>
          </div>

          <!-- EVENT DAY MASTER TIMETABLE (09:00 AM – 06:45 PM) -->
          <div class="mb-16">
            <div class="flex items-center justify-between border-b border-line pb-3 mb-6">
              <h2 class="font-sans text-2xl font-extrabold uppercase text-ink tracking-tight flex items-center gap-3">
                <span class="w-3 h-3 bg-signal inline-block"></span>
                <span>EVENT DAY ARENA TIMELINE (OCTOBER 13)</span>
              </h2>
              <span class="text-xs font-mono text-accent-dark font-bold">TOTAL: 9:00 AM – 6:45 PM</span>
            </div>

            <div class="space-y-3 font-mono">
              ${eventConfig.eventDaySchedule.map((item, idx) => `
                <div class="tech-card p-4 md:p-5 border ${
                  item.time.includes('09:30 AM') || item.time.includes('05:30 PM') || item.time.includes('06:45 PM')
                    ? 'border-accent bg-paper shadow-xs'
                    : 'border-line bg-paper'
                } flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-accent transition-all">
                  
                  <div class="flex items-start md:items-center gap-4">
                    <div class="px-3 py-1.5 bg-canvas border border-line text-ink font-bold text-xs whitespace-nowrap min-w-[130px] text-center">
                      ${item.time}
                    </div>
                    <div>
                      <div class="font-sans text-base font-bold text-ink uppercase flex items-center gap-2">
                        <span>${item.title}</span>
                        ${item.time.includes('09:30 AM') ? '<span class="text-[10px] px-2 py-0.5 bg-signal text-canvas font-bold font-mono">ON-SPOT RELEASE</span>' : ''}
                        ${item.time.includes('05:30 PM') && !item.time.includes('06:30') ? '<span class="text-[10px] px-2 py-0.5 bg-error text-white font-bold font-mono">CODE FREEZE</span>' : ''}
                        ${item.time.includes('06:45 PM') ? '<span class="text-[10px] px-2 py-0.5 bg-success text-white font-bold font-mono">AWARDS</span>' : ''}
                      </div>
                      <div class="text-xs text-muted font-sans mt-0.5">
                        ${item.desc}
                      </div>
                    </div>
                  </div>

                  <div class="text-[10px] text-accent-dark font-bold uppercase shrink-0 text-right md:text-right">
                    #${String(idx + 1).padStart(2, '0')}
                  </div>

                </div>
              `).join('')}
            </div>
          </div>

          <!-- MACRO PIPELINE PHASES -->
          <div>
            <h2 class="font-sans text-xl font-bold uppercase text-ink border-b border-line pb-3 mb-8">
              // MACRO EXECUTION PHASES
            </h2>

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
      </div>
    `;
  }
}
