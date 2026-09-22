import express from 'express';
import { authenticateAdmin } from '../middleware/auth.js';
import { dbAdapter } from '../db/dbAdapter.js';
import { sendShortlistedEmail, sendPaymentInvoiceEmail, sendTestEmail } from '../services/emailService.js';

const router = express.Router();

// Apply auth middleware to ALL admin routes
router.use(authenticateAdmin);

// 1. Dashboard Overview Stats & Summary
router.get('/dashboard', async (req, res) => {
  try {
    const teams = await dbAdapter.getAllTeams();
    const fullTeams = await Promise.all(teams.map(t => dbAdapter.getTeamByRegId(t.reg_id)));

    let totalRegistrations = fullTeams.length;
    let pendingPayments = 0;
    let approvedPayments = 0;
    let pptSubmissions = 0;
    let shortlisted = 0;
    let attendedCount = 0;

    for (const fullTeam of fullTeams) {
      if (!fullTeam) continue;
      if (fullTeam.payment) {
        if (fullTeam.payment.status === 'APPROVED') approvedPayments++;
        else pendingPayments++;
      } else {
        pendingPayments++;
      }

      if (fullTeam.ppt) pptSubmissions++;
      if (fullTeam.status === 'SHORTLISTED') shortlisted++;
      if (fullTeam.attended) attendedCount++;
    }

    return res.json({
      success: true,
      stats: {
        totalRegistrations,
        pendingPayments,
        approvedPayments,
        pptSubmissions,
        shortlisted,
        attendedCount
      }
    });
  } catch (err) {
    console.error('Admin dashboard stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics.' });
  }
});

// 2. Search & Filter Teams
router.get('/teams', async (req, res) => {
  try {
    const { search, theme, status, college } = req.query;
    const teams = await dbAdapter.getAllTeams();

    const fullTeams = await Promise.all(teams.map(t => dbAdapter.getTeamByRegId(t.reg_id)));

    let filtered = fullTeams.filter(Boolean);

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(t =>
        (t.reg_id || '').toLowerCase().includes(q) ||
        (t.team_name || '').toLowerCase().includes(q) ||
        (t.leader_name || '').toLowerCase().includes(q) ||
        (t.leader_email || '').toLowerCase().includes(q) ||
        (t.payment && t.payment.utr_number && t.payment.utr_number.toLowerCase().includes(q))
      );
    }

    if (theme && theme !== 'ALL') {
      filtered = filtered.filter(t => t.theme_id === theme);
    }

    if (status && status !== 'ALL') {
      filtered = filtered.filter(t => t.status === status);
    }

    if (college && college !== 'ALL') {
      filtered = filtered.filter(t => (t.college || '').toLowerCase().includes(college.toLowerCase()));
    }

    return res.json({ success: true, teams: filtered });
  } catch (err) {
    console.error('Admin teams fetch error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch teams list.' });
  }
});

// 3. Approve Payment
router.post('/payment/approve', async (req, res) => {
  try {
    const { payment_id, reg_id } = req.body;
    if (!payment_id && !reg_id) {
      return res.status(400).json({ success: false, message: 'Payment ID or Registration ID is required.' });
    }

    let targetTeam = null;
    let paymentId = payment_id;

    if (reg_id) {
      targetTeam = await dbAdapter.getTeamByRegId(reg_id);
      if (targetTeam && targetTeam.payment) paymentId = targetTeam.payment.id;
    }

    if (!paymentId) {
      return res.status(404).json({ success: false, message: 'No payment record found for team.' });
    }

    const updatedPayment = await dbAdapter.updatePaymentStatus(paymentId, 'APPROVED', null, req.user.email);
    
    if (!targetTeam && updatedPayment && updatedPayment.team_id) {
      const allTeams = await dbAdapter.getAllTeams();
      const match = allTeams.find(t => t.id === updatedPayment.team_id);
      if (match) {
        targetTeam = await dbAdapter.getTeamByRegId(match.reg_id);
      }
    }

    const targetRegId = targetTeam ? targetTeam.reg_id : (reg_id || paymentId);
    await dbAdapter.logAdminAction(req.user.email, 'PAYMENT_APPROVED', targetRegId, `Payment approved for payment ID ${paymentId}`);

    if (targetTeam) {
      const fullTeam = await dbAdapter.getTeamByRegId(targetTeam.reg_id);
      sendPaymentInvoiceEmail(fullTeam, updatedPayment, fullTeam.ppt, fullTeam.members || []).catch(err => console.error('Approved payment invoice dispatch error:', err));
    }

    return res.json({ success: true, message: 'Payment approved successfully! Official payment invoice with squad member list dispatched to team.', payment: updatedPayment });
  } catch (err) {
    console.error('Payment approval error:', err);
    return res.status(500).json({ success: false, message: 'Payment approval failed.' });
  }
});

// 4. Reject Payment (Requires Mandatory Reason)
router.post('/payment/reject', async (req, res) => {
  try {
    const { payment_id, reg_id, reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'A mandatory rejection reason must be provided.' });
    }

    let targetTeam = null;
    let paymentId = payment_id;

    if (reg_id) {
      targetTeam = await dbAdapter.getTeamByRegId(reg_id);
      if (targetTeam && targetTeam.payment) paymentId = targetTeam.payment.id;
    }

    if (!paymentId) {
      return res.status(404).json({ success: false, message: 'No payment record found for team.' });
    }

    const updatedPayment = await dbAdapter.updatePaymentStatus(paymentId, 'REJECTED', reason.trim(), req.user.email);

    if (!targetTeam && updatedPayment && updatedPayment.team_id) {
      const allTeams = await dbAdapter.getAllTeams();
      const match = allTeams.find(t => t.id === updatedPayment.team_id);
      if (match) {
        targetTeam = await dbAdapter.getTeamByRegId(match.reg_id);
      }
    }

    const targetRegId = targetTeam ? targetTeam.reg_id : (reg_id || paymentId);
    await dbAdapter.logAdminAction(req.user.email, 'PAYMENT_REJECTED', targetRegId, `Reason: ${reason.trim()}`);

    return res.json({ success: true, message: 'Payment rejected. Team informed via status tracker.', payment: updatedPayment });
  } catch (err) {
    console.error('Payment rejection error:', err);
    return res.status(500).json({ success: false, message: 'Payment rejection failed.' });
  }
});

// 5. Shortlist or Reject Team
router.post('/team/update-status', async (req, res) => {
  try {
    const { team_id, reg_id, new_status } = req.body;
    const validStatuses = ['SHORTLISTED', 'UNDER_REVIEW', 'REJECTED', 'PAYMENT_APPROVED', 'PAYMENT_PENDING', 'PPT_SUBMITTED'];

    if (!validStatuses.includes(new_status)) {
      return res.status(400).json({ success: false, message: 'Invalid target team status.' });
    }

    let targetTeam = null;
    let targetTeamId = team_id;
    let targetRegId = reg_id;

    if (reg_id) {
      targetTeam = await dbAdapter.getTeamByRegId(reg_id);
      if (targetTeam) {
        targetTeamId = targetTeam.id;
        targetRegId = targetTeam.reg_id;
      }
    } else if (team_id) {
      const allTeams = await dbAdapter.getAllTeams();
      targetTeam = allTeams.find(t => t.id === team_id);
      if (targetTeam) {
        targetTeam = await dbAdapter.getTeamByRegId(targetTeam.reg_id);
        targetRegId = targetTeam.reg_id;
      }
    }

    if (!targetTeamId) {
      return res.status(404).json({ success: false, message: 'Target team not found.' });
    }

    await dbAdapter.updateTeamStatus(targetTeamId, new_status);
    await dbAdapter.logAdminAction(req.user.email, `TEAM_STATUS_${new_status}`, targetRegId || targetTeamId, `Status changed to ${new_status}`);

    // Trigger Shortlisted Email with Attendance QR code & payment link if team is shortlisted
    if (new_status === 'SHORTLISTED' && targetTeam) {
      sendShortlistedEmail(targetTeam, targetTeam.members || []).catch(err => console.error('Shortlist email dispatch error:', err));
    }

    return res.json({ success: true, message: `Team status updated to ${new_status}.` });
  } catch (err) {
    console.error('Update status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update team status.' });
  }
});

// 6. Mark Event Day Entry Attendance
router.post('/team/mark-attendance', async (req, res) => {
  try {
    const { reg_id } = req.body;
    if (!reg_id) return res.status(400).json({ success: false, message: 'Registration ID is required.' });

    const team = await dbAdapter.getTeamByRegId(reg_id.trim());
    if (!team) return res.status(404).json({ success: false, message: `No registered team found with ID: ${reg_id}` });

    const updated = await dbAdapter.markAttendance(team.reg_id, req.user ? req.user.email : 'Admin');
    await dbAdapter.logAdminAction(req.user ? req.user.email : 'Admin', 'ATTENDANCE_MARKED', team.reg_id, `Attendance entry granted for team ${team.team_name}`);

    return res.json({
      success: true,
      message: `✔ ENTRY GRANTED! Attendance logged for Team ${team.team_name} (${team.reg_id}).`,
      team: updated
    });
  } catch (err) {
    console.error('Mark attendance error:', err);
    return res.status(500).json({ success: false, message: 'Failed to mark attendance.' });
  }
});

// 6. Post Announcement
router.post('/announcements', async (req, res) => {
  try {
    const { title, content, priority } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Announcement title and content are required.' });
    }
    const newAnn = await dbAdapter.createAnnouncement({ title: title.trim(), content: content.trim(), priority: priority || 'NORMAL' });
    await dbAdapter.logAdminAction(req.user.email, 'CREATE_ANNOUNCEMENT', null, `Title: ${title}`);
    return res.status(201).json({ success: true, announcement: newAnn });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to create announcement.' });
  }
});

// 7. Get Audit Logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await dbAdapter.getAdminLogs();
    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch admin logs.' });
  }
});

// 8. Export CSV
router.get('/export-csv', async (req, res) => {
  try {
    const teams = await dbAdapter.getAllTeams();
    const fullTeams = await Promise.all(teams.map(t => dbAdapter.getTeamByRegId(t.reg_id)));

    let csvContent = 'Registration ID,Team Name,Theme,Leader Name,Leader Email,Leader Phone,College,Department,Year,Member Count,Status,UTR Number,Payer Name,Payment Status,PPT Title,PPT File URL\n';

    const sanitize = (str) => `"${(str || '').toString().replace(/"/g, '""')}"`;

    for (const t of fullTeams) {
      if (!t) continue;
      const row = [
        sanitize(t.reg_id),
        sanitize(t.team_name),
        sanitize(t.theme_id),
        sanitize(t.leader_name),
        sanitize(t.leader_email),
        sanitize(t.leader_phone),
        sanitize(t.college),
        sanitize(t.department),
        sanitize(t.year),
        t.member_count || 1,
        sanitize(t.status),
        sanitize(t.payment ? t.payment.utr_number : 'N/A'),
        sanitize(t.payment ? t.payment.payer_name : 'N/A'),
        sanitize(t.payment ? t.payment.status : 'N/A'),
        sanitize(t.ppt ? t.ppt.project_title : 'N/A'),
        sanitize(t.ppt ? t.ppt.file_url : 'N/A')
      ].join(',');
      csvContent += row + '\n';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="gambits_glitch_registrations_2026.csv"');
    return res.status(200).send(csvContent);

  } catch (err) {
    console.error('CSV export error:', err);
    return res.status(500).json({ success: false, message: 'CSV export failed.' });
  }
});

// 10. Send Diagnostic Test Email Endpoint
router.post('/email/test', async (req, res) => {
  try {
    const { email } = req.body;
    const targetEmail = (email || req.user.email).trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid recipient email address is required.' });
    }

    const result = await sendTestEmail(targetEmail);
    await dbAdapter.logAdminAction(req.user.email, 'TEST_EMAIL_SENT', null, `Test email dispatched to ${targetEmail}. Result: ${result.success ? 'Success' : 'Failed'}`);

    if (result.success) {
      return res.json({ success: true, message: result.message, info: result.info });
    } else {
      return res.status(400).json({ success: false, message: result.message });
    }
  } catch (err) {
    console.error('Test email route error:', err);
    return res.status(500).json({ success: false, message: 'Failed to execute test email dispatch.' });
  }
});

// 11. Clear All Database Data
router.post('/clear-all', async (req, res) => {
  try {
    await dbAdapter.clearAllData();
    await dbAdapter.logAdminAction(req.user.email, 'CLEAR_DATABASE', null, 'Wiped all team registrations, payments, and submissions.');
    return res.json({ success: true, message: 'Database successfully cleared!' });
  } catch (err) {
    console.error('Clear database error:', err);
    return res.status(500).json({ success: false, message: 'Failed to clear database.' });
  }
});

export default router;
