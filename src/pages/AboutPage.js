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
              A high-stakes, 10-hour continuous hackathon engineered for developers, system architects, UI designers, and hardware creators who build functional software and real-world technology.
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
                <div class="text-accent text-base font-bold font-mono">02 / 10-HOUR CONTINUOUS ARENA SPRINT</div>
                <p class="text-xs text-muted leading-relaxed">
                  A continuous 10-hour sprint at Auditorium, VSBCETC with gigabit connectivity, power infrastructure, meals, and real-time leaderboard updates.
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

          <!-- Section 4: Live Arena 10-Hour Schedule -->
          <div class="space-y-6">
            <div class="border-b border-line pb-4">
              <div class="text-xs text-accent-dark font-bold mb-1">// HACKATHON DAY SPRINT STRUCTURE</div>
              <h2 class="font-serif text-4xl text-ink font-normal italic">The 10-Hour Arena Sprint</h2>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs font-mono">
              
              <div class="p-5 bg-paper border border-line flex flex-col justify-between gap-4">
                <div>
                  <div class="text-accent font-bold mb-1">09:00 AM IST</div>
                  <div class="text-ink font-extrabold uppercase font-sans text-sm">KICKOFF & BRIEFING</div>
                </div>
                <p class="text-muted font-sans text-[11px] leading-relaxed">
                  Track briefing, repository setup, and live environment configuration.
                </p>
              </div>

              <div class="p-5 bg-paper border border-line flex flex-col justify-between gap-4">
                <div>
                  <div class="text-accent-dark font-bold mb-1">10:00 AM IST</div>
                  <div class="text-ink font-extrabold uppercase font-sans text-sm">CORE BUILD PHASE</div>
                </div>
                <p class="text-muted font-sans text-[11px] leading-relaxed">
                  Database schemas built, core business logic written, API endpoints hooked up.
                </p>
              </div>

              <div class="p-5 bg-paper border border-line flex flex-col justify-between gap-4">
                <div>
                  <div class="text-accent font-bold mb-1">01:00 PM IST</div>
                  <div class="text-ink font-extrabold uppercase font-sans text-sm">MENTOR CHECKPOINT</div>
                </div>
                <p class="text-muted font-sans text-[11px] leading-relaxed">
                  Live architectural sanity check with senior engineers. Edge-case debugging.
                </p>
              </div>

              <div class="p-5 bg-paper border border-line flex flex-col justify-between gap-4">
                <div>
                  <div class="text-accent-dark font-bold mb-1">04:00 PM IST</div>
                  <div class="text-ink font-extrabold uppercase font-sans text-sm">SYSTEM POLISH</div>
                </div>
                <p class="text-muted font-sans text-[11px] leading-relaxed">
                  Frontend UI integration, error handling, performance tuning, and build packaging.
                </p>
              </div>

              <div class="p-5 bg-paper border border-accent flex flex-col justify-between gap-4">
                <div>
                  <div class="text-signal font-bold mb-1">07:00 PM IST</div>
                  <div class="text-ink font-extrabold uppercase font-sans text-sm">CODE FREEZE & DEMO</div>
                </div>
                <p class="text-muted font-sans text-[11px] leading-relaxed">
                  Repository freeze. Live terminal & prototype demonstration to jury panel.
                </p>
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

