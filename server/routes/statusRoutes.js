import express from 'express';
import { dbAdapter } from '../db/dbAdapter.js';

const router = express.Router();

router.post('/check', async (req, res) => {
  try {
    const { reg_id, email } = req.body;

    if (!reg_id || !email) {
      return res.status(400).json({ success: false, message: 'Both Registration ID and registered email are required.' });
    }

    const team = await dbAdapter.getTeamByRegId(reg_id.trim());
    if (!team) {
      return res.status(404).json({ success: false, message: `No registered team found matching Registration ID: "${reg_id}".` });
    }

    // Verify email matches leader or member email
    const cleanEmail = email.trim().toLowerCase();
    const isLeaderMatch = (team.leader_email || '').toLowerCase() === cleanEmail;
    const isMemberMatch = team.members && team.members.some(m => (m.email || '').toLowerCase() === cleanEmail);

    if (!isLeaderMatch && !isMemberMatch) {
      return res.status(401).json({ success: false, message: `Email "${email}" is not authorized for team ID ${reg_id}. Please check your registered email.` });
    }

    // Determine current overall pipeline state badge
    let pipelineState = team.status;
    let paymentStatus = team.payment ? team.payment.status : 'NOT_SUBMITTED';
    let rejectionReason = team.payment ? team.payment.rejection_reason : null;

    const announcements = await dbAdapter.getAnnouncements();

    return res.json({
      success: true,
      data: {
        reg_id: team.reg_id,
        team_name: team.team_name,
        theme_id: team.theme_id,
        college: team.college,
        leader_name: team.leader_name,
        leader_email: team.leader_email,
        member_count: team.member_count,
        members: team.members || [],
        pipeline_status: pipelineState,
        payment: team.payment ? {
          utr_number: team.payment.utr_number,
          payer_name: team.payment.payer_name,
          payment_date: team.payment.payment_date,
          status: paymentStatus,
          rejection_reason: rejectionReason,
          reviewed_at: team.payment.reviewed_at
        } : null,
        ppt: team.ppt ? {
          project_title: team.ppt.project_title,
          original_filename: team.ppt.original_filename,
          file_url: team.ppt.file_url,
          version: team.ppt.version,
          submitted_at: team.ppt.updated_at || team.ppt.submitted_at,
          repo_link: team.ppt.repo_link,
          demo_link: team.ppt.demo_link
        } : null,
        announcements: announcements.slice(0, 3) // Latest 3 announcements
      }
    });

  } catch (err) {
    console.error('Status check error:', err);
    return res.status(500).json({ success: false, message: 'Server error retrieving status.' });
  }
});

export default router;
