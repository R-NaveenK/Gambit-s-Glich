/**
 * GAMBIT'S GLITCH - Swiss Editorial Admin Control Panel
 */

import { api } from '../utils/api.js';
import { toast } from '../utils/toast.js';
import { soundFx } from '../utils/audio.js';
import { eventConfig } from '../config/eventConfig.js';

export class AdminPage {
  constructor(navigate) {
    this.navigate = navigate;
    this.stats = null;
    this.teams = [];
    this.logs = [];
    this.selectedTeam = null;
    this.scannedTeam = null;
    this.currentFilters = { search: '', theme: 'ALL', status: 'ALL' };
    this.searchDebounceTimer = null;
  }

  render() {
    if (!api.getToken()) {
      setTimeout(() => this.navigate('login'), 10);
      return `<div class="py-20 text-center font-mono text-xs text-muted">Redirecting to admin login...</div>`;
    }

    return `
      <div class="py-12 font-mono bg-canvas">
        <div class="container mx-auto px-4">
          
          <!-- Top Bar -->
          <div class="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6 mb-8">
            <div>
              <div class="text-xs text-accent-dark tracking-widest uppercase font-bold font-mono">[ADMIN CONTROL PANEL]</div>
              <h1 class="font-sans text-3xl sm:text-5xl font-extrabold uppercase text-ink">
                GAMBIT’S GLITCH DASHBOARD
              </h1>
            </div>

            <div class="flex flex-wrap items-center gap-2 sm:gap-3">
              <button id="admin-gate-toggle-btn" type="button" class="btn-secondary text-xs py-2.5 px-4 border border-line font-mono font-bold uppercase tracking-wider transition-all cursor-pointer">
                PAYMENT PORTAL: CHECKING...
              </button>
              <button id="admin-refresh-btn" type="button" class="btn-primary text-xs py-2.5 px-4 font-mono font-bold uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer">
                REFRESH DATA
              </button>
              <a href="${api.getExportCsvUrl()}" download class="btn-secondary text-xs py-2.5 px-4 border border-accent text-accent-dark font-mono font-bold uppercase tracking-wider hover:bg-accent hover:text-ink transition-all">
                EXPORT DATA CSV
              </a>
              <button id="admin-clear-btn" type="button" class="btn-secondary text-xs py-2.5 px-3 border border-error text-error font-mono font-bold uppercase tracking-wider hover:bg-error hover:text-white transition-all cursor-pointer">
                CLEAR ALL DATA
              </button>
              <button id="admin-logout-btn" type="button" class="btn-secondary text-xs py-2.5 px-3 border border-line text-muted font-mono font-bold uppercase tracking-wider hover:border-error hover:text-error transition-all cursor-pointer">
                LOGOUT
              </button>
            </div>
          </div>

          <!-- OVERVIEW STATS GRID -->
          <div id="admin-stats-grid" class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-10">
            <div class="tech-card p-4 border-line bg-paper text-center shadow-xs">
              <div class="text-[10px] text-muted uppercase font-mono font-bold">TOTAL TEAMS</div>
              <div id="stat-total" class="font-mono text-3xl font-bold text-ink">--</div>
            </div>
            <div class="tech-card p-4 border-line bg-paper text-center shadow-xs">
              <div class="text-[10px] text-muted uppercase font-mono font-bold">SHORTLISTED</div>
              <div id="stat-shortlist" class="font-mono text-3xl font-bold text-accent">--</div>
            </div>
            <div class="tech-card p-4 border-line bg-paper text-center shadow-xs">
              <div class="text-[10px] text-muted uppercase font-mono font-bold">PAYMENT PENDING</div>
              <div id="stat-pending" class="font-mono text-3xl font-bold text-accent-dark">--</div>
            </div>
            <div class="tech-card p-4 border-line bg-paper text-center shadow-xs">
              <div class="text-[10px] text-muted uppercase font-mono font-bold">PAYMENT APPROVED</div>
              <div id="stat-approved" class="font-mono text-3xl font-bold text-success">--</div>
            </div>
            <div class="tech-card p-4 border-line bg-paper text-center shadow-xs">
              <div class="text-[10px] text-muted uppercase font-mono font-bold">PPT SUBMISSIONS</div>
              <div id="stat-ppt" class="font-mono text-3xl font-bold text-ink">--</div>
            </div>
            <div class="tech-card p-4 border-line bg-paper text-center shadow-xs">
              <div class="text-[10px] text-muted uppercase font-mono font-bold">ATTENDANCE ENTRY</div>
              <div id="stat-attended" class="font-mono text-3xl font-bold text-success">--</div>
            </div>
          </div>

          <!-- VENUE CHECK-IN SCANNER LAUNCH TRIGGER BANNER -->
          <div class="tech-card p-6 border-2 border-accent/40 bg-paper mb-8 flex flex-wrap items-center justify-between gap-6 shadow-sm hover:border-accent transition-all">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs text-accent-dark font-bold font-mono">// VENUE ENTRY & TICKET CHECK-IN</span>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-accent/15 border border-accent text-accent-dark text-[10px] font-bold font-mono uppercase">
                  <span class="w-1.5 h-1.5 rounded-full bg-success animate-ping"></span> LIVE SCANNER READY
                </span>
              </div>
              <h2 class="font-sans text-xl sm:text-2xl font-extrabold text-ink uppercase tracking-tight">
                Event Day Attendance Pass Scanner
              </h2>
              <p class="text-xs text-muted font-mono">
                Click Verify & Scan Ticket to launch live camera scanner or barcode reader.
              </p>
            </div>
            <button type="button" id="open-scanner-box-btn" class="btn-primary py-3 px-6 text-xs uppercase font-mono font-extrabold tracking-widest cursor-pointer shadow-md bg-ink hover:bg-accent hover:text-ink text-inverse-text border border-accent transition-all flex items-center gap-2.5 group">
              <span>VERIFY & SCAN TICKET PASS</span>
              <span class="text-accent group-hover:text-ink group-hover:translate-x-0.5 transition-all text-sm font-bold">→</span>
            </button>
          </div>

          <!-- COLLAPSIBLE SCANNER CONTAINER (Appears when Verify & Scan clicked) -->
          <div id="scanner-drawer-container" class="hidden tech-card p-6 md:p-8 border-2 border-accent bg-paper space-y-6 mb-12 max-w-3xl mx-auto shadow-2xl relative">
            <div class="flex flex-wrap items-center justify-between border-b border-line pb-4 gap-4">
              <div>
                <div class="text-xs text-accent-dark font-bold font-mono">// VENUE CHECK-IN SCANNER ACTIVE</div>
                <h2 class="font-sans text-2xl font-bold text-ink uppercase">
                  Official QR Pass Scanner
                </h2>
              </div>
              
              <div class="flex items-center gap-3">
                <button type="button" id="toggle-camera-btn" class="btn-primary text-xs py-2 px-4 uppercase font-mono font-bold cursor-pointer flex items-center gap-2">
                  <span class="inline-block w-2 h-2 rounded-full bg-success animate-pulse"></span>
                  START LIVE CAMERA
                </button>
                <button type="button" id="close-scanner-box-btn" class="btn-secondary text-xs py-2 px-3 border border-line text-ink hover:border-accent cursor-pointer font-mono font-bold">
                  CLOSE SCANNER
                </button>
              </div>
            </div>

            <!-- UNIFIED SCANNER VIEWPORT -->
            <div class="space-y-4">
              <div id="reader-container" class="relative bg-canvas border-2 border-accent p-4 min-h-[200px] flex flex-col items-center justify-center text-center">
                <div id="reader" class="w-full max-w-md mx-auto"></div>
                
                <div id="camera-placeholder" class="py-4 space-y-2">
                  <div class="text-xs font-mono font-bold text-ink uppercase tracking-wider">
                    SCANNER READY // HOLD QR TICKET PASS TO CAMERA OR SCANNER
                  </div>
                  <div class="text-[11px] text-muted font-mono">
                    Point ticket pass at camera or trigger handheld barcode scanner below
                  </div>
                </div>
              </div>

              <!-- UNIFIED SCAN INPUT FIELD -->
              <form id="qr-scanner-form" class="flex flex-wrap items-center gap-2 bg-canvas p-2 border border-accent">
                <div class="flex-1 flex items-center px-3 gap-2">
                  <span class="text-accent-dark text-xs font-mono font-bold">SCAN:</span>
                  <input type="text" id="qr-scan-input" placeholder="Point scanner or scan ticket pass here..." class="w-full py-2 text-xs text-ink font-mono bg-transparent focus:outline-none uppercase font-bold" />
                </div>
                <button type="submit" class="btn-primary text-xs py-2.5 px-6 font-mono uppercase font-bold cursor-pointer">
                  VERIFY TICKET
                </button>
              </form>
            </div>

            <!-- SCANNER RESULT DISPLAY -->
            <div id="scanner-result-box" class="hidden p-6 bg-canvas border-2 border-accent space-y-4">
              <!-- Injected dynamically via JS -->
            </div>
          </div>

          <!-- SEARCH & FILTER BAR -->
          <div class="tech-card p-4 border border-line bg-paper flex flex-wrap items-center gap-4 mb-8 shadow-xs">
            <div class="flex-1 min-w-[220px]">
              <input type="text" id="admin-search-input" placeholder="Search by Team Name, ID, Leader Email, UTR..." class="w-full px-3 py-2 text-xs text-ink font-mono focus:border-accent outline-none bg-canvas border border-line" />
            </div>

            <div class="w-40">
              <select id="admin-theme-filter" class="w-full px-3 py-2 text-xs text-ink font-mono outline-none bg-canvas border border-line">
                <option value="ALL">All Themes</option>
                ${eventConfig.themes.map(t => `<option value="${t.id}">${t.number}. ${t.name}</option>`).join('')}
              </select>
            </div>

            <div class="w-40">
              <select id="admin-status-filter" class="w-full px-3 py-2 text-xs text-ink font-mono outline-none bg-canvas border border-line">
                <option value="ALL">All Statuses</option>
                <option value="UNDER_REVIEW">PPT Under Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="PAYMENT_PENDING">Payment Pending</option>
                <option value="PAYMENT_APPROVED">Payment Approved</option>
                <option value="PPT_SUBMITTED">PPT Submitted</option>
              </select>
            </div>

            <button id="admin-filter-reset" class="btn-secondary text-xs py-2 px-4 font-mono font-bold uppercase tracking-wider border border-line hover:border-accent hover:text-accent-dark transition-all cursor-pointer">
              RESET FILTERS
            </button>
          </div>

          <!-- MAIN REGISTRATION MANAGEMENT TABLE -->
          <div class="tech-card border-line bg-paper overflow-x-auto mb-12">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-canvas border-b border-line text-muted uppercase tracking-widest text-[11px]">
                  <th class="p-4">TEAM INTEL</th>
                  <th class="p-4">THEME</th>
                  <th class="p-4">PAYMENT / UTR</th>
                  <th class="p-4">PPT PITCH DECK</th>
                  <th class="p-4">STATUS</th>
                  <th class="p-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody id="admin-teams-tbody" class="divide-y divide-line">
                <tr>
                  <td colspan="6" class="p-8 text-center text-muted">Loading teams database...</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- BROADCAST ANNOUNCEMENT SECTION -->
          <div class="tech-card p-6 border-line bg-paper space-y-4 mb-12">
            <h2 class="font-sans text-lg font-bold text-ink uppercase border-b border-line pb-2">
              BROADCAST PARTICIPANT ANNOUNCEMENT
            </h2>
            <form id="announcement-form" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-2">
                  <input type="text" name="title" required placeholder="Announcement Headline..." class="w-full px-3 py-2 text-xs text-ink focus:border-accent outline-none" />
                </div>
                <div>
                  <select name="priority" class="w-full px-3 py-2 text-xs text-ink outline-none">
                    <option value="NORMAL">NORMAL PRIORITY</option>
                    <option value="URGENT">URGENT</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>
              <textarea name="content" required rows="2" placeholder="Announcement body text displayed on status tracker..." class="w-full p-3 text-xs text-ink focus:border-accent outline-none font-sans"></textarea>
              <button type="submit" class="btn-primary text-xs py-2 px-6">
                POST ANNOUNCEMENT
              </button>
            </form>
          </div>

          <!-- PAYMENT MODAL -->
          <div id="payment-modal" class="hidden fixed inset-0 z-50 bg-canvas/95 flex items-center justify-center p-4">
            <div class="tech-card p-6 border-accent bg-paper max-w-2xl w-full space-y-4 max-h-[90vh] overflow-y-auto">
              <div class="flex items-center justify-between border-b border-line pb-3">
                <div class="font-sans text-lg font-bold text-ink uppercase" id="modal-team-title">VERIFY PAYMENT PROOF</div>
                <button id="close-modal-btn" class="text-ink hover:text-accent text-xl font-bold p-2 cursor-pointer">✕</button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>REG ID: <strong id="modal-reg-id" class="text-accent-dark">--</strong></div>
                <div>UTR NO: <strong id="modal-utr" class="text-ink">--</strong></div>
                <div>PAYER: <span id="modal-payer" class="text-ink">--</span></div>
                <div>AMOUNT: <span id="modal-amount" class="text-accent-dark font-bold">₹900</span></div>
              </div>

              <!-- Screenshot Viewer -->
              <div class="p-2 bg-canvas border border-line text-center max-h-80 overflow-auto">
                <img id="modal-screenshot-img" src="" alt="Payment Proof" class="max-w-full h-auto mx-auto border border-line" />
              </div>

              <!-- Controls -->
              <div class="flex flex-col gap-3 pt-2">
                <button id="modal-approve-btn" class="btn-primary w-full py-3 text-xs font-bold tracking-widest uppercase">
                  APPROVE PAYMENT (ISSUE ATTENDANCE PASS & INVOICE)
                </button>
              </div>
            </div>
          </div>

          <!-- PPT PREVIEW MODAL -->
          <div id="ppt-modal" class="hidden fixed inset-0 z-50 bg-canvas/95 flex items-center justify-center p-4">
            <div class="tech-card p-6 border-2 border-accent bg-paper max-w-4xl w-full space-y-4 max-h-[95vh] overflow-y-auto shadow-2xl">
              <div class="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <div class="text-xs text-accent-dark font-bold font-mono">// PPT PITCH DECK PREVIEW & INTEL</div>
                  <h2 class="font-sans text-xl font-bold text-ink uppercase" id="ppt-modal-team-title">PITCH DECK PREVIEW</h2>
                </div>
                <button id="close-ppt-modal-btn" class="text-ink hover:text-accent text-xl font-bold p-2 cursor-pointer transition-colors">✕</button>
              </div>

              <!-- Metadata Grid -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono bg-canvas p-4 border border-line">
                <div>REG ID: <strong id="ppt-modal-reg-id" class="text-accent-dark">--</strong></div>
                <div>THEME: <strong id="ppt-modal-theme" class="text-ink">--</strong></div>
                <div>VERSION: <strong id="ppt-modal-version" class="text-accent-dark font-bold">--</strong></div>
                <div class="md:col-span-2">PROJECT TITLE: <strong id="ppt-modal-title" class="text-ink font-bold">--</strong></div>
                <div>FILE: <span id="ppt-modal-filename" class="text-muted truncate inline-block max-w-full">--</span></div>
              </div>

              <!-- Project Summary & Links -->
              <div id="ppt-modal-summary-box" class="p-4 bg-canvas border border-line text-xs font-sans space-y-2">
                <div class="font-bold text-accent-dark font-mono text-[11px] uppercase">// PROJECT SUMMARY:</div>
                <div id="ppt-modal-summary" class="text-muted leading-relaxed whitespace-pre-line">--</div>
                <div id="ppt-modal-links" class="flex flex-wrap gap-4 pt-2 font-mono text-[11px]">
                  <!-- Links injected dynamically -->
                </div>
              </div>

              <!-- Interactive Document Viewer Frame & Toolbar -->
              <div class="space-y-2">
                <div class="flex flex-wrap items-center justify-between gap-2 text-xs font-mono border-b border-line pb-2">
                  <div class="flex items-center gap-2">
                    <span class="text-accent-dark font-bold">// PREVIEW ENGINE:</span>
                    <button type="button" id="ppt-view-direct-btn" class="px-2.5 py-1 border border-line text-ink hover:border-accent font-mono text-[10px] font-bold uppercase transition-all cursor-pointer">Native View</button>
                    <button type="button" id="ppt-view-ms-btn" class="px-2.5 py-1 border border-line text-ink hover:border-accent font-mono text-[10px] font-bold uppercase transition-all cursor-pointer">Office Embed</button>
                    <button type="button" id="ppt-view-gdocs-btn" class="px-2.5 py-1 border border-line text-ink hover:border-accent font-mono text-[10px] font-bold uppercase transition-all cursor-pointer">Google Docs</button>
                  </div>
                  <a id="ppt-modal-direct-link" href="#" target="_blank" download class="btn-primary py-1 px-3.5 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                    Download Original File
                  </a>
                </div>
                
                <div class="relative border-2 border-accent bg-canvas min-h-[420px] flex flex-col items-center justify-center">
                  <iframe id="ppt-modal-iframe" class="ppt-preview-frame w-full h-[500px] hidden" src="" frameborder="0" allowfullscreen></iframe>
                  <div id="ppt-modal-fallback" class="p-8 text-center space-y-3">
                    <div class="text-xs font-mono font-bold text-ink uppercase" id="ppt-fallback-text">
                      Presentation Document Ready
                    </div>
                    <div class="flex items-center justify-center gap-3">
                      <a id="ppt-fallback-open-btn" href="#" target="_blank" class="btn-primary text-xs py-2 px-5 font-mono uppercase font-bold">
                        Open Document in New Tab
                      </a>
                      <a id="ppt-fallback-download-btn" href="#" download class="btn-secondary text-xs py-2 px-5 font-mono uppercase font-bold border border-line hover:border-accent">
                        Download File
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Controls -->
              <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-line">
                <div class="text-xs font-mono text-muted" id="ppt-modal-submitted-at">Submitted at: --</div>
                <button id="ppt-modal-close-bottom-btn" class="btn-secondary py-2 px-6 text-xs font-mono font-bold uppercase border border-line hover:border-accent cursor-pointer">
                  CLOSE PREVIEW
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  async attachEvents() {
    if (this.autoRefreshTimer) clearInterval(this.autoRefreshTimer);

    // Fetch initial dashboard data on page load
    await this.fetchDashboardData();

    // Auto-refresh stats and team status live every 5 seconds
    this.autoRefreshTimer = setInterval(() => {
      this.fetchDashboardData(true);
    }, 5000);

    // PAYMENT PORTAL GATE TOGGLE BUTTON HANDLER
    const gateToggleBtn = document.getElementById('admin-gate-toggle-btn');
    const syncGateBtnUI = async () => {
      if (!gateToggleBtn) return;
      try {
        const res = await api.getPaymentGateStatus();
        const isOpen = res && res.open;
        if (isOpen) {
          gateToggleBtn.className = "btn-secondary text-xs py-2.5 px-4 border border-success text-success font-mono font-bold uppercase tracking-wider hover:bg-success hover:text-canvas transition-all cursor-pointer";
          gateToggleBtn.textContent = "PAYMENT PORTAL: OPEN";
        } else {
          gateToggleBtn.className = "btn-secondary text-xs py-2.5 px-4 border border-error text-error font-mono font-bold uppercase tracking-wider hover:bg-error hover:text-white transition-all cursor-pointer";
          gateToggleBtn.textContent = "PAYMENT PORTAL: LOCKED";
        }
        gateToggleBtn.setAttribute('data-open', isOpen ? 'true' : 'false');
      } catch (err) {
        gateToggleBtn.textContent = "PAYMENT PORTAL: ERROR";
      }
    };
    await syncGateBtnUI();

    if (gateToggleBtn) {
      gateToggleBtn.addEventListener('click', async () => {
        soundFx.playClick();
        const currentOpen = gateToggleBtn.getAttribute('data-open') === 'true';
        const newStatus = !currentOpen;
        const confirmed = confirm(`Are you sure you want to ${newStatus ? 'OPEN' : 'LOCK'} the payment portal for shortlisted teams?`);
        if (!confirmed) return;

        try {
          const res = await api.togglePaymentGate(newStatus);
          if (res && res.success) {
            toast.show(`Payment Portal is now ${res.open ? 'OPEN' : 'LOCKED'}`, 'success');
            await syncGateBtnUI();
          } else {
            toast.show('Failed to toggle Payment Portal gate.', 'error');
          }
        } catch (err) {
          toast.show('Error updating Payment Portal status.', 'error');
        }
      });
    }

    const refreshBtn = document.getElementById('admin-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        soundFx.playClick();
        toast.show('Refreshing admin teams database...', 'info');
        await this.fetchDashboardData();
        toast.show('Dashboard data updated!', 'success');
      });
    }

    const clearBtn = document.getElementById('admin-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', async () => {
        soundFx.playClick();
        const confirmed = confirm("⚠️ ARE YOU SURE?\nThis will permanently delete all registered teams, payments, PPT submissions, and attendance logs from the database!");
        if (!confirmed) return;
        toast.show('Clearing database...', 'info');
        const res = await api.clearAllData();
        if (res.success) {
          toast.show('Database wiped clean successfully!', 'success');
          await this.fetchDashboardData();
        } else {
          toast.show(res.message || 'Failed to clear database.', 'error');
        }
      });
    }

    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (this.autoRefreshTimer) clearInterval(this.autoRefreshTimer);
        api.clearToken();
        toast.show('Logged out.', 'info');
        this.navigate('login');
      });
    }

    // SCANNER DRAWER SHOW / HIDE TOGGLE
    const openScannerBtn = document.getElementById('open-scanner-box-btn');
    const closeScannerBtn = document.getElementById('close-scanner-box-btn');
    const scannerDrawer = document.getElementById('scanner-drawer-container');
    const qrInput = document.getElementById('qr-scan-input');

    if (openScannerBtn && scannerDrawer) {
      openScannerBtn.addEventListener('click', () => {
        soundFx.playClick();
        scannerDrawer.classList.remove('hidden');
        scannerDrawer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (qrInput) setTimeout(() => qrInput.focus(), 100);
      });
    }

    if (closeScannerBtn && scannerDrawer) {
      closeScannerBtn.addEventListener('click', async () => {
        soundFx.playClick();
        scannerDrawer.classList.add('hidden');
        if (this.isScanning && this.html5QrCode) {
          try {
            await this.html5QrCode.stop();
            this.html5QrCode.clear();
          } catch (e) {}
          this.isScanning = false;
        }
      });
    }

    // CAMERA QR SCANNER TOGGLE
    const cameraBtn = document.getElementById('toggle-camera-btn');
    const placeholder = document.getElementById('camera-placeholder');
    if (cameraBtn) {
      cameraBtn.addEventListener('click', async () => {
        if (this.isScanning && this.html5QrCode) {
          try {
            await this.html5QrCode.stop();
            this.html5QrCode.clear();
          } catch (e) {}
          this.isScanning = false;
          if (placeholder) placeholder.classList.remove('hidden');
          cameraBtn.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-success animate-pulse"></span> START LIVE CAMERA';
          return;
        }

        try {
          if (window.Html5Qrcode) {
            this.html5QrCode = new window.Html5Qrcode("reader");
            if (placeholder) placeholder.classList.add('hidden');
            await this.html5QrCode.start(
              { facingMode: "environment" },
              { fps: 10, qrbox: { width: 220, height: 220 } },
              (decodedText) => {
                soundFx.playBeep();
                this.processScanCode(decodedText);
              },
              () => {}
            );
            this.isScanning = true;
            cameraBtn.innerHTML = 'STOP CAMERA';
          } else {
            toast.show('Camera scanner module loading...', 'info');
          }
        } catch (err) {
          if (placeholder) placeholder.classList.remove('hidden');
          toast.show('Camera access unavailable. Point scanner or scan ticket into field.', 'error');
        }
      });
    }

    const processScanCode = async (rawInput) => {
      if (!rawInput) return;
      let regId = rawInput.trim();
      const match = rawInput.match(/GG26-[A-Z0-9]{4}/i);
      if (match) regId = match[0];

      const team = this.teams.find(t => t.reg_id.toUpperCase() === regId.toUpperCase());
      if (team) {
        this.renderScannerResult(team);
      } else {
        try {
          const allRes = await api.getAdminTeams({ search: regId });
          if (allRes.success && allRes.teams && allRes.teams.length) {
            this.renderScannerResult(allRes.teams[0]);
          } else {
            toast.show(`Invalid QR Code scanned.`, 'error');
          }
        } catch (err) {
          toast.show('Error verifying scanned QR ticket.', 'error');
        }
      }
    };
    this.processScanCode = processScanCode;

    // QR SCANNER FORM EVENT
    const qrForm = document.getElementById('qr-scanner-form');
    if (qrForm && qrInput) {
      qrForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        soundFx.playClick();
        await processScanCode(qrInput.value);
        qrInput.value = '';
      });
    }

    const searchInput = document.getElementById('admin-search-input');
    const themeFilter = document.getElementById('admin-theme-filter');
    const statusFilter = document.getElementById('admin-status-filter');
    const resetBtn = document.getElementById('admin-filter-reset');

    const updateFiltersAndFetch = async () => {
      this.currentFilters = {
        search: searchInput ? searchInput.value.trim() : '',
        theme: themeFilter ? themeFilter.value : 'ALL',
        status: statusFilter ? statusFilter.value : 'ALL'
      };
      await this.fetchDashboardData(true);
    };

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(updateFiltersAndFetch, 300);
      });
    }

    if (themeFilter) themeFilter.addEventListener('change', updateFiltersAndFetch);
    if (statusFilter) statusFilter.addEventListener('change', updateFiltersAndFetch);

    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        if (searchInput) searchInput.value = '';
        if (themeFilter) themeFilter.value = 'ALL';
        if (statusFilter) statusFilter.value = 'ALL';
        this.currentFilters = { search: '', theme: 'ALL', status: 'ALL' };
        await this.fetchDashboardData();
      });
    }

    const closeModal = document.getElementById('close-modal-btn');
    const modal = document.getElementById('payment-modal');
    if (closeModal && modal) {
      closeModal.addEventListener('click', () => modal.classList.add('hidden'));
    }

    const closePptModalBtn = document.getElementById('close-ppt-modal-btn');
    const closePptModalBottomBtn = document.getElementById('ppt-modal-close-bottom-btn');
    const pptModal = document.getElementById('ppt-modal');
    const closePptModal = () => {
      if (pptModal) pptModal.classList.add('hidden');
      const iframe = document.getElementById('ppt-modal-iframe');
      if (iframe) iframe.src = '';
    };
    if (closePptModalBtn) closePptModalBtn.addEventListener('click', closePptModal);
    if (closePptModalBottomBtn) closePptModalBottomBtn.addEventListener('click', closePptModal);

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    }

    if (pptModal) {
      pptModal.addEventListener('click', (e) => {
        if (e.target === pptModal) closePptModal();
      });
    }

    const annForm = document.getElementById('announcement-form');
    if (annForm) {
      annForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(annForm);
        const title = formData.get('title');
        const content = formData.get('content');
        const priority = formData.get('priority');

        try {
          const res = await api.createAnnouncement(title, content, priority);
          if (res.success) {
            toast.show('Announcement broadcasted!', 'success');
            annForm.reset();
          }
        } catch (err) {
          toast.show('Failed to post announcement.', 'error');
        }
      });
    }
  }

  renderScannerResult(team) {
    const box = document.getElementById('scanner-result-box');
    if (!box) return;

    this.scannedTeam = team;
    const isPaid = team.payment && team.payment.status === 'APPROVED';
    const isAttended = Boolean(team.attended);

    const membersHtml = (team.members && team.members.length) ? team.members.map((m, i) => `
      <div class="text-[11px] text-ink border-b border-line/40 py-1 flex justify-between">
        <span><strong>0${i + 1}. ${m.name}</strong> (${m.role || 'Member'})</span>
        <span class="text-muted">${m.phone || m.email}</span>
      </div>
    `).join('') : `<div class="text-[11px] text-muted">01. ${team.leader_name} (${team.leader_phone})</div>`;

    box.innerHTML = `
      <div class="flex flex-wrap items-center justify-between border-b border-line pb-3 gap-2">
        <div>
          <div class="text-xs text-muted">REGISTRATION ID: <strong class="text-accent-dark font-mono text-base">${team.reg_id}</strong></div>
          <h3 class="font-sans text-xl font-bold text-ink uppercase">${team.team_name}</h3>
          <div class="text-xs text-muted">${team.college} // Track: ${team.theme_id}</div>
        </div>

        <div class="text-right font-mono">
          <div class="px-3 py-1 border ${isPaid ? 'border-success text-success bg-paper' : 'border-accent text-accent-dark bg-paper'} text-xs font-bold uppercase mb-1">
            ${isPaid ? 'PAYMENT VERIFIED' : 'PAYMENT PENDING'}
          </div>
          <div class="text-[11px] ${isAttended ? 'text-success font-bold' : 'text-error font-bold'}">
            ${isAttended ? `ATTENDANCE RECORDED (${team.attended_at ? team.attended_at.split('T')[0] : 'Today'})` : 'NOT CHECKED IN'}
          </div>
        </div>
      </div>

      <div class="space-y-2 font-mono text-xs">
        <div class="text-xs text-accent-dark font-bold uppercase">// SQUAD ROSTER DETAILS:</div>
        <div class="bg-paper p-3 border border-line space-y-1">
          ${membersHtml}
        </div>
      </div>

      <div class="pt-2 flex gap-3">
        ${!isAttended ? `
          <button id="scanner-mark-attendance-btn" class="btn-primary w-full py-3 text-xs font-bold tracking-wider uppercase">
            MARK ATTENDANCE & GRANT VENUE ENTRY
          </button>
        ` : `
          <div class="p-3 bg-paper border border-success text-success text-xs text-center font-bold w-full">
            ENTRY ALREADY GRANTED // ATTENDANCE LOGGED
          </div>
        `}
      </div>
    `;

    box.classList.remove('hidden');

    const markBtn = document.getElementById('scanner-mark-attendance-btn');
    if (markBtn) {
      markBtn.addEventListener('click', async () => {
        try {
          const res = await api.markAttendance(team.reg_id);
          if (res.success) {
            soundFx.playBeep();
            toast.show(`ENTRY GRANTED! Attendance logged for ${team.team_name}`, 'success');
            await this.fetchDashboardData();
            this.renderScannerResult({ ...team, attended: true, attended_at: new Date().toISOString() });
          } else {
            toast.show(res.message || 'Failed to mark attendance.', 'error');
          }
        } catch (err) {
          toast.show('Network error marking attendance.', 'error');
        }
      });
    }
  }

  async fetchDashboardData(silent = false) {
    try {
      const searchInput = document.getElementById('admin-search-input');
      const themeFilter = document.getElementById('admin-theme-filter');
      const statusFilter = document.getElementById('admin-status-filter');

      const filters = {};
      if (searchInput && searchInput.value) filters.search = searchInput.value;
      if (themeFilter && themeFilter.value !== 'ALL') filters.theme = themeFilter.value;
      if (statusFilter && statusFilter.value !== 'ALL') filters.status = statusFilter.value;

      const [statsRes, teamsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminTeams(filters)
      ]);

      if (statsRes.unauthorized || teamsRes.unauthorized) {
        if (this.autoRefreshTimer) clearInterval(this.autoRefreshTimer);
        toast.show('Admin session expired. Please log in again.', 'info');
        this.navigate('login');
        return;
      }

      if (statsRes.success && statsRes.stats) {
        const totalEl = document.getElementById('stat-total');
        const pendingEl = document.getElementById('stat-pending');
        const approvedEl = document.getElementById('stat-approved');
        const pptEl = document.getElementById('stat-ppt');
        const shortlistEl = document.getElementById('stat-shortlist');
        const attendedEl = document.getElementById('stat-attended');

        if (totalEl) totalEl.textContent = statsRes.stats.totalRegistrations;
        if (pendingEl) pendingEl.textContent = statsRes.stats.pendingPayments;
        if (approvedEl) approvedEl.textContent = statsRes.stats.approvedPayments;
        if (pptEl) pptEl.textContent = statsRes.stats.pptSubmissions;
        if (shortlistEl) shortlistEl.textContent = statsRes.stats.shortlisted;
        if (attendedEl) attendedEl.textContent = statsRes.stats.attendedCount || 0;
      }

      if (teamsRes.success) {
        this.teams = teamsRes.teams || [];
        this.renderTeamsTable(this.teams);
      }
    } catch (err) {
      if (!silent) toast.show('Error loading dashboard statistics.', 'error');
    }
  }

  async fetchTeamsData(filters = {}) {
    const tbody = document.getElementById('admin-teams-tbody');
    if (!tbody) return;

    try {
      const res = await api.getAdminTeams(filters);
      if (res.success) {
        this.teams = res.teams || [];
        this.renderTeamsTable(this.teams);
      }
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-error">Failed to load teams list.</td></tr>`;
    }
  }

  renderTeamsTable(teams) {
    const tbody = document.getElementById('admin-teams-tbody');
    if (!tbody) return;

    if (teams.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-muted">No teams found matching current query.</td></tr>`;
      return;
    }

    tbody.innerHTML = teams.map(team => {
      const pay = team.payment;
      const ppt = team.ppt;

      const payBadge = pay ? (
        pay.status === 'APPROVED' ? '<span class="text-success font-bold">APPROVED</span>' :
        '<span class="text-accent-dark font-bold">PENDING VERIFICATION</span>'
      ) : '<span class="text-muted">NO PROOF</span>';

      const attendanceBadge = team.attended ? '<span class="text-success font-bold text-[10px]">ATTENDED</span>' : '';

      return `
        <tr class="hover:bg-canvas transition-colors">
          <td class="p-4">
            <div class="font-bold text-ink font-sans">${team.team_name} ${attendanceBadge}</div>
            <div class="text-accent-dark text-[11px] font-mono">${team.reg_id} // Leader: ${team.leader_name}</div>
            <div class="text-muted text-[10px] font-sans">${team.college} (${team.member_count} Members)</div>
          </td>

          <td class="p-4 text-ink font-mono">
            ${team.theme_id}
          </td>

          <td class="p-4 font-mono">
            <div>${payBadge}</div>
            ${pay ? `<div class="text-[10px] text-muted">UTR: ${pay.utr_number}</div>` : ''}
          </td>

          <td class="p-4 font-mono text-[11px]">
            ${ppt ? `
              <div class="space-y-1">
                <a href="${ppt.file_data && ppt.file_data.startsWith('data:') ? ppt.file_data : `${ppt.file_url}${ppt.file_url.includes('?') ? '&' : '?'}download=true`}" target="_blank" download="${ppt.original_filename || 'presentation'}" class="text-ink hover:text-accent font-bold underline block truncate max-w-[180px]">
                  ${ppt.original_filename} (v${ppt.version})
                </a>
                <button data-action="preview-ppt" data-reg="${team.reg_id}" class="px-2 py-0.5 border border-accent text-accent-dark hover:bg-accent hover:text-ink text-[10px] font-bold cursor-pointer">
                  PREVIEW PPT
                </button>
              </div>
            ` : '<span class="text-muted">NOT SUBMITTED</span>'}
          </td>

          <td class="p-4 font-mono text-[11px]">
            <span class="px-2 py-1 border ${
              team.status === 'SHORTLISTED' ? 'border-accent text-accent-dark font-bold' : 'border-line text-ink'
            }">
              ${team.status}
            </span>
          </td>

          <td class="p-4 text-right space-x-2 font-mono">
            ${ppt ? `
              <button data-action="preview-ppt" data-reg="${team.reg_id}" class="px-2 py-1 border border-accent text-accent-dark hover:bg-accent hover:text-ink text-[10px] cursor-pointer font-bold">
                PPT PREVIEW
              </button>
            ` : ''}

            ${pay ? `
              <button data-action="verify-pay" data-reg="${team.reg_id}" class="px-2 py-1 border border-accent text-accent-dark hover:bg-accent hover:text-ink text-[10px] cursor-pointer">
                REVIEW PAYMENT
              </button>
            ` : ''}

            <button data-action="toggle-shortlist" data-reg="${team.reg_id}" data-current="${team.status}" class="px-2 py-1 border border-line text-ink hover:bg-paper text-[10px] cursor-pointer">
              ${team.status === 'SHORTLISTED' ? 'UN-SHORTLIST' : 'SHORTLIST'}
            </button>

            <button data-action="quick-scan" data-reg="${team.reg_id}" class="px-2 py-1 border border-success text-success hover:bg-success hover:text-canvas text-[10px] cursor-pointer">
              SCAN / ENTRY
            </button>
          </td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('button[data-action="preview-ppt"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const regId = btn.getAttribute('data-reg');
        const team = this.teams.find(t => t.reg_id === regId);
        if (team && team.ppt) {
          this.openPptModal(team);
        }
      });
    });

    tbody.querySelectorAll('button[data-action="verify-pay"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const regId = btn.getAttribute('data-reg');
        const team = this.teams.find(t => t.reg_id === regId);
        if (team && team.payment) {
          this.openPaymentModal(team);
        }
      });
    });

    tbody.querySelectorAll('button[data-action="quick-scan"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const regId = btn.getAttribute('data-reg');
        const team = this.teams.find(t => t.reg_id === regId);
        if (team) {
          const drawer = document.getElementById('scanner-drawer-container');
          if (drawer) drawer.classList.remove('hidden');
          this.renderScannerResult(team);
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }
      });
    });

    tbody.querySelectorAll('button[data-action="toggle-shortlist"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const regId = btn.getAttribute('data-reg');
        const current = btn.getAttribute('data-current');
        const nextStatus = current === 'SHORTLISTED' ? 'UNDER_REVIEW' : 'SHORTLISTED';

        try {
          const res = await api.updateTeamStatus(regId, nextStatus);
          if (res.success) {
            toast.show(`Team status updated to ${nextStatus}`, 'success');
            await this.fetchDashboardData();
          }
        } catch (err) {
          toast.show('Failed to update status.', 'error');
        }
      });
    });
  }

  createBlobUrlFromData(dataUrl) {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null;
    try {
      const parts = dataUrl.split(',');
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      return URL.createObjectURL(blob);
    } catch (e) {
      return dataUrl;
    }
  }

  openPptModal(team) {
    this.selectedTeam = team;
    const modal = document.getElementById('ppt-modal');
    if (!modal || !team.ppt) return;

    const ppt = team.ppt;
    const rawFileUrl = ppt.file_url || '';
    const fullUrl = rawFileUrl.startsWith('http') ? rawFileUrl : (window.location.origin + (rawFileUrl.startsWith('/') ? '' : '/') + rawFileUrl);
    
    let downloadUrl = `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}download=true`;
    let viewUrl = fullUrl;

    if (ppt.file_data && ppt.file_data.startsWith('data:')) {
      const blobUrl = this.createBlobUrlFromData(ppt.file_data);
      if (blobUrl) {
        downloadUrl = blobUrl;
        viewUrl = blobUrl;
      }
    }

    const lowerFilename = (ppt.original_filename || rawFileUrl || '').toLowerCase();
    const isPdf = lowerFilename.endsWith('.pdf') || lowerFilename.includes('.pdf') || (ppt.file_data && ppt.file_data.includes('application/pdf'));

    document.getElementById('ppt-modal-team-title').textContent = `PITCH DECK PREVIEW: ${team.team_name}`;
    document.getElementById('ppt-modal-reg-id').textContent = team.reg_id;
    document.getElementById('ppt-modal-theme').textContent = team.theme_id;
    document.getElementById('ppt-modal-version').textContent = `v${ppt.version}`;
    document.getElementById('ppt-modal-title').textContent = ppt.project_title || team.team_name;
    document.getElementById('ppt-modal-filename').textContent = ppt.original_filename;
    document.getElementById('ppt-modal-summary').textContent = ppt.summary || 'No project summary provided.';
    document.getElementById('ppt-modal-submitted-at').textContent = `Submitted at: ${ppt.submitted_at || 'N/A'}`;

    const linksBox = document.getElementById('ppt-modal-links');
    if (linksBox) {
      const links = [];
      if (ppt.repo_link) {
        links.push(`<a href="${ppt.repo_link}" target="_blank" rel="noopener" class="text-accent-dark font-bold underline hover:text-ink">Repository: ${ppt.repo_link}</a>`);
      }
      if (ppt.demo_link) {
        links.push(`<a href="${ppt.demo_link}" target="_blank" rel="noopener" class="text-accent-dark font-bold underline hover:text-ink">Demo Link: ${ppt.demo_link}</a>`);
      }
      linksBox.innerHTML = links.join(' | ') || '<span class="text-muted">No external links provided.</span>';
    }

    const directLink = document.getElementById('ppt-modal-direct-link');
    if (directLink) {
      directLink.href = downloadUrl;
      directLink.download = ppt.original_filename || 'presentation';
    }

    const iframe = document.getElementById('ppt-modal-iframe');
    const fallbackBox = document.getElementById('ppt-modal-fallback');
    const fallbackOpen = document.getElementById('ppt-fallback-open-btn');
    const fallbackDownload = document.getElementById('ppt-fallback-download-btn');
    const fallbackText = document.getElementById('ppt-fallback-text');

    if (fallbackOpen) fallbackOpen.href = viewUrl;
    if (fallbackDownload) {
      fallbackDownload.href = downloadUrl;
      fallbackDownload.download = ppt.original_filename || 'presentation';
    }

    const msEmbedUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;
    const googleEmbedUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fullUrl)}&embedded=true`;

    const msBtn = document.getElementById('ppt-view-ms-btn');
    const gDocsBtn = document.getElementById('ppt-view-gdocs-btn');
    const directViewBtn = document.getElementById('ppt-view-direct-btn');

    const activeBtnClass = "px-2.5 py-1 border border-accent bg-accent text-canvas font-mono text-[10px] font-bold uppercase transition-all cursor-pointer shadow-sm";
    const inactiveBtnClass = "px-2.5 py-1 border border-line text-ink hover:border-accent font-mono text-[10px] font-bold uppercase transition-all cursor-pointer opacity-70 hover:opacity-100";

    const setActiveEngine = (engine) => {
      if (directViewBtn) directViewBtn.className = engine === 'native' ? activeBtnClass : inactiveBtnClass;
      if (msBtn) msBtn.className = engine === 'office' ? activeBtnClass : inactiveBtnClass;
      if (gDocsBtn) gDocsBtn.className = engine === 'gdocs' ? activeBtnClass : inactiveBtnClass;
    };

    if (isPdf) {
      iframe.src = viewUrl;
      iframe.classList.remove('hidden');
      if (fallbackBox) fallbackBox.classList.add('hidden');
      setActiveEngine('native');
    } else {
      // For PPTX/PPT files, default to Native View (Instant Open & Download card)
      // to avoid external cloud viewer timeouts on Render/serverless environments
      if (iframe) iframe.classList.add('hidden');
      if (fallbackBox) {
        fallbackBox.classList.remove('hidden');
        if (fallbackText) {
          fallbackText.innerHTML = `
            <div class="text-accent-dark font-bold">// PRESENTATION FILE (${ppt.original_filename}) READY FOR REVIEW</div>
            <div class="text-[11px] text-muted font-sans normal-case mt-1">Open directly in a new tab for instant full-screen review, or download the original presentation file below.</div>
          `;
        }
      }
      setActiveEngine('native');
    }

    if (msBtn) {
      msBtn.onclick = () => {
        setActiveEngine('office');
        iframe.src = msEmbedUrl;
        iframe.classList.remove('hidden');
        if (fallbackBox) fallbackBox.classList.add('hidden');
      };
    }
    if (gDocsBtn) {
      gDocsBtn.onclick = () => {
        setActiveEngine('gdocs');
        iframe.src = googleEmbedUrl;
        iframe.classList.remove('hidden');
        if (fallbackBox) fallbackBox.classList.add('hidden');
      };
    }
    if (directViewBtn) {
      directViewBtn.onclick = () => {
        setActiveEngine('native');
        if (isPdf) {
          iframe.src = viewUrl;
          iframe.classList.remove('hidden');
          if (fallbackBox) fallbackBox.classList.add('hidden');
        } else {
          if (iframe) iframe.classList.add('hidden');
          if (fallbackBox) {
            fallbackBox.classList.remove('hidden');
            if (fallbackText) {
              fallbackText.innerHTML = `
                <div class="text-accent-dark font-bold">// PRESENTATION FILE (${ppt.original_filename}) READY FOR REVIEW</div>
                <div class="text-[11px] text-muted font-sans normal-case mt-1">Open directly in a new tab for instant full-screen review, or download the original presentation file below.</div>
              `;
            }
          }
        }
      };
    }

    modal.classList.remove('hidden');
  }

  openPaymentModal(team) {
    this.selectedTeam = team;
    const modal = document.getElementById('payment-modal');
    if (!modal || !team.payment) return;

    document.getElementById('modal-team-title').textContent = `VERIFY PAYMENT: ${team.team_name}`;
    document.getElementById('modal-reg-id').textContent = team.reg_id;
    document.getElementById('modal-utr').textContent = team.payment.utr_number;
    document.getElementById('modal-payer').textContent = team.payment.payer_name;
    document.getElementById('modal-amount').textContent = `₹${team.payment.amount}`;

    let screenshotUrl = team.payment.screenshot_url || '';
    if (team.payment.file_data && team.payment.file_data.startsWith('data:')) {
      const blobUrl = this.createBlobUrlFromData(team.payment.file_data);
      if (blobUrl) screenshotUrl = blobUrl;
    } else if (screenshotUrl && !screenshotUrl.startsWith('http') && !screenshotUrl.startsWith('data:')) {
      screenshotUrl = window.location.origin + (screenshotUrl.startsWith('/') ? '' : '/') + screenshotUrl;
    }

    const imgEl = document.getElementById('modal-screenshot-img');
    if (imgEl) imgEl.src = screenshotUrl;

    modal.classList.remove('hidden');

    const approveBtn = document.getElementById('modal-approve-btn');

    approveBtn.onclick = async () => {
      try {
        const res = await api.approvePayment(team.reg_id, team.payment.id);
        if (res.success) {
          toast.show('Payment approved! Invoice & Attendance QR Pass dispatched.', 'success');
          modal.classList.add('hidden');
          await this.fetchDashboardData();
        }
      } catch (err) {
        toast.show('Error approving payment.', 'error');
      }
    };
  }
}
