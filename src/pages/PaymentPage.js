/**
 * GAMBIT'S GLITCH - 06 / TRANSMIT YOUR ENTRY (Payment View)
 */

import { eventConfig } from '../config/eventConfig.js';
import { api } from '../utils/api.js';
import { toast } from '../utils/toast.js';
import { soundFx } from '../utils/audio.js';

export class PaymentPage {
  constructor(navigate) {
    this.navigate = navigate;
  }

  render() {
    const defaultRegId = sessionStorage.getItem('last_reg_id') || '';

    return `
      <div class="py-16 font-mono bg-canvas">
        <div class="container mx-auto px-4 max-w-4xl">
          
          <!-- Header -->
          <div class="border-b border-line pb-8 mb-10">
            <div class="text-xs text-accent-dark tracking-widest uppercase mb-2">06 / TRANSMIT YOUR ENTRY — STEP 02</div>
            <h1 class="font-serif text-5xl sm:text-7xl font-normal italic text-ink">
              Payment Verification
            </h1>
            <p class="text-sm text-muted mt-4 leading-relaxed font-sans">
              Enter your Team Registration ID. The system will instantly verify your shortlisting status, squad roster, and calculate the total fee (₹300 per member).
            </p>
          </div>

          <!-- Gate Locked Container -->
          <div id="payment-gate-locked-card" class="hidden tech-card p-8 sm:p-12 border-2 border-accent/60 bg-paper text-center space-y-6 max-w-2xl mx-auto my-8 shadow-xl">
            <div>
              <div class="text-xs text-accent-dark font-bold font-mono uppercase tracking-widest mb-1">// PAYMENT PORTAL GATE STATUS: LOCKED</div>
              <h2 class="font-sans text-2xl sm:text-3xl font-extrabold text-ink uppercase">Payment Submission Not Yet Open</h2>
            </div>

            <p class="text-xs text-muted font-mono leading-relaxed max-w-lg mx-auto">
              The payment portal will be officially opened by administrators once team shortlisting is announced. 
              If your team is shortlisted, you will receive an official notification to process payment.
            </p>

            <div class="pt-4 flex flex-wrap items-center justify-center gap-4">
              <button id="gate-view-status-btn" type="button" class="btn-primary py-3 px-8 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer">
                CHECK SHORTLIST STATUS
              </button>
            </div>
          </div>

          <div id="payment-content-area" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- Left Column: UPI QR Intel -->
            <div class="lg:col-span-5 space-y-6">
              
              <div class="tech-card p-6 border-accent bg-paper space-y-4">
                <div class="text-xs text-accent-dark font-bold font-mono">// UPI PAYMENT INTEL</div>
                
                <div class="p-4 bg-canvas border border-line text-center space-y-2">
                  <div class="text-[11px] text-muted font-mono">REGISTRATION FEE RATE</div>
                  <div class="font-mono text-2xl font-bold text-accent">₹300 / PER PERSON</div>
                  <div id="upi-calculated-total" class="text-xs text-accent-dark font-bold font-mono border-t border-line/60 pt-2 mt-1">
                    TOTAL: ENTER TEAM ID FOR AUTO-CALCULATION
                  </div>
                  <div class="text-[10px] text-muted font-mono">INCLUDES ACCESS, MEALS & EVENT MERCH</div>
                </div>

                <div class="space-y-2 text-xs font-mono">
                  <div class="text-muted">UPI VPA / ID:</div>
                  <div class="flex items-center justify-between bg-canvas p-3 border border-line text-ink font-bold">
                    <span id="upi-id-text">${eventConfig.paymentDetails.upiId}</span>
                    <button id="copy-upi-btn" class="text-xs text-accent hover:underline cursor-pointer">COPY</button>
                  </div>
                  <div class="text-[10px] text-muted">PAYEE: ${eventConfig.paymentDetails.payeeName}</div>
                </div>

                <div class="p-6 bg-canvas border border-line flex flex-col items-center justify-center text-center space-y-2">
                  <div class="w-32 h-32 bg-paper border border-line flex items-center justify-center text-accent font-mono font-bold text-xs p-2">
                    [UPI QR CODE]
                  </div>
                  <div class="text-[10px] text-muted font-mono">SCAN WITH ANY UPI APP (GPAY, PHONEPE, PAYTM)</div>
                </div>

              </div>

              <div class="tech-card p-4 border-line bg-paper text-[11px] text-muted space-y-2 font-sans">
                <div class="text-ink font-bold font-mono">SECURITY NOTICE</div>
                <p>We only collect transaction reference numbers (UTR) and payment screenshots for manual verification. We NEVER request UPI PINs, bank passwords, or sensitive credentials.</p>
              </div>

            </div>

            <!-- Right Column: Verification Form -->
            <div class="lg:col-span-7">
              <form id="payment-form" class="tech-card p-6 md:p-8 border-line bg-paper space-y-6">
                
                <h2 class="font-sans text-xl font-bold text-ink uppercase border-b border-line pb-3">
                  TRANSACTION VERIFICATION FORM
                </h2>

                <div>
                  <div class="flex items-center justify-between mb-2">
                    <label class="block text-xs text-ink font-mono font-bold">TEAM REGISTRATION ID *</label>
                    <span id="pay-id-status-indicator" class="text-[10px] font-mono font-bold text-muted uppercase">
                      TYPE ID TO VERIFY
                    </span>
                  </div>
                  <input type="text" id="pay-reg-id-input" name="reg_id" required value="${defaultRegId}" placeholder="Enter Team Registration ID (e.g. GG26-8F92)" class="w-full px-4 py-3 text-xs text-accent-dark font-bold tracking-wider focus:border-accent outline-none uppercase font-mono bg-canvas border border-line transition-all" />
                  <div class="text-[10px] text-muted mt-1 font-sans">Details & fee calculation load automatically as you type.</div>
                </div>

                <!-- DYNAMIC SHORTLISTED TEAM INTEL & CALCULATED FEE CARD -->
                <div id="team-intel-card" class="hidden p-5 bg-canvas border-2 border-accent space-y-4 font-mono text-xs shadow-xs">
                  <div class="flex items-center justify-between border-b border-line pb-3">
                    <div>
                      <div class="text-[10px] text-accent-dark font-bold uppercase tracking-wider">// VERIFIED SQUAD INTEL</div>
                      <div id="intel-team-name" class="font-sans text-lg font-extrabold text-ink uppercase">--</div>
                    </div>
                    <div id="intel-status-badge" class="px-3 py-1 text-[10px] font-bold border border-success text-success uppercase bg-paper">
                      SHORTLISTED
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-3 text-[11px]">
                    <div>COLLEGE: <strong id="intel-college" class="text-ink">--</strong></div>
                    <div>LEADER: <strong id="intel-leader" class="text-ink">--</strong></div>
                    <div>SQUAD ROSTER: <strong id="intel-members" class="text-accent-dark font-bold">-- Members</strong></div>
                    <div>RATE PER MEMBER: <strong class="text-ink">₹300</strong></div>
                  </div>

                  <div class="p-3.5 bg-paper border border-accent flex items-center justify-between text-xs">
                    <div>
                      <div class="text-[10px] text-muted font-mono uppercase">TOTAL CALCULATED FEE</div>
                      <div id="intel-calculation-formula" class="text-[10px] text-accent-dark font-mono font-bold">-- Members × ₹300</div>
                    </div>
                    <span id="intel-total-display" class="text-accent-dark font-extrabold text-xl font-mono">₹--</span>
                  </div>
                </div>

                <!-- NOT SHORTLISTED WARNING NOTICE -->
                <div id="team-not-shortlisted-card" class="hidden p-5 bg-canvas border-2 border-error/70 space-y-3 font-mono text-xs">
                  <div class="flex items-center justify-between border-b border-line pb-2">
                    <div class="text-error font-bold uppercase text-xs">// STATUS: NOT YET SHORTLISTED</div>
                    <span class="px-2.5 py-0.5 text-[10px] font-bold border border-error text-error bg-paper uppercase" id="not-shortlist-badge">
                      UNDER REVIEW
                    </span>
                  </div>
                  <div id="not-shortlist-team-info" class="font-sans text-sm font-bold text-ink uppercase">--</div>
                  <p class="text-[11px] text-muted font-mono leading-relaxed">
                    ⚠️ Payment is strictly reserved for teams that have been officially shortlisted by hackathon organizers. Your team is currently undergoing review.
                  </p>
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2 font-mono">PAYER FULL NAME *</label>
                  <input type="text" id="pay-payer-name" name="payer_name" required placeholder="Name on UPI account" class="w-full px-4 py-3 text-xs focus:border-accent outline-none font-mono" />
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2 font-mono">12-DIGIT UTR / REFERENCE NUMBER *</label>
                  <input type="text" id="pay-utr-number" name="utr_number" required pattern="[a-zA-Z0-9]{8,24}" placeholder="e.g. 202698765432" class="w-full px-4 py-3 text-xs focus:border-accent outline-none font-mono" />
                  <div class="text-[10px] text-muted mt-1 font-sans">12-digit transaction ID from your UPI payment receipt.</div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-ink mb-2 font-mono">PAYMENT DATE *</label>
                    <input type="date" name="payment_date" required value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-3 text-xs focus:border-accent outline-none font-mono" />
                  </div>

                  <div>
                    <label class="block text-xs text-ink mb-2 font-mono">CALCULATED AMOUNT (₹) *</label>
                    <input type="number" name="amount" required readonly value="300" class="w-full px-3 py-3 text-xs text-accent-dark font-bold outline-none font-mono bg-canvas border border-line" />
                  </div>
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2 font-mono">PAYMENT PROOF SCREENSHOT *</label>
                  <input type="file" id="pay-screenshot-input" name="screenshot" accept="image/jpeg,image/png,image/webp,image/heic" required class="w-full bg-canvas border border-line p-3 text-xs text-muted file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-accent file:text-ink file:font-bold file:text-xs cursor-pointer font-mono" />
                  <div class="text-[10px] text-muted mt-1 font-sans">Accepted formats: JPG, PNG, WEBP (Max 10MB).</div>
                </div>

                <button type="submit" id="submit-payment-btn" class="btn-primary w-full py-4 text-xs font-mono font-bold tracking-widest uppercase">
                  SUBMIT PAYMENT FOR VERIFICATION
                </button>

              </form>
            </div>

          </div>

        </div>
      </div>
    `;
  }

  async attachEvents() {
    const checkGate = async () => {
      try {
        const res = await api.getPaymentGateStatus();
        const contentArea = document.getElementById('payment-content-area');
        const lockedCard = document.getElementById('payment-gate-locked-card');

        if (res && res.success && !res.open) {
          if (contentArea) contentArea.classList.add('hidden');
          if (lockedCard) lockedCard.classList.remove('hidden');
        } else {
          if (contentArea) contentArea.classList.remove('hidden');
          if (lockedCard) lockedCard.classList.add('hidden');
        }
      } catch (e) {}
    };

    checkGate();

    const statusBtn = document.getElementById('gate-view-status-btn');
    if (statusBtn) {
      statusBtn.addEventListener('click', () => {
        this.navigate('status');
      });
    }

    const copyBtn = document.getElementById('copy-upi-btn');
    const upiText = document.getElementById('upi-id-text');
    if (copyBtn && upiText) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(upiText.textContent);
        toast.show('UPI ID copied to clipboard!', 'success');
      });
    }

    // REAL-TIME AUTOMATIC TEAM FETCH & SHORTLIST VERIFICATION
    const regIdInput = document.getElementById('pay-reg-id-input');
    const statusIndicator = document.getElementById('pay-id-status-indicator');
    const intelCard = document.getElementById('team-intel-card');
    const notShortlistedCard = document.getElementById('team-not-shortlisted-card');
    const submitBtn = document.getElementById('submit-payment-btn');
    const amountInput = document.querySelector('input[name="amount"]');
    const upiTotalDisplay = document.getElementById('upi-calculated-total');

    let debounceTimer = null;

    const doRealtimeLookup = async (showNotifications = false) => {
      if (!regIdInput) return;
      const regId = regIdInput.value.trim().toUpperCase();

      if (!regId || regId.length < 3) {
        if (statusIndicator) statusIndicator.textContent = 'TYPE ID TO VERIFY';
        if (statusIndicator) statusIndicator.className = 'text-[10px] font-mono font-bold text-muted uppercase';
        if (intelCard) intelCard.classList.add('hidden');
        if (notShortlistedCard) notShortlistedCard.classList.add('hidden');
        if (upiTotalDisplay) upiTotalDisplay.textContent = 'TOTAL: ENTER TEAM ID FOR AUTO-CALCULATION';
        if (submitBtn) submitBtn.disabled = false;
        return;
      }

      if (statusIndicator) {
        statusIndicator.textContent = 'VERIFYING SQUAD...';
        statusIndicator.className = 'text-[10px] font-mono font-bold text-accent-dark uppercase animate-pulse';
      }

      try {
        const res = await api.lookupPaymentTeam(regId);

        if (res && res.success && res.team) {
          const t = res.team;

          if (t.is_shortlisted) {
            // TEAM IS SHORTLISTED AND ELIGIBLE
            if (statusIndicator) {
              statusIndicator.textContent = '✔ SHORTLISTED & VERIFIED';
              statusIndicator.className = 'text-[10px] font-mono font-bold text-success uppercase';
            }

            if (intelCard) {
              document.getElementById('intel-team-name').textContent = t.team_name;
              document.getElementById('intel-college').textContent = t.college;
              document.getElementById('intel-leader').textContent = t.leader_name;
              document.getElementById('intel-members').textContent = `${t.member_count} Members`;
              document.getElementById('intel-calculation-formula').textContent = `${t.member_count} Members × ₹300 per head`;
              document.getElementById('intel-total-display').textContent = `₹${t.calculated_total}`;
              intelCard.classList.remove('hidden');
            }

            if (notShortlistedCard) notShortlistedCard.classList.add('hidden');

            if (amountInput) amountInput.value = t.calculated_total;

            if (upiTotalDisplay) {
              upiTotalDisplay.textContent = `TOTAL PAYABLE: ₹${t.calculated_total} (${t.member_count} MEMBERS × ₹300)`;
            }

            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.textContent = `SUBMIT ₹${t.calculated_total} PAYMENT FOR VERIFICATION`;
            }

            if (showNotifications) {
              toast.show(`Team "${t.team_name}" is Shortlisted! Total fee: ₹${t.calculated_total}`, 'success');
            }

          } else {
            // TEAM EXISTS BUT IS NOT YET SHORTLISTED
            if (statusIndicator) {
              statusIndicator.textContent = '❌ NOT SHORTLISTED YET';
              statusIndicator.className = 'text-[10px] font-mono font-bold text-error uppercase';
            }

            if (intelCard) intelCard.classList.add('hidden');

            if (notShortlistedCard) {
              document.getElementById('not-shortlist-badge').textContent = t.status;
              document.getElementById('not-shortlist-team-info').textContent = `${t.team_name} (${t.reg_id}) — Leader: ${t.leader_name}`;
              notShortlistedCard.classList.remove('hidden');
            }

            if (upiTotalDisplay) {
              upiTotalDisplay.textContent = `STATUS: NOT YET SHORTLISTED`;
            }

            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.textContent = `PAYMENT LOCKED — TEAM NOT SHORTLISTED`;
            }

            if (showNotifications) {
              toast.show(`Team "${t.team_name}" has not been shortlisted yet. Payment is locked.`, 'error');
            }
          }
        } else {
          // INVALID OR UNREGISTERED TEAM ID
          if (statusIndicator) {
            statusIndicator.textContent = '❌ UNKNOWN TEAM ID';
            statusIndicator.className = 'text-[10px] font-mono font-bold text-error uppercase';
          }

          if (intelCard) intelCard.classList.add('hidden');
          if (notShortlistedCard) notShortlistedCard.classList.add('hidden');
          if (upiTotalDisplay) upiTotalDisplay.textContent = `TOTAL: ENTER TEAM ID FOR AUTO-CALCULATION`;
          if (submitBtn) submitBtn.disabled = false;

          if (showNotifications) {
            toast.show(res.message || 'No registered team found with this ID.', 'error');
          }
        }
      } catch (err) {
        if (statusIndicator) statusIndicator.textContent = 'ERROR VERIFYING';
      }
    };

    if (regIdInput) {
      // Real-time input listener with 250ms debounce
      regIdInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => doRealtimeLookup(false), 250);
      });

      regIdInput.addEventListener('blur', () => {
        doRealtimeLookup(false);
      });

      // Auto-trigger on initial page render if regId is prefilled from session
      if (regIdInput.value.trim()) {
        setTimeout(() => doRealtimeLookup(false), 150);
      }
    }

    const form = document.getElementById('payment-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        soundFx.playClick();

        const submitBtn = document.getElementById('submit-payment-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `UPLOADING & VERIFYING...`;

        const formData = new FormData(form);

        try {
          const res = await api.submitPayment(formData);
          if (res.success) {
            soundFx.playGlitch();
            toast.show('Payment screenshot submitted! Status: VERIFICATION PENDING.', 'success');
            
            setTimeout(() => {
              this.navigate('status');
            }, 1200);

          } else {
            if (res.isLocked) {
              toast.show(`PAYMENT GATE LOCKED: ${res.message}`, 'error', 6000);
              checkGate();
            } else if (res.isDuplicateUtr) {
              toast.show(`WARNING: ${res.message}`, 'error', 6000);
            } else {
              toast.show(res.message || 'Payment submission failed.', 'error');
            }
            submitBtn.disabled = false;
            submitBtn.innerHTML = `SUBMIT PAYMENT FOR VERIFICATION`;
          }
        } catch (err) {
          toast.show('Network error during payment submission.', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = `SUBMIT PAYMENT FOR VERIFICATION`;
        }
      });
    }
  }
}
