/**
 * GAMBIT'S GLITCH - Admin Login View
 */

import { api } from '../utils/api.js';
import { toast } from '../utils/toast.js';
import { soundFx } from '../utils/audio.js';

export class LoginPage {
  constructor(navigate) {
    this.navigate = navigate;
  }

  render() {
    return `
      <div class="py-20 font-mono bg-canvas flex items-center justify-center min-h-[75vh]">
        <div class="container mx-auto px-4 max-w-md">
          
          <div class="tech-card p-8 border-line bg-paper space-y-6">
            <div class="flex items-center gap-3 border-b border-line pb-4">
              <div class="w-8 h-8 bg-ink text-canvas font-bold flex items-center justify-center text-lg font-sans">A</div>
              <div>
                <h1 class="font-sans text-xl font-bold text-ink uppercase tracking-tight">ADMIN AUTHENTICATION</h1>
                <div class="text-[10px] text-muted">GAMBIT CONTROL PANEL LOGIN</div>
              </div>
            </div>

            <form id="admin-login-form" class="space-y-4">
              <div>
                <label class="block text-xs text-ink mb-2">ADMIN EMAIL *</label>
                <input type="email" name="email" required value="gambitsglitch@gmail.com" class="w-full px-4 py-3 text-xs text-ink focus:border-accent outline-none" />
              </div>

              <div>
                <label class="block text-xs text-ink mb-2">MASTER PASSWORD *</label>
                <input type="password" name="password" required value="admin#glitch2026" class="w-full px-4 py-3 text-xs text-ink focus:border-accent outline-none" />
              </div>

              <div class="text-[10px] text-muted p-3 bg-canvas border border-line">
                Default Credentials: <code class="text-accent-dark font-bold">gambitsglitch@gmail.com</code> / <code class="text-accent-dark font-bold">admin#glitch2026</code>
              </div>

              <button type="submit" id="login-btn" class="nav-link btn-primary w-full py-4 text-xs font-bold tracking-widest uppercase">
                ⚡ AUTHENTICATE & ACCESS DASHBOARD →
              </button>
            </form>
          </div>

        </div>
      </div>
    `;
  }

  attachEvents() {
    const form = document.getElementById('admin-login-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        soundFx.playClick();

        const btn = document.getElementById('login-btn');
        btn.disabled = true;
        btn.innerHTML = `AUTHENTICATING...`;

        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
          const res = await api.adminLogin(email, password);
          if (res.success) {
            soundFx.playGlitch();
            toast.show('Admin authentication granted.', 'success');
            this.navigate('admin');
          } else {
            toast.show(res.message || 'Authentication failed.', 'error');
            btn.disabled = false;
            btn.innerHTML = `⚡ AUTHENTICATE & ACCESS DASHBOARD →`;
          }
        } catch (err) {
          toast.show('Network error during admin login.', 'error');
          btn.disabled = false;
          btn.innerHTML = `⚡ AUTHENTICATE & ACCESS DASHBOARD →`;
        }
      });
    }
  }
}
