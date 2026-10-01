/**
 * GAMBIT'S GLITCH - 07 / SYSTEM STATUS (Status Tracker View)
 */

import { api } from '../utils/api.js';
import { toast } from '../utils/toast.js';
import { soundFx } from '../utils/audio.js';

export class StatusTrackerPage {
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
            <div class="text-xs text-accent-dark tracking-widest uppercase mb-2">07 / SYSTEM STATUS</div>
            <h1 class="font-serif text-5xl sm:text-7xl font-normal italic text-ink">
              Pipeline Status Tracker
            </h1>
            <p class="text-sm text-muted mt-4 leading-relaxed font-sans">
              Enter your Team Registration ID and Leader's email to verify real-time status across squad registration, direct UPI fee payment verification, confirmed entry pass allocation, and on-spot problem statement briefing.
            </p>
          </div>

          <!-- Form -->
          <form id="status-lookup-form" class="tech-card p-6 md:p-8 border-line bg-paper space-y-6 mb-10">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label class="block text-xs text-ink mb-2">TEAM REGISTRATION ID *</label>
                <input type="text" name="reg_id" required value="${defaultRegId}" placeholder="e.g. GG26-8F92" class="w-full px-4 py-3 text-xs text-accent-dark font-bold uppercase tracking-wider focus:border-accent outline-none" />
              </div>

              <div>
                <label class="block text-xs text-ink mb-2">REGISTERED EMAIL *</label>
                <input type="email" name="email" required placeholder="leader@example.com" class="w-full px-4 py-3 text-xs focus:border-accent outline-none" />
              </div>

            </div>

            <button type="submit" id="lookup-btn" class="nav-link btn-primary w-full py-4 text-xs font-bold tracking-widest uppercase">
              ⚡ CHECK REAL-TIME STATUS →
            </button>
          </form>

          <!-- Status Display Results -->
          <div id="status-results-container" class="hidden space-y-8">
            <!-- Dynamically populated via JavaScript -->
          </div>

        </div>
      </div>
    `;
  }

  attachEvents() {
    const form = document.getElementById('status-lookup-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        soundFx.playClick();

        const submitBtn = document.getElementById('lookup-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `QUERYING DATABASE...`;

        const formData = new FormData(form);
        const regId = formData.get('reg_id');
        const email = formData.get('email');

        try {
          const res = await api.checkStatus(regId, email);
          if (res.success && res.data) {
            soundFx.playBeep();
            this.renderStatusDetails(res.data);
          } else {
            toast.show(res.message || 'Team status lookup failed.', 'error');
          }
        } catch (err) {
          toast.show('Network error looking up status.', 'error');
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `⚡ CHECK REAL-TIME STATUS →`;
        }
      });
    }
  }

  renderStatusDetails(data) {
    const resultsContainer = document.getElementById('status-results-container');
    if (!resultsContainer) return;

    const payment = data.payment;
    const pipelineStatus = data.pipeline_status;

    const isPaymentApproved = payment && payment.status === 'APPROVED';
    const isPaymentRejected = payment && payment.status === 'REJECTED';
    const isSlotConfirmed = isPaymentApproved || pipelineStatus === 'PAYMENT_APPROVED';

    const pipelineBadge = isSlotConfirmed
      ? 'border-success text-success bg-paper font-bold'
      : pipelineStatus === 'REJECTED'
      ? 'border-error text-error bg-paper'
      : 'border-accent text-accent-dark bg-paper font-bold';

    resultsContainer.innerHTML = `
      <!-- Overview Card -->
      <div class="tech-card p-6 md:p-8 border-accent bg-paper space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <div class="text-xs text-muted">TEAM: <strong class="text-ink">${data.team_name}</strong></div>
            <div class="text-xs text-accent-dark font-bold mt-1">ID: ${data.reg_id} // ${data.college}</div>
          </div>
          <div class="px-4 py-2 border ${pipelineBadge} text-xs tracking-widest uppercase font-mono">
            SLOT STATUS: ${isSlotConfirmed ? 'SLOT CONFIRMED' : pipelineStatus.replace('_', ' ')}
          </div>
        </div>

        <!-- 4-STEP PIPELINE TRACKER VISUALIZER (FIRST-COME, FIRST-SERVED) -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
          
          <div class="p-3 border border-accent bg-canvas text-accent-dark">
            <div class="font-bold">STEP 01</div>
            <div class="text-[10px]">SQUAD & PAYMENT</div>
            <div class="text-accent text-xs mt-1">✔ SUBMITTED</div>
          </div>

          <div class="p-3 border ${isPaymentApproved ? 'border-accent text-accent-dark bg-canvas' : isPaymentRejected ? 'border-error text-error bg-canvas' : payment ? 'border-accent text-accent-dark bg-canvas' : 'border-line text-muted bg-paper'}">
            <div class="font-bold">STEP 02</div>
            <div class="text-[10px]">PAYMENT VERIFICATION</div>
            <div class="text-xs mt-1 font-bold">
              ${isPaymentApproved ? '✔ VERIFIED' : isPaymentRejected ? '❌ REJECTED' : payment ? '⏳ PENDING' : '❌ UNPAID'}
            </div>
          </div>

          <div class="p-3 border ${isSlotConfirmed ? 'border-success text-success bg-canvas font-bold' : 'border-line text-muted bg-paper'}">
            <div class="font-bold">STEP 03</div>
            <div class="text-[10px]">ENTRY PASS & QR</div>
            <div class="text-xs mt-1 font-bold">
              ${isSlotConfirmed ? '⭐ CONFIRMED' : '⏳ AWAITING VERIFICATION'}
            </div>
          </div>

          <div class="p-3 border border-line text-ink bg-paper">
            <div class="font-bold">STEP 04</div>
            <div class="text-[10px]">ON-SPOT PROBLEM</div>
            <div class="text-xs mt-1 font-bold text-accent-dark">
              OCT 13 (09:00 AM)
            </div>
          </div>

        </div>
      </div>

      <!-- FCFS Team Action Banner Callout & Official Pass -->
      ${isSlotConfirmed ? `
        <div class="tech-card p-6 border-2 border-success bg-paper space-y-4 shadow-md">
          <div class="flex items-center justify-between border-b border-line pb-3">
            <div class="text-xs text-success font-bold font-mono">// PARTICIPATION SLOT CONFIRMED (FCFS)</div>
            <span class="px-2.5 py-0.5 border border-success bg-success/10 text-success text-[10px] font-bold font-mono uppercase">OFFICIAL ENTRY PASS VALID</span>
          </div>
          <h3 class="font-sans text-2xl font-bold text-ink uppercase">
            🎉 CONGRATULATIONS! TEAM ${data.team_name} HAS A CONFIRMED SLOT!
          </h3>
          <p class="text-xs text-ink font-sans leading-relaxed">
            Your registration fee has been verified and your team's confirmed slot (out of strictly 40 slots) for the grand finals at <strong>Auditorium, VSBCETC</strong> is secured!
          </p>

          <!-- Attendance QR Code Frame -->
          <div class="p-4 bg-canvas border border-line text-center space-y-3">
            <div class="text-[10px] text-muted font-mono font-bold uppercase tracking-wider">// OFFICIAL VENUE ATTENDANCE PASS QR:</div>
            <div class="inline-block p-2 bg-paper border border-line shadow-xs">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`GAMBIT'S GLITCH 2026 PASS\nID: ${data.reg_id}\nTeam: ${data.team_name}\nTrack: ${data.theme_id}\nStatus: PAID & VERIFIED`)}&color=10100E&bgcolor=F8F7F2" alt="Attendance Pass QR" class="w-44 h-44 mx-auto" />
            </div>
            <div class="text-xs font-mono font-bold text-ink">REG ID: <span class="text-accent-dark">${data.reg_id}</span></div>
            <p class="text-[11px] text-muted font-mono">Present this QR pass on your phone upon arrival at Auditorium, VSBCETC.</p>
          </div>
        </div>
      ` : `
        <div class="tech-card p-6 border-2 border-accent bg-paper space-y-4 shadow-md">
          <div class="text-xs text-accent-dark font-bold font-mono">// PAYMENT VERIFICATION IN PROGRESS (FCFS)</div>
          <h3 class="font-sans text-2xl font-bold text-ink uppercase">
            ⚡ SLOT CONFIRMATION PENDING ORGANIZER VERIFICATION
          </h3>
          <p class="text-xs text-ink font-sans leading-relaxed">
            Your registration and payment reference are currently being verified by event organizers. Slots are confirmed strictly on a <strong>First-Come, First-Served (FCFS)</strong> basis capped at <strong>only 40 teams</strong>.
          </p>
        </div>
      `}

      <!-- Payment Detail Box -->
      <div class="tech-card p-6 border-line bg-paper space-y-4">
        <h3 class="font-sans text-lg font-bold text-ink uppercase border-b border-line pb-2">
          PAYMENT VERIFICATION INTEL
        </h3>

        ${payment ? `
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div>UTR NUMBER: <strong class="text-accent-dark">${payment.utr_number}</strong></div>
            <div>PAYER NAME: <strong class="text-ink">${payment.payer_name}</strong></div>
            <div>PAYMENT DATE: <strong class="text-ink">${payment.payment_date}</strong></div>
          </div>

          ${isPaymentRejected ? `
            <div class="p-4 bg-canvas border border-error text-error text-xs space-y-2 font-sans">
              <div class="font-bold">⚠️ PAYMENT REJECTION REASON:</div>
              <div>"${payment.rejection_reason || 'Screenshot or UTR reference mismatch.'}"</div>
              <div class="pt-2">
                <a href="#" data-route="register" class="nav-link btn-primary text-xs py-2 px-4 inline-block font-mono">
                  RE-SUBMIT WITH CORRECTED UTR IN REGISTRATION →
                </a>
              </div>
            </div>
          ` : `
            <div class="text-xs text-muted font-sans">
              Payment Status: <strong class="${isPaymentApproved ? 'text-success font-bold' : 'text-accent-dark font-bold'}">${payment.status}</strong>. 
              ${isPaymentApproved ? 'Official Attendance Pass has been validated.' : 'Our team will review your UTR transaction shortly.'}
            </div>
          `}

        ` : `
          <div class="text-xs text-muted space-y-3 font-sans">
            <p>No payment proof attached. Please complete registration and payment via the Registration page.</p>
            <a href="#" data-route="register" class="nav-link btn-primary text-xs py-2 px-4 inline-block font-mono">
              GO TO REGISTRATION & SUBMIT PAYMENT PROOF →
            </a>
          </div>
        `}
      </div>

      <!-- On-Spot Problem Statement Box (Replaces PPT) -->
      <div class="tech-card p-6 border-line bg-paper space-y-4">
        <div class="flex items-center justify-between border-b border-line pb-2">
          <h3 class="font-sans text-lg font-bold text-ink uppercase">
            ON-SPOT PROBLEM STATEMENT INTEL
          </h3>
          <span class="px-2.5 py-0.5 text-[10px] font-bold border border-accent bg-accent/15 text-accent-dark font-mono uppercase">
            LIVE VENUE RELEASE
          </span>
        </div>

        <div class="space-y-3 text-xs font-mono">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-canvas p-4 border border-line">
            <div>SELECTED TRACK: <strong class="text-accent-dark font-bold">${data.theme_id}</strong></div>
            <div>CHALLENGE RELEASE: <strong class="text-ink">09:30 AM IST // OCT 13, 2026</strong></div>
            <div>VENUE: <strong class="text-ink">Auditorium, VSBCETC</strong></div>
            <div>SPRINT DURATION: <strong class="text-ink">8 HOURS CONTINUOUS BUILD (09:30 AM – 05:30 PM)</strong></div>
          </div>

          <p class="text-xs text-muted font-sans leading-relaxed">
            <strong class="text-ink">No prior PPT or deck submission is required.</strong> On the morning of October 13 at 09:30 AM IST, the official real-world problem statements for your selected track will be announced live. Teams will have 8 hours to build, architect, and deploy their prototype before final code freeze at 05:30 PM.
          </p>
        </div>
      </div>
    `;

    resultsContainer.classList.remove('hidden');

    const navLinks = resultsContainer.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.getAttribute('data-route');
        if (route) this.navigate(route);
      });
    });
  }
}
