/**
 * GAMBIT'S GLITCH - 01 / THE PROTOCOL (About View)
 */

import { eventConfig } from '../config/eventConfig.js';

export class AboutPage {
  render() {
    return `
      <div class="py-16 font-mono bg-canvas">
        <div class="container mx-auto px-4 max-w-5xl">
          
          <!-- Page Header -->
          <div class="border-b border-line pb-8 mb-12">
            <div class="text-xs text-accent-dark tracking-widest uppercase mb-2">01 / THE PROTOCOL</div>
            <h1 class="font-serif text-5xl sm:text-7xl font-normal italic text-ink">
              About Gambit’s Glitch
            </h1>
            <p class="text-sm text-muted mt-4 max-w-2xl leading-relaxed font-sans">
              Understand the creative philosophy, structure, and expectations behind the hackathon.
            </p>
          </div>

          <!-- Grid Section 1: Core Concept -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            
            <div class="tech-card p-8 border-line bg-paper flex flex-col gap-4">
              <div class="text-xs text-accent font-bold">// THE CREATIVE CONCEPT</div>
              <h2 class="font-sans text-2xl text-ink uppercase font-bold">CONTROLLED DIGITAL CHAOS</h2>
              <p class="text-xs text-muted leading-relaxed font-sans">
                <strong>“Gambit”</strong> represents a calculated, high-leverage technical move. It is about taking bold risks, committing to original architectures, and sacrificing easy solutions to achieve breakthrough results.
              </p>
              <p class="text-xs text-muted leading-relaxed font-sans">
                <strong>“Glitch”</strong> represents disruption, breaking out of boilerplate limits, and uncovering unexpected possibilities hidden inside system failures.
              </p>
            </div>

            <div class="tech-card p-8 border-line bg-paper flex flex-col gap-4">
              <div class="text-xs text-accent-dark font-bold">// THE OBJECTIVE</div>
              <h2 class="font-sans text-2xl text-ink uppercase font-bold">BREAK THE SYSTEM. BUILD THE FUTURE.</h2>
              <p class="text-xs text-muted leading-relaxed font-sans">
                Our objective is simple: assemble developers, hardware tinkerers, UI designers, and systems architects to build high-performance applications in a 10-hour continuous sprint at Auditorium, Coimbatore.
              </p>
              <p class="text-xs text-muted leading-relaxed font-sans">
                We replace generic slide presentations with live, functioning code, deployed instances, and measurable performance benchmarks.
              </p>
            </div>

          </div>

          <!-- Section 2: What Makes Us Different -->
          <div class="tech-card p-8 md:p-12 border-line mb-16 bg-paper">
            <div class="text-xs text-accent-dark font-bold mb-2">// ARCHITECTURAL DIFFERENCE</div>
            <h2 class="font-sans text-3xl font-bold uppercase text-ink mb-8">WHAT MAKES THIS EVENT DIFFERENT?</h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 font-sans">
              
              <div class="space-y-2">
                <div class="text-accent-dark text-base font-bold">01 / NO FLUFF OR DECK-ONLY HACKS</div>
                <div class="text-xs text-muted leading-relaxed">
                  PowerPoint slides without working repositories do not win. Working software, robust APIs, and clean UX take priority over flashy presentations.
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-accent text-base font-bold">02 / TRANSPARENT PIPELINES</div>
                <div class="text-xs text-muted leading-relaxed">
                  Real-time manual verification status tracking, instant PPT gate access, clear jury metrics, and zero hidden evaluation criteria.
                </div>
              </div>

              <div class="space-y-2">
                <div class="text-ink text-base font-bold">03 / ACTIVE MENTOR SPRINT</div>
                <div class="text-xs text-muted leading-relaxed">
                  Direct checkpoint access to senior engineers, startup founders, and technical architects to debug edge cases during the 10-hour sprint.
                </div>
              </div>

            </div>
          </div>

          <!-- Section 3: Participant Profile -->
          <div class="border-t border-line pt-12">
            <h2 class="font-serif text-4xl text-ink font-normal italic mb-6">Expected Participant Experience</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-muted font-sans">
              <div class="p-6 bg-paper border border-line space-y-3">
                <div class="text-ink font-bold uppercase">WHO CAN PARTICIPATE?</div>
                <p>Enrolled Undergraduate (UG) students (1st to 4th Year) from any recognized academic institution. Squads must range from 2 to 4 members.</p>
              </div>

              <div class="p-6 bg-paper border border-line space-y-3">
                <div class="text-ink font-bold uppercase">WHAT TO EXPECT ON-SITE & ONLINE?</div>
                <p>High-speed connectivity, continuous meal & beverage check-ins, rest zones, line-by-line jury evaluation, and immediate feedback.</p>
              </div>
            </div>

            <div class="mt-8 flex justify-center">
              <a href="#" data-route="register" class="nav-link btn-primary py-4 px-8">
                ⚡ JOIN GAMBIT’S GLITCH NOW
              </a>
            </div>
          </div>

        </div>
      </div>
    `;
  }
}
