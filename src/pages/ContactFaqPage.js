/**
 * GAMBIT'S GLITCH - FAQ & Contact View
 */

import { eventConfig } from '../config/eventConfig.js';

export class ContactFaqPage {
  render() {
    return `
      <div class="py-16 font-mono bg-canvas">
        <div class="container mx-auto px-4 max-w-4xl">
          
          <!-- Header -->
          <div class="border-b border-line pb-8 mb-10">
            <div class="text-xs text-accent-dark tracking-widest uppercase mb-2">06 / KNOWLEDGE & SUPPORT</div>
            <h1 class="font-serif text-5xl sm:text-7xl font-normal italic text-ink">
              Frequently Asked Questions
            </h1>
            <p class="text-sm text-muted mt-4 leading-relaxed font-sans">
              Find answers to registration, manual payment verification, PPT pitch deck rules, and venue logistics.
            </p>
          </div>

          <!-- Accordion FAQ Items -->
          <div class="space-y-4 mb-16">
            ${eventConfig.faq.map((item, index) => `
              <div class="tech-card border-line bg-paper overflow-hidden">
                <button class="faq-toggle w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-canvas transition-colors">
                  <span class="font-sans text-lg font-bold text-ink">
                    <span class="text-accent font-mono mr-2">0${index + 1}.</span> ${item.question}
                  </span>
                  <span class="faq-icon text-ink text-xl font-bold font-mono">+</span>
                </button>
                <div class="faq-answer hidden p-6 pt-0 text-xs text-muted leading-relaxed font-sans border-t border-line/50">
                  ${item.answer}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Contact Section -->
          <div class="border-t border-line pt-12">
            <h2 class="font-serif text-4xl font-normal italic text-ink mb-8">
              Organizer Intel & Support Hotline
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
              
              <div class="tech-card p-6 border-line bg-paper space-y-2">
                <div class="text-xs text-accent-dark font-bold">// EMAIL SUPPORT</div>
                <div class="text-xs text-ink font-bold">${eventConfig.contact.email}</div>
                <div class="text-[10px] text-muted font-sans">Response time: &lt; 2 hours during event window</div>
              </div>

              <div class="tech-card p-6 border-line bg-paper space-y-2">
                <div class="text-xs text-accent-dark font-bold">// HOTLINE / PHONE</div>
                <div class="text-xs text-ink font-bold">${eventConfig.contact.phone}</div>
                <div class="text-[10px] text-muted font-sans">Available 24/7 during hackathon sprint</div>
              </div>

              <div class="tech-card p-6 border-line bg-paper space-y-2">
                <div class="text-xs text-accent-dark font-bold">// VENUE ADDRESS</div>
                <div class="text-xs text-ink font-bold">${eventConfig.contact.location}</div>
                <div class="text-[10px] text-muted font-sans">${eventConfig.venue.city}</div>
              </div>

            </div>
          </div>

        </div>
      </div>
    `;
  }

  attachEvents() {
    const toggles = document.querySelectorAll('.faq-toggle');
    toggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        const answer = toggle.nextElementSibling;
        const icon = toggle.querySelector('.faq-icon');
        
        if (answer) {
          const isHidden = answer.classList.contains('hidden');
          answer.classList.toggle('hidden');
          if (icon) icon.textContent = isHidden ? '-' : '+';
        }
      });
    });
  }
}
