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
            <div class="text-xs text-accent-dark tracking-widest uppercase mb-2">// KNOWLEDGE & SUPPORT</div>
            <h1 class="font-serif text-5xl sm:text-7xl font-normal italic text-ink">
              Frequently Asked Questions
            </h1>
            <p class="text-sm text-muted mt-4 leading-relaxed font-sans">
              Find clear answers regarding team formation, registration, manual payment verification, PPT pitch deck guidelines, and venue logistics at Auditorium, VSBCETC.
            </p>
          </div>

          <!-- Accordion FAQ Items -->
          <div id="faq-accordion-container" class="space-y-4 mb-16">
            ${eventConfig.faq.map((item, index) => {
              const isOpen = index === 0;
              return `
                <div class="faq-item tech-card border ${isOpen ? 'border-accent bg-paper shadow-sm' : 'border-line bg-paper'} overflow-hidden transition-all duration-200">
                  <button type="button" class="faq-toggle group w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-canvas/50 transition-colors">
                    <span class="font-sans text-base sm:text-lg font-bold text-ink flex items-baseline gap-3">
                      <span class="text-accent font-mono text-sm sm:text-base font-bold">0${index + 1}.</span>
                      <span class="group-hover:text-accent-dark transition-colors">${item.question}</span>
                    </span>
                    <span class="faq-icon shrink-0 w-8 h-8 rounded flex items-center justify-center text-ink text-lg font-bold font-mono border ${isOpen ? 'border-accent bg-accent/10 text-accent-dark' : 'border-line bg-canvas'} group-hover:border-accent transition-all">
                      ${isOpen ? '−' : '+'}
                    </span>
                  </button>
                  <div class="faq-answer ${isOpen ? '' : 'hidden'} px-5 sm:px-8 pb-6 pt-2 text-sm sm:text-base text-ink leading-relaxed font-sans border-t border-line/40 bg-canvas/40">
                    <p class="pt-2 text-ink font-normal">${item.answer}</p>
                  </div>
                </div>
              `;
            }).join('')}
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
                <div class="text-[10px] text-muted font-sans">Auditorium, VSBCETC</div>
              </div>

            </div>
          </div>

        </div>
      </div>
    `;
  }

  attachEvents() {
    const accordionContainer = document.getElementById('faq-accordion-container');
    if (!accordionContainer) return;

    const faqItems = accordionContainer.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
      const toggle = item.querySelector('.faq-toggle');
      const answer = item.querySelector('.faq-answer');
      const icon = item.querySelector('.faq-icon');

      if (!toggle || !answer || !icon) return;

      toggle.addEventListener('click', () => {
        const isCurrentlyOpen = !answer.classList.contains('hidden');

        // Close ALL other items first (Single Accordion Rule)
        faqItems.forEach(otherItem => {
          const otherAnswer = otherItem.querySelector('.faq-answer');
          const otherIcon = otherItem.querySelector('.faq-icon');

          if (otherAnswer) otherAnswer.classList.add('hidden');
          if (otherIcon) {
            otherIcon.textContent = '+';
            otherIcon.classList.remove('border-accent', 'bg-accent/10', 'text-accent-dark');
            otherIcon.classList.add('border-line', 'bg-canvas', 'text-ink');
          }
          otherItem.classList.remove('border-accent', 'shadow-sm');
          otherItem.classList.add('border-line');
        });

        // Toggle clicked item if it was previously closed
        if (!isCurrentlyOpen) {
          answer.classList.remove('hidden');
          icon.textContent = '−';
          icon.classList.remove('border-line', 'bg-canvas', 'text-ink');
          icon.classList.add('border-accent', 'bg-accent/10', 'text-accent-dark');
          item.classList.remove('border-line');
          item.classList.add('border-accent', 'shadow-sm');
        }
      });
    });
  }
}
