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
  { name: 'payment_screenshot', maxCount: 1 }
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
      // Payment fields (Mandatory in registration)
      utr_number,
      payer_name,
      amount
    } = req.body;

    // Strict input validation
    if (!team_name || !theme_id || !college || !department || !year || !city || !leader_name || !leader_email || !leader_phone) {
      return res.status(400).json({ success: false, message: 'All required team leadership fields must be filled.' });
    }

    if (!rules_agreed || rules_agreed === 'false') {
      return res.status(400).json({ success: false, message: 'You must agree to the event rules and code of conduct.' });
    }

    const paymentFile = req.files && req.files['payment_screenshot'] ? req.files['payment_screenshot'][0] : null;

    // MANDATORY PAYMENT VALIDATION
    if (!paymentFile || !utr_number || !utr_number.trim() || !payer_name || !payer_name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Registration requirement: UPI payment screenshot, 12-digit UTR reference number, and payer name must be submitted.'
      });
    }

    const sanitizedUtr = utr_number.trim();
    if (sanitizedUtr.length < 8 || sanitizedUtr.length > 24) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UTR reference number. Please provide a valid 12-digit transaction ID.'
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

    // Enforce 40 teams event capacity limit
    const MAX_TEAMS_CAPACITY = 40;
    const allTeams = await dbAdapter.getAllTeams();
    const activeTeams = allTeams.filter(t => t.status !== 'REJECTED');
    if (activeTeams.length >= MAX_TEAMS_CAPACITY) {
      return res.status(403).json({
        success: false,
        message: 'Registration is closed: Maximum event capacity of 40 teams has been reached.',
        capacityFull: true
      });
    }

    // Check for duplicate leader email
    const existingLeader = allTeams.find(t => (t.leader_email || '').toLowerCase() === leader_email.toLowerCase());
    if (existingLeader) {
      return res.status(400).json({
        success: false,
        message: `Team leader email (${leader_email}) is already registered with team "${existingLeader.team_name}" (ID: ${existingLeader.reg_id}).`
      });
    }

    // Check for duplicate UTR number across all payments
    const existingPaymentWithUtr = await dbAdapter.getPaymentByUtr(sanitizedUtr);
    if (existingPaymentWithUtr) {
      return res.status(400).json({
        success: false,
        message: `UTR transaction reference "${sanitizedUtr}" has already been submitted for another team. Each payment must be unique.`
      });
    }

    // Generate unique Registration ID
    let regId = generateRegId();
    while (allTeams.some(t => t.reg_id === regId)) {
      regId = generateRegId();
    }

    const totalSquadMembers = memberArray.length + 1;
    const expectedAmount = totalSquadMembers * 250;

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
      member_count: totalSquadMembers,
      status: 'PAYMENT_PENDING',
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

    // Read payment screenshot buffer for persistence
    let fileData = null;
    try {
      if (paymentFile && paymentFile.path && fs.existsSync(paymentFile.path)) {
        const fileBuffer = fs.readFileSync(paymentFile.path);
        fileData = `data:${paymentFile.mimetype};base64,${fileBuffer.toString('base64')}`;
      }
    } catch (e) {
      console.warn("Could not read screenshot buffer:", e.message);
    }

    // Create Payment Record linked to team
    const screenshotUrl = `/uploads/${paymentFile.filename}`;
    const paymentRecord = await dbAdapter.createPayment({
      team_id: createdTeam.id,
      utr_number: sanitizedUtr,
      payer_name: payer_name.trim(),
      amount: parseFloat(amount) || expectedAmount,
      payment_date: new Date().toISOString().split('T')[0],
      screenshot_url: screenshotUrl,
      filename: paymentFile.filename,
      original_filename: paymentFile.originalname,
      mime_type: paymentFile.mimetype,
      file_data: fileData
    });

    // Send Registration & Payment Confirmation Email (with on-spot problem statement notice)
    sendRegistrationConfirmation(createdTeam, teamMembersData, paymentRecord).catch(err => console.error('Registration email dispatch error:', err));

    return res.status(201).json({
      success: true,
      message: 'Team successfully registered with fee payment! Slot confirmation is pending admin verification on a First-Come, First-Served basis.',
      reg_id: regId,
      team: createdTeam,
      payment: paymentRecord
    });

  } catch (err) {
    console.error('Registration server error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
});

export default router;


