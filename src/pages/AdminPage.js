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
              <div class="text-xs text-accent-dark tracking-widest uppercase font-bold">[ADMIN CONTROL PANEL]</div>
              <h1 class="font-sans text-3xl sm:text-5xl font-extrabold uppercase text-ink">
                GAMBIT’S GLITCH DASHBOARD
              </h1>
            </div>

            <div class="flex items-center gap-3">
              <a href="${api.getExportCsvUrl()}" download class="btn-secondary text-xs py-2 px-4 border-accent text-accent-dark hover:bg-accent hover:text-ink">
                📥 EXPORT DATA CSV
              </a>
              <button id="admin-logout-btn" class="btn-secondary text-xs py-2 px-3 border-line text-error hover:border-error">
                LOGOUT
              </button>
            </div>
          </div>

          <!-- OVERVIEW STATS GRID -->
          <div id="admin-stats-grid" class="grid grid-cols-2 md:grid-cols-6 gap-4 mb-10">
            <div class="tech-card p-4 border-line bg-paper text-center">
              <div class="text-[10px] text-muted uppercase">TOTAL TEAMS</div>
              <div id="stat-total" class="font-mono text-3xl font-bold text-ink">--</div>
            </div>
            <div class="tech-card p-4 border-line bg-paper text-center">
              <div class="text-[10px] text-muted uppercase">SHORTLISTED</div>
              <div id="stat-shortlist" class="font-mono text-3xl font-bold text-accent">--</div>
            </div>
            <div class="tech-card p-4 border-line bg-paper text-center">
              <div class="text-[10px] text-muted uppercase">PAYMENT PENDING</div>
              <div id="stat-pending" class="font-mono text-3xl font-bold text-accent-dark">--</div>
            </div>
            <div class="tech-card p-4 border-line bg-paper text-center">
              <div class="text-[10px] text-muted uppercase">PAYMENT APPROVED</div>
              <div id="stat-approved" class="font-mono text-3xl font-bold text-success">--</div>
            </div>
            <div class="tech-card p-4 border-line bg-paper text-center">
              <div class="text-[10px] text-muted uppercase">PPT SUBMISSIONS</div>
              <div id="stat-ppt" class="font-mono text-3xl font-bold text-ink">--</div>
            </div>
            <div class="tech-card p-4 border-line bg-paper text-center">
              <div class="text-[10px] text-muted uppercase">ATTENDANCE ENTRY</div>
              <div id="stat-attended" class="font-mono text-3xl font-bold text-success">--</div>
            </div>
          </div>

          <!-- EVENT DAY UNIFIED ATTENDANCE & QR CODE SCANNER SECTION -->
          <div class="tech-card p-6 md:p-8 border-accent bg-paper space-y-6 mb-12 max-w-3xl mx-auto">
            <div class="flex flex-wrap items-center justify-between border-b border-line pb-4 gap-4">
              <div>
                <div class="text-xs text-accent-dark font-bold">// VENUE CHECK-IN SYSTEM</div>
                <h2 class="font-sans text-2xl font-bold text-ink uppercase">
                  📷 Official Venue QR Pass Scanner
                </h2>
              </div>
              <button type="button" id="toggle-camera-btn" class="btn-primary text-xs py-2.5 px-5 uppercase font-bold cursor-pointer flex items-center gap-2">
                <span class="inline-block w-2 h-2 rounded-full bg-success animate-pulse"></span>
                ▶ START LIVE CAMERA
              </button>
            </div>

            <!-- UNIFIED SCANNER VIEWPORT -->
            <div class="space-y-4">
              <div id="reader-container" class="relative bg-canvas border-2 border-accent p-4 min-h-[220px] flex flex-col items-center justify-center text-center">
                <div id="reader" class="w-full max-w-md mx-auto"></div>
                
                <div id="camera-placeholder" class="py-4 space-y-2">
                  <div class="text-4xl text-accent-dark">📷</div>
                  <div class="text-xs font-mono font-bold text-ink uppercase tracking-wider">
                    SCANNER ACTIVE // HOLD QR TICKET TO CAMERA OR BARCODE SCANNER
                  </div>
                  <div class="text-[11px] text-muted font-mono">
                    Point participant's QR pass or trigger handheld scanner below
                  </div>
                </div>
              </div>

              <!-- UNIFIED SCAN INPUT FIELD -->
              <form id="qr-scanner-form" class="flex flex-wrap items-center gap-2 bg-canvas p-2 border border-accent">
                <div class="flex-1 flex items-center px-3 gap-2">
                  <span class="text-accent-dark text-xs font-mono font-bold">⚡ SCAN:</span>
                  <input type="text" id="qr-scan-input" autofocus placeholder="Point scanner or scan pass here..." class="w-full py-2 text-xs text-ink font-mono bg-transparent focus:outline-none uppercase font-bold" />
                </div>
                <button type="submit" class="btn-primary text-xs py-2.5 px-6 uppercase font-bold">
                  VERIFY TICKET →
                </button>
              </form>
            </div>

            <!-- SCANNER RESULT DISPLAY -->
            <div id="scanner-result-box" class="hidden p-6 bg-canvas border-2 border-accent space-y-4">
              <!-- Injected dynamically via JS -->
            </div>
          </div>

          <!-- SEARCH & FILTER BAR -->
          <div class="tech-card p-4 border-line bg-paper flex flex-wrap items-center gap-4 mb-8">
            <div class="flex-1 min-w-[220px]">
              <input type="text" id="admin-search-input" placeholder="Search by Team Name, ID, Leader Email, UTR..." class="w-full px-3 py-2 text-xs text-ink focus:border-accent outline-none" />
            </div>

            <div class="w-40">
              <select id="admin-theme-filter" class="w-full px-3 py-2 text-xs text-ink outline-none">
                <option value="ALL">All Themes</option>
                ${eventConfig.themes.map(t => `<option value="${t.id}">${t.number}. ${t.name}</option>`).join('')}
              </select>
            </div>

            <div class="w-40">
              <select id="admin-status-filter" class="w-full px-3 py-2 text-xs text-ink outline-none">
                <option value="ALL">All Statuses</option>
                <option value="UNDER_REVIEW">PPT Under Review</option>
                <option value="SHORTLISTED">Shortlisted</option>
                <option value="PAYMENT_PENDING">Payment Pending</option>
                <option value="PAYMENT_APPROVED">Payment Approved</option>
                <option value="PPT_SUBMITTED">PPT Submitted</option>
              </select>
            </div>

            <button id="admin-filter-reset" class="btn-secondary text-xs py-2 px-3">
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
                  ✔ APPROVE PAYMENT (ISSUE ATTENDANCE PASS & INVOICE) →
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  async attachEvents() {
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        api.clearToken();
        toast.show('Logged out.', 'info');
        this.navigate('login');
      });
    }

    await this.fetchDashboardData();

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
          cameraBtn.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-success animate-pulse"></span> ▶ START LIVE CAMERA';
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
            cameraBtn.innerHTML = '⏹ STOP CAMERA';
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
    const qrInput = document.getElementById('qr-scan-input');
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

    const applyFilters = async () => {
      const search = searchInput.value;
      const theme = themeFilter.value;
      const status = statusFilter.value;
      await this.fetchTeamsData({ search, theme, status });
    };

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (themeFilter) themeFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        themeFilter.value = 'ALL';
        statusFilter.value = 'ALL';
        this.fetchTeamsData();
      });
    }

    const closeModal = document.getElementById('close-modal-btn');
    const modal = document.getElementById('payment-modal');
    if (closeModal && modal) {
      closeModal.addEventListener('click', () => modal.classList.add('hidden'));
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
            ${isPaid ? '✔ PAYMENT VERIFIED' : '⏳ PAYMENT PENDING'}
          </div>
          <div class="text-[11px] ${isAttended ? 'text-success font-bold' : 'text-error font-bold'}">
            ${isAttended ? `✔ ATTENDANCE RECORDED (${team.attended_at ? team.attended_at.split('T')[0] : 'Today'})` : '❌ NOT CHECKED IN'}
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
            ✔ MARK ATTENDANCE & GRANT VENUE ENTRY →
          </button>
        ` : `
          <div class="p-3 bg-paper border border-success text-success text-xs text-center font-bold w-full">
            ✔ ENTRY ALREADY GRANTED // ATTENDANCE LOGGED
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

  async fetchDashboardData() {
    try {
      const statsRes = await api.getAdminStats();
      if (statsRes.success && statsRes.stats) {
        document.getElementById('stat-total').textContent = statsRes.stats.totalRegistrations;
        document.getElementById('stat-pending').textContent = statsRes.stats.pendingPayments;
        document.getElementById('stat-approved').textContent = statsRes.stats.approvedPayments;
        document.getElementById('stat-ppt').textContent = statsRes.stats.pptSubmissions;
        document.getElementById('stat-shortlist').textContent = statsRes.stats.shortlisted;
        document.getElementById('stat-attended').textContent = statsRes.stats.attendedCount || 0;
      }
      await this.fetchTeamsData();
    } catch (err) {
      toast.show('Error loading dashboard statistics.', 'error');
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
        pay.status === 'APPROVED' ? '<span class="text-success font-bold">✔ APPROVED</span>' :
        '<span class="text-accent-dark font-bold">⏳ PENDING VERIFICATION</span>'
      ) : '<span class="text-muted">NO PROOF</span>';

      const attendanceBadge = team.attended ? '<span class="text-success font-bold text-[10px]">✔ ATTENDED</span>' : '';

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
              <a href="${ppt.file_url}" target="_blank" download class="text-ink hover:text-accent font-bold underline">
                📥 ${ppt.original_filename} (v${ppt.version})
              </a>
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
            ${pay ? `
              <button data-action="verify-pay" data-reg="${team.reg_id}" class="px-2 py-1 border border-accent text-accent-dark hover:bg-accent hover:text-ink text-[10px] cursor-pointer">
                REVIEW PAYMENT
              </button>
            ` : ''}

            <button data-action="toggle-shortlist" data-reg="${team.reg_id}" data-current="${team.status}" class="px-2 py-1 border border-line text-ink hover:bg-paper text-[10px] cursor-pointer">
              ${team.status === 'SHORTLISTED' ? 'UN-SHORTLIST' : 'SHORTLIST'}
            </button>

            <button data-action="quick-scan" data-reg="${team.reg_id}" class="px-2 py-1 border border-success text-success hover:bg-success hover:text-canvas text-[10px] cursor-pointer">
              📷 SCAN / ENTRY
            </button>
          </td>
        </tr>
      `;
    }).join('');

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

  openPaymentModal(team) {
    this.selectedTeam = team;
    const modal = document.getElementById('payment-modal');
    if (!modal || !team.payment) return;

    document.getElementById('modal-team-title').textContent = `VERIFY PAYMENT: ${team.team_name}`;
    document.getElementById('modal-reg-id').textContent = team.reg_id;
    document.getElementById('modal-utr').textContent = team.payment.utr_number;
    document.getElementById('modal-payer').textContent = team.payment.payer_name;
    document.getElementById('modal-amount').textContent = `₹${team.payment.amount}`;
    document.getElementById('modal-screenshot-img').src = team.payment.screenshot_url;

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
