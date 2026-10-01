/**
 * GAMBIT'S GLITCH 2026 - 06 / TRANSMIT YOUR ENTRY (Squad Registration & Direct Fee Payment)
 * Strictly First-Come, First-Served (Capped at 40 Teams)
 * Challenge Problem Statements: REVEALED ON SPOT AT VENUE (No Advance PPT Required)
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

  findMatchingTrack(targetTrack) {
    if (!targetTrack) return null;
    const cleanTarget = String(targetTrack).trim().toLowerCase();
    
    return eventConfig.themes.find(t => {
      const cleanId = String(t.id).trim().toLowerCase();
      const cleanNum = String(t.number).trim().toLowerCase();
      const cleanName = String(t.name).trim().toLowerCase();
      const numOnly = cleanNum.replace(/^0+/, '');

      return (
        cleanTarget === cleanId ||
        cleanTarget === cleanNum ||
        cleanTarget === cleanName ||
        cleanTarget === numOnly ||
        cleanTarget === `track-${cleanNum}` ||
        cleanTarget === `track-${numOnly}` ||
        cleanTarget.includes(cleanName) ||
        cleanName.includes(cleanTarget)
      );
    }) || null;
  }

  render() {
    const selectedTrackId = sessionStorage.getItem('selected_track_id');
    const matchedTrack = this.findMatchingTrack(selectedTrackId);
    const selectedValue = matchedTrack ? matchedTrack.id : 'track-01';
    const fee = eventConfig.teamPolicy.registrationFee || 250;

    return `
      <div class="py-16 font-mono bg-canvas">
        <div class="container mx-auto px-4 max-w-4xl">
          
          <!-- Header -->
          <div class="border-b border-line pb-8 mb-10">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span class="text-xs text-accent-dark tracking-widest uppercase font-bold">// 06 / TRANSMIT YOUR ENTRY</span>
              <span class="px-2.5 py-0.5 text-[10px] font-bold border border-accent bg-accent/15 text-accent-dark font-mono uppercase">
                STRICTLY 40 TEAMS ONLY (FCFS)
              </span>
            </div>
            <h1 class="font-serif text-5xl sm:text-7xl font-normal italic text-ink">
              Team Registration & Payment
            </h1>
            <p class="text-sm text-muted mt-4 leading-relaxed font-sans">
              Register your squad and submit your UPI fee payment in one step. Participation slots are strictly limited to <strong class="text-accent-dark font-bold">only 40 teams</strong> on a <strong class="text-accent-dark font-bold">First-Come, First-Served (FCFS)</strong> basis. Registration deadline is <strong class="text-accent-dark font-bold">October 10, 2026</strong>. <strong class="text-ink">No advance PPT pitch deck is required</strong>—concrete challenge problem statements will be revealed <strong class="text-signal">ON SPOT</strong> on hackathon morning at 09:30 AM IST on October 13 (Inauguration at 09:00 AM)!
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
                  <select name="theme_id" id="theme-id-select" required class="w-full px-4 py-3 text-xs focus:border-accent outline-none">
                    ${eventConfig.themes.map(t => {
                      const isSelected = (t.id === selectedValue);
                      return `<option value="${t.id}" ${isSelected ? 'selected="selected"' : ''}>${t.number}. ${t.name}</option>`;
                    }).join('')}
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

                <div class="flex items-center gap-3">
                  <span class="text-xs text-muted">SQUAD SIZE:</span>
                  <select id="member-count-select" class="px-3 py-1.5 text-xs text-accent-dark font-bold outline-none border border-line bg-canvas cursor-pointer">
                    <option value="2">2 Members (₹${(2 * fee).toLocaleString()})</option>
                    <option value="3" selected>3 Members (₹${(3 * fee).toLocaleString()})</option>
                    <option value="4">4 Members (₹${(4 * fee).toLocaleString()})</option>
                  </select>
                </div>
              </div>

              <!-- Dynamic Member Input Container -->
              <div id="members-input-container" class="space-y-6">
                <!-- Injected via JavaScript -->
              </div>
            </div>

            <!-- SECTION 4: ON-SPOT PROBLEM STATEMENT NOTICE (NO PPT REQUIRED) -->
            <div class="tech-card p-6 md:p-8 border-2 border-accent bg-paper space-y-3">
              <div class="flex items-center justify-between border-b border-line pb-2">
                <span class="text-xs text-accent-dark font-bold font-mono uppercase tracking-wider">// 04 / CHALLENGE FORMAT: ON-SPOT RELEASE</span>
                <span class="px-2.5 py-0.5 text-[10px] font-bold border border-accent bg-accent/15 text-accent-dark font-mono uppercase">
                  NO ADVANCE PPT REQUIRED
                </span>
              </div>
              <h3 class="font-sans text-xl font-bold text-ink uppercase">
                Problem Statements Announced Live on Hackathon Morning
              </h3>
              <p class="text-xs text-muted leading-relaxed font-sans">
                You do <strong class="text-ink">NOT</strong> need to submit any PPT pitch deck, slides, or pre-built code beforehand. Concrete, real-world challenge problem statements across all 5 tracks will be revealed live at the venue on <strong class="text-ink">October 13, 2026 at 09:30 AM IST (Auditorium, VSBCETC)</strong> right after inauguration. All architectural design, programming, and prototype engineering take place live during the 8-hour arena sprint (09:30 AM – 05:30 PM)!
              </p>
            </div>

            <!-- SECTION 5: PARTICIPANT FEE PAYMENT (UPI VERIFICATION) -->
            <div class="tech-card p-6 md:p-8 border-2 border-accent/80 bg-paper space-y-6">
              <div class="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                <h2 class="font-sans text-lg font-bold text-ink uppercase">
                  05 / REGISTRATION FEE PAYMENT (UPI)
                </h2>
                <span id="calculated-fee-pill" class="px-3 py-1 bg-accent/20 border border-accent text-accent-dark font-mono text-xs font-bold uppercase">
                  TOTAL: ₹750 (3 MEMBERS × ₹250)
                </span>
              </div>

              <!-- UPI Info Box -->
              <div class="grid grid-cols-1 md:grid-cols-12 gap-6 bg-canvas p-5 border border-line">
                <div class="md:col-span-8 space-y-3">
                  <div class="text-xs text-accent-dark font-bold">// OFFICIAL UPI PAYMENT DETAILS</div>
                  
                  <div class="space-y-1 text-xs">
                    <div class="text-muted text-[11px]">UPI ID / VPA:</div>
                    <div class="flex items-center justify-between bg-paper p-3 border border-line text-ink font-bold font-mono">
                      <span id="reg-upi-id">${eventConfig.paymentDetails.upiId}</span>
                      <button type="button" id="copy-reg-upi-btn" class="text-xs text-accent hover:underline cursor-pointer font-mono font-bold">
                        [COPY UPI]
                      </button>
                    </div>
                    <div class="text-[10px] text-muted">PAYEE: ${eventConfig.paymentDetails.payeeName}</div>
                  </div>

                  <div class="p-3 bg-paper border border-line text-[11px] text-muted space-y-1 font-sans">
                    <div>1. Open Google Pay, PhonePe, Paytm, or any UPI app.</div>
                    <div>2. Pay <strong id="calculated-pay-amount-text" class="text-ink font-bold">₹750</strong> for your team.</div>
                    <div>3. Note down the 12-digit UTR / transaction ID and take a screenshot of the receipt.</div>
                  </div>
                </div>

                <div class="md:col-span-4 flex flex-col items-center justify-center p-4 bg-paper border border-line text-center space-y-2">
                  <div class="p-2 bg-canvas border border-line">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(`upi://pay?pa=${eventConfig.paymentDetails.upiId}&pn=${encodeURIComponent(eventConfig.paymentDetails.payeeName)}&cu=INR`)}&color=10100E&bgcolor=F8F7F2" alt="UPI QR Code" class="w-28 h-28 object-contain" />
                  </div>
                  <div class="text-[10px] text-muted font-mono font-bold">SCAN WITH ANY UPI APP</div>
                </div>
              </div>

              <!-- Payment Inputs -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <label class="block text-xs text-ink mb-2">PAYER FULL NAME (NAME ON UPI ACCOUNT) *</label>
                  <input type="text" name="payer_name" required placeholder="e.g. Arjun Leader" class="w-full px-4 py-3 text-xs focus:border-accent outline-none font-mono" />
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2">12-DIGIT UTR / REFERENCE NUMBER *</label>
                  <input type="text" name="utr_number" required pattern="[a-zA-Z0-9]{8,24}" placeholder="e.g. 202698765432" class="w-full px-4 py-3 text-xs focus:border-accent outline-none font-mono" />
                  <div class="text-[10px] text-muted mt-1 font-sans">Enter the 12-digit transaction number from your UPI receipt.</div>
                </div>

              </div>

              <div>
                <label class="block text-xs text-ink mb-2">PAYMENT PROOF SCREENSHOT *</label>
                <input type="file" name="payment_screenshot" accept="image/jpeg,image/png,image/webp,image/heic" required class="w-full bg-canvas border border-line p-3 text-xs text-muted file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-accent file:text-ink file:font-bold file:text-xs cursor-pointer font-mono" />
                <div class="text-[10px] text-muted mt-1 font-sans">Upload clear screenshot showing UTR number, date, and amount (JPG, PNG, WEBP - Max 10MB).</div>
              </div>

            </div>

            <!-- SECTION 6: CODE OF CONDUCT & SUBMIT -->
            <div class="tech-card p-6 border-line bg-paper space-y-4">
              <label class="flex items-start gap-3 cursor-pointer text-xs text-muted font-sans">
                <input type="checkbox" name="rules_agreed" required class="mt-1 accent-accent" />
                <span>
                  I confirm that all team members are enrolled students and agree to abide by the <strong class="text-ink">Gambit’s Glitch Rules and Code of Conduct</strong>. I understand that all 40 slots are locked strictly on a First-Come, First-Served basis upon payment verification.
                </span>
              </label>

              <button type="submit" id="submit-reg-btn" class="nav-link btn-primary w-full py-4 text-xs font-bold tracking-widest uppercase">
                ⚡ REGISTER TEAM & SUBMIT ₹${(3 * fee).toLocaleString()} PAYMENT (LOCK FCFS SLOT) →
              </button>
            </div>

          </form>

          <!-- Success Modal -->
          <div id="reg-success-modal" class="hidden fixed inset-0 z-50 bg-canvas/95 flex items-center justify-center p-4 font-mono">
            <div class="tech-card p-8 md:p-12 border-accent bg-paper max-w-xl w-full text-center space-y-6">
              <div class="w-12 h-12 bg-accent text-ink font-bold flex items-center justify-center text-2xl mx-auto font-sans">
                ✔
              </div>

              <h2 class="font-serif text-4xl font-normal italic text-ink">Registration & Payment Submitted</h2>
              
              <div class="p-4 bg-canvas border border-accent text-center space-y-2">
                <div class="text-xs text-muted">YOUR UNIQUE REGISTRATION ID</div>
                <div id="success-reg-id" class="font-mono text-3xl font-bold text-accent-dark tracking-wider">GG26-XXXX</div>
                <div class="text-[11px] text-muted">STATUS: PAYMENT VERIFICATION PENDING (FCFS)</div>
              </div>

              <p class="text-xs text-muted leading-relaxed font-sans">
                Your squad registration and payment proof have been received successfully! Slots are allocated strictly on a <strong>First-Come, First-Served (FCFS)</strong> basis capped at <strong>only 40 teams</strong>. Once our organizers verify your UTR reference, your official Attendance QR Pass & Invoice will be issued.
              </p>

              <div class="p-3 bg-canvas border border-line text-left text-xs space-y-1">
                <div class="text-accent-dark font-bold">// ON-SPOT PROBLEM STATEMENT REMINDER:</div>
                <div class="text-muted text-[11px]">
                  Exact problem statements will be revealed live at <strong>09:30 AM IST on October 13, 2026 at Auditorium, VSBCETC</strong> (following Inauguration at 09:00 AM). No advance PPT submission is required.
                </div>
              </div>

              <div class="flex flex-col gap-3 pt-2">
                <button id="modal-check-status" class="nav-link btn-primary w-full py-3.5 text-xs font-bold tracking-wider uppercase">
                  ⚡ VIEW STATUS TRACKER →
                </button>
                <button id="modal-go-home" class="btn-secondary w-full py-2.5 text-xs font-mono font-bold uppercase border border-line hover:border-accent">
                  🏠 RETURN TO HOMEPAGE
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  attachEvents() {
    const selectedTrackId = sessionStorage.getItem('selected_track_id');
    const matchedTrack = this.findMatchingTrack(selectedTrackId);
    const themeSelect = document.querySelector('select[name="theme_id"]') || document.getElementById('theme-id-select');
    if (themeSelect && matchedTrack) {
      themeSelect.value = matchedTrack.id;
    }

    const selectEl = document.getElementById('member-count-select');
    const containerEl = document.getElementById('members-input-container');
    const feePill = document.getElementById('calculated-fee-pill');
    const payAmountText = document.getElementById('calculated-pay-amount-text');
    const submitBtn = document.getElementById('submit-reg-btn');

    // In-memory data store for member input values so nothing is lost when changing squad size
    const memberDataStore = {};

    const saveCurrentMemberData = () => {
      if (!containerEl) return;
      const inputs = containerEl.querySelectorAll('input');
      inputs.forEach(input => {
        if (input.name) {
          memberDataStore[input.name] = input.value;
        }
      });
    };

    if (containerEl) {
      containerEl.addEventListener('input', (e) => {
        if (e.target && e.target.name) {
          memberDataStore[e.target.name] = e.target.value;
        }
      });
    }

    const updateMemberInputs = (totalMembers) => {
      saveCurrentMemberData();

      const feePerPerson = eventConfig.teamPolicy.registrationFee;
      const totalFee = totalMembers * feePerPerson;

      if (feePill) {
        feePill.textContent = `TOTAL: ₹${totalFee} (${totalMembers} MEMBERS × ₹${feePerPerson})`;
      }

      if (payAmountText) {
        payAmountText.textContent = `₹${totalFee}`;
      }

      if (submitBtn) {
        submitBtn.innerHTML = `⚡ REGISTER TEAM & SUBMIT ₹${totalFee} PAYMENT (LOCK FCFS SLOT) →`;
      }

      const extraCount = totalMembers - 1;
      let html = '';

      for (let i = 1; i <= extraCount; i++) {
        const nameKey = `member_${i}_name`;
        const emailKey = `member_${i}_email`;
        const phoneKey = `member_${i}_phone`;

        const nameVal = (memberDataStore[nameKey] || '').replace(/"/g, '&quot;');
        const emailVal = (memberDataStore[emailKey] || '').replace(/"/g, '&quot;');
        const phoneVal = (memberDataStore[phoneKey] || '').replace(/"/g, '&quot;');

        html += `
          <div class="p-4 bg-canvas border border-line space-y-4">
            <div class="text-xs text-accent-dark font-bold">// MEMBER 0${i + 1} DETAILS</div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-[11px] text-muted mb-1">MEMBER 0${i + 1} FULL NAME *</label>
                <input type="text" name="member_${i}_name" required value="${nameVal}" placeholder="Member Name" class="w-full px-3 py-2 text-xs focus:border-accent outline-none" />
              </div>
              <div>
                <label class="block text-[11px] text-muted mb-1">MEMBER 0${i + 1} EMAIL *</label>
                <input type="email" name="member_${i}_email" required value="${emailVal}" placeholder="member${i}@example.com" class="w-full px-3 py-2 text-xs focus:border-accent outline-none" />
              </div>
              <div>
                <label class="block text-[11px] text-muted mb-1">MEMBER 0${i + 1} PHONE *</label>
                <input type="tel" name="member_${i}_phone" required value="${phoneVal}" placeholder="+91 9123456780" class="w-full px-3 py-2 text-xs focus:border-accent outline-none" />
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

    // Copy UPI Button
    const copyUpiBtn = document.getElementById('copy-reg-upi-btn');
    const upiText = document.getElementById('reg-upi-id');
    if (copyUpiBtn && upiText) {
      copyUpiBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(upiText.textContent.trim());
        toast.show('UPI ID copied to clipboard!', 'success');
      });
    }

    const form = document.getElementById('registration-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        soundFx.playClick();

        const memberCount = parseInt(selectEl.value);
        const totalFee = memberCount * eventConfig.teamPolicy.registrationFee;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `⏳ TRANSMITTING REGISTRATION & VERIFYING PAYMENT...`;

        const formData = new FormData(form);

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
        formData.set('amount', totalFee.toString());
        formData.set('rules_agreed', 'true');

        try {
          const res = await api.registerTeam(formData);
          if (res.success) {
            soundFx.playGlitch();
            toast.show(`Registration & Payment submitted! ID: ${res.reg_id}`, 'success');
            
            sessionStorage.setItem('last_reg_id', res.reg_id);

            const modal = document.getElementById('reg-success-modal');
            const regIdEl = document.getElementById('success-reg-id');
            if (modal && regIdEl) {
              regIdEl.textContent = res.reg_id;
              modal.classList.remove('hidden');
              modal.classList.add('flex');
            }

            const checkStatusBtn = document.getElementById('modal-check-status');
            if (checkStatusBtn) {
              checkStatusBtn.addEventListener('click', () => {
                this.navigate('status');
              });
            }

            const goHomeBtn = document.getElementById('modal-go-home');
            if (goHomeBtn) {
              goHomeBtn.addEventListener('click', () => {
                this.navigate('home');
              });
            }

          } else {
            if (res.capacityFull) {
              toast.show(`REGISTRATION CLOSED: ${res.message}`, 'error', 8000);
            } else {
              toast.show(res.message || 'Registration failed.', 'error');
            }
            submitBtn.disabled = false;
            submitBtn.innerHTML = `⚡ REGISTER TEAM & SUBMIT ₹${totalFee} PAYMENT (LOCK FCFS SLOT) →`;
          }
        } catch (err) {
          toast.show('Network error submitting registration.', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = `⚡ REGISTER TEAM & SUBMIT ₹${totalFee} PAYMENT (LOCK FCFS SLOT) →`;
        }
      });
    }
  }
}
