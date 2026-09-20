/**
 * GAMBIT'S GLITCH - 06 / TRANSMIT YOUR ENTRY (PPT Submission View)
 */

import { eventConfig } from '../config/eventConfig.js';
import { api } from '../utils/api.js';
import { toast } from '../utils/toast.js';
import { soundFx } from '../utils/audio.js';

export class SubmitPptPage {
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
            <div class="text-xs text-accent-dark tracking-widest uppercase mb-2">06 / TRANSMIT YOUR ENTRY — PPT GATE</div>
            <h1 class="font-serif text-5xl sm:text-7xl font-normal italic text-ink">
              Submit Pitch Deck
            </h1>
            <p class="text-sm text-muted mt-4 leading-relaxed font-sans">
              Upload your initial pitch presentation (.ppt, .pptx, .pdf). <strong class="text-accent-dark font-bold">Note: Gate access is unlocked only for teams with APPROVED payment status.</strong>
            </p>
          </div>

          <!-- Form Card -->
          <form id="ppt-form" class="tech-card p-6 md:p-10 border-line bg-paper space-y-6">
            
            <div class="flex items-center justify-between border-b border-line pb-3">
              <h2 class="font-sans text-xl font-bold text-ink uppercase">
                PITCH DECK UPLOAD GATE
              </h2>
              <span class="text-xs text-accent-dark font-bold">MAX FILE SIZE: 15 MB</span>
            </div>

            <div>
              <label class="block text-xs text-ink mb-2">TEAM REGISTRATION ID *</label>
              <input type="text" name="reg_id" required value="${defaultRegId}" placeholder="e.g. GG26-8F92" class="w-full px-4 py-3 text-xs text-accent-dark font-bold uppercase tracking-wider focus:border-accent outline-none" />
              <div class="text-[10px] text-muted mt-1 font-sans">Your registered Team ID. Payment must be approved first.</div>
            </div>

            <div>
              <label class="block text-xs text-ink mb-2">PROJECT TITLE *</label>
              <input type="text" name="project_title" required placeholder="e.g. GLITCH_NET: Decentralized WASM Edge Proxy" class="w-full px-4 py-3 text-xs focus:border-accent outline-none" />
            </div>

            <div>
              <label class="block text-xs text-ink mb-2">SHORT PROJECT SUMMARY *</label>
              <textarea name="summary" required rows="4" placeholder="Describe the problem, proposed architectural solution, key technical stack, and target impact..." class="w-full p-4 text-xs focus:border-accent outline-none leading-relaxed font-sans"></textarea>
            </div>

            <div>
              <label class="block text-xs text-ink mb-2">PRESENTATION FILE (.PPT, .PPTX, .PDF) *</label>
              <input type="file" name="ppt_file" accept=".ppt,.pptx,.pdf" required class="w-full bg-canvas border border-line p-3 text-xs text-muted file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-accent file:text-ink file:font-bold file:text-xs cursor-pointer" />
              <div class="text-[10px] text-muted mt-1 font-sans">Maximum size 15 MB. Re-uploading before deadline will update your submission version.</div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-ink mb-2">REPOSITORY LINK (OPTIONAL)</label>
                <input type="url" name="repo_link" placeholder="https://github.com/team/repo" class="w-full px-4 py-3 text-xs focus:border-accent outline-none" />
              </div>

              <div>
                <label class="block text-xs text-ink mb-2">DEMO / PROTOTYPE URL (OPTIONAL)</label>
                <input type="url" name="demo_link" placeholder="https://demo.app" class="w-full px-4 py-3 text-xs focus:border-accent outline-none" />
              </div>
            </div>

            <button type="submit" id="submit-ppt-btn" class="nav-link btn-primary w-full py-4 text-xs font-bold tracking-widest uppercase">
              ⚡ UPLOAD PITCH DECK & GENERATE RECEIPT →
            </button>

          </form>

          <!-- Receipt Container -->
          <div id="ppt-receipt-card" class="hidden tech-card p-8 border-accent bg-paper space-y-6 mt-8">
            <div class="flex items-center justify-between border-b border-line pb-3">
              <span class="text-xs text-accent-dark font-bold">// SUBMISSION RECEIPT GENERATED</span>
              <span id="rcpt-timestamp" class="text-xs text-muted">2026-09-19 22:00</span>
            </div>

            <div class="p-4 bg-canvas border border-line text-xs space-y-2">
              <div>RECEIPT ID: <strong id="rcpt-id" class="text-accent">RCPT-XXXXXX</strong></div>
              <div>TEAM REG ID: <strong id="rcpt-reg-id" class="text-ink">GG26-XXXX</strong></div>
              <div>FILE NAME: <strong id="rcpt-filename" class="text-ink font-bold">Presentation.pdf</strong></div>
              <div>SUBMISSION VERSION: <strong id="rcpt-version" class="text-accent-dark font-bold">1</strong></div>
            </div>

            <div class="text-xs text-muted leading-relaxed font-sans">
              Your PPT pitch deck has been securely received. You can re-upload to update your version anytime before the PPT deadline (${eventConfig.dates.pptDeadline.split('T')[0]}).
            </div>

            <button id="rcpt-view-status" class="nav-link btn-secondary w-full py-3 text-xs">
              GO TO STATUS TRACKER
            </button>
          </div>

        </div>
      </div>
    `;
  }

  attachEvents() {
    const form = document.getElementById('ppt-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        soundFx.playClick();

        const submitBtn = document.getElementById('submit-ppt-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `VERIFYING PAYMENT & UPLOADING...`;

        const formData = new FormData(form);

        try {
          const res = await api.submitPpt(formData);
          if (res.success) {
            soundFx.playGlitch();
            toast.show('PPT pitch deck successfully submitted!', 'success');

            const receiptCard = document.getElementById('ppt-receipt-card');
            if (receiptCard && res.receipt) {
              document.getElementById('rcpt-id').textContent = res.receipt.receipt_id;
              document.getElementById('rcpt-reg-id').textContent = res.receipt.reg_id;
              document.getElementById('rcpt-filename').textContent = res.receipt.original_filename;
              document.getElementById('rcpt-version').textContent = `v${res.receipt.version}`;
              document.getElementById('rcpt-timestamp').textContent = res.receipt.submitted_at;

              receiptCard.classList.remove('hidden');

              document.getElementById('rcpt-view-status').addEventListener('click', () => {
                this.navigate('status');
              });
            }

            submitBtn.innerHTML = `✔ UPLOAD COMPLETED`;
          } else {
            if (res.locked) {
              toast.show(`SUBMISSION LOCKED: ${res.message}`, 'error', 7000);
            } else {
              toast.show(res.message || 'PPT upload failed.', 'error');
            }
            submitBtn.disabled = false;
            submitBtn.innerHTML = `⚡ UPLOAD PITCH DECK & GENERATE RECEIPT →`;
          }
        } catch (err) {
          toast.show('Network error during PPT upload.', 'error');
          submitBtn.disabled = false;
          submitBtn.innerHTML = `⚡ UPLOAD PITCH DECK & GENERATE RECEIPT →`;
        }
      });
    }
  }
}
