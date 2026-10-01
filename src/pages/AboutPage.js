/**
 * GAMBIT'S GLITCH - 01 / THE PROTOCOL & MANIFESTO (About View)
 */

import { eventConfig } from '../config/eventConfig.js';

export class AboutPage {
  render() {
    return `
      <div class="py-16 font-mono bg-canvas">
        <div class="container mx-auto px-4 max-w-5xl space-y-16">
          
          <!-- Page Header & Manifesto Hero -->
          <div class="border-b border-line pb-10">
            <div class="flex items-center gap-3 text-xs text-accent-dark tracking-widest uppercase mb-3">
              <span class="w-2 h-2 bg-signal inline-block"></span>
              <span>01 / THE HACKATHON MANIFESTO</span>
            </div>
            <h1 class="font-serif text-5xl sm:text-7xl font-normal italic text-ink leading-tight">
              About Gambit’s Glitch
            </h1>
            <p class="text-base sm:text-lg text-muted mt-4 max-w-3xl leading-relaxed font-sans font-normal">
              A high-stakes, 8-hour continuous hackathon (09:00 AM – 06:45 PM) engineered for developers, system architects, UI designers, and hardware creators who build functional software and real-world technology.
            </p>
          </div>

          <!-- Highlight Banner: Pure Code vs PPT Deck -->
          <div class="tech-card p-8 md:p-10 border-accent bg-paper relative overflow-hidden">
            <div class="absolute -right-12 -bottom-12 text-8xl font-black text-line/20 select-none font-sans pointer-events-none">
              BUILD
            </div>
            <div class="relative z-10 space-y-4">
              <div class="text-xs text-accent font-bold tracking-wider">// THE GOLDEN STANDARD</div>
              <h2 class="font-sans text-2xl sm:text-3xl font-extrabold uppercase text-ink tracking-tight">
                BUILT FOR BUILDERS WHO SHIP CODE. NOT SLIDE PRESENTATIONS.
              </h2>
              <p class="text-xs sm:text-sm text-muted leading-relaxed font-sans max-w-3xl">
                Gambit’s Glitch was established with one uncompromising premise: <strong class="text-ink font-semibold">working systems speak louder than pitch decks</strong>. We replace static slides and theoretical talk with live terminal runs, deployed APIs, functional user interfaces, and verifiable code repositories evaluated by active technical judges.
              </p>
            </div>
          </div>

          <!-- Dual Philosophy Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div class="tech-card p-8 border-line bg-paper flex flex-col justify-between gap-6">
              <div class="space-y-3">
                <div class="text-xs text-accent-dark font-bold">// THE GAMBIT</div>
                <h3 class="font-sans text-2xl text-ink uppercase font-bold">HIGH-LEVERAGE TECHNICAL MOVES</h3>
                <p class="text-xs text-muted leading-relaxed font-sans">
                  A <strong>Gambit</strong> is a calculated, high-risk technical commitment. It is about sacrificing boilerplate templates, avoiding safe cookie-cutter apps, and engineering custom high-performance solutions under time constraints.
                </p>
              </div>
              <div class="pt-4 border-t border-line text-[11px] text-accent font-mono uppercase tracking-wider">
                ⚡ BRAVERY IN ARCHITECTURE
              </div>
            </div>

            <div class="tech-card p-8 border-line bg-paper flex flex-col justify-between gap-6">
              <div class="space-y-3">
                <div class="text-xs text-accent font-bold">// THE GLITCH</div>
                <h3 class="font-sans text-2xl text-ink uppercase font-bold">CONTROLLED DIGITAL DISRUPTION</h3>
                <p class="text-xs text-muted leading-relaxed font-sans">
                  A <strong>Glitch</strong> represents intentional system disruption. Exposing legacy flaws, breaking out of standard framework restrictions, and unlocking breakthrough features inside complex technical challenges.
                </p>
              </div>
              <div class="pt-4 border-t border-line text-[11px] text-signal font-mono uppercase tracking-wider">
                ⚡ INNOVATION THROUGH DISRUPTION
              </div>
            </div>

          </div>

          <!-- Section 3: The 4 Non-Negotiable Standards -->
          <div class="tech-card p-8 md:p-12 border-line bg-paper space-y-8">
            <div class="border-b border-line pb-4">
              <div class="text-xs text-accent-dark font-bold mb-1">// ARCHITECTURAL PILLARS</div>
              <h2 class="font-sans text-3xl font-extrabold uppercase text-ink">WHY GAMBIT'S GLITCH IS DIFFERENT</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 font-sans">
              
              <div class="space-y-2 p-5 bg-canvas border border-line">
                <div class="text-accent-dark text-base font-bold font-mono">01 / LIVE CODE & DEPLOYED INSTANCES</div>
                <p class="text-xs text-muted leading-relaxed">
                  Every submission must feature working code, functional APIs, or working hardware prototypes. Code repositories are analyzed line-by-line during final evaluation.
                </p>
              </div>

              <div class="space-y-2 p-5 bg-canvas border border-line">
                <div class="text-accent text-base font-bold font-mono">02 / 8-HOUR CONTINUOUS ARENA SPRINT</div>
                <p class="text-xs text-muted leading-relaxed">
                  A high-intensity 8-hour sprint (09:30 AM – 05:30 PM) at Auditorium, VSBCETC with gigabit connectivity, power infrastructure, meals, refreshments, and real-time leaderboard updates.
                </p>
              </div>

              <div class="space-y-2 p-5 bg-canvas border border-line">
                <div class="text-ink text-base font-bold font-mono">03 / ACTIVE MENTOR SPRINT</div>
                <p class="text-xs text-muted leading-relaxed">
                  Direct access to senior software engineers, startup founders, and system architects walking the floor to review technical architecture and assist with edge cases.
                </p>
              </div>

              <div class="space-y-2 p-5 bg-canvas border border-line">
                <div class="text-signal text-base font-bold font-mono">04 / TRANSPARENT TECHNICAL JURY</div>
                <p class="text-xs text-muted leading-relaxed">
                  Zero subjective black-box scoring. Evaluation is strictly weighted across Technical Disruption (30%), Feasibility (25%), Working Prototype (25%), UX (10%), and Technical Defense (10%).
                </p>
              </div>

            </div>
          </div>

          <!-- Section 4: Live Arena 8-Hour Schedule (09:00 AM – 06:45 PM) -->
          <div class="space-y-6">
            <div class="border-b border-line pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <div class="text-xs text-accent-dark font-bold mb-1">// HACKATHON DAY SPRINT STRUCTURE</div>
                <h2 class="font-serif text-4xl text-ink font-normal italic">The 8-Hour Arena Timetable</h2>
              </div>
              <div class="font-mono text-xs text-muted">
                OCTOBER 10, 2026 • 09:00 AM – 06:45 PM IST
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-xs font-mono">
              
              <div class="p-5 bg-paper border border-line flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-accent font-bold">09:00 AM</span>
                  <span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-accent text-accent">OPENING</span>
                </div>
                <div>
                  <div class="text-ink font-extrabold uppercase font-sans text-sm">INAUGRATION</div>
                  <p class="text-muted font-sans text-[11px] leading-relaxed mt-1">
                    Arena gates open, squad desk allocations, kit handover & opening ceremony.
                  </p>
                </div>
              </div>

              <div class="p-5 bg-paper border border-line flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-accent-dark font-bold">09:10 AM</span>
                  <span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-line text-muted">KEYNOTE</span>
                </div>
                <div>
                  <div class="text-ink font-extrabold uppercase font-sans text-sm">GUEST SPEECH</div>
                  <p class="text-muted font-sans text-[11px] leading-relaxed mt-1">
                    Industry keynote & jury address on high-impact engineering and innovation.
                  </p>
                </div>
              </div>

              <div class="p-5 bg-paper border-2 border-accent flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-accent font-bold">09:30 AM</span>
                  <span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-accent text-paper font-bold">START</span>
                </div>
                <div>
                  <div class="text-ink font-extrabold uppercase font-sans text-sm">HACKATHON KICK OFF</div>
                  <p class="text-muted font-sans text-[11px] leading-relaxed mt-1">
                    Live on-spot problem statement briefing! 8-Hour sprint timer begins.
                  </p>
                </div>
              </div>

              <div class="p-5 bg-paper border border-line flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-accent font-bold">11:15 AM</span>
                  <span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-accent text-accent">MILESTONE</span>
                </div>
                <div>
                  <div class="text-ink font-extrabold uppercase font-sans text-sm">REFRESHMENT 1 & EVALUATION 1</div>
                  <p class="text-muted font-sans text-[11px] leading-relaxed mt-1">
                    Tea, coffee & light snacks served. First jury checkpoint on schema & architecture.
                  </p>
                </div>
              </div>

              <div class="p-5 bg-paper border border-line flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-ink font-bold">12:30 PM</span>
                  <span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-line text-muted">MEAL</span>
                </div>
                <div>
                  <div class="text-ink font-extrabold uppercase font-sans text-sm">LUNCH BREAK</div>
                  <p class="text-muted font-sans text-[11px] leading-relaxed mt-1">
                    Hot lunch served to all registered participants in the dining hall.
                  </p>
                </div>
              </div>

              <div class="p-5 bg-paper border border-line flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-accent font-bold">01:15 PM</span>
                  <span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-accent text-accent">RESUME</span>
                </div>
                <div>
                  <div class="text-ink font-extrabold uppercase font-sans text-sm">LUNCH ENDS & SPRINT RESUMES</div>
                  <p class="text-muted font-sans text-[11px] leading-relaxed mt-1">
                    Back to desks. Core coding, API integrations, and feature development sprint.
                  </p>
                </div>
              </div>

              <div class="p-5 bg-paper border border-line flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-accent font-bold">03:20 PM</span>
                  <span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-line text-muted">ENERGY</span>
                </div>
                <div>
                  <div class="text-ink font-extrabold uppercase font-sans text-sm">REFRESHMENT 2</div>
                  <p class="text-muted font-sans text-[11px] leading-relaxed mt-1">
                    Beverages & energy boosters served. Sprint polish & bug bashing.
                  </p>
                </div>
              </div>

              <div class="p-5 bg-paper border-2 border-signal flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-signal font-bold">05:30 PM</span>
                  <span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-signal text-paper font-bold">FREEZE</span>
                </div>
                <div>
                  <div class="text-ink font-extrabold uppercase font-sans text-sm">HACKATHON ENDS</div>
                  <p class="text-muted font-sans text-[11px] leading-relaxed mt-1">
                    Hard code freeze. 8 hours of continuous building completed! Repositories submitted.
                  </p>
                </div>
              </div>

              <div class="p-5 bg-paper border border-line flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-signal font-bold">05:30 – 06:30 PM</span>
                  <span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-signal text-signal">DEFENSE</span>
                </div>
                <div>
                  <div class="text-ink font-extrabold uppercase font-sans text-sm">FINAL EVALUATION START</div>
                  <p class="text-muted font-sans text-[11px] leading-relaxed mt-1">
                    Live prototype demonstrations, terminal defense, and line-by-line jury examination.
                  </p>
                </div>
              </div>

              <div class="p-5 bg-paper border border-line flex flex-col justify-between gap-3">
                <div class="flex items-center justify-between">
                  <span class="text-accent font-bold">06:35 PM</span>
                  <span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-line text-muted">CHILL</span>
                </div>
                <div>
                  <div class="text-ink font-extrabold uppercase font-sans text-sm">REFRESHMENT 3</div>
                  <p class="text-muted font-sans text-[11px] leading-relaxed mt-1">
                    Evening tea & snacks while the jury tabulates final scores.
                  </p>
                </div>
              </div>

              <div class="p-5 bg-paper border-2 border-ink flex flex-col justify-between gap-3 sm:col-span-2">
                <div class="flex items-center justify-between">
                  <span class="text-ink font-bold">06:45 PM</span>
                  <span class="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-ink text-paper font-bold">VICTORY</span>
                </div>
                <div>
                  <div class="text-ink font-extrabold uppercase font-sans text-base">PRIZE DISTRIBUTION & CLOSING CEREMONY</div>
                  <p class="text-muted font-sans text-[11px] leading-relaxed mt-1">
                    Awarding cash prizes, championship trophies, certificates, and closing address.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <!-- Section 5: Who Belongs Here -->
          <div class="border-t border-line pt-12 space-y-8">
            <h2 class="font-serif text-4xl text-ink font-normal italic">Who Should Participate?</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-muted font-sans">
              <div class="p-6 bg-paper border border-line space-y-3">
                <div class="text-ink font-bold uppercase font-mono text-sm">// SQUAD COMPOSITION</div>
                <p class="leading-relaxed">
                  Enrolled Undergraduate (UG) students (1st to 4th Year) from any recognized academic institution. Squads range from <strong>2 to 4 members</strong> with multi-disciplinary roles (Backend, Frontend, AI/ML, System Engineering, or Design).
                </p>
              </div>

              <div class="p-6 bg-paper border border-line space-y-3">
                <div class="text-ink font-bold uppercase font-mono text-sm">// ON-SITE ARENA INFRASTRUCTURE</div>
                <p class="leading-relaxed">
                  High-speed gigabit Wi-Fi, power stations at every squad desk, continuous refreshments & snacks, quiet rest zones, line-by-line jury examination, and cash awards for top teams.
                </p>
              </div>
            </div>

            <!-- Call to Action -->
            <div class="pt-6 flex flex-wrap items-center justify-center gap-4">
              <a href="#" data-route="themes" class="nav-link btn-primary py-4 px-8 text-xs font-bold tracking-widest uppercase">
                ⚡ CHOOSE YOUR TRACK & REGISTER →
              </a>
              <a href="#" data-route="rules" class="nav-link btn-secondary py-4 px-8 text-xs font-bold tracking-widest uppercase">
                EXPLORE HACKATHON RULES
              </a>
            </div>
          </div>

        </div>
      </div>
    `;
  }
}

