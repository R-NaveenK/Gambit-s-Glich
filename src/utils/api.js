/**
 * GAMBIT'S GLITCH - API Fetch Helper
 */

const BASE_URL = '/api';

export const api = {
  getToken() {
    return localStorage.getItem('gg_admin_token');
  },

  setToken(token) {
    localStorage.setItem('gg_admin_token', token);
  },

  clearToken() {
    localStorage.removeItem('gg_admin_token');
  },

  async registerTeam(teamData) {
    const isFormData = typeof FormData !== 'undefined' && teamData instanceof FormData;
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: isFormData ? {} : { 'Content-Type': 'application/json' },
      body: isFormData ? teamData : JSON.stringify(teamData)
    });
    return res.json();
  },

  async submitPayment(formData) {
    const res = await fetch(`${BASE_URL}/payment/submit`, {
      method: 'POST',
      body: formData // FormData automatically sets multipart/form-data boundary
    });
    return res.json();
  },

  async submitPpt(formData) {
    const res = await fetch(`${BASE_URL}/ppt/upload`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async checkStatus(regId, email) {
    const res = await fetch(`${BASE_URL}/status/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reg_id: regId, email })
    });
    return res.json();
  },

  // Admin APIs
  async adminLogin(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success && data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async getAdminStats() {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async getAdminTeams(params = {}) {
    const token = this.getToken();
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/admin/teams?${query}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async approvePayment(regId, paymentId) {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/admin/payment/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reg_id: regId, payment_id: paymentId })
    });
    return res.json();
  },

  async rejectPayment(regId, paymentId, reason) {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/admin/payment/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reg_id: regId, payment_id: paymentId, reason })
    });
    return res.json();
  },

  async updateTeamStatus(regId, newStatus) {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/admin/team/update-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reg_id: regId, new_status: newStatus })
    });
    return res.json();
  },

  async getAdminLogs() {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/admin/logs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
  },

  async createAnnouncement(title, content, priority) {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/admin/announcements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, content, priority })
    });
    return res.json();
  },

  async markAttendance(regId) {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/admin/team/mark-attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reg_id: regId })
    });
    return res.json();
  },

  getExportCsvUrl() {
    return `${BASE_URL}/admin/export-csv`;
  },

  async testEmail(targetEmail) {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/admin/email/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email: targetEmail })
    });
    return res.json();
  },

  async clearAllData() {
    const token = this.getToken();
    const res = await fetch(`${BASE_URL}/admin/clear-all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return res.json();
  }
};
