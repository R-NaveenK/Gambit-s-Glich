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
              Enter your Team Registration ID to auto-fetch squad details and calculate your total team payment fee (₹300 per member).
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
                  <div class="text-[11px] text-muted font-mono">REGISTRATION RATE</div>
                  <div class="font-mono text-2xl font-bold text-accent">₹300 / PER PERSON</div>
                  <div id="upi-calculated-total" class="text-xs text-accent-dark font-bold font-mono border-t border-line/60 pt-2 mt-1">
                    TOTAL: AUTO-CALCULATED ON ID FETCH
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
                  <label class="block text-xs text-ink mb-2 font-mono">TEAM REGISTRATION ID *</label>
                  <div class="flex gap-2">
                    <input type="text" id="pay-reg-id-input" name="reg_id" required value="${defaultRegId}" placeholder="e.g. GG26-8F92" class="w-full px-4 py-3 text-xs text-accent-dark font-bold tracking-wider focus:border-accent outline-none uppercase font-mono bg-canvas border border-line" />
                    <button type="button" id="fetch-team-btn" class="btn-secondary px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider border border-accent text-accent-dark hover:bg-accent hover:text-ink transition-all cursor-pointer whitespace-nowrap">
                      FETCH TEAM
                    </button>
                  </div>
                  <div class="text-[10px] text-muted mt-1 font-sans">Enter Team Registration ID and click Fetch Team to auto-calculate squad amount.</div>
                </div>

                <!-- DYNAMIC TEAM INTEL & CALCULATED FEE CARD -->
                <div id="team-intel-card" class="hidden p-4 bg-canvas border-2 border-accent space-y-3 font-mono text-xs">
                  <div class="flex items-center justify-between border-b border-line pb-2">
                    <div>
                      <div class="text-[10px] text-accent-dark font-bold uppercase">// VERIFIED TEAM INTEL</div>
                      <div id="intel-team-name" class="font-sans text-base font-bold text-ink uppercase">--</div>
                    </div>
                    <div id="intel-status-badge" class="px-2.5 py-1 text-[10px] font-bold border border-accent text-accent-dark uppercase bg-paper">
                      SHORTLISTED
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-2 text-[11px]">
                    <div>COLLEGE: <strong id="intel-college" class="text-ink">--</strong></div>
                    <div>LEADER: <strong id="intel-leader" class="text-ink">--</strong></div>
                    <div>SQUAD SIZE: <strong id="intel-members" class="text-accent-dark font-bold">-- Members</strong></div>
                    <div>RATE PER PERSON: <strong class="text-ink">₹300</strong></div>
                  </div>
                  <div class="p-3 bg-paper border border-accent flex items-center justify-between text-xs">
                    <span class="text-muted font-bold uppercase">TOTAL PAYABLE AMOUNT:</span>
                    <span id="intel-total-display" class="text-accent-dark font-extrabold text-lg font-mono">₹--</span>
                  </div>
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2 font-mono">PAYER FULL NAME *</label>
                  <input type="text" name="payer_name" required placeholder="Name on UPI account" class="w-full px-4 py-3 text-xs focus:border-accent outline-none font-mono" />
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2 font-mono">12-DIGIT UTR / REFERENCE NUMBER *</label>
                  <input type="text" name="utr_number" required pattern="[a-zA-Z0-9]{8,24}" placeholder="e.g. 202698765432" class="w-full px-4 py-3 text-xs focus:border-accent outline-none font-mono" />
                  <div class="text-[10px] text-muted mt-1 font-sans">12-digit transaction ID from your UPI payment receipt.</div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-ink mb-2 font-mono">PAYMENT DATE *</label>
                    <input type="date" name="payment_date" required value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-3 text-xs focus:border-accent outline-none font-mono" />
                  </div>

                  <div>
                    <label class="block text-xs text-ink mb-2 font-mono">CALCULATED TOTAL (₹) *</label>
                    <input type="number" name="amount" required readonly value="300" class="w-full px-3 py-3 text-xs text-accent-dark font-bold outline-none font-mono bg-canvas border border-line" />
                  </div>
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2 font-mono">PAYMENT PROOF SCREENSHOT *</label>
                  <input type="file" name="screenshot" accept="image/jpeg,image/png,image/webp,image/heic" required class="w-full bg-canvas border border-line p-3 text-xs text-muted file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-accent file:text-ink file:font-bold file:text-xs cursor-pointer font-mono" />
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

    // TEAM DETAILS LOOKUP & AUTOMATIC FEE CALCULATION
    const regIdInput = document.getElementById('pay-reg-id-input');
    const fetchBtn = document.getElementById('fetch-team-btn');

    const doTeamLookup = async (showToast = true) => {
      if (!regIdInput) return;
      const regId = regIdInput.value.trim();
      if (!regId) {
        if (showToast) toast.show('Please enter your Team Registration ID.', 'info');
        return;
      }

      if (fetchBtn) {
        fetchBtn.disabled = true;
        fetchBtn.textContent = 'FETCHING...';
      }

      try {
        const res = await api.lookupPaymentTeam(regId);
        const intelCard = document.getElementById('team-intel-card');
        const amountInput = document.querySelector('input[name="amount"]');
        const upiTotalDisplay = document.getElementById('upi-calculated-total');

        if (res && res.success && res.team) {
          const t = res.team;
          if (intelCard) {
            document.getElementById('intel-team-name').textContent = t.team_name;
            document.getElementById('intel-college').textContent = t.college;
            document.getElementById('intel-leader').textContent = t.leader_name;
            document.getElementById('intel-members').textContent = `${t.member_count} Members`;
            document.getElementById('intel-total-display').textContent = `₹${t.calculated_total}`;
            document.getElementById('intel-status-badge').textContent = t.status;
            intelCard.classList.remove('hidden');
          }

          if (amountInput) {
            amountInput.value = t.calculated_total;
          }

          if (upiTotalDisplay) {
            upiTotalDisplay.textContent = `TOTAL: ₹${t.calculated_total} (${t.member_count} MEMBERS × ₹300)`;
          }

          if (showToast) {
            toast.show(`Team "${t.team_name}" found! Total payable fee: ₹${t.calculated_total} (${t.member_count} members)`, 'success');
          }
        } else {
          if (intelCard) intelCard.classList.add('hidden');
          if (upiTotalDisplay) upiTotalDisplay.textContent = `TOTAL: AUTO-CALCULATED ON ID FETCH`;
          if (showToast) toast.show(res.message || 'No team found with this ID.', 'error');
        }
      } catch (err) {
        if (showToast) toast.show('Error fetching team details.', 'error');
      } finally {
        if (fetchBtn) {
          fetchBtn.disabled = false;
          fetchBtn.textContent = 'FETCH TEAM';
        }
      }
    };

    if (fetchBtn) {
      fetchBtn.addEventListener('click', () => {
        soundFx.playClick();
        doTeamLookup(true);
      });
    }

    if (regIdInput) {
      regIdInput.addEventListener('blur', () => {
        if (regIdInput.value.trim()) doTeamLookup(false);
      });
      // Run initial lookup if regId is prefilled from sessionStorage
      if (regIdInput.value.trim()) {
        setTimeout(() => doTeamLookup(false), 200);
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
