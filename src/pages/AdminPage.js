/**
 * GAMBIT'S GLITCH - Swiss Editorial Admin Control Panel
 * Enhanced with Dual-Mode Check-in Scanner & Mobile-First Responsive UI
 */

import { Html5Qrcode } from 'html5-qrcode';
import { api } from '../utils/api.js';
import { toast } from '../utils/toast.js';
import { soundFx } from '../utils/audio.js';
import { eventConfig } from '../config/eventConfig.js';

export async function triggerFileDownload(fileUrl, filename = 'download') {
  if (!fileUrl) return;
  try {
    let blobUrl = fileUrl;
    let shouldRevoke = false;

    if (fileUrl.startsWith('data:')) {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      blobUrl = URL.createObjectURL(blob);
      shouldRevoke = true;
    } else if (fileUrl.startsWith('blob:')) {
      blobUrl = fileUrl;
    } else {
      const downloadUrl = fileUrl.includes('?') ? `${fileUrl}&download=true` : `${fileUrl}?download=true`;
      const res = await fetch(downloadUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      blobUrl = URL.createObjectURL(blob);
      shouldRevoke = true;
    }

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (shouldRevoke) {
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
    }
  } catch (err) {
    console.warn('Blob fetch download failed, falling back to direct link', err);
    const windowTarget = window.open(fileUrl, '_blank');
    if (!windowTarget) {
      window.location.href = fileUrl;
    }
  }
}

export async function copyToClipboard(text, label = 'Text') {
  if (!text) return;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    soundFx.playBeep();
    toast.show(`✔ ${label} copied to clipboard!`, 'info');
  } catch (e) {
    toast.show(`Failed to copy: ${text}`, 'error');
  }
}

export class AdminPage {
  constructor(navigate) {
    this.navigate = navigate;
    this.stats = null;
    this.teams = [];
    this.logs = [];
    this.selectedTeam = null;
    this.scannedTeam = null;
    this.squadModalTeam = null;
    this.currentFilters = { search: '', theme: 'ALL', status: 'ALL', attendance: 'ALL', sort: 'NEWEST' };
    this.searchDebounceTimer = null;
    this.scannerMode = 'camera'; // 'camera' or 'reg_id'
    this.html5QrCode = null;
    this.isScanning = false;
    this.autoRefreshTimer = null;
  }

  render() {
    if (!api.getToken()) {
      setTimeout(() => this.navigate('login'), 10);
      return `<div class="py-20 text-center font-mono text-xs text-muted">Redirecting to admin login...</div>`;
    }

    return `
      <div class="py-6 sm:py-12 font-mono bg-canvas min-h-screen">
        <div class="container mx-auto px-3 sm:px-4 max-w-7xl">
          
          <!-- TOP BAR: DESKTOP & MOBILE RESPONSIVE -->
          <div class="border-b border-line pb-5 mb-6 space-y-4">
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div class="text-[10px] sm:text-xs text-accent-dark tracking-widest uppercase font-bold font-mono">// CONTROL PANEL [ADMIN ACCESS]</div>
                <h1 class="font-sans text-2xl sm:text-4xl md:text-5xl font-extrabold uppercase text-ink tracking-tight">
                  GAMBIT’S GLITCH DASHBOARD
                </h1>
              </div>

              <!-- Primary Quick Bar on Desktop -->
              <div class="hidden lg:flex items-center gap-2">
                <button id="admin-gate-toggle-btn" type="button" class="btn-secondary text-xs py-2 px-3 border border-line font-mono font-bold uppercase tracking-wider transition-all cursor-pointer">
                  PAYMENT GATE: CHECKING...
                </button>
                <button id="admin-refresh-btn" type="button" class="btn-primary text-xs py-2 px-3 font-mono font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer">
                  REFRESH
                </button>
                <button id="admin-export-csv-btn" type="button" class="btn-secondary text-xs py-2 px-3 border border-accent text-accent-dark font-mono font-bold uppercase tracking-wider hover:bg-accent hover:text-ink transition-all cursor-pointer">
                  EXPORT CSV
                </button>
                <button id="admin-test-email-btn" type="button" class="btn-secondary text-xs py-2 px-3 border border-line text-ink hover:border-accent hover:text-accent-dark font-mono font-bold uppercase tracking-wider transition-all cursor-pointer">
                  TEST EMAIL
                </button>
                <button id="admin-logs-btn" type="button" class="btn-secondary text-xs py-2 px-3 border border-line text-ink hover:border-accent hover:text-accent-dark font-mono font-bold uppercase tracking-wider transition-all cursor-pointer">
                  AUDIT LOGS
                </button>
                <button id="admin-clear-btn" type="button" class="btn-secondary text-xs py-2 px-2.5 border border-error text-error font-mono font-bold uppercase tracking-wider hover:bg-error hover:text-white transition-all cursor-pointer" title="Wipe database">
                  CLEAR DATA
                </button>
                <button id="admin-logout-btn" type="button" class="btn-secondary text-xs py-2 px-2.5 border border-line text-muted font-mono font-bold uppercase tracking-wider hover:border-error hover:text-error transition-all cursor-pointer">
                  LOGOUT
                </button>
              </div>
            </div>

            <!-- Mobile Action Grid (Fits phone screens perfectly without wrapping ugliness) -->
            <div class="grid grid-cols-2 sm:grid-cols-4 lg:hidden gap-2 pt-2 border-t border-line/60">
              <button id="mobile-gate-toggle-btn" type="button" class="btn-secondary text-[11px] py-2.5 px-2 border border-line font-mono font-bold uppercase tracking-tight text-center truncate">
                GATE: ...
              </button>
              <button id="mobile-refresh-btn" type="button" class="btn-primary text-[11px] py-2.5 px-2 font-mono font-bold uppercase tracking-tight text-center">
                🔄 REFRESH
              </button>
              <button id="mobile-test-email-btn" type="button" class="btn-secondary text-[11px] py-2.5 px-2 border border-line text-ink font-mono font-bold uppercase tracking-tight text-center">
                ✉ TEST EMAIL
              </button>
              <button id="mobile-logs-btn" type="button" class="btn-secondary text-[11px] py-2.5 px-2 border border-line text-ink font-mono font-bold uppercase tracking-tight text-center">
                📋 AUDIT LOGS
              </button>
              <button id="mobile-export-csv-btn" type="button" class="btn-secondary text-[11px] py-2.5 px-2 border border-accent text-accent-dark font-mono font-bold uppercase tracking-tight text-center">
                📊 EXPORT CSV
              </button>
              <button id="mobile-clear-btn" type="button" class="btn-secondary text-[11px] py-2.5 px-2 border border-error text-error font-mono font-bold uppercase tracking-tight text-center">
                🗑 CLEAR ALL
              </button>
              <button id="mobile-logout-btn" type="button" class="col-span-2 btn-secondary text-[11px] py-2.5 px-2 border border-line text-muted font-mono font-bold uppercase tracking-tight text-center">
                🚪 LOGOUT
              </button>
            </div>
          </div>

          <!-- OVERVIEW STATS GRID (Responsive for mobile & desktop) -->
          <div id="admin-stats-grid" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4 mb-8">
            <div class="tech-card p-3 sm:p-4 border-line bg-paper text-center shadow-xs">
              <div class="text-[9px] sm:text-[10px] text-muted uppercase font-mono font-bold">TOTAL SQUADS</div>
              <div id="stat-total" class="font-mono text-2xl sm:text-3xl font-bold text-ink">--</div>
              <div class="text-[8px] sm:text-[9px] text-muted font-mono font-bold uppercase">REGISTERED</div>
            </div>
            <div class="tech-card p-3 sm:p-4 border-line bg-paper text-center shadow-xs">
              <div class="text-[9px] sm:text-[10px] text-muted uppercase font-mono font-bold">CONFIRMED (FCFS)</div>
              <div class="flex items-baseline justify-center gap-1">
                <span id="stat-confirmed" class="font-mono text-2xl sm:text-3xl font-bold text-success">--</span>
                <span class="font-mono text-xs sm:text-base text-muted font-bold">/ 40</span>
              </div>
              <div class="text-[8px] sm:text-[9px] text-accent-dark font-mono font-bold uppercase">CAP: 40 TEAMS</div>
            </div>
            <div class="tech-card p-3 sm:p-4 border-line bg-paper text-center shadow-xs">
              <div class="text-[9px] sm:text-[10px] text-muted uppercase font-mono font-bold">PAY PENDING</div>
              <div id="stat-pending" class="font-mono text-2xl sm:text-3xl font-bold text-accent-dark">--</div>
              <div class="text-[8px] sm:text-[9px] text-muted font-mono font-bold uppercase">AWAITING PROOF</div>
            </div>
            <div class="tech-card p-3 sm:p-4 border-line bg-paper text-center shadow-xs">
              <div class="text-[9px] sm:text-[10px] text-muted uppercase font-mono font-bold">PAY APPROVED</div>
              <div id="stat-approved" class="font-mono text-2xl sm:text-3xl font-bold text-success">--</div>
              <div class="text-[8px] sm:text-[9px] text-success/80 font-mono font-bold uppercase">VERIFIED SLOTS</div>
            </div>
            <div class="tech-card p-3 sm:p-4 border-line bg-paper text-center shadow-xs">
              <div class="text-[9px] sm:text-[10px] text-muted uppercase font-mono font-bold">ATTENDANCE (TEAMS)</div>
              <div class="flex items-baseline justify-center gap-1">
                <span id="stat-attended" class="font-mono text-2xl sm:text-3xl font-bold text-success">--</span>
                <span class="font-mono text-xs sm:text-base text-muted font-bold">/ 40</span>
              </div>
              <div class="text-[8px] sm:text-[9px] text-muted font-mono font-bold uppercase">CHECKED IN</div>
            </div>
            <div class="tech-card p-3 sm:p-4 border-line bg-paper text-center shadow-xs">
              <div class="text-[9px] sm:text-[10px] text-muted uppercase font-mono font-bold">HEADCOUNT (ATTENDEES)</div>
              <div id="stat-attendees-headcount" class="font-mono text-xl sm:text-2xl font-bold text-ink">-- / --</div>
              <div class="text-[8px] sm:text-[9px] text-accent-dark font-mono font-bold uppercase">PRESENT / TOTAL</div>
            </div>
          </div>

          <!-- ATTENDANCE & CHECK-IN LAUNCH BANNER -->
          <div class="tech-card p-4 sm:p-6 border-2 border-accent bg-paper mb-6 space-y-4 shadow-sm">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] sm:text-xs text-accent-dark font-bold font-mono">// VENUE CHECK-IN SYSTEM</span>
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-accent/15 border border-accent text-accent-dark text-[9px] sm:text-[10px] font-bold font-mono uppercase">
                    <span class="w-1.5 h-1.5 rounded-full bg-success animate-ping"></span> TWO CHECK-IN MODES
                  </span>
                </div>
                <h2 class="font-sans text-lg sm:text-2xl font-extrabold text-ink uppercase tracking-tight mt-1">
                  Event Day Attendance Pass Scanner
                </h2>
                <p class="text-xs text-muted font-mono">
                  Scan attendee QR pass via mobile camera OR search instantly by Registration ID / Squad name.
                </p>
              </div>

              <!-- Two prominent trigger buttons right on the banner -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button type="button" id="open-scanner-camera-btn" class="btn-primary py-3 px-4 text-xs uppercase font-mono font-bold tracking-wider cursor-pointer shadow-sm flex items-center justify-center gap-2 group">
                  <span>📷 1. LIVE CAMERA SCAN</span>
                </button>
                <button type="button" id="open-scanner-regid-btn" class="btn-secondary py-3 px-4 text-xs uppercase font-mono font-bold tracking-wider border-2 border-accent text-accent-dark hover:bg-accent hover:text-ink cursor-pointer flex items-center justify-center gap-2 transition-all">
                  <span>🔢 2. BY REG ID / SEARCH</span>
                </button>
              </div>
            </div>
          </div>

          <!-- DUAL-MODE CHECK-IN SCANNER DRAWER / MODAL -->
          <div id="scanner-drawer-container" class="hidden tech-card p-4 sm:p-8 border-2 border-accent bg-paper space-y-5 mb-10 max-w-3xl mx-auto shadow-2xl relative">
            <div class="flex items-center justify-between border-b border-line pb-4 gap-2">
              <div>
                <div class="text-[10px] sm:text-xs text-accent-dark font-bold font-mono">// ATTENDANCE ENTRY VERIFICATION</div>
                <h2 class="font-sans text-lg sm:text-2xl font-bold text-ink uppercase">
                  Check-In Pass Verification
                </h2>
              </div>
              <button type="button" id="close-scanner-box-btn" class="btn-secondary text-xs py-2 px-3 border border-line text-ink hover:border-accent cursor-pointer font-mono font-bold">
                ✕ CLOSE
              </button>
            </div>

            <!-- TWO CLEAR TAB BUTTONS -->
            <div class="grid grid-cols-2 gap-2 p-1 bg-canvas border border-line">
              <button type="button" id="tab-btn-camera" class="py-3 px-3 text-xs font-mono font-extrabold uppercase tracking-wider text-center transition-all bg-accent text-ink border border-accent cursor-pointer">
                📷 OPTION 1: CAMERA SCANNER
              </button>
              <button type="button" id="tab-btn-regid" class="py-3 px-3 text-xs font-mono font-bold uppercase tracking-wider text-center transition-all text-muted hover:text-ink cursor-pointer">
                🔢 OPTION 2: REG ID LOOKUP
              </button>
            </div>

            <!-- VIEW 1: LIVE CAMERA QR SCANNER -->
            <div id="scanner-mode-camera-view" class="space-y-4">
              <div class="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div class="flex items-center gap-2">
                  <span class="text-muted">CAMERA DEVICE:</span>
                  <select id="camera-select-dropdown" class="px-2 py-1.5 text-xs text-ink bg-canvas border border-line font-mono outline-none">
                    <option value="">Detecting cameras...</option>
                  </select>
                </div>
                <button type="button" id="toggle-camera-btn" class="btn-primary text-xs py-2 px-4 uppercase font-mono font-bold cursor-pointer flex items-center gap-2">
                  <span class="inline-block w-2 h-2 rounded-full bg-success animate-pulse"></span>
                  START CAMERA
                </button>
              </div>

              <!-- Camera Viewport Box -->
              <div id="reader-container" class="relative bg-canvas border-2 border-accent p-3 sm:p-4 min-h-[220px] flex flex-col items-center justify-center text-center overflow-hidden">
                <div id="reader" class="w-full max-w-sm mx-auto overflow-hidden"></div>
                <div id="camera-placeholder" class="py-8 space-y-2">
                  <div class="text-3xl">📷</div>
                  <div class="text-xs font-mono font-bold text-ink uppercase tracking-wider">
                    CAMERA SCANNER READY
                  </div>
                  <div class="text-[11px] text-muted font-mono max-w-xs mx-auto">
                    Click <strong>START CAMERA</strong> above and hold the participant's QR pass in front of the lens.
                  </div>
                </div>
              </div>

              <!-- Fast barcode or paste fallback in camera mode -->
              <div class="text-center">
                <button type="button" id="switch-to-regid-quick-btn" class="text-xs text-accent-dark hover:underline font-mono font-bold">
                  Camera not working or permission denied? Switch to Option 2 (Lookup by Reg ID) →
                </button>
              </div>
            </div>

            <!-- VIEW 2: MANUAL REGISTRATION ID & SQUAD LOOKUP -->
            <div id="scanner-mode-regid-view" class="hidden space-y-5">
              <div class="p-4 bg-canvas border border-line space-y-3">
                <div class="text-xs text-accent-dark font-bold font-mono">// OPTION 2: DIRECT LOOKUP & CHECK-IN</div>
                <p class="text-xs text-muted font-sans">
                  Enter the 9-character Registration ID (e.g. <strong class="text-ink">GG26-KLGF</strong>) or search by Team Name, Leader Email, or Phone.
                </p>

                <form id="direct-reg-lookup-form" class="space-y-3">
                  <div class="flex flex-col sm:flex-row gap-2">
                    <input 
                      type="text" 
                      id="reg-id-lookup-input" 
                      placeholder="e.g. GG26-KLGF or V' Engine" 
                      class="flex-1 px-4 py-3 text-sm sm:text-base text-ink font-mono font-bold uppercase bg-paper border-2 border-accent focus:outline-none placeholder:text-muted/60"
                      autocomplete="off"
                    />
                    <button type="submit" class="btn-primary py-3 px-6 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer whitespace-nowrap">
                      🔍 CHECK IN
                    </button>
                  </div>
                </form>
              </div>

              <!-- Clickable Quick Chips for Existing Teams -->
              <div class="space-y-2">
                <div class="text-[11px] text-muted font-mono font-bold uppercase">// QUICK CLICK REGISTERED TEAMS TO VERIFY:</div>
                <div id="quick-teams-chips" class="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                  <!-- Dynamically populated -->
                </div>
              </div>
            </div>

            <!-- UNIFIED SCANNER RESULT CARD (Appears below both options when verified) -->
            <div id="scanner-result-box" class="hidden p-4 sm:p-6 bg-canvas border-2 border-accent space-y-4">
              <!-- Dynamically populated via JS -->
            </div>
          </div>

          <!-- SEARCH & FILTER BAR (Mobile full-width stacked & responsive grid) -->
          <div class="tech-card p-3 sm:p-5 border border-line bg-paper mb-6 shadow-xs space-y-3">
            <div class="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
              <div class="relative flex-1">
                <input 
                  type="text" 
                  id="admin-search-input" 
                  placeholder="Search by Team Name, ID (GG26-...), Leader Email, Phone, College, UTR..." 
                  class="w-full pl-9 pr-8 py-2.5 text-xs text-ink font-mono focus:border-accent outline-none bg-canvas border border-line" 
                />
                <span class="absolute left-3 top-2.5 text-muted text-xs">🔍</span>
                <button type="button" id="admin-search-clear-btn" class="hidden absolute right-2.5 top-2 text-muted hover:text-ink text-sm font-bold font-mono px-1">✕</button>
              </div>

              <!-- Filter Badges & Counter -->
              <div class="flex items-center justify-between sm:justify-end gap-2">
                <div id="admin-filtered-count-badge" class="px-3 py-2 text-[11px] font-mono font-bold bg-canvas border border-line text-accent-dark whitespace-nowrap">
                  SHOWING -- SQUADS
                </div>
                <button id="admin-filter-reset" class="btn-secondary text-xs py-2 px-3.5 font-mono font-bold uppercase tracking-wider border border-line hover:border-accent hover:text-accent-dark transition-all cursor-pointer whitespace-nowrap">
                  RESET
                </button>
              </div>
            </div>

            <!-- Controls row: Themes, Status, Attendance, Sort -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 border-t border-line/50 text-xs font-mono">
              <div>
                <label class="block text-[10px] text-muted font-bold uppercase mb-1">THEME / TRACK:</label>
                <select id="admin-theme-filter" class="w-full px-2.5 py-2 text-xs text-ink font-mono outline-none bg-canvas border border-line">
                  <option value="ALL">All Themes</option>
                  ${eventConfig.themes.map(t => `<option value="${t.id}">${t.number}. ${t.name}</option>`).join('')}
                </select>
              </div>

              <div>
                <label class="block text-[10px] text-muted font-bold uppercase mb-1">PAYMENT &amp; SLOT STATUS:</label>
                <select id="admin-status-filter" class="w-full px-2.5 py-2 text-xs text-ink font-mono outline-none bg-canvas border border-line">
                  <option value="ALL">All Statuses</option>
                  <option value="REGISTERED">Registered / FCFS</option>
                  <option value="PAYMENT_PENDING">Payment Pending</option>
                  <option value="PAYMENT_APPROVED">Payment Approved (Confirmed)</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              <div>
                <label class="block text-[10px] text-muted font-bold uppercase mb-1">VENUE CHECK-IN ATTENDANCE:</label>
                <select id="admin-attendance-filter" class="w-full px-2.5 py-2 text-xs text-ink font-mono outline-none bg-canvas border border-line">
                  <option value="ALL">All Attendance States</option>
                  <option value="ATTENDED">✔ Attended / Checked In</option>
                  <option value="NOT_ATTENDED">❌ Not Checked In</option>
                </select>
              </div>

              <div>
                <label class="block text-[10px] text-muted font-bold uppercase mb-1">SORT ROSTER BY:</label>
                <select id="admin-sort-filter" class="w-full px-2.5 py-2 text-xs text-ink font-mono outline-none bg-canvas border border-line">
                  <option value="NEWEST">Newest First</option>
                  <option value="OLDEST">Oldest First</option>
                  <option value="NAME_ASC">Team Name (A-Z)</option>
                  <option value="NAME_DESC">Team Name (Z-A)</option>
                  <option value="MEMBERS_DESC">Members Count (High-Low)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- MAIN REGISTRATION DATA: DUAL PRESENTATION -->
          
          <!-- 1. DESKTOP VIEW (TABLE): Visible on screens md and larger -->
          <div class="hidden md:block tech-card border-line bg-paper overflow-x-auto mb-10 shadow-sm">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="bg-canvas border-b border-line text-muted uppercase tracking-widest text-[11px]">
                  <th class="p-4">TEAM INTEL</th>
                  <th class="p-4">THEME</th>
                  <th class="p-4">PAYMENT INTEL (UTR)</th>
                  <th class="p-4">PAYMENT PROOF</th>
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

          <!-- 2. MOBILE VIEW (CARDS): Clean, native card list on phones (no horizontal scrolling!) -->
          <div id="admin-teams-mobile-container" class="md:hidden space-y-3 mb-10">
            <div class="tech-card p-6 border-line bg-paper text-center text-xs text-muted">
              Loading teams mobile database...
            </div>
          </div>

          <!-- BROADCAST ANNOUNCEMENT SECTION -->
          <div class="tech-card p-4 sm:p-6 border-line bg-paper space-y-4 mb-10">
            <h2 class="font-sans text-base sm:text-lg font-bold text-ink uppercase border-b border-line pb-2">
              BROADCAST PARTICIPANT ANNOUNCEMENT
            </h2>
            <form id="announcement-form" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="md:col-span-2">
                  <input type="text" name="title" required placeholder="Announcement Headline..." class="w-full px-3 py-2 text-xs text-ink focus:border-accent outline-none bg-canvas border border-line" />
                </div>
                <div>
                  <select name="priority" class="w-full px-3 py-2 text-xs text-ink outline-none bg-canvas border border-line">
                    <option value="NORMAL">NORMAL PRIORITY</option>
                    <option value="URGENT">URGENT</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>
              <textarea name="content" required rows="2" placeholder="Announcement body text displayed on status tracker..." class="w-full p-3 text-xs text-ink focus:border-accent outline-none font-sans bg-canvas border border-line"></textarea>
              <button type="submit" class="btn-primary text-xs py-2.5 px-6 font-mono font-bold uppercase cursor-pointer">
                POST ANNOUNCEMENT
              </button>
            </form>
          </div>

          <!-- SQUAD DETAILS & MEMBER ROSTER MODAL -->
          <div id="squad-modal" class="hidden fixed inset-0 z-50 bg-canvas/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
            <div class="tech-card p-4 sm:p-8 border-2 border-accent bg-paper max-w-2xl w-full space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
              <div class="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <div class="text-[10px] text-accent-dark font-mono font-bold tracking-widest uppercase">// SQUAD DOSSIER &amp; ROSTER</div>
                  <div class="font-sans text-lg sm:text-2xl font-bold text-ink uppercase truncate max-w-xs sm:max-w-md" id="squad-modal-team-name">TEAM NAME</div>
                </div>
                <button id="close-squad-modal-btn" class="text-ink hover:text-accent text-2xl font-bold p-1 cursor-pointer transition-colors leading-none">✕</button>
              </div>

              <!-- Metadata Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-canvas p-3 border border-line">
                <div>
                  <div class="text-[9px] text-muted uppercase font-bold">REG ID:</div>
                  <strong id="squad-modal-reg-id" class="text-accent-dark font-mono text-xs select-all">--</strong>
                </div>
                <div>
                  <div class="text-[9px] text-muted uppercase font-bold">THEME:</div>
                  <strong id="squad-modal-theme" class="text-ink font-mono text-xs truncate block">--</strong>
                </div>
                <div>
                  <div class="text-[9px] text-muted uppercase font-bold">COLLEGE:</div>
                  <span id="squad-modal-college" class="text-ink font-bold text-xs truncate block">--</span>
                </div>
                <div>
                  <div class="text-[9px] text-muted uppercase font-bold">ATTENDANCE:</div>
                  <span id="squad-modal-attendance-status" class="text-xs font-bold font-mono">--</span>
                </div>
              </div>

              <!-- Members List Container -->
              <div class="space-y-2">
                <div class="text-xs text-accent-dark font-bold font-mono uppercase flex items-center justify-between">
                  <span>// SQUAD MEMBERS (<span id="squad-modal-member-count">0</span>):</span>
                  <span id="squad-modal-present-count" class="text-[11px] text-muted font-mono">0 Present</span>
                </div>
                <div id="squad-modal-members-list" class="space-y-2 max-h-72 overflow-y-auto pr-1">
                  <!-- Dynamically rendered -->
                </div>
              </div>

              <!-- Action Bar -->
              <div class="pt-3 border-t border-line flex flex-wrap gap-2 justify-end">
                <button type="button" id="squad-modal-open-scanner-btn" class="btn-primary py-2.5 px-4 text-xs font-bold uppercase font-mono cursor-pointer">
                  🎫 OPEN IN CHECK-IN SCANNER
                </button>
                <button type="button" id="squad-modal-invoice-btn" class="btn-secondary py-2.5 px-4 text-xs font-bold uppercase font-mono border border-line hover:border-accent text-ink hover:text-accent-dark cursor-pointer">
                  ✉ RESEND INVOICE / PASS
                </button>
                <button type="button" id="squad-modal-close-bottom-btn" class="btn-secondary py-2.5 px-3 text-xs font-bold uppercase font-mono border border-line text-muted cursor-pointer">
                  CLOSE
                </button>
              </div>
            </div>
          </div>

          <!-- PAYMENT PROOF AUDIT MODAL -->
          <div id="payment-modal" class="hidden fixed inset-0 z-50 bg-canvas/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
            <div class="tech-card p-4 sm:p-8 border-2 border-accent bg-paper max-w-3xl w-full space-y-4 max-h-[92vh] overflow-y-auto shadow-2xl">
              <div class="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <div class="text-[10px] text-accent-dark font-mono font-bold tracking-widest uppercase">// PAYMENT PROOF VERIFICATION</div>
                  <div class="font-sans text-lg sm:text-2xl font-bold text-ink uppercase truncate max-w-xs sm:max-w-md" id="modal-team-title">VERIFY PAYMENT PROOF</div>
                </div>
                <button id="close-modal-btn" class="text-ink hover:text-accent text-2xl font-bold p-1 cursor-pointer transition-colors leading-none">✕</button>
              </div>

              <!-- Metadata Grid -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono bg-canvas p-3 border border-line">
                <div>
                  <div class="text-[10px] text-muted uppercase font-bold">REG ID:</div>
                  <strong id="modal-reg-id" class="text-accent-dark font-mono text-sm">--</strong>
                </div>
                <div>
                  <div class="text-[10px] text-muted uppercase font-bold">UTR NUMBER:</div>
                  <strong id="modal-utr" class="text-ink font-mono text-xs sm:text-sm select-all break-all">--</strong>
                </div>
                <div>
                  <div class="text-[10px] text-muted uppercase font-bold">PAYER ACCOUNT:</div>
                  <span id="modal-payer" class="text-ink font-bold truncate block">--</span>
                </div>
                <div>
                  <div class="text-[10px] text-muted uppercase font-bold">AMOUNT:</div>
                  <span id="modal-amount" class="text-success font-bold text-sm">₹--</span>
                </div>
              </div>

              <!-- Screenshot Viewer Frame -->
              <div class="space-y-2">
                <div class="flex items-center justify-between text-xs font-mono">
                  <span class="text-muted font-bold text-[10px] uppercase">// UPI TRANSFER SCREENSHOT:</span>
                  <div class="flex items-center gap-2">
                    <a id="modal-view-original-btn" href="#" target="_blank" class="px-2.5 py-1 border border-line text-ink hover:border-accent text-[10px] font-bold uppercase transition-all">
                      Open Full Size ↗
                    </a>
                    <button type="button" id="modal-download-proof-btn" class="px-2.5 py-1 border border-accent text-accent-dark hover:bg-accent hover:text-ink text-[10px] font-bold uppercase transition-all cursor-pointer">
                      Download File
                    </button>
                  </div>
                </div>
                <div class="p-2 sm:p-3 bg-canvas border-2 border-line text-center max-h-80 overflow-auto flex items-center justify-center">
                  <img id="modal-screenshot-img" src="" alt="Payment Proof Screenshot" class="max-w-full max-h-72 h-auto mx-auto object-contain border border-line shadow-xs" />
                </div>
              </div>

              <!-- Action Controls -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-line">
                <button id="modal-approve-btn" type="button" class="btn-primary py-3 px-4 text-xs font-bold tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2">
                  <span>✔ APPROVE PAYMENT (CONFIRM FCFS)</span>
                </button>
                <button id="modal-reject-btn" type="button" class="btn-secondary py-3 px-4 text-xs font-bold tracking-widest uppercase border border-error text-error hover:bg-error hover:text-white cursor-pointer transition-all">
                  <span>✕ REJECT PAYMENT (REQUEST RESUBMISSION)</span>
                </button>
              </div>

              <!-- Email Dispatch Controls -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-line">
                <button id="modal-resend-invoice-btn" type="button" class="btn-secondary py-2.5 px-3 text-xs font-bold font-mono border border-line hover:border-accent text-ink hover:text-accent-dark cursor-pointer transition-all">
                  ✉ RESEND INVOICE &amp; ATTENDANCE QR PASS
                </button>
                <button id="modal-resend-reg-btn" type="button" class="btn-secondary py-2.5 px-3 text-xs font-bold font-mono border border-line hover:border-accent text-ink hover:text-accent-dark cursor-pointer transition-all">
                  ✉ RESEND REGISTRATION CONFIRMATION EMAIL
                </button>
              </div>
            </div>
          </div>

          <!-- DIAGNOSTIC TEST EMAIL MODAL -->
          <div id="test-email-modal" class="hidden fixed inset-0 z-50 bg-canvas/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
            <div class="tech-card p-5 sm:p-8 border-2 border-accent bg-paper max-w-md w-full space-y-4 shadow-2xl">
              <div class="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <div class="text-[10px] text-accent-dark font-mono font-bold tracking-widest uppercase">// EMAIL DISPATCH DIAGNOSTICS</div>
                  <h3 class="font-sans text-lg sm:text-xl font-bold text-ink uppercase">SEND DIAGNOSTIC TEST EMAIL</h3>
                </div>
                <button id="close-test-email-btn" class="text-ink hover:text-accent text-2xl font-bold p-1 cursor-pointer transition-colors leading-none">✕</button>
              </div>
              <p class="text-xs text-muted font-sans leading-relaxed">
                Test and verify live Brevo HTTP API v3 deliverability directly to any inbox.
              </p>
              <form id="test-email-form" class="space-y-4">
                <div>
                  <label class="block text-xs text-ink mb-1">RECIPIENT EMAIL ADDRESS *</label>
                  <input type="email" id="test-email-input" required value="gambitsglitch@gmail.com" placeholder="name@example.com" class="w-full px-3 py-2.5 text-xs text-ink border border-line bg-canvas focus:border-accent outline-none font-mono" />
                </div>
                <button type="submit" id="send-test-email-submit-btn" class="btn-primary w-full py-3 text-xs font-bold font-mono uppercase tracking-wider cursor-pointer">
                  ⚡ DISPATCH TEST EMAIL
                </button>
              </form>
              <div id="test-email-status-box" class="hidden p-3 text-xs font-mono border break-words"></div>
            </div>
          </div>

          <!-- AUDIT LOGS MODAL -->
          <div id="admin-logs-modal" class="hidden fixed inset-0 z-50 bg-canvas/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
            <div class="tech-card p-4 sm:p-8 border-2 border-accent bg-paper max-w-4xl w-full space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
              <div class="flex items-center justify-between border-b border-line pb-3">
                <div>
                  <div class="text-[10px] text-accent-dark font-mono font-bold tracking-widest uppercase">// SYSTEM AUDIT TRAIL</div>
                  <h3 class="font-sans text-lg sm:text-xl font-bold text-ink uppercase">ADMINISTRATIVE ACTION LOGS</h3>
                </div>
                <button id="close-logs-modal-btn" class="text-ink hover:text-accent text-2xl font-bold p-1 cursor-pointer transition-colors leading-none">✕</button>
              </div>
              <div class="flex-1 overflow-y-auto border border-line bg-canvas min-h-[250px]">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="bg-paper border-b border-line text-muted uppercase text-[10px] tracking-wider">
                      <th class="p-3">TIMESTAMP</th>
                      <th class="p-3">ADMIN</th>
                      <th class="p-3">ACTION</th>
                      <th class="p-3">TARGET</th>
                      <th class="p-3">DETAILS</th>
                    </tr>
                  </thead>
                  <tbody id="admin-logs-tbody" class="divide-y divide-line font-mono text-[11px]">
                    <tr><td colspan="5" class="p-4 text-center text-muted">Loading audit records...</td></tr>
                  </tbody>
                </table>
              </div>
              <div class="flex justify-between items-center pt-2 border-t border-line text-xs font-mono">
                <span id="logs-count-text" class="text-muted">0 logs recorded</span>
                <button type="button" id="refresh-logs-btn" class="px-3 py-1.5 border border-line hover:border-accent text-ink text-[11px] font-bold uppercase transition-all cursor-pointer">
                  REFRESH LOGS
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

    // Initial fetch
    await this.fetchDashboardData();

    // Auto-refresh stats and team status every 6 seconds
    this.autoRefreshTimer = setInterval(() => {
      this.fetchDashboardData(true);
    }, 6000);

    // GATE BUTTON STATUS SYNC
    const syncGateBtnUI = async () => {
      const desktopBtn = document.getElementById('admin-gate-toggle-btn');
      const mobileBtn = document.getElementById('mobile-gate-toggle-btn');
      try {
        const res = await api.getPaymentGateStatus();
        const isOpen = res && res.open;
        const text = isOpen ? 'GATE: OPEN' : 'GATE: LOCKED';
        const className = isOpen
          ? 'btn-secondary text-xs py-2 px-3 border border-success text-success font-mono font-bold uppercase tracking-wider cursor-pointer'
          : 'btn-secondary text-xs py-2 px-3 border border-error text-error font-mono font-bold uppercase tracking-wider cursor-pointer';

        if (desktopBtn) {
          desktopBtn.className = className;
          desktopBtn.textContent = isOpen ? 'PAYMENT PORTAL: OPEN' : 'PAYMENT PORTAL: LOCKED';
          desktopBtn.setAttribute('data-open', isOpen ? 'true' : 'false');
        }
        if (mobileBtn) {
          mobileBtn.className = className.replace('text-xs py-2 px-3', 'text-[11px] py-2.5 px-2 text-center');
          mobileBtn.textContent = text;
          mobileBtn.setAttribute('data-open', isOpen ? 'true' : 'false');
        }
      } catch (err) {
        if (desktopBtn) desktopBtn.textContent = 'PAYMENT GATE: ERROR';
        if (mobileBtn) mobileBtn.textContent = 'GATE: ERR';
      }
    };
    await syncGateBtnUI();

    const handleGateToggle = async () => {
      soundFx.playClick();
      const currentBtn = document.getElementById('admin-gate-toggle-btn') || document.getElementById('mobile-gate-toggle-btn');
      const currentOpen = currentBtn?.getAttribute('data-open') === 'true';
      const newStatus = !currentOpen;
      const confirmed = confirm(`Are you sure you want to ${newStatus ? 'OPEN' : 'LOCK'} the payment portal for participating teams?`);
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
    };

    document.getElementById('admin-gate-toggle-btn')?.addEventListener('click', handleGateToggle);
    document.getElementById('mobile-gate-toggle-btn')?.addEventListener('click', handleGateToggle);

    // REFRESH BUTTONS
    const handleRefresh = async () => {
      soundFx.playClick();
      toast.show('Refreshing teams database...', 'info');
      await this.fetchDashboardData();
      toast.show('Dashboard data updated!', 'success');
    };
    document.getElementById('admin-refresh-btn')?.addEventListener('click', handleRefresh);
    document.getElementById('mobile-refresh-btn')?.addEventListener('click', handleRefresh);

    // EXPORT CSV BUTTONS
    const handleExportCsv = async (e) => {
      e.preventDefault();
      soundFx.playClick();
      toast.show('Generating CSV export...', 'info');
      try {
        const blob = await api.downloadExportCsv();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `gambits_glitch_registrations_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
        toast.show('CSV export downloaded successfully!', 'success');
      } catch (err) {
        toast.show('Failed to export CSV. Please check admin login session.', 'error');
      }
    };
    document.getElementById('admin-export-csv-btn')?.addEventListener('click', handleExportCsv);
    document.getElementById('mobile-export-csv-btn')?.addEventListener('click', handleExportCsv);

    // CLEAR ALL DATA BUTTONS
    const handleClearData = async () => {
      soundFx.playClick();
      const confirmed = confirm("⚠️ ARE YOU SURE?\nThis will permanently delete all registered teams, payments, and attendance logs!");
      if (!confirmed) return;
      toast.show('Clearing database...', 'info');
      const res = await api.clearAllData();
      if (res.success) {
        toast.show('Database wiped clean successfully!', 'success');
        await this.fetchDashboardData();
      } else {
        toast.show(res.message || 'Failed to clear database.', 'error');
      }
    };
    document.getElementById('admin-clear-btn')?.addEventListener('click', handleClearData);
    document.getElementById('mobile-clear-btn')?.addEventListener('click', handleClearData);

    // LOGOUT BUTTONS
    const handleLogout = () => {
      if (this.autoRefreshTimer) clearInterval(this.autoRefreshTimer);
      if (this.isScanning && this.html5QrCode) {
        try { this.html5QrCode.stop(); } catch (e) {}
      }
      api.clearToken();
      toast.show('Logged out.', 'info');
      this.navigate('login');
    };
    document.getElementById('admin-logout-btn')?.addEventListener('click', handleLogout);
    document.getElementById('mobile-logout-btn')?.addEventListener('click', handleLogout);

    // DUAL-MODE SCANNER DRAWER / TABS HANDLERS
    const scannerDrawer = document.getElementById('scanner-drawer-container');
    const tabBtnCamera = document.getElementById('tab-btn-camera');
    const tabBtnRegId = document.getElementById('tab-btn-regid');
    const viewCamera = document.getElementById('scanner-mode-camera-view');
    const viewRegId = document.getElementById('scanner-mode-regid-view');
    const regLookupInput = document.getElementById('reg-id-lookup-input');

    const switchScannerTab = (mode) => {
      this.scannerMode = mode;
      if (mode === 'camera') {
        tabBtnCamera.className = "py-3 px-3 text-xs font-mono font-extrabold uppercase tracking-wider text-center transition-all bg-accent text-ink border border-accent cursor-pointer";
        tabBtnRegId.className = "py-3 px-3 text-xs font-mono font-bold uppercase tracking-wider text-center transition-all text-muted hover:text-ink cursor-pointer";
        viewCamera?.classList.remove('hidden');
        viewRegId?.classList.add('hidden');
      } else {
        tabBtnRegId.className = "py-3 px-3 text-xs font-mono font-extrabold uppercase tracking-wider text-center transition-all bg-accent text-ink border border-accent cursor-pointer";
        tabBtnCamera.className = "py-3 px-3 text-xs font-mono font-bold uppercase tracking-wider text-center transition-all text-muted hover:text-ink cursor-pointer";
        viewRegId?.classList.remove('hidden');
        viewCamera?.classList.add('hidden');
        setTimeout(() => regLookupInput?.focus(), 100);
      }
    };

    tabBtnCamera?.addEventListener('click', () => switchScannerTab('camera'));
    tabBtnRegId?.addEventListener('click', () => switchScannerTab('reg_id'));
    document.getElementById('switch-to-regid-quick-btn')?.addEventListener('click', () => switchScannerTab('reg_id'));

    // Open from Banner Button 1 (Camera Mode)
    document.getElementById('open-scanner-camera-btn')?.addEventListener('click', () => {
      soundFx.playClick();
      scannerDrawer?.classList.remove('hidden');
      switchScannerTab('camera');
      scannerDrawer?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // If camera not yet started, trigger start
      if (!this.isScanning) {
        document.getElementById('toggle-camera-btn')?.click();
      }
    });

    // Open from Banner Button 2 (Reg ID Mode)
    document.getElementById('open-scanner-regid-btn')?.addEventListener('click', () => {
      soundFx.playClick();
      scannerDrawer?.classList.remove('hidden');
      switchScannerTab('reg_id');
      scannerDrawer?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // Close Scanner Drawer
    document.getElementById('close-scanner-box-btn')?.addEventListener('click', async () => {
      soundFx.playClick();
      scannerDrawer?.classList.add('hidden');
      if (this.isScanning && this.html5QrCode) {
        try {
          await this.html5QrCode.stop();
          this.html5QrCode.clear();
        } catch (e) {}
        this.isScanning = false;
        const cameraBtn = document.getElementById('toggle-camera-btn');
        if (cameraBtn) cameraBtn.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-success animate-pulse"></span> START CAMERA';
      }
    });

    // Populate Available Cameras in Dropdown
    const populateCameras = async () => {
      const select = document.getElementById('camera-select-dropdown');
      if (!select) return;
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length) {
          select.innerHTML = devices.map((d, i) => `
            <option value="${d.id}">${d.label || `Camera ${i + 1}`}</option>
          `).join('');
        } else {
          select.innerHTML = `<option value="environment">Back Camera (Default)</option><option value="user">Front Camera</option>`;
        }
      } catch (e) {
        select.innerHTML = `<option value="environment">Back Camera (Default)</option><option value="user">Front Camera</option>`;
      }
    };
    populateCameras();

    // LIVE CAMERA SCANNER START / STOP
    const cameraBtn = document.getElementById('toggle-camera-btn');
    const placeholder = document.getElementById('camera-placeholder');
    const cameraSelect = document.getElementById('camera-select-dropdown');

    if (cameraBtn) {
      cameraBtn.addEventListener('click', async () => {
        if (this.isScanning && this.html5QrCode) {
          try {
            await this.html5QrCode.stop();
            this.html5QrCode.clear();
          } catch (e) {}
          this.isScanning = false;
          if (placeholder) placeholder.classList.remove('hidden');
          cameraBtn.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-success animate-pulse"></span> START CAMERA';
          return;
        }

        try {
          const ScannerClass = window.Html5Qrcode || Html5Qrcode;
          if (!this.html5QrCode) {
            this.html5QrCode = new ScannerClass("reader");
          }

          if (placeholder) placeholder.classList.add('hidden');
          cameraBtn.innerHTML = 'STOPPING...';

          const selectedCameraId = cameraSelect?.value || { facingMode: "environment" };

          await this.html5QrCode.start(
            selectedCameraId,
            { fps: 12, qrbox: { width: 240, height: 240 } },
            (decodedText) => {
              soundFx.playBeep();
              this.processScanCode(decodedText);
            },
            () => {}
          );

          this.isScanning = true;
          cameraBtn.innerHTML = '⏹ STOP CAMERA';
        } catch (err) {
          if (placeholder) placeholder.classList.remove('hidden');
          cameraBtn.innerHTML = '<span class="inline-block w-2 h-2 rounded-full bg-success animate-pulse"></span> START CAMERA';
          toast.show('Camera access unavailable. Use Option 2 (Reg ID Lookup) below.', 'error');
          switchScannerTab('reg_id');
        }
      });
    }

    // REG ID DIRECT LOOKUP FORM SUBMIT
    const directLookupForm = document.getElementById('direct-reg-lookup-form');
    if (directLookupForm && regLookupInput) {
      directLookupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        soundFx.playClick();
        await this.processScanCode(regLookupInput.value);
      });
    }

    // Search, Filters, and Sorting
    const searchInput = document.getElementById('admin-search-input');
    const searchClearBtn = document.getElementById('admin-search-clear-btn');
    const themeFilter = document.getElementById('admin-theme-filter');
    const statusFilter = document.getElementById('admin-status-filter');
    const attendanceFilter = document.getElementById('admin-attendance-filter');
    const sortFilter = document.getElementById('admin-sort-filter');
    const resetBtn = document.getElementById('admin-filter-reset');

    const updateFiltersAndFetch = async () => {
      this.currentFilters = {
        search: searchInput ? searchInput.value.trim() : '',
        theme: themeFilter ? themeFilter.value : 'ALL',
        status: statusFilter ? statusFilter.value : 'ALL',
        attendance: attendanceFilter ? attendanceFilter.value : 'ALL',
        sort: sortFilter ? sortFilter.value : 'NEWEST'
      };
      if (searchClearBtn) {
        if (this.currentFilters.search) {
          searchClearBtn.classList.remove('hidden');
        } else {
          searchClearBtn.classList.add('hidden');
        }
      }
      await this.fetchDashboardData(true);
    };

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        if (searchClearBtn) {
          if (searchInput.value.trim()) searchClearBtn.classList.remove('hidden');
          else searchClearBtn.classList.add('hidden');
        }
        if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
        this.searchDebounceTimer = setTimeout(updateFiltersAndFetch, 300);
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', async () => {
        if (searchInput) searchInput.value = '';
        searchClearBtn.classList.add('hidden');
        await updateFiltersAndFetch();
      });
    }

    if (themeFilter) themeFilter.addEventListener('change', updateFiltersAndFetch);
    if (statusFilter) statusFilter.addEventListener('change', updateFiltersAndFetch);
    if (attendanceFilter) attendanceFilter.addEventListener('change', updateFiltersAndFetch);

    if (sortFilter) {
      sortFilter.addEventListener('change', () => {
        this.currentFilters.sort = sortFilter.value;
        this.renderTeamsTable(this.teams);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', async () => {
        soundFx.playClick();
        if (searchInput) searchInput.value = '';
        if (searchClearBtn) searchClearBtn.classList.add('hidden');
        if (themeFilter) themeFilter.value = 'ALL';
        if (statusFilter) statusFilter.value = 'ALL';
        if (attendanceFilter) attendanceFilter.value = 'ALL';
        if (sortFilter) sortFilter.value = 'NEWEST';
        this.currentFilters = { search: '', theme: 'ALL', status: 'ALL', attendance: 'ALL', sort: 'NEWEST' };
        await this.fetchDashboardData();
        toast.show('Filters reset to default.', 'info');
      });
    }

    // SQUAD MODAL CLOSE & ACTION HANDLERS
    const squadModal = document.getElementById('squad-modal');
    const closeSquadModal = () => squadModal?.classList.add('hidden');
    document.getElementById('close-squad-modal-btn')?.addEventListener('click', closeSquadModal);
    document.getElementById('squad-modal-close-bottom-btn')?.addEventListener('click', closeSquadModal);
    if (squadModal) {
      squadModal.addEventListener('click', (e) => {
        if (e.target === squadModal) closeSquadModal();
      });
    }

    document.getElementById('squad-modal-open-scanner-btn')?.addEventListener('click', () => {
      soundFx.playClick();
      closeSquadModal();
      if (this.squadModalTeam) {
        const drawer = document.getElementById('scanner-drawer-container');
        if (drawer) drawer.classList.remove('hidden');
        this.renderScannerResult(this.squadModalTeam);
      }
    });

    document.getElementById('squad-modal-invoice-btn')?.addEventListener('click', async () => {
      soundFx.playClick();
      if (!this.squadModalTeam) return;
      const team = this.squadModalTeam;
      toast.show(`Dispatching invoice & QR pass to Team ${team.team_name}...`, 'info');
      try {
        const res = await api.resendInvoiceEmail(team.reg_id);
        if (res.success) {
          toast.show(res.message || 'Invoice & QR pass email dispatched!', 'success');
        } else {
          toast.show(res.message || 'Failed to dispatch invoice email.', 'error');
        }
      } catch (err) {
        toast.show('Network error dispatching invoice email.', 'error');
      }
    });

    // PAYMENT MODAL CLOSE
    const closeModal = document.getElementById('close-modal-btn');
    const modal = document.getElementById('payment-modal');
    if (closeModal && modal) {
      closeModal.addEventListener('click', () => modal.classList.add('hidden'));
    }
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
      });
    }

    // TEST EMAIL MODAL HANDLERS
    const openTestEmail = () => {
      soundFx.playClick();
      document.getElementById('test-email-modal')?.classList.remove('hidden');
      document.getElementById('test-email-status-box')?.classList.add('hidden');
    };
    document.getElementById('admin-test-email-btn')?.addEventListener('click', openTestEmail);
    document.getElementById('mobile-test-email-btn')?.addEventListener('click', openTestEmail);

    const closeTestEmailBtn = document.getElementById('close-test-email-btn');
    const testEmailModal = document.getElementById('test-email-modal');
    if (closeTestEmailBtn && testEmailModal) {
      closeTestEmailBtn.addEventListener('click', () => testEmailModal.classList.add('hidden'));
      testEmailModal.addEventListener('click', (e) => {
        if (e.target === testEmailModal) testEmailModal.classList.add('hidden');
      });
    }

    const testEmailForm = document.getElementById('test-email-form');
    if (testEmailForm) {
      testEmailForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        soundFx.playClick();
        const input = document.getElementById('test-email-input');
        const submitBtn = document.getElementById('send-test-email-submit-btn');
        const statusBox = document.getElementById('test-email-status-box');
        const targetEmail = input ? input.value.trim() : '';
        if (!targetEmail) return;

        submitBtn.disabled = true;
        submitBtn.innerHTML = `DISPATCHING VIA BREVO API...`;
        if (statusBox) {
          statusBox.className = 'p-3 text-xs font-mono border border-accent bg-canvas text-accent-dark';
          statusBox.textContent = 'Connecting to Brevo REST API v3...';
          statusBox.classList.remove('hidden');
        }

        try {
          const res = await api.testEmail(targetEmail);
          if (res.success) {
            toast.show('Test email delivered!', 'success');
            if (statusBox) {
              statusBox.className = 'p-3 text-xs font-mono border border-success bg-paper text-success';
              statusBox.textContent = `✔ SUCCESS: ${res.message || 'Diagnostic email delivered.'}`;
            }
          } else {
            toast.show(res.message || 'Email delivery failed.', 'error');
            if (statusBox) {
              statusBox.className = 'p-3 text-xs font-mono border border-error bg-paper text-error';
              statusBox.textContent = `✕ ERROR: ${res.message || 'Delivery failed.'}`;
            }
          }
        } catch (err) {
          toast.show('Network error testing email.', 'error');
          if (statusBox) {
            statusBox.className = 'p-3 text-xs font-mono border border-error bg-paper text-error';
            statusBox.textContent = '✕ Network error dispatching test email.';
          }
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `⚡ DISPATCH TEST EMAIL`;
        }
      });
    }

    // AUDIT LOGS MODAL HANDLERS
    const logsModal = document.getElementById('admin-logs-modal');
    const loadLogs = async () => {
      const tbody = document.getElementById('admin-logs-tbody');
      const countEl = document.getElementById('logs-count-text');
      if (!tbody) return;
      tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-muted">Loading audit records...</td></tr>`;
      try {
        const res = await api.getAdminLogs();
        if (res.success && res.logs) {
          if (countEl) countEl.textContent = `${res.logs.length} logs recorded`;
          if (res.logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-muted">No administrative logs recorded yet.</td></tr>`;
            return;
          }
          tbody.innerHTML = res.logs.map(log => {
            const time = log.created_at ? new Date(log.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'N/A';
            return `
              <tr class="hover:bg-paper">
                <td class="p-3 text-muted whitespace-nowrap text-[10px]">${time}</td>
                <td class="p-3 font-bold text-ink">${log.admin_user || 'Admin'}</td>
                <td class="p-3"><span class="px-2 py-0.5 border border-line bg-canvas font-bold text-[10px]">${log.action}</span></td>
                <td class="p-3 text-accent-dark font-bold">${log.target_reg_id || '--'}</td>
                <td class="p-3 text-muted text-[11px]">${log.details || '--'}</td>
              </tr>
            `;
          }).join('');
        } else {
          tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-error">Failed to fetch logs.</td></tr>`;
        }
      } catch (e) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-error">Error loading logs.</td></tr>`;
      }
    };

    const openLogsModal = async () => {
      soundFx.playClick();
      logsModal?.classList.remove('hidden');
      await loadLogs();
    };
    document.getElementById('admin-logs-btn')?.addEventListener('click', openLogsModal);
    document.getElementById('mobile-logs-btn')?.addEventListener('click', openLogsModal);
    document.getElementById('close-logs-modal-btn')?.addEventListener('click', () => logsModal?.classList.add('hidden'));
    document.getElementById('refresh-logs-btn')?.addEventListener('click', loadLogs);
    if (logsModal) {
      logsModal.addEventListener('click', (e) => {
        if (e.target === logsModal) logsModal.classList.add('hidden');
      });
    }

    // ANNOUNCEMENT BROADCAST FORM
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

  async processScanCode(rawInput) {
    if (!rawInput) return;
    let clean = rawInput.trim();
    const match = clean.match(/GG26-[A-Z0-9]{4}/i);
    const searchTarget = match ? match[0] : clean;

    const team = this.teams.find(t => 
      t.reg_id.toUpperCase() === searchTarget.toUpperCase() ||
      (t.team_name || '').toLowerCase() === searchTarget.toLowerCase() ||
      (t.leader_phone || '').includes(searchTarget)
    );

    if (team) {
      this.renderScannerResult(team);
    } else {
      try {
        toast.show('Looking up squad in database...', 'info');
        const allRes = await api.getAdminTeams({ search: searchTarget });
        if (allRes.success && allRes.teams && allRes.teams.length) {
          this.renderScannerResult(allRes.teams[0]);
        } else {
          toast.show(`No registered team found matching "${searchTarget}".`, 'error');
        }
      } catch (err) {
        toast.show('Error querying database.', 'error');
      }
    }
  }

  renderScannerResult(team) {
    const box = document.getElementById('scanner-result-box');
    if (!box) return;

    this.scannedTeam = team;
    const isPaid = team.payment && team.payment.status === 'APPROVED';
    const isAttended = Boolean(team.attended);

    // Normalize members list
    const members = (team.members && team.members.length) ? team.members : [
      { id: 'leader', name: team.leader_name, email: team.leader_email, phone: team.leader_phone, role: 'Team Leader' }
    ];

    // Parse existing attendance map if any
    let existingAtt = {};
    if (team.member_attendance) {
      existingAtt = typeof team.member_attendance === 'string'
        ? JSON.parse(team.member_attendance)
        : team.member_attendance;
    }

    // Default each member's attendance: if already recorded in existingAtt use that; otherwise default to true for convenience
    const memberAttendanceState = {};
    members.forEach((m, idx) => {
      const key = String(m.id || m.email || m.name || `m_${idx}`);
      if (existingAtt && typeof existingAtt[key] === 'boolean') {
        memberAttendanceState[key] = existingAtt[key];
      } else if (existingAtt && typeof existingAtt[m.email] === 'boolean') {
        memberAttendanceState[key] = existingAtt[m.email];
      } else {
        // Default to checked (present) if fresh check-in, or true if already attended
        memberAttendanceState[key] = true;
      }
    });

    const getPresentCount = () => Object.values(memberAttendanceState).filter(Boolean).length;

    const renderMembersChecklist = () => {
      return members.map((m, i) => {
        const key = String(m.id || m.email || m.name || `m_${i}`);
        const isPresent = Boolean(memberAttendanceState[key]);
        const isLeader = i === 0 || (m.role && m.role.toLowerCase().includes('leader'));

        return `
          <label class="member-check-row flex items-center justify-between p-2.5 bg-paper hover:bg-line/20 border ${isPresent ? 'border-success/40 bg-success/[0.03]' : 'border-line/60 opacity-70'} transition-all cursor-pointer rounded-none select-none gap-3" data-key="${key}">
            <div class="flex items-center gap-3 min-w-0">
              <input type="checkbox" class="scanner-member-chk w-4 h-4 cursor-pointer accent-[#00ff88]" data-key="${key}" ${isPresent ? 'checked' : ''} />
              <div class="truncate">
                <div class="text-xs font-bold text-ink flex items-center gap-1.5 truncate">
                  <span>0${i + 1}. ${m.name}</span>
                  ${isLeader ? '<span class="text-[9px] px-1.5 py-0.2 bg-accent/20 text-accent-dark font-mono font-bold">LEADER</span>' : ''}
                </div>
                <div class="text-[10px] text-muted font-mono truncate">${m.email || 'No email'} ${m.phone ? `• ${m.phone}` : ''}</div>
              </div>
            </div>
            <div class="shrink-0">
              <span class="member-status-pill text-[10px] font-mono font-bold px-2 py-0.5 border ${isPresent ? 'border-success text-success bg-success/10' : 'border-line text-muted bg-paper'}">
                ${isPresent ? '✔ PRESENT' : '✕ ABSENT'}
              </span>
            </div>
          </label>
        `;
      }).join('');
    };

    box.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-line pb-3 gap-2">
        <div>
          <div class="text-xs text-muted">REGISTRATION ID: <strong class="text-accent-dark font-mono text-base">${team.reg_id}</strong></div>
          <h3 class="font-sans text-xl sm:text-2xl font-bold text-ink uppercase">${team.team_name}</h3>
          <div class="text-xs text-muted">${team.college} // Track: ${team.theme_id}</div>
        </div>

        <div class="sm:text-right font-mono space-y-1">
          <div class="inline-block px-3 py-1 border ${isPaid ? 'border-success text-success bg-paper font-bold' : 'border-accent text-accent-dark bg-paper font-bold'} text-xs uppercase">
            ${isPaid ? '✔ PAYMENT VERIFIED (FCFS CONFIRMED)' : '⏳ PAYMENT PENDING'}
          </div>
          <div id="scanner-team-status-pill" class="text-[11px] ${isAttended ? 'text-success font-bold' : 'text-error font-bold'}">
            ${isAttended ? `✔ ATTENDANCE RECORDED (${team.attended_at ? new Date(team.attended_at).toLocaleTimeString('en-IN') : 'Logged'})` : '❌ NOT CHECKED IN'}
          </div>
        </div>
      </div>

      <div class="space-y-2 font-mono text-xs">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="text-xs text-accent-dark font-bold uppercase flex items-center gap-2">
            <span>// ATTENDANCE CHECKLIST:</span>
            <span id="scanner-present-counter" class="px-2 py-0.5 bg-paper border border-line text-[11px] text-ink font-bold font-mono">
              ${getPresentCount()} / ${members.length} PRESENT
            </span>
          </div>
          <div class="flex items-center gap-1.5">
            <button type="button" id="scanner-check-all-btn" class="text-[10px] px-2 py-1 border border-line bg-paper text-ink hover:text-success hover:border-success transition-all cursor-pointer font-mono font-bold uppercase">
              ✔ ALL PRESENT
            </button>
            <button type="button" id="scanner-clear-all-btn" class="text-[10px] px-2 py-1 border border-line bg-paper text-ink hover:text-error hover:border-error transition-all cursor-pointer font-mono font-bold uppercase">
              ✕ CLEAR ALL
            </button>
          </div>
        </div>

        <div id="scanner-members-list" class="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          ${renderMembersChecklist()}
        </div>
      </div>

      <div class="pt-2 flex flex-col sm:flex-row gap-2">
        <button id="scanner-mark-attendance-btn" class="btn-primary w-full py-4 text-xs font-bold tracking-wider uppercase cursor-pointer shadow-md bg-success hover:bg-success/90 text-canvas border border-success transition-all">
          ✔ ${isAttended ? 'UPDATE ATTENDANCE' : 'CONFIRM ATTENDANCE & GRANT VENUE ENTRY'} (<span id="scanner-btn-count">${getPresentCount()}/${members.length}</span> PRESENT)
        </button>
        <button id="scanner-resend-pass-btn" class="btn-secondary py-3 px-4 text-xs font-bold uppercase font-mono border border-line hover:border-accent text-ink hover:text-accent-dark transition-all cursor-pointer whitespace-nowrap">
          ✉ RESEND INVOICE / PASS
        </button>
      </div>
    `;

    box.classList.remove('hidden');
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Update UI helper
    const updateChecklistUI = () => {
      const listEl = document.getElementById('scanner-members-list');
      if (listEl) {
        listEl.innerHTML = renderMembersChecklist();
        bindChecklistEvents();
      }
      const count = getPresentCount();
      const counterEl = document.getElementById('scanner-present-counter');
      if (counterEl) counterEl.textContent = `${count} / ${members.length} PRESENT`;
      const btnCountEl = document.getElementById('scanner-btn-count');
      if (btnCountEl) btnCountEl.textContent = `${count}/${members.length}`;
    };

    const bindChecklistEvents = () => {
      box.querySelectorAll('.scanner-member-chk').forEach(chk => {
        chk.addEventListener('change', (e) => {
          const key = e.target.getAttribute('data-key');
          memberAttendanceState[key] = e.target.checked;
          updateChecklistUI();
        });
      });
    };

    bindChecklistEvents();

    document.getElementById('scanner-check-all-btn')?.addEventListener('click', () => {
      Object.keys(memberAttendanceState).forEach(k => { memberAttendanceState[k] = true; });
      updateChecklistUI();
    });

    document.getElementById('scanner-clear-all-btn')?.addEventListener('click', () => {
      Object.keys(memberAttendanceState).forEach(k => { memberAttendanceState[k] = false; });
      updateChecklistUI();
    });

    document.getElementById('scanner-mark-attendance-btn')?.addEventListener('click', async () => {
      const presentCount = getPresentCount();
      if (presentCount === 0) {
        const confirmEmpty = window.confirm('No members are marked present. Do you still want to proceed?');
        if (!confirmEmpty) return;
      }

      try {
        toast.show('Submitting attendance...', 'info');
        const res = await api.markAttendance(team.reg_id, memberAttendanceState);
        if (res.success) {
          soundFx.playBeep();
          toast.show(`✔ ENTRY GRANTED! ${presentCount}/${members.length} members checked in for ${team.team_name}`, 'success');
          await this.fetchDashboardData(true);
          this.renderScannerResult({
            ...team,
            attended: true,
            attended_at: new Date().toISOString(),
            member_attendance: memberAttendanceState
          });
        } else {
          toast.show(res.message || 'Failed to mark attendance.', 'error');
        }
      } catch (err) {
        toast.show('Network error marking attendance.', 'error');
      }
    });

    document.getElementById('scanner-resend-pass-btn')?.addEventListener('click', async () => {
      soundFx.playClick();
      toast.show(`Sending Attendance Pass email to Team ${team.team_name}...`, 'info');
      try {
        const res = await api.resendInvoiceEmail(team.reg_id);
        if (res.success) {
          toast.show('Attendance Pass email sent successfully!', 'success');
        } else {
          toast.show(res.message || 'Failed to send pass email.', 'error');
        }
      } catch (err) {
        toast.show('Network error sending pass email.', 'error');
      }
    });
  }

  async fetchDashboardData(silent = false) {
    try {
      const searchInput = document.getElementById('admin-search-input');
      const themeFilter = document.getElementById('admin-theme-filter');
      const statusFilter = document.getElementById('admin-status-filter');
      const attendanceFilter = document.getElementById('admin-attendance-filter');

      const filters = {};
      if (searchInput && searchInput.value) filters.search = searchInput.value.trim();
      if (themeFilter && themeFilter.value !== 'ALL') filters.theme = themeFilter.value;
      if (statusFilter && statusFilter.value !== 'ALL') filters.status = statusFilter.value;
      if (attendanceFilter && attendanceFilter.value !== 'ALL') filters.attendance = attendanceFilter.value;

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
        const remainingEl = document.getElementById('stat-remaining');
        const shortlistEl = document.getElementById('stat-confirmed') || document.getElementById('stat-shortlist');
        const attendedEl = document.getElementById('stat-attended');
        const attendeesHeadcountEl = document.getElementById('stat-attendees-headcount');

        const confirmedCount = statsRes.stats.confirmedSlots ?? statsRes.stats.approvedPayments ?? 0;

        if (totalEl) totalEl.textContent = statsRes.stats.totalRegistrations;
        if (pendingEl) pendingEl.textContent = statsRes.stats.pendingPayments;
        if (approvedEl) approvedEl.textContent = statsRes.stats.approvedPayments;
        if (remainingEl) remainingEl.textContent = Math.max(0, 40 - confirmedCount);
        if (shortlistEl) shortlistEl.textContent = confirmedCount;
        if (attendedEl) attendedEl.textContent = statsRes.stats.attendedCount || 0;
        if (attendeesHeadcountEl) {
          const presentCount = statsRes.stats.attendedMembersCount || 0;
          const totalCount = statsRes.stats.totalParticipants || (statsRes.stats.totalRegistrations * 3);
          attendeesHeadcountEl.textContent = `${presentCount} / ${totalCount}`;
        }
      }

      if (teamsRes.success) {
        this.teams = teamsRes.teams || [];
        this.renderTeamsTable(this.teams);
        this.renderQuickTeamChips(this.teams);
      }
    } catch (err) {
      if (!silent) toast.show('Error loading dashboard statistics.', 'error');
    }
  }

  renderQuickTeamChips(teams = []) {
    const container = document.getElementById('quick-teams-chips');
    if (!container) return;

    if (!teams || teams.length === 0) {
      container.innerHTML = `<span class="text-[11px] text-muted font-mono">No teams registered yet.</span>`;
      return;
    }

    container.innerHTML = teams.slice(0, 8).map(t => `
      <button type="button" data-quick-reg="${t.reg_id}" class="px-2.5 py-1 text-[11px] font-mono border border-line hover:border-accent bg-paper hover:bg-accent/15 text-ink hover:text-accent-dark font-bold rounded-xs transition-all cursor-pointer truncate max-w-xs">
        ⚡ ${t.team_name} (${t.reg_id})
      </button>
    `).join('');

    container.querySelectorAll('button[data-quick-reg]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFx.playClick();
        const regId = btn.getAttribute('data-quick-reg');
        const team = this.teams.find(t => t.reg_id === regId);
        if (team) {
          const input = document.getElementById('reg-id-lookup-input');
          if (input) input.value = team.reg_id;
          this.renderScannerResult(team);
        }
      });
    });
  }

  renderTeamsTable(teams) {
    const tbody = document.getElementById('admin-teams-tbody');
    const mobileContainer = document.getElementById('admin-teams-mobile-container');
    const countBadge = document.getElementById('admin-filtered-count-badge');

    if (!teams || teams.length === 0) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-muted">No teams found matching current query.</td></tr>`;
      if (mobileContainer) mobileContainer.innerHTML = `<div class="tech-card p-6 border-line bg-paper text-center text-xs text-muted">No teams found matching current query.</div>`;
      if (countBadge) countBadge.textContent = 'SHOWING 0 SQUADS';
      return;
    }

    // Client-side Sorting
    const sortedTeams = [...teams];
    const sortMode = this.currentFilters.sort || 'NEWEST';
    if (sortMode === 'OLDEST') {
      sortedTeams.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    } else if (sortMode === 'NAME_ASC') {
      sortedTeams.sort((a, b) => (a.team_name || '').localeCompare(b.team_name || ''));
    } else if (sortMode === 'NAME_DESC') {
      sortedTeams.sort((a, b) => (b.team_name || '').localeCompare(a.team_name || ''));
    } else if (sortMode === 'MEMBERS_DESC') {
      sortedTeams.sort((a, b) => (b.member_count || 1) - (a.member_count || 1));
    } else {
      // Default: NEWEST
      sortedTeams.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    if (countBadge) countBadge.textContent = `SHOWING ${sortedTeams.length} SQUADS`;

    // 1. RENDER DESKTOP TABLE
    if (tbody) {
      tbody.innerHTML = sortedTeams.map(team => {
        const pay = team.payment;
        const payBadge = pay ? (
          pay.status === 'APPROVED' ? '<span class="text-success font-bold">APPROVED</span>' :
          pay.status === 'REJECTED' ? '<span class="text-error font-bold">REJECTED</span>' :
          '<span class="text-accent-dark font-bold">PENDING VERIFICATION</span>'
        ) : '<span class="text-muted">NO PROOF</span>';

        let memberAtt = null;
        try {
          if (team.member_attendance) {
            memberAtt = typeof team.member_attendance === 'string' ? JSON.parse(team.member_attendance) : team.member_attendance;
          }
        } catch (e) {}
        const presentCount = memberAtt ? Object.values(memberAtt).filter(Boolean).length : (team.attended ? (team.member_count || 1) : 0);
        const attendanceBadge = team.attended ? `<span class="text-success font-bold text-[10px] ml-1 bg-success/10 px-1.5 py-0.5 border border-success/30 font-mono">[ATTENDED: ${presentCount}/${team.member_count || 1}]</span>` : '';

        return `
          <tr class="hover:bg-canvas transition-colors">
            <td class="p-4">
              <div class="font-bold text-ink font-sans text-sm flex items-center flex-wrap gap-1">${team.team_name} ${attendanceBadge}</div>
              <div class="text-accent-dark text-[11px] font-mono flex items-center gap-1.5 mt-0.5">
                <span class="font-bold cursor-pointer hover:underline" data-copy="${team.reg_id}" title="Click to copy Registration ID">${team.reg_id}</span>
                <span class="text-muted text-[10px]">// Leader: ${team.leader_name}</span>
              </div>
              <div class="text-muted text-[10px] font-sans">${team.college} (${team.member_count || 1} Members)</div>
            </td>

            <td class="p-4 text-ink font-mono">${team.theme_id || 'TBD'}</td>

            <td class="p-4 font-mono">
              <div>${payBadge}</div>
              ${pay ? `<div class="text-[10px] text-muted">UTR: <span class="text-ink font-bold select-all cursor-pointer hover:underline" data-copy="${pay.utr_number}" title="Click to copy UTR">${pay.utr_number}</span></div>` : ''}
              ${pay && pay.payer_name ? `<div class="text-[10px] text-muted">Payer: ${pay.payer_name}</div>` : ''}
            </td>

            <td class="p-4 font-mono text-[11px]">
              ${pay ? `
                <div class="space-y-1">
                  <button type="button" data-action="view-proof" data-reg="${team.reg_id}" class="px-2.5 py-1 border border-accent text-accent-dark hover:bg-accent hover:text-ink text-[10px] font-bold cursor-pointer uppercase flex items-center gap-1 transition-all">
                    <span>VIEW PROOF</span>
                    <span class="text-xs">↗</span>
                  </button>
                  <div class="text-[10px] text-muted">₹${pay.amount || (team.member_count * 250)} • ${pay.payment_date || 'Today'}</div>
                </div>
              ` : '<span class="text-muted">NO PROOF</span>'}
            </td>

            <td class="p-4 font-mono text-[11px]">
              <span class="px-2 py-1 border ${
                team.status === 'PAYMENT_APPROVED' ? 'border-success text-success font-bold' :
                team.status === 'PAYMENT_PENDING' ? 'border-accent text-accent-dark font-bold' :
                team.status === 'REJECTED' ? 'border-error text-error font-bold' : 'border-line text-ink'
              }">
                ${team.status === 'PAYMENT_APPROVED' ? 'SLOT CONFIRMED' : team.status}
              </span>
            </td>

            <td class="p-4 text-right space-x-1 font-mono whitespace-nowrap">
              <button data-action="view-squad" data-reg="${team.reg_id}" class="px-2 py-1 border border-line text-ink hover:border-accent hover:text-accent-dark text-[10px] cursor-pointer font-bold transition-all" title="View squad members roster">
                👥 SQUAD
              </button>

              ${pay ? `
                <button data-action="verify-pay" data-reg="${team.reg_id}" class="px-2 py-1 border border-accent text-accent-dark hover:bg-accent hover:text-ink text-[10px] cursor-pointer font-bold transition-all">
                  ${pay.status === 'APPROVED' ? 'PROOF' : 'VERIFY'}
                </button>
              ` : ''}

              <button data-action="toggle-slot" data-reg="${team.reg_id}" data-current="${team.status}" class="px-2 py-1 border ${team.status === 'PAYMENT_APPROVED' ? 'border-line text-muted' : 'border-accent text-accent-dark font-bold'} hover:bg-paper text-[10px] cursor-pointer transition-all">
                ${team.status === 'PAYMENT_APPROVED' ? 'REVOKE' : 'CONFIRM'}
              </button>

              <button data-action="quick-scan" data-reg="${team.reg_id}" class="px-2 py-1 border border-success text-success hover:bg-success hover:text-canvas text-[10px] cursor-pointer transition-all">
                ENTRY
              </button>

              <button data-action="resend-invoice" data-reg="${team.reg_id}" title="Resend Payment Invoice &amp; Attendance QR Email" class="px-2 py-1 border border-line text-ink hover:border-accent hover:text-accent-dark text-[10px] cursor-pointer transition-all">
                ✉ PASS
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    // 2. RENDER MOBILE CARDS (Touch-friendly native layout for phones)
    if (mobileContainer) {
      mobileContainer.innerHTML = sortedTeams.map(team => {
        const pay = team.payment;
        const isPaid = pay && pay.status === 'APPROVED';
        const isAttended = Boolean(team.attended);
        let memberAtt = null;
        try {
          if (team.member_attendance) {
            memberAtt = typeof team.member_attendance === 'string' ? JSON.parse(team.member_attendance) : team.member_attendance;
          }
        } catch (e) {}
        const presentCount = memberAtt ? Object.values(memberAtt).filter(Boolean).length : (team.attended ? (team.member_count || 1) : 0);

        return `
          <div class="tech-card p-4 border border-line bg-paper space-y-3 shadow-xs">
            <div class="flex items-start justify-between gap-2 border-b border-line/50 pb-2">
              <div>
                <div class="text-[11px] text-accent-dark font-bold font-mono tracking-wider cursor-pointer hover:underline" data-copy="${team.reg_id}" title="Click to copy Reg ID">
                  ${team.reg_id} 📋
                </div>
                <h3 class="font-sans text-base font-extrabold text-ink uppercase tracking-tight">${team.team_name}</h3>
                <div class="text-[10px] text-muted font-sans">${team.college} • ${team.member_count || 1} Members</div>
              </div>

              <div>
                <span class="px-2 py-0.5 border text-[10px] font-mono font-bold uppercase ${
                  isAttended ? 'border-success text-success bg-canvas' : 'border-line text-muted'
                }">
                  ${isAttended ? `✔ ATTENDED (${presentCount}/${team.member_count || 1})` : 'NOT CHECKED IN'}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 text-[11px] font-mono bg-canvas p-2.5 border border-line">
              <div>
                <div class="text-[9px] text-muted uppercase font-bold">SLOT STATUS:</div>
                <span class="font-bold ${team.status === 'PAYMENT_APPROVED' ? 'text-success' : 'text-accent-dark'}">
                  ${team.status === 'PAYMENT_APPROVED' ? 'SLOT CONFIRMED' : team.status}
                </span>
              </div>
              <div>
                <div class="text-[9px] text-muted uppercase font-bold">PAYMENT:</div>
                <span class="font-bold ${isPaid ? 'text-success' : pay ? 'text-accent-dark' : 'text-muted'}">
                  ${pay ? (pay.status === 'APPROVED' ? `✔ PAID (₹${pay.amount})` : `⏳ PENDING`) : 'NO PROOF'}
                </span>
              </div>
            </div>

            ${pay ? `
              <div class="text-[10px] text-muted font-mono truncate">
                UTR: <span class="text-ink font-bold select-all cursor-pointer hover:underline" data-copy="${pay.utr_number}">${pay.utr_number}</span> (${pay.payer_name || 'Payer'})
              </div>
            ` : ''}

            <!-- Mobile Action Buttons Grid (5 touch-friendly buttons) -->
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-mono text-[11px]">
              <button data-action="view-squad" data-reg="${team.reg_id}" class="py-2.5 px-2 border border-line text-ink hover:border-accent hover:text-accent-dark font-bold text-center cursor-pointer">
                👥 SQUAD
              </button>

              ${pay ? `
                <button data-action="verify-pay" data-reg="${team.reg_id}" class="py-2.5 px-2 border border-accent text-accent-dark font-bold text-center cursor-pointer hover:bg-accent hover:text-ink">
                  ${pay.status === 'APPROVED' ? 'PROOF ↗' : 'VERIFY PAY'}
                </button>
              ` : `
                <button disabled class="py-2.5 px-2 border border-line text-muted font-bold text-center opacity-50">
                  NO PROOF
                </button>
              `}

              <button data-action="toggle-slot" data-reg="${team.reg_id}" data-current="${team.status}" class="py-2.5 px-2 border ${team.status === 'PAYMENT_APPROVED' ? 'border-line text-muted' : 'border-accent text-accent-dark font-bold'} text-center cursor-pointer">
                ${team.status === 'PAYMENT_APPROVED' ? 'REVOKE' : 'CONFIRM'}
              </button>

              <button data-action="quick-scan" data-reg="${team.reg_id}" class="py-2.5 px-2 border border-success text-success font-bold text-center cursor-pointer hover:bg-success hover:text-canvas">
                🎫 CHECK IN
              </button>

              <button data-action="resend-invoice" data-reg="${team.reg_id}" class="col-span-2 sm:col-span-1 py-2.5 px-2 border border-line text-ink hover:text-accent-dark font-bold text-center cursor-pointer">
                ✉ INVOICE
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    // ATTACH ACTION LISTENERS (Covers both Desktop Table AND Mobile Cards)
    document.querySelectorAll('button[data-action="view-squad"]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFx.playClick();
        const regId = btn.getAttribute('data-reg');
        const team = this.teams.find(t => t.reg_id === regId);
        if (team) {
          this.openSquadModal(team);
        }
      });
    });

    document.querySelectorAll('[data-copy]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const val = el.getAttribute('data-copy');
        copyToClipboard(val, 'Copied');
      });
    });

    document.querySelectorAll('button[data-action="view-proof"], button[data-action="verify-pay"]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFx.playClick();
        const regId = btn.getAttribute('data-reg');
        const team = this.teams.find(t => t.reg_id === regId);
        if (team && team.payment) {
          this.openPaymentModal(team);
        }
      });
    });

    document.querySelectorAll('button[data-action="quick-scan"]').forEach(btn => {
      btn.addEventListener('click', () => {
        soundFx.playClick();
        const regId = btn.getAttribute('data-reg');
        const team = this.teams.find(t => t.reg_id === regId);
        if (team) {
          const drawer = document.getElementById('scanner-drawer-container');
          if (drawer) drawer.classList.remove('hidden');
          this.renderScannerResult(team);
        }
      });
    });

    document.querySelectorAll('button[data-action="toggle-slot"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        soundFx.playClick();
        const regId = btn.getAttribute('data-reg');
        const current = btn.getAttribute('data-current');
        const nextStatus = current === 'PAYMENT_APPROVED' ? 'REGISTERED' : 'PAYMENT_APPROVED';

        try {
          const res = await api.updateTeamStatus(regId, nextStatus);
          if (res.success) {
            toast.show(`Slot status updated to ${nextStatus === 'PAYMENT_APPROVED' ? 'SLOT CONFIRMED' : 'REGISTERED'}`, 'success');
            await this.fetchDashboardData();
          }
        } catch (err) {
          toast.show('Failed to update status.', 'error');
        }
      });
    });

    document.querySelectorAll('button[data-action="resend-invoice"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        soundFx.playClick();
        const regId = btn.getAttribute('data-reg');
        const team = this.teams.find(t => t.reg_id === regId);
        if (!team) return;

        toast.show(`Dispatching invoice & QR pass to Team ${team.team_name}...`, 'info');
        try {
          const res = await api.resendInvoiceEmail(regId);
          if (res.success) {
            toast.show(res.message || 'Invoice & QR pass email dispatched!', 'success');
          } else {
            toast.show(res.message || 'Failed to dispatch invoice email.', 'error');
          }
        } catch (err) {
          toast.show('Network error dispatching invoice email.', 'error');
        }
      });
    });
  }

  openSquadModal(team) {
    this.squadModalTeam = team;
    const modal = document.getElementById('squad-modal');
    if (!modal) return;

    document.getElementById('squad-modal-team-name').textContent = team.team_name;
    document.getElementById('squad-modal-reg-id').textContent = team.reg_id;
    document.getElementById('squad-modal-theme').textContent = team.theme_id || 'TBD';
    document.getElementById('squad-modal-college').textContent = team.college || 'N/A';

    const attStatusEl = document.getElementById('squad-modal-attendance-status');
    if (attStatusEl) {
      attStatusEl.textContent = team.attended ? '✔ ATTENDED' : '❌ NOT CHECKED IN';
      attStatusEl.className = team.attended ? 'text-xs font-bold font-mono text-success' : 'text-xs font-bold font-mono text-error';
    }

    const members = (team.members && team.members.length) ? team.members : [
      { id: 'leader', name: team.leader_name, email: team.leader_email, phone: team.leader_phone, role: 'Team Leader' }
    ];

    let existingAtt = {};
    if (team.member_attendance) {
      existingAtt = typeof team.member_attendance === 'string' ? JSON.parse(team.member_attendance) : team.member_attendance;
    }

    const presentMembersCount = members.filter((m, i) => {
      const key = String(m.id || m.email || m.name || `m_${i}`);
      if (existingAtt && typeof existingAtt[key] === 'boolean') return existingAtt[key];
      if (existingAtt && typeof existingAtt[m.email] === 'boolean') return existingAtt[m.email];
      return Boolean(team.attended);
    }).length;

    document.getElementById('squad-modal-member-count').textContent = members.length;
    document.getElementById('squad-modal-present-count').textContent = `${presentMembersCount} / ${members.length} Present`;

    const membersListEl = document.getElementById('squad-modal-members-list');
    if (membersListEl) {
      membersListEl.innerHTML = members.map((m, i) => {
        const key = String(m.id || m.email || m.name || `m_${i}`);
        let isPresent = false;
        if (existingAtt && typeof existingAtt[key] === 'boolean') isPresent = existingAtt[key];
        else if (existingAtt && typeof existingAtt[m.email] === 'boolean') isPresent = existingAtt[m.email];
        else if (team.attended) isPresent = true;

        const isLeader = i === 0 || (m.role && m.role.toLowerCase().includes('leader'));

        return `
          <div class="p-3 bg-canvas border ${isPresent ? 'border-success/40 bg-success/[0.02]' : 'border-line'} flex items-start justify-between gap-3 text-xs font-mono">
            <div class="space-y-1 min-w-0">
              <div class="font-bold text-ink flex items-center gap-1.5 truncate">
                <span>0${i + 1}. ${m.name}</span>
                ${isLeader ? '<span class="text-[9px] px-1.5 py-0.2 bg-accent/20 text-accent-dark font-bold">LEADER</span>' : ''}
              </div>
              <div class="text-[11px] text-muted flex flex-wrap items-center gap-2">
                ${m.email ? `
                  <a href="mailto:${m.email}" class="text-accent-dark hover:underline truncate">✉ ${m.email}</a>
                  <button type="button" data-copy="${m.email}" class="text-[10px] text-muted hover:text-ink cursor-pointer">📋</button>
                ` : ''}
                ${m.phone ? `
                  <a href="tel:${m.phone}" class="text-accent-dark hover:underline">📞 ${m.phone}</a>
                  <button type="button" data-copy="${m.phone}" class="text-[10px] text-muted hover:text-ink cursor-pointer">📋</button>
                ` : ''}
              </div>
            </div>
            <div class="shrink-0">
              <span class="text-[10px] font-bold px-2 py-0.5 border ${isPresent ? 'border-success text-success bg-success/10' : 'border-line text-muted bg-paper'}">
                ${isPresent ? '✔ PRESENT' : '✕ ABSENT'}
              </span>
            </div>
          </div>
        `;
      }).join('');

      membersListEl.querySelectorAll('[data-copy]').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = el.getAttribute('data-copy');
          copyToClipboard(val, 'Contact info');
        });
      });
    }

    modal.classList.remove('hidden');
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

  openPaymentModal(team) {
    this.selectedTeam = team;
    const modal = document.getElementById('payment-modal');
    if (!modal || !team.payment) return;

    document.getElementById('modal-team-title').textContent = `VERIFY PAYMENT: ${team.team_name}`;
    document.getElementById('modal-reg-id').textContent = team.reg_id;
    document.getElementById('modal-utr').textContent = team.payment.utr_number || 'N/A';
    document.getElementById('modal-payer').textContent = team.payment.payer_name || 'N/A';
    document.getElementById('modal-amount').textContent = `₹${team.payment.amount || ((team.member_count || 1) * 250)}`;

    let screenshotUrl = team.payment.screenshot_url || '';
    if (team.payment.file_data && team.payment.file_data.startsWith('data:')) {
      const blobUrl = this.createBlobUrlFromData(team.payment.file_data);
      if (blobUrl) screenshotUrl = blobUrl;
    } else if (screenshotUrl && !screenshotUrl.startsWith('http') && !screenshotUrl.startsWith('data:')) {
      screenshotUrl = window.location.origin + (screenshotUrl.startsWith('/') ? '' : '/') + screenshotUrl;
    }

    const imgEl = document.getElementById('modal-screenshot-img');
    if (imgEl) imgEl.src = screenshotUrl;

    const viewOriginalBtn = document.getElementById('modal-view-original-btn');
    if (viewOriginalBtn) viewOriginalBtn.href = screenshotUrl;

    const downloadProofBtn = document.getElementById('modal-download-proof-btn');
    if (downloadProofBtn) {
      downloadProofBtn.onclick = (e) => {
        e.preventDefault();
        soundFx.playClick();
        triggerFileDownload(screenshotUrl, `${team.reg_id}_payment_proof`);
      };
    }

    modal.classList.remove('hidden');

    const approveBtn = document.getElementById('modal-approve-btn');
    if (approveBtn) {
      approveBtn.onclick = async () => {
        soundFx.playClick();
        try {
          const res = await api.approvePayment(team.reg_id, team.payment.id);
          if (res.success) {
            toast.show('Payment approved! Official attendance pass & invoice dispatched.', 'success');
            modal.classList.add('hidden');
            await this.fetchDashboardData();
          } else {
            toast.show(res.message || 'Payment approval failed.', 'error');
          }
        } catch (err) {
          toast.show('Error approving payment.', 'error');
        }
      };
    }

    const rejectBtn = document.getElementById('modal-reject-btn');
    if (rejectBtn) {
      rejectBtn.onclick = async () => {
        soundFx.playClick();
        const reason = prompt("Enter mandatory reason for rejecting this payment proof (visible to team on status tracker):", "Invalid UTR / Payment transfer not verified in bank account");
        if (!reason || !reason.trim()) return;

        try {
          const res = await api.rejectPayment(team.reg_id, team.payment.id, reason.trim());
          if (res.success) {
            toast.show('Payment rejected and reason logged.', 'info');
            modal.classList.add('hidden');
            await this.fetchDashboardData();
          } else {
            toast.show(res.message || 'Payment rejection failed.', 'error');
          }
        } catch (err) {
          toast.show('Error rejecting payment.', 'error');
        }
      };
    }

    const resendInvoiceBtn = document.getElementById('modal-resend-invoice-btn');
    if (resendInvoiceBtn) {
      resendInvoiceBtn.onclick = async () => {
        soundFx.playClick();
        toast.show(`Dispatching payment invoice & QR pass email to Team ${team.team_name}...`, 'info');
        try {
          const res = await api.resendInvoiceEmail(team.reg_id);
          if (res.success) {
            toast.show(res.message || 'Invoice & QR pass email dispatched!', 'success');
          } else {
            toast.show(res.message || 'Failed to dispatch invoice email.', 'error');
          }
        } catch (err) {
          toast.show('Network error dispatching invoice email.', 'error');
        }
      };
    }

    const resendRegBtn = document.getElementById('modal-resend-reg-btn');
    if (resendRegBtn) {
      resendRegBtn.onclick = async () => {
        soundFx.playClick();
        toast.show(`Dispatching registration confirmation email to Team ${team.team_name}...`, 'info');
        try {
          const res = await api.resendRegistrationEmail(team.reg_id);
          if (res.success) {
            toast.show(res.message || 'Registration confirmation email dispatched!', 'success');
          } else {
            toast.show(res.message || 'Failed to dispatch registration email.', 'error');
          }
        } catch (err) {
          toast.show('Network error dispatching registration email.', 'error');
        }
      };
    }
  }
}
