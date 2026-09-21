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
  teams: [
    {
      id: "demo-team-1",
      reg_id: "GG26-78A1",
      team_name: "CYBER_GLITCH_LABS",
      theme_id: "track-01",
      college: "Indian Institute of Technology, Bengaluru",
      department: "Computer Science",
      year: "3rd Year",
      city: "Bengaluru",
      leader_name: "Alex Vance",
      leader_email: "alex.vance@example.com",
      leader_phone: "+91 9876543210",
      member_count: 3,
      status: "PAYMENT_APPROVED",
      rules_agreed: true,
      created_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: "demo-team-2",
      reg_id: "GG26-99B4",
      team_name: "SYNTAX_ERRORS",
      theme_id: "track-03",
      college: "National Institute of Tech, Trichy",
      department: "Information Technology",
      year: "4th Year",
      city: "Trichy",
      leader_name: "Rohan Sharma",
      leader_email: "rohan@example.com",
      leader_phone: "+91 9123456780",
      member_count: 2,
      status: "PAYMENT_PENDING",
      rules_agreed: true,
      created_at: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ],
  team_members: [
    { id: "m1", team_id: "demo-team-1", name: "Alex Vance", email: "alex.vance@example.com", phone: "+91 9876543210", role: "Leader" },
    { id: "m2", team_id: "demo-team-1", name: "Elena Rostova", email: "elena@example.com", phone: "+91 9876543211", role: "Frontend Dev" },
    { id: "m3", team_id: "demo-team-1", name: "Devin K", email: "devin@example.com", phone: "+91 9876543212", role: "Backend Architect" },
    { id: "m4", team_id: "demo-team-2", name: "Rohan Sharma", email: "rohan@example.com", phone: "+91 9123456780", role: "Leader" },
    { id: "m5", team_id: "demo-team-2", name: "Ananya Iyer", email: "ananya@example.com", phone: "+91 9123456781", role: "AI Engineer" }
  ],
  payments: [
    {
      id: "pay-1",
      team_id: "demo-team-1",
      utr_number: "202698765432",
      payer_name: "Alex Vance",
      amount: 499.00,
      payment_date: "2026-09-17",
      screenshot_url: "/assets/demo_payment_proof.png",
      status: "APPROVED",
      rejection_reason: null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: "Admin System",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: "pay-2",
      team_id: "demo-team-2",
      utr_number: "202611223344",
      payer_name: "Rohan Sharma",
      amount: 499.00,
      payment_date: "2026-09-19",
      screenshot_url: "/assets/demo_payment_proof.png",
      status: "PENDING",
      rejection_reason: null,
      reviewed_at: null,
      reviewed_by: null,
      created_at: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ],
  ppt_submissions: [
    {
      id: "ppt-1",
      team_id: "demo-team-1",
      project_title: "GLITCH_NET: Decentralized Autonomous Edge Proxy",
      summary: "A sub-millisecond edge routing network leveraging WASM micro-containers.",
      file_url: "/uploads/demo_presentation.pdf",
      original_filename: "GlitchNet_Deck.pdf",
      repo_link: "https://github.com/alexvance/glitch-net",
      demo_link: "https://glitch-net-demo.vercel.app",
      version: 1,
      submitted_at: new Date(Date.now() - 86400000 * 1).toISOString()
    }
  ],
  announcements: [
    {
      id: "ann-1",
      title: "PPT Submission Gate active for approved teams",
      content: "Teams with verified payments can now submit their initial pitch decks on the Submit PPT page.",
      priority: "NORMAL",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ],
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
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
      return initialData;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error("Local data store load error:", err);
    return initialData;
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
      await supabase.from('admin_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('ppt_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('team_members').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('teams').delete().neq('id', '00000000-0000-0000-0000-000000000000');
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
  }
};
