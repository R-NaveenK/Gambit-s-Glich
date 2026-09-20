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
              Enter your Team Registration ID and Leader's email to verify real-time status across registration, payment approval, PPT submission, and shortlist decisions.
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
    const ppt = data.ppt;
    const pipelineStatus = data.pipeline_status;

    const isPaymentApproved = payment && payment.status === 'APPROVED';
    const isPaymentRejected = payment && payment.status === 'REJECTED';
    const isPptSubmitted = Boolean(ppt);
    const isShortlisted = pipelineStatus === 'SHORTLISTED';

    const pipelineBadge = isShortlisted
      ? 'border-accent text-accent-dark bg-paper font-bold'
      : pipelineStatus === 'REJECTED'
      ? 'border-error text-error bg-paper'
      : 'border-line text-ink bg-paper';

    resultsContainer.innerHTML = `
      <!-- Overview Card -->
      <div class="tech-card p-6 md:p-8 border-accent bg-paper space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <div>
            <div class="text-xs text-muted">TEAM: <strong class="text-ink">${data.team_name}</strong></div>
            <div class="text-xs text-accent-dark font-bold mt-1">ID: ${data.reg_id} // ${data.college}</div>
          </div>
          <div class="px-4 py-2 border ${pipelineBadge} text-xs tracking-widest uppercase font-mono">
            PIPELINE STATE: ${pipelineStatus.replace('_', ' ')}
          </div>
        </div>

        <!-- 4-STEP PIPELINE TRACKER VISUALIZER -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
          
          <div class="p-3 border border-accent bg-canvas text-accent-dark">
            <div class="font-bold">STEP 01</div>
            <div class="text-[10px]">REGISTERED</div>
            <div class="text-accent text-xs mt-1">✔ OK</div>
          </div>

          <div class="p-3 border ${isPaymentApproved ? 'border-accent text-accent-dark bg-canvas' : isPaymentRejected ? 'border-error text-error bg-canvas' : 'border-line text-muted bg-paper'}">
            <div class="font-bold">STEP 02</div>
            <div class="text-[10px]">PAYMENT PROOF</div>
            <div class="text-xs mt-1 font-bold">
              ${isPaymentApproved ? '✔ APPROVED' : isPaymentRejected ? '❌ REJECTED' : payment ? '⏳ PENDING' : '❌ MISSING'}
            </div>
          </div>

          <div class="p-3 border ${isPptSubmitted ? 'border-accent text-accent-dark bg-canvas' : isPaymentApproved ? 'border-line text-ink bg-canvas' : 'border-line text-muted bg-paper'}">
            <div class="font-bold">STEP 03</div>
            <div class="text-[10px]">PPT PITCH DECK</div>
            <div class="text-xs mt-1 font-bold">
              ${isPptSubmitted ? '✔ SUBMITTED' : isPaymentApproved ? '🔓 UNLOCKED' : '🔒 LOCKED'}
            </div>
          </div>

          <div class="p-3 border ${isShortlisted ? 'border-accent text-accent-dark bg-canvas' : 'border-line text-muted bg-paper'}">
            <div class="font-bold">STEP 04</div>
            <div class="text-[10px]">SHORTLIST STATUS</div>
            <div class="text-xs mt-1 font-bold">
              ${isShortlisted ? '⭐ SHORTLISTED' : 'PENDING JURY'}
            </div>
          </div>

        </div>
      </div>

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
                <a href="#" data-route="payment" class="nav-link btn-primary text-xs py-2 px-4 inline-block font-mono">
                  RE-SUBMIT CORRECTED PAYMENT PROOF →
                </a>
              </div>
            </div>
          ` : ''}

        ` : `
          <div class="text-xs text-muted space-y-3 font-sans">
            <p>No payment proof submitted yet for this team.</p>
            <a href="#" data-route="payment" class="nav-link btn-primary text-xs py-2 px-4 inline-block font-mono">
              SUBMIT PAYMENT PROOF NOW →
            </a>
          </div>
        `}
      </div>

      <!-- PPT Detail Box -->
      <div class="tech-card p-6 border-line bg-paper space-y-4">
        <h3 class="font-sans text-lg font-bold text-ink uppercase border-b border-line pb-2">
          PPT PITCH DECK SUBMISSION INTEL
        </h3>

        ${ppt ? `
          <div class="space-y-2 text-xs font-mono">
            <div>PROJECT TITLE: <strong class="text-accent-dark font-bold">${ppt.project_title}</strong></div>
            <div>FILE NAME: <strong class="text-ink">${ppt.original_filename}</strong> (Version ${ppt.version})</div>
            <div>LAST UPDATED: <strong class="text-ink">${ppt.submitted_at}</strong></div>
            ${ppt.repo_link ? `<div>REPO LINK: <a href="${ppt.repo_link}" target="_blank" class="text-accent underline">${ppt.repo_link}</a></div>` : ''}
          </div>
          <div class="pt-2">
            <a href="#" data-route="submit-ppt" class="nav-link btn-secondary text-xs py-2 px-4 inline-block font-mono">
              RE-UPLOAD / UPDATE PITCH DECK →
            </a>
          </div>
        ` : isPaymentApproved ? `
          <div class="text-xs text-accent-dark font-sans space-y-3">
            <p>🎉 Payment Approved! PPT submission gate is unlocked for your team.</p>
            <a href="#" data-route="submit-ppt" class="nav-link btn-primary text-xs py-2 px-4 inline-block font-mono">
              SUBMIT PPT PITCH DECK NOW →
            </a>
          </div>
        ` : `
          <div class="text-xs text-muted font-sans">
            🔒 PPT submission is locked. Payment approval is required before uploading presentation files.
          </div>
        `}
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
