/**
 * GAMBIT'S GLITCH - Unified Database Adapter
 * 
 * Automatically detects whether Supabase environment variables are available.
 * - If available, routes database operations to Supabase PostgreSQL.
 * - If absent, provides an in-memory & JSON file persistent store for zero-config local testing.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data_store.json');

// Initial seed structure for local database fallback
const initialData = {
  teams: [],
  team_members: [],
  payments: [],
  ppt_submissions: [],
  announcements: [],
  admin_logs: [
    {
      id: "log-1",
      admin_user: "system_admin",
      action: "PAYMENT_APPROVED",
      target_reg_id: "GG26-78A1",
      details: "Payment verified for UTR 202698765432",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ]
};

// Ensure JSON file store exists
function loadLocalStore() {
  try {
    let data;
    if (!fs.existsSync(DATA_FILE)) {
      data = initialData;
    } else {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      data = JSON.parse(raw);
    }
    data.teams = data.teams || [];
    data.team_members = data.team_members || [];
    data.payments = data.payments || [];
    data.ppt_submissions = data.ppt_submissions || [];
    data.announcements = data.announcements || [];
    data.admin_logs = data.admin_logs || [];
    saveLocalStore(data);
    return data;
  } catch (err) {
    console.error("Local data store load error:", err);
    return {
      teams: [],
      team_members: [],
      payments: [],
      ppt_submissions: [],
      announcements: [],
      admin_logs: []
    };
  }
}

function saveLocalStore(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Local data store save error:", err);
  }
}

// Initialize Supabase if keys provided
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseUrl.includes("supabase.co") && supabaseKey);

let supabase = null;
if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log("⚡ Connected to Supabase PostgreSQL database.");
  } catch (err) {
    console.warn("⚠️ Supabase init failed, falling back to Local JSON Data Store.", err.message);
  }
} else {
  console.log("ℹ️ Running with Local JSON Data Store (Set SUPABASE_URL in .env to use Supabase Cloud).");
}

export const dbAdapter = {
  isSupabase: isSupabaseConfigured && supabase !== null,

  // Teams CRUD
  async createTeam(teamData, membersData) {
    if (this.isSupabase) {
      const { data: team, error: teamErr } = await supabase.from('teams').insert([teamData]).select().single();
      if (teamErr) throw teamErr;

      const membersWithTeamId = membersData.map(m => ({ ...m, team_id: team.id }));
      const { error: memErr } = await supabase.from('team_members').insert(membersWithTeamId);
      if (memErr) throw memErr;

      return team;
    } else {
      const store = loadLocalStore();
      const teamId = "team-" + Date.now();
      const newTeam = { id: teamId, ...teamData, created_at: new Date().toISOString() };
      store.teams.push(newTeam);

      const newMembers = membersData.map((m, idx) => ({
        id: `mem-${Date.now()}-${idx}`,
        team_id: teamId,
        ...m,
        created_at: new Date().toISOString()
      }));
      store.team_members.push(...newMembers);

      saveLocalStore(store);
      return newTeam;
    }
  },

  async getTeamByRegId(regId) {
    if (this.isSupabase) {
      const { data: team } = await supabase.from('teams').select('*').eq('reg_id', regId).maybeSingle();
      if (!team) return null;
      const { data: members } = await supabase.from('team_members').select('*').eq('team_id', team.id);
      const { data: payment } = await supabase.from('payments').select('*').eq('team_id', team.id).maybeSingle();
      const { data: ppt } = await supabase.from('ppt_submissions').select('*').eq('team_id', team.id).maybeSingle();
      return { ...team, members: members || [], payment: payment || null, ppt: ppt || null };
    } else {
      const store = loadLocalStore();
      const team = store.teams.find(t => t.reg_id.toUpperCase() === regId.toUpperCase());
      if (!team) return null;
      const members = store.team_members.filter(m => m.team_id === team.id);
      const payment = store.payments.find(p => p.team_id === team.id) || null;
      const ppt = store.ppt_submissions.find(p => p.team_id === team.id) || null;
      return { ...team, members, payment, ppt };
    }
  },

  async getAllTeams() {
    if (this.isSupabase) {
      const { data: teams } = await supabase.from('teams').select('*').order('created_at', { ascending: false });
      return teams || [];
    } else {
      const store = loadLocalStore();
      return store.teams.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  async updateTeamStatus(teamId, newStatus) {
    if (this.isSupabase) {
      await supabase.from('teams').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', teamId);
    } else {
      const store = loadLocalStore();
      const team = store.teams.find(t => t.id === teamId || t.reg_id === teamId);
      if (team) {
        team.status = newStatus;
        team.updated_at = new Date().toISOString();
        saveLocalStore(store);
      }
    }
  },

  async markAttendance(regId, markedBy = 'Admin') {
    const cleanId = regId.trim();
    if (this.isSupabase) {
      try {
        const { data } = await supabase.from('teams').update({
          attended: true,
          attended_at: new Date().toISOString(),
          attended_by: markedBy
        }).ilike('reg_id', cleanId).select().maybeSingle();

        if (data) return data;
        
        const team = await this.getTeamByRegId(cleanId);
        if (team) {
          team.attended = true;
          team.attended_at = new Date().toISOString();
          team.attended_by = markedBy;
        }
        return team || { reg_id: cleanId, attended: true, attended_at: new Date().toISOString() };
      } catch (err) {
        const team = await this.getTeamByRegId(cleanId);
        if (team) {
          team.attended = true;
          team.attended_at = new Date().toISOString();
        }
        return team || { reg_id: cleanId, attended: true, attended_at: new Date().toISOString() };
      }
    } else {
      const store = loadLocalStore();
      const team = store.teams.find(t => t.reg_id.toUpperCase() === cleanId.toUpperCase());
      if (team) {
        team.attended = true;
        team.attended_at = new Date().toISOString();
        team.attended_by = markedBy;
        saveLocalStore(store);
      }
      return team || { reg_id: cleanId, attended: true, attended_at: new Date().toISOString() };
    }
  },

  // Payments CRUD
  async createPayment(paymentData) {
    if (this.isSupabase) {
      const { data, error } = await supabase.from('payments').insert([paymentData]).select().single();
      if (error) throw error;
      return data;
    } else {
      const store = loadLocalStore();
      const paymentId = "pay-" + Date.now();
      const newPay = {
        id: paymentId,
        ...paymentData,
        status: 'PENDING',
        rejection_reason: null,
        created_at: new Date().toISOString()
      };
      store.payments.push(newPay);
      
      // Update team status to PAYMENT_PENDING if not already
      const team = store.teams.find(t => t.id === paymentData.team_id);
      if (team && team.status !== 'PAYMENT_APPROVED') {
        team.status = 'PAYMENT_PENDING';
      }

      saveLocalStore(store);
      return newPay;
    }
  },

  async getPaymentByUtr(utrNumber) {
    if (this.isSupabase) {
      const { data } = await supabase.from('payments').select('*').eq('utr_number', utrNumber).maybeSingle();
      return data || null;
    } else {
      const store = loadLocalStore();
      return store.payments.find(p => p.utr_number === utrNumber) || null;
    }
  },

  async updatePaymentStatus(paymentId, status, rejectionReason = null, reviewer = 'Admin') {
    if (this.isSupabase) {
      const updates = {
        status,
        rejection_reason: rejectionReason,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewer
      };
      const { data: pay } = await supabase.from('payments').update(updates).eq('id', paymentId).select().single();
      if (pay) {
        const teamStatus = status === 'APPROVED' ? 'PAYMENT_APPROVED' : 'PAYMENT_REJECTED';
        await supabase.from('teams').update({ status: teamStatus }).eq('id', pay.team_id);
      }
      return pay;
    } else {
      const store = loadLocalStore();
      const pay = store.payments.find(p => p.id === paymentId);
      if (pay) {
        pay.status = status;
        pay.rejection_reason = rejectionReason;
        pay.reviewed_at = new Date().toISOString();
        pay.reviewed_by = reviewer;

        const team = store.teams.find(t => t.id === pay.team_id);
        if (team) {
          team.status = status === 'APPROVED' ? 'PAYMENT_APPROVED' : 'PAYMENT_REJECTED';
        }
        saveLocalStore(store);
      }
      return pay;
    }
  },

  // PPT Submissions CRUD
  async upsertPptSubmission(pptData) {
    if (this.isSupabase) {
      const { data: existing } = await supabase.from('ppt_submissions').select('*').eq('team_id', pptData.team_id).maybeSingle();
      if (existing) {
        const { data, error } = await supabase.from('ppt_submissions')
          .update({ ...pptData, version: (existing.version || 1) + 1, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('ppt_submissions').insert([pptData]).select().single();
        if (error) throw error;
        return data;
      }
    } else {
      const store = loadLocalStore();
      const existingIdx = store.ppt_submissions.findIndex(p => p.team_id === pptData.team_id);
      let pptRecord;

      if (existingIdx !== -1) {
        pptRecord = {
          ...store.ppt_submissions[existingIdx],
          ...pptData,
          version: (store.ppt_submissions[existingIdx].version || 1) + 1,
          updated_at: new Date().toISOString()
        };
        store.ppt_submissions[existingIdx] = pptRecord;
      } else {
        pptRecord = {
          id: "ppt-" + Date.now(),
          ...pptData,
          version: 1,
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        store.ppt_submissions.push(pptRecord);
      }

      saveLocalStore(store);
      return pptRecord;
    }
  },

  // Announcements
  async getAnnouncements() {
    if (this.isSupabase) {
      const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      return data || [];
    } else {
      const store = loadLocalStore();
      return store.announcements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  async createAnnouncement(announcementData) {
    if (this.isSupabase) {
      const { data } = await supabase.from('announcements').insert([announcementData]).select().single();
      return data;
    } else {
      const store = loadLocalStore();
      const newAnn = {
        id: "ann-" + Date.now(),
        ...announcementData,
        created_at: new Date().toISOString()
      };
      store.announcements.push(newAnn);
      saveLocalStore(store);
      return newAnn;
    }
  },

  // Admin Audit Log
  async logAdminAction(adminUser, action, targetRegId, details) {
    const logEntry = {
      admin_user: adminUser,
      action,
      target_reg_id: targetRegId,
      details,
      created_at: new Date().toISOString()
    };

    if (this.isSupabase) {
      await supabase.from('admin_logs').insert([logEntry]);
    } else {
      const store = loadLocalStore();
      store.admin_logs.push({ id: "log-" + Date.now(), ...logEntry });
      saveLocalStore(store);
    }
  },

  async getAdminLogs() {
    if (this.isSupabase) {
      const { data } = await supabase.from('admin_logs').select('*').order('created_at', { ascending: false });
      return data || [];
    } else {
      const store = loadLocalStore();
      return store.admin_logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  },

  // Clear all test data from Supabase & Local JSON store
  async clearAllData() {
    if (this.isSupabase) {
      console.log('🧹 Clearing all test data from Supabase PostgreSQL database...');
      await supabase.from('admin_logs').delete().not('id', 'is', null);
      await supabase.from('ppt_submissions').delete().not('id', 'is', null);
      await supabase.from('payments').delete().not('id', 'is', null);
      await supabase.from('team_members').delete().not('id', 'is', null);
      await supabase.from('teams').delete().not('id', 'is', null);
      console.log('✅ Supabase database cleared successfully.');
    }

    // Also clear local JSON store
    const emptyData = {
      teams: [],
      team_members: [],
      payments: [],
      ppt_submissions: [],
      announcements: [],
      admin_logs: []
    };
    saveLocalStore(emptyData);
    console.log('✅ Local JSON store cleared successfully.');
  },

  async getPaymentGateStatus() {
    const store = loadLocalStore();
    return Boolean(store.payment_portal_open);
  },

  async setPaymentGateStatus(isOpen) {
    const store = loadLocalStore();
    store.payment_portal_open = Boolean(isOpen);
    saveLocalStore(store);
    return store.payment_portal_open;
  }
};
