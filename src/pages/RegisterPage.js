/**
 * GAMBIT'S GLITCH - 06 / TRANSMIT YOUR ENTRY (Full Team Registration, Payment & PPT Submission)
 */

import { eventConfig } from '../config/eventConfig.js';
import { api } from '../utils/api.js';
import { toast } from '../utils/toast.js';
import { soundFx } from '../utils/audio.js';

export class RegisterPage {
  constructor(navigate) {
    this.navigate = navigate;
    this.memberCount = 3;
  }

  render() {
    return `
      <div class="py-16 font-mono bg-canvas">
        <div class="container mx-auto px-4 max-w-4xl">
          
          <!-- Header -->
          <div class="border-b border-line pb-8 mb-10">
            <div class="text-xs text-accent-dark tracking-widest uppercase mb-2">06 / TRANSMIT YOUR ENTRY</div>
            <h1 class="font-serif text-5xl sm:text-7xl font-normal italic text-ink">
              Team Registration & Submission
            </h1>
            <p class="text-sm text-muted mt-4 leading-relaxed font-sans">
              Register your squad, attach your payment screenshot, and upload your project presentation pitch deck. 
              Fee: <strong class="text-accent-dark font-bold">₹300 per person</strong>. Deadline: <strong class="text-ink font-bold">05/10/2026</strong>.
            </p>
          </div>

          <!-- Registration Form -->
          <form id="registration-form" class="space-y-8" enctype="multipart/form-data">
            
            <!-- SECTION 1: SQUAD & ACADEMIC INTEL -->
            <div class="tech-card p-6 md:p-8 border-line bg-paper">
              <h2 class="font-sans text-lg font-bold text-ink uppercase mb-6 border-b border-line pb-2">
                01 / SQUAD & ACADEMIC INTEL
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <label class="block text-xs text-ink mb-2">TEAM NAME *</label>
                  <input type="text" name="team_name" required placeholder="e.g. CYBER_DISRUPTORS" class="w-full px-4 py-3 text-xs focus:border-accent outline-none" />
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2">HACKATHON TRACK *</label>
                  <select name="theme_id" required class="w-full px-4 py-3 text-xs focus:border-accent outline-none">
                    ${eventConfig.themes.map(t => `<option value="${t.id}">${t.number}. ${t.name}</option>`).join('')}
                  </select>
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2">COLLEGE / INSTITUTION *</label>
                  <input type="text" name="college" required placeholder="e.g. VSBCETC, Coimbatore" class="w-full px-4 py-3 text-xs focus:border-accent outline-none" />
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2">DEPARTMENT *</label>
                  <input type="text" name="department" required placeholder="e.g. Computer Science" class="w-full px-4 py-3 text-xs focus:border-accent outline-none" />
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2">YEAR OF STUDY (UG ONLY) *</label>
                  <select name="year" required class="w-full px-4 py-3 text-xs focus:border-accent outline-none">
                    <option value="1st Year UG">1st Year UG</option>
                    <option value="2nd Year UG">2nd Year UG</option>
                    <option value="3rd Year UG" selected>3rd Year UG</option>
                    <option value="4th Year UG">4th Year UG</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2">CITY *</label>
                  <input type="text" name="city" required value="Coimbatore" placeholder="e.g. Coimbatore" class="w-full px-4 py-3 text-xs focus:border-accent outline-none" />
                </div>

              </div>
            </div>

            <!-- SECTION 2: TEAM LEADER DETAILS -->
            <div class="tech-card p-6 md:p-8 border-line bg-paper">
              <h2 class="font-sans text-lg font-bold text-ink uppercase mb-6 border-b border-line pb-2">
                02 / TEAM LEADER (PRIMARY CONTACT)
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div>
                  <label class="block text-xs text-ink mb-2">LEADER FULL NAME *</label>
                  <input type="text" name="leader_name" required placeholder="Full Name" class="w-full px-4 py-3 text-xs focus:border-accent outline-none" />
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2">LEADER EMAIL *</label>
                  <input type="email" name="leader_email" required placeholder="leader@example.com" class="w-full px-4 py-3 text-xs focus:border-accent outline-none" />
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2">LEADER PHONE NUMBER *</label>
                  <input type="tel" name="leader_phone" required placeholder="+91 8438765412" class="w-full px-4 py-3 text-xs focus:border-accent outline-none" />
                </div>

              </div>
            </div>

            <!-- SECTION 3: ADDITIONAL SQUAD MEMBERS -->
            <div class="tech-card p-6 md:p-8 border-line bg-paper">
              <div class="flex items-center justify-between border-b border-line pb-2 mb-6">
                <h2 class="font-sans text-lg font-bold text-ink uppercase">
                  03 / SQUAD MEMBERS
                </h2>

                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted">SQUAD SIZE:</span>
                  <select id="member-count-select" class="px-3 py-1 text-xs text-accent-dark font-bold outline-none border border-line bg-canvas">
                    <option value="2">2 Members (₹600)</option>
                    <option value="3" selected>3 Members (₹900)</option>
                    <option value="4">4 Members (₹1200)</option>
                  </select>
                </div>
              </div>

              <!-- Dynamic Member Input Container -->
              <div id="members-input-container" class="space-y-6">
                <!-- Injected via JavaScript -->
              </div>
            </div>

            <!-- SECTION 4: PAYMENT SCREENSHOT & UTR PROOF -->
            <div class="tech-card p-6 md:p-8 border-line bg-paper space-y-6">
              <div class="flex items-center justify-between border-b border-line pb-3">
                <h2 class="font-sans text-lg font-bold text-ink uppercase">
                  04 / PAYMENT PROOF SCREENSHOT
                </h2>
                <span id="calculated-fee-badge" class="text-xs font-bold text-accent-dark bg-canvas px-3 py-1 border border-accent">
                  TOTAL FEE: ₹900 (3 MEMBERS × ₹300)
                </span>
              </div>

              <div class="p-4 bg-canvas border border-line text-xs space-y-2">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div>UPI VPA / ID: <strong class="text-ink font-bold">${eventConfig.paymentDetails.upiId}</strong></div>
                  <div>PAYEE: <strong class="text-ink">${eventConfig.paymentDetails.payeeName}</strong></div>
                  <div>HOTLINE: <strong class="text-accent-dark">${eventConfig.contact.phone}</strong></div>
                </div>
                <div class="text-[11px] text-muted font-sans">
                  Pay the total fee using any UPI app (GPay, PhonePe, Paytm, BHIM) and upload the clear payment receipt screenshot below along with the 12-digit UTR number.
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs text-ink mb-2">PAYMENT PROOF SCREENSHOT *</label>
                  <input type="file" name="payment_screenshot" accept="image/jpeg,image/png,image/webp,image/heic" required class="w-full bg-canvas border border-line p-3 text-xs text-muted file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-accent file:text-ink file:font-bold file:text-xs cursor-pointer" />
                  <div class="text-[10px] text-muted mt-1 font-sans">Upload payment receipt screenshot (JPG, PNG, WEBP).</div>
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2">12-DIGIT UTR / REFERENCE NUMBER *</label>
                  <input type="text" name="utr_number" required pattern="[a-zA-Z0-9]{8,24}" placeholder="e.g. 202698765432" class="w-full px-4 py-3 text-xs focus:border-accent outline-none font-mono" />
                  <div class="text-[10px] text-muted mt-1 font-sans">12-digit transaction ID from your payment receipt.</div>
                </div>
              </div>

              <div>
                <label class="block text-xs text-ink mb-2">PAYER NAME (NAME ON UPI ACCOUNT)</label>
                <input type="text" name="payer_name" placeholder="Name as displayed on payment app" class="w-full px-4 py-3 text-xs focus:border-accent outline-none" />
              </div>
            </div>

            <!-- SECTION 5: PPT PRESENTATION SUBMISSION -->
            <div class="tech-card p-6 md:p-8 border-line bg-paper space-y-6">
              <div class="flex items-center justify-between border-b border-line pb-3">
                <h2 class="font-sans text-lg font-bold text-ink uppercase">
                  05 / PPT PRESENTATION SUBMISSION
                </h2>
                <span class="text-xs text-accent-dark font-bold">MAX FILE SIZE: 15 MB</span>
              </div>

              <div>
                <label class="block text-xs text-ink mb-2">PROJECT TITLE *</label>
                <input type="text" name="project_title" required placeholder="e.g. AI-driven Healthcare Diagnostics System" class="w-full px-4 py-3 text-xs focus:border-accent outline-none" />
              </div>

              <div>
                <label class="block text-xs text-ink mb-2">SHORT PROJECT SUMMARY *</label>
                <textarea name="summary" required rows="3" placeholder="Briefly describe the problem, architectural approach, and key features..." class="w-full p-4 text-xs focus:border-accent outline-none leading-relaxed font-sans"></textarea>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-xs text-ink mb-2">PITCH DECK PRESENTATION FILE (.PPT, .PPTX, .PDF) *</label>
                  <input type="file" name="ppt_file" accept=".ppt,.pptx,.pdf" required class="w-full bg-canvas border border-line p-3 text-xs text-muted file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-accent file:text-ink file:font-bold file:text-xs cursor-pointer" />
                  <div class="text-[10px] text-muted mt-1 font-sans">Upload your deck file (.ppt, .pptx, or .pdf).</div>
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2">GITHUB REPOSITORY LINK (OPTIONAL)</label>
                  <input type="url" name="repo_link" placeholder="https://github.com/team/project" class="w-full px-4 py-3 text-xs focus:border-accent outline-none" />
                </div>
              </div>
            </div>

            <!-- SECTION 6: CODE OF CONDUCT & SUBMIT -->
            <div class="tech-card p-6 border-line bg-paper space-y-4">
              <label class="flex items-start gap-3 cursor-pointer text-xs text-muted font-sans">
                <input type="checkbox" name="rules_agreed" required class="mt-1 accent-accent" />
                <span>
                  I confirm that all team members are enrolled students and agree to abide by the <strong class="text-ink">Gambit’s Glitch Rules and Code of Conduct</strong>. I have attached the payment proof screenshot and PPT presentation file.
                </span>
              </label>

              <button type="submit" id="submit-reg-btn" class="nav-link btn-primary w-full py-4 text-xs font-bold tracking-widest uppercase">
                ⚡ COMPLETE REGISTRATION & SUBMIT ENTRY →
              </button>
            </div>

          </form>

          <!-- Success Modal -->
          <div id="reg-success-modal" class="hidden fixed inset-0 z-50 bg-canvas/95 flex items-center justify-center p-4 font-mono">
            <div class="tech-card p-8 md:p-12 border-accent bg-paper max-w-xl w-full text-center space-y-6">
              <div class="w-12 h-12 bg-accent text-ink font-bold flex items-center justify-center text-2xl mx-auto font-sans">
                ✔
              </div>

              <h2 class="font-serif text-4xl font-normal italic text-ink">Registration Completed</h2>
              
              <div class="p-4 bg-canvas border border-accent text-center space-y-2">
                <div class="text-xs text-muted">YOUR UNIQUE REGISTRATION ID</div>
                <div id="success-reg-id" class="font-mono text-3xl font-bold text-accent-dark tracking-wider">GG26-XXXX</div>
                <div class="text-[11px] text-muted">SAVE THIS ID FOR STATUS TRACKING!</div>
              </div>

              <p class="text-xs text-muted leading-relaxed font-sans">
                Team registration, payment screenshot, and PPT pitch deck have been submitted successfully. Admin review is underway.
              </p>

              <div class="flex flex-col gap-3 pt-2">
                <button id="modal-check-status" class="nav-link btn-primary w-full py-3 text-xs">
                  ⚡ VIEW STATUS TRACKER →
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  attachEvents() {
    const selectEl = document.getElementById('member-count-select');
    const containerEl = document.getElementById('members-input-container');
    const feeBadge = document.getElementById('calculated-fee-badge');

    const updateMemberInputs = (totalMembers) => {
      const feePerPerson = eventConfig.teamPolicy.registrationFee;
      const totalFee = totalMembers * feePerPerson;

      if (feeBadge) {
        feeBadge.textContent = `TOTAL FEE: ₹${totalFee} (${totalMembers} MEMBERS × ₹${feePerPerson})`;
      }

      const extraCount = totalMembers - 1;
      let html = '';

      for (let i = 1; i <= extraCount; i++) {
        html += `
          <div class="p-4 bg-canvas border border-line space-y-4">
            <div class="text-xs text-accent-dark font-bold">// MEMBER 0${i + 1} DETAILS</div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-[11px] text-muted mb-1">MEMBER 0${i + 1} FULL NAME *</label>
                <input type="text" name="member_${i}_name" required placeholder="Member Name" class="w-full px-3 py-2 text-xs focus:border-accent outline-none" />
              </div>
              <div>
                <label class="block text-[11px] text-muted mb-1">MEMBER 0${i + 1} EMAIL *</label>
                <input type="email" name="member_${i}_email" required placeholder="member${i}@example.com" class="w-full px-3 py-2 text-xs focus:border-accent outline-none" />
              </div>
              <div>
                <label class="block text-[11px] text-muted mb-1">MEMBER 0${i + 1} PHONE *</label>
                <input type="tel" name="member_${i}_phone" required placeholder="+91 9123456780" class="w-full px-3 py-2 text-xs focus:border-accent outline-none" />
              </div>
            </div>
          </div>
        `;
      }
      containerEl.innerHTML = html;
    };

    if (selectEl && containerEl) {
      updateMemberInputs(parseInt(selectEl.value));
      selectEl.addEventListener('change', (e) => {
        updateMemberInputs(parseInt(e.target.value));
      });
    }

    const form = document.getElementById('registration-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        soundFx.playClick();

        const submitBtn = document.getElementById('submit-reg-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `TRANSMITTING REGISTRATION, PAYMENT & PPT...`;

        const formData = new FormData(form);
        const memberCount = parseInt(selectEl.value);

        const members = [];
        for (let i = 1; i < memberCount; i++) {
          members.push({
            name: formData.get(`member_${i}_name`),
            email: formData.get(`member_${i}_email`),
            phone: formData.get(`member_${i}_phone`),
            role: 'Member'
          });
        }

        formData.set('members', JSON.stringify(members));
        formData.set('amount', (memberCount * eventConfig.teamPolicy.registrationFee).toString());
        formData.set('rules_agreed', 'true');

        try {
          const res = await api.registerTeam(formData);
          if (res.success) {
            soundFx.playGlitch();
            toast.show(`Registration & Submission successful! ID: ${res.reg_id}`, 'success');
            
            sessionStorage.setItem('last_reg_id', res.reg_id);

            const modal = document.getElementById('reg-success-modal');
            const regIdEl = document.getElementById('success-reg-id');
            if (modal && regIdEl) {
              regIdEl.textContent = res.reg_id;
              modal.classList.remove('hidden');
              modal.classList.add('flex');
            }

            document.getElementById('modal-check-status').addEventListener('click', () => {
              this.navigate('status');
            });

          } else {
            toast.show(res.message || 'Registration failed.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = `⚡ COMPLETE REGISTRATION & SUBMIT ENTRY →`;
          }
        } catch (err) {
          toast.show('Network error submitting registration.', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = `⚡ COMPLETE REGISTRATION & SUBMIT ENTRY →`;
        }
      });
    }
  }
}

