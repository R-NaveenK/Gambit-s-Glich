import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { dbAdapter } from '../db/dbAdapter.js';
import { sendRegistrationConfirmation, sendPaymentInvoiceEmail } from '../services/emailService.js';

const router = express.Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || (process.env.VERCEL ? '/tmp' : './uploads');
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (err) {
  console.warn("Upload dir note:", err.message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const prefix = file.fieldname === 'payment_screenshot' ? 'PAYMENT' : 'PPT';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${prefix}_REG_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }
});

const regUpload = upload.fields([
  { name: 'payment_screenshot', maxCount: 1 },
  { name: 'ppt_file', maxCount: 1 }
]);

// Helper to generate unique registration ID (e.g., GG26-8F92)
function generateRegId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let randomCode = '';
  for (let i = 0; i < 4; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GG26-${randomCode}`;
}

router.post('/', regUpload, async (req, res) => {
  try {
    const {
      team_name,
      theme_id,
      college,
      department,
      year,
      city,
      leader_name,
      leader_email,
      leader_phone,
      members,
      rules_agreed,
      // Payment fields
      utr_number,
      payer_name,
      amount,
      // PPT fields
      project_title,
      summary,
      repo_link,
      demo_link
    } = req.body;

    // Strict input validation
    if (!team_name || !theme_id || !college || !department || !year || !city || !leader_name || !leader_email || !leader_phone) {
      return res.status(400).json({ success: false, message: 'All required team leadership fields must be filled.' });
    }

    if (!rules_agreed || rules_agreed === 'false') {
      return res.status(400).json({ success: false, message: 'You must agree to the event rules and code of conduct.' });
    }

    const paymentFile = req.files && req.files['payment_screenshot'] ? req.files['payment_screenshot'][0] : null;
    const pptFile = req.files && req.files['ppt_file'] ? req.files['ppt_file'][0] : null;

    // STEP 1 REQUIREMENT: Pitch Deck PPT presentation file + title + summary are mandatory for registration!
    if (!pptFile || !project_title || !project_title.trim() || !summary || !summary.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Registration requirement: Presentation pitch deck file (.ppt, .pptx, .pdf), project title, and summary must be submitted for jury evaluation.'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leader_email)) {
      return res.status(400).json({ success: false, message: 'Invalid team leader email address.' });
    }

    // Members array validation (handles JSON string or array)
    let memberArray = [];
    if (typeof members === 'string') {
      try { memberArray = JSON.parse(members); } catch (e) { memberArray = []; }
    } else if (Array.isArray(members)) {
      memberArray = members;
    }

    // Check for duplicate leader email
    const allTeams = await dbAdapter.getAllTeams();
    const existingLeader = allTeams.find(t => t.leader_email.toLowerCase() === leader_email.toLowerCase());
    if (existingLeader) {
      return res.status(400).json({
        success: false,
        message: `Team leader email (${leader_email}) is already registered with team "${existingLeader.team_name}" (ID: ${existingLeader.reg_id}).`
      });
    }

    // Generate unique Registration ID
    let regId = generateRegId();
    while (allTeams.some(t => t.reg_id === regId)) {
      regId = generateRegId();
    }

    const teamData = {
      reg_id: regId,
      team_name: team_name.trim(),
      theme_id,
      college: college.trim(),
      department: department.trim(),
      year: year.trim(),
      city: city.trim(),
      leader_name: leader_name.trim(),
      leader_email: leader_email.trim().toLowerCase(),
      leader_phone: leader_phone.trim(),
      member_count: memberArray.length + 1,
      status: 'UNDER_REVIEW',
      rules_agreed: true
    };

    const teamMembersData = [
      {
        name: leader_name.trim(),
        email: leader_email.trim().toLowerCase(),
        phone: leader_phone.trim(),
        role: 'Team Leader'
      },
      ...memberArray.map(m => ({
        name: (m.name || '').trim(),
        email: (m.email || '').trim().toLowerCase(),
        phone: (m.phone || '').trim(),
        role: (m.role || 'Member').trim()
      }))
    ];

    const createdTeam = await dbAdapter.createTeam(teamData, teamMembersData);

    // Process Payment Screenshot & Record if attached
    let paymentRecord = null;
    if (paymentFile && utr_number) {
      let paymentFileData = null;
      try {
        if (paymentFile.path && fs.existsSync(paymentFile.path)) {
          paymentFileData = `data:${paymentFile.mimetype};base64,${fs.readFileSync(paymentFile.path).toString('base64')}`;
        }
      } catch (e) {}

      const screenshotUrl = `/uploads/${paymentFile.filename}`;
      paymentRecord = await dbAdapter.createPayment({
        team_id: createdTeam.id,
        utr_number: utr_number.trim(),
        payer_name: (payer_name || leader_name).trim(),
        amount: parseFloat(amount) || ((memberArray.length + 1) * 300),
        payment_date: new Date().toISOString().split('T')[0],
        screenshot_url: screenshotUrl,
        filename: paymentFile.filename,
        original_filename: paymentFile.originalname,
        mime_type: paymentFile.mimetype,
        file_data: paymentFileData
      });
    }

    // Process PPT Pitch Deck
    let pptFileData = null;
    try {
      if (pptFile.path && fs.existsSync(pptFile.path)) {
        pptFileData = `data:${pptFile.mimetype};base64,${fs.readFileSync(pptFile.path).toString('base64')}`;
      }
    } catch (e) {}

    const pptRecord = await dbAdapter.upsertPptSubmission({
      team_id: createdTeam.id,
      project_title: project_title.trim(),
      summary: (summary || 'Submitted during team registration').trim(),
      file_url: `/uploads/${pptFile.filename}`,
      filename: pptFile.filename,
      original_filename: pptFile.originalname,
      mime_type: pptFile.mimetype,
      file_data: pptFileData,
      repo_link: repo_link ? repo_link.trim() : '',
      demo_link: demo_link ? demo_link.trim() : ''
    });

    // Send Initial Registration Confirmation Email
    sendRegistrationConfirmation(createdTeam, teamMembersData, pptRecord).catch(err => console.error('Registration email dispatch error:', err));
    if (paymentRecord) {
      sendPaymentInvoiceEmail(createdTeam, paymentRecord, pptRecord, teamMembersData).catch(err => console.error('Invoice email dispatch error:', err));
    }

    return res.status(201).json({
      success: true,
      message: 'Team successfully registered with Payment & PPT pitch deck!',
      reg_id: regId,
      team: createdTeam,
      payment: paymentRecord,
      ppt: pptRecord
    });

  } catch (err) {
    console.error('Registration server error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

export default router;


