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
              <div class="text-[10px] text-muted uppercase">PAYMENT PENDING</div>
              <div id="stat-pending" class="font-mono text-3xl font-bold text-accent">--</div>
            </div>
            <div class="tech-card p-4 border-line bg-paper text-center">
              <div class="text-[10px] text-muted uppercase">PAYMENT APPROVED</div>
              <div id="stat-approved" class="font-mono text-3xl font-bold text-success">--</div>
            </div>
            <div class="tech-card p-4 border-line bg-paper text-center">
              <div class="text-[10px] text-muted uppercase">PAYMENT REJECTED</div>
              <div id="stat-rejected" class="font-mono text-3xl font-bold text-error">--</div>
            </div>
            <div class="tech-card p-4 border-line bg-paper text-center">
              <div class="text-[10px] text-muted uppercase">PPT SUBMISSIONS</div>
              <div id="stat-ppt" class="font-mono text-3xl font-bold text-accent-dark">--</div>
            </div>
            <div class="tech-card p-4 border-line bg-paper text-center">
              <div class="text-[10px] text-muted uppercase">SHORTLISTED</div>
              <div id="stat-shortlist" class="font-mono text-3xl font-bold text-success">--</div>
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
                <option value="PAYMENT_PENDING">Payment Pending</option>
                <option value="PAYMENT_APPROVED">Payment Approved</option>
                <option value="PAYMENT_REJECTED">Payment Rejected</option>
                <option value="PPT_SUBMITTED">PPT Submitted</option>
                <option value="SHORTLISTED">Shortlisted</option>
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
                  <th class="p-4">PPT FILE</th>
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
                <div>AMOUNT: <span id="modal-amount" class="text-accent-dark font-bold">₹499</span></div>
              </div>

              <!-- Screenshot Viewer -->
              <div class="p-2 bg-canvas border border-line text-center max-h-80 overflow-auto">
                <img id="modal-screenshot-img" src="" alt="Payment Proof" class="max-w-full h-auto mx-auto border border-line" />
              </div>

              <!-- Controls -->
              <div class="flex flex-col gap-3 pt-2">
                <button id="modal-approve-btn" class="btn-primary w-full py-3 text-xs">
                  ✔ APPROVE PAYMENT (UNLOCK PPT GATE)
                </button>
                
                <div class="space-y-2 pt-2 border-t border-line">
                  <input type="text" id="modal-reject-reason" placeholder="Mandatory rejection reason if rejecting..." class="w-full px-3 py-2 text-xs text-error outline-none" />
                  <button id="modal-reject-btn" class="btn-secondary w-full py-3 text-xs border-error text-error hover:bg-error hover:text-canvas">
                    ❌ REJECT PAYMENT WITH REASON
                  </button>
                </div>
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

  async fetchDashboardData() {
    try {
      const statsRes = await api.getAdminStats();
      if (statsRes.success && statsRes.stats) {
        document.getElementById('stat-total').textContent = statsRes.stats.totalRegistrations;
        document.getElementById('stat-pending').textContent = statsRes.stats.pendingPayments;
        document.getElementById('stat-approved').textContent = statsRes.stats.approvedPayments;
        document.getElementById('stat-rejected').textContent = statsRes.stats.rejectedPayments;
        document.getElementById('stat-ppt').textContent = statsRes.stats.pptSubmissions;
        document.getElementById('stat-shortlist').textContent = statsRes.stats.shortlisted;
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
        pay.status === 'REJECTED' ? '<span class="text-error font-bold">❌ REJECTED</span>' :
        '<span class="text-accent font-bold">⏳ PENDING</span>'
      ) : '<span class="text-muted">NO PROOF</span>';

      return `
        <tr class="hover:bg-canvas transition-colors">
          <td class="p-4">
            <div class="font-bold text-ink font-sans">${team.team_name}</div>
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
              team.status === 'SHORTLISTED' ? 'border-accent text-accent-dark font-bold' :
              team.status === 'REJECTED' ? 'border-error text-error' : 'border-line text-ink'
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

    tbody.querySelectorAll('button[data-action="toggle-shortlist"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const regId = btn.getAttribute('data-reg');
        const current = btn.getAttribute('data-current');
        const nextStatus = current === 'SHORTLISTED' ? 'PAYMENT_APPROVED' : 'SHORTLISTED';

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
    const rejectBtn = document.getElementById('modal-reject-btn');
    const reasonInput = document.getElementById('modal-reject-reason');

    approveBtn.onclick = async () => {
      try {
        const res = await api.approvePayment(team.reg_id, team.payment.id);
        if (res.success) {
          toast.show('Payment approved! PPT gate unlocked for team.', 'success');
          modal.classList.add('hidden');
          await this.fetchDashboardData();
        }
      } catch (err) {
        toast.show('Error approving payment.', 'error');
      }
    };

    rejectBtn.onclick = async () => {
      const reason = reasonInput.value;
      if (!reason || !reason.trim()) {
        toast.show('Mandatory rejection reason required.', 'error');
        return;
      }
      try {
        const res = await api.rejectPayment(team.reg_id, team.payment.id, reason);
        if (res.success) {
          toast.show('Payment rejected with reason.', 'info');
          modal.classList.add('hidden');
          await this.fetchDashboardData();
        }
      } catch (err) {
        toast.show('Error rejecting payment.', 'error');
      }
    };
  }
}
