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
              Pay ₹300 per person via UPI, upload your payment screenshot, and provide the 12-digit UTR/Reference number for manual verification.
            </p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- Left Column: UPI QR Intel -->
            <div class="lg:col-span-5 space-y-6">
              
              <div class="tech-card p-6 border-accent bg-paper space-y-4">
                <div class="text-xs text-accent-dark font-bold">// UPI PAYMENT INTEL</div>
                
                <div class="p-4 bg-canvas border border-line text-center space-y-2">
                  <div class="text-[11px] text-muted">REGISTRATION FEE</div>
                  <div class="font-mono text-3xl font-bold text-accent">₹300 / PER PERSON</div>
                  <div class="text-[10px] text-muted">INCLUDES 10-HOUR ACCESS, MEALS & MERCH</div>
                </div>

                <div class="space-y-2 text-xs">
                  <div class="text-muted">UPI VPA / ID:</div>
                  <div class="flex items-center justify-between bg-canvas p-3 border border-line text-ink font-bold">
                    <span id="upi-id-text">${eventConfig.paymentDetails.upiId}</span>
                    <button id="copy-upi-btn" class="text-xs text-accent hover:underline cursor-pointer">COPY</button>
                  </div>
                  <div class="text-[10px] text-muted">PAYEE: ${eventConfig.paymentDetails.payeeName}</div>
                </div>

                <div class="p-6 bg-canvas border border-line flex flex-col items-center justify-center text-center space-y-2">
                  <div class="w-32 h-32 bg-paper border border-line flex items-center justify-center text-accent font-mono font-bold text-xs p-2">
                    [UPI QR CODE PLACEHOLDER]
                  </div>
                  <div class="text-[10px] text-muted">SCAN WITH ANY UPI APP (GPAY, PHONEPE, PAYTM)</div>
                </div>

              </div>

              <div class="tech-card p-4 border-line bg-paper text-[11px] text-muted space-y-2 font-sans">
                <div class="text-ink font-bold">🔒 SECURITY NOTICE</div>
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
                  <label class="block text-xs text-ink mb-2">TEAM REGISTRATION ID *</label>
                  <input type="text" name="reg_id" required value="${defaultRegId}" placeholder="e.g. GG26-8F92" class="w-full px-4 py-3 text-xs text-accent-dark font-bold tracking-wider focus:border-accent outline-none uppercase" />
                  <div class="text-[10px] text-muted mt-1 font-sans">Found in your registration success modal or status check.</div>
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2">PAYER FULL NAME *</label>
                  <input type="text" name="payer_name" required placeholder="Name on UPI account" class="w-full px-4 py-3 text-xs focus:border-accent outline-none" />
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2">12-DIGIT UTR / REFERENCE NUMBER *</label>
                  <input type="text" name="utr_number" required pattern="[a-zA-Z0-9]{8,24}" placeholder="e.g. 202698765432" class="w-full px-4 py-3 text-xs focus:border-accent outline-none font-mono" />
                  <div class="text-[10px] text-muted mt-1 font-sans">12-digit transaction ID from your UPI payment receipt.</div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-ink mb-2">PAYMENT DATE *</label>
                    <input type="date" name="payment_date" required value="${new Date().toISOString().split('T')[0]}" class="w-full px-3 py-3 text-xs focus:border-accent outline-none" />
                  </div>

                  <div>
                    <label class="block text-xs text-ink mb-2">AMOUNT PAID (₹) *</label>
                    <input type="number" name="amount" required readonly value="${eventConfig.teamPolicy.registrationFee}" class="w-full px-3 py-3 text-xs text-accent-dark font-bold outline-none" />
                  </div>
                </div>

                <div>
                  <label class="block text-xs text-ink mb-2">PAYMENT PROOF SCREENSHOT *</label>
                  <input type="file" name="screenshot" accept="image/jpeg,image/png,image/webp,image/heic" required class="w-full bg-canvas border border-line p-3 text-xs text-muted file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-accent file:text-ink file:font-bold file:text-xs cursor-pointer" />
                  <div class="text-[10px] text-muted mt-1 font-sans">Accepted formats: JPG, PNG, WEBP (Max 10MB).</div>
                </div>

                <button type="submit" id="submit-payment-btn" class="nav-link btn-primary w-full py-4 text-xs font-bold tracking-widest uppercase">
                  ⚡ SUBMIT PAYMENT FOR VERIFICATION →
                </button>

              </form>
            </div>

          </div>

        </div>
      </div>
    `;
  }

  attachEvents() {
    const copyBtn = document.getElementById('copy-upi-btn');
    const upiText = document.getElementById('upi-id-text');
    if (copyBtn && upiText) {
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(upiText.textContent);
        toast.show('UPI ID copied to clipboard!', 'success');
      });
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
            if (res.isDuplicateUtr) {
              toast.show(`WARNING: ${res.message}`, 'error', 6000);
            } else {
              toast.show(res.message || 'Payment submission failed.', 'error');
            }
            submitBtn.disabled = false;
            submitBtn.innerHTML = `⚡ SUBMIT PAYMENT FOR VERIFICATION →`;
          }
        } catch (err) {
          toast.show('Network error during payment submission.', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = `⚡ SUBMIT PAYMENT FOR VERIFICATION →`;
        }
      });
    }
  }
}
