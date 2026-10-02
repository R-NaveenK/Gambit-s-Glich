import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { dbAdapter } from '../db/dbAdapter.js';

const router = express.Router();

// Ensure upload directory exists
const UPLOAD_DIR = process.env.UPLOAD_DIR || (process.env.VERCEL ? '/tmp' : './uploads');
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (err) {
  console.warn("Upload dir note:", err.message);
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedRegId = (req.body.reg_id || 'PAYMENT').replace(/[^a-zA-Z0-9_-]/g, '');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `PAYMENT_${sanitizedRegId}_${uniqueSuffix}${ext}`);
  }
});

// File filter (Images only for proof)
const fileFilter = (req, file, cb) => {
  const allowedMime = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
  if (allowedMime.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Invalid payment proof file format. Please upload JPG, PNG, WEBP, or HEIC screenshot.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

// GET Public Payment Gate Status
router.get('/gate-status', async (req, res) => {
  try {
    const isOpen = await dbAdapter.getPaymentGateStatus();
    return res.json({ success: true, open: isOpen });
  } catch (err) {
    return res.json({ success: true, open: false });
  }
});

// GET Team Details & Calculate Payment Amount by Reg ID
router.get('/lookup/:regId', async (req, res) => {
  try {
    const regId = req.params.regId ? req.params.regId.trim() : '';
    if (!regId) {
      return res.status(400).json({ success: false, message: 'Registration ID required.' });
    }

    const team = await dbAdapter.getTeamByRegId(regId);
    if (!team) {
      return res.status(404).json({ success: false, message: `No registered team found matching "${regId}".` });
    }

    const MAX_CONFIRMED_TEAMS = 40;
    const confirmedCount = await dbAdapter.getConfirmedPaymentCount();
    const isPaid = Boolean(team.payment && team.payment.status === 'APPROVED');
    const isCapacityFull = confirmedCount >= MAX_CONFIRMED_TEAMS && !isPaid;
    const isEligible = team.status !== 'REJECTED' && !isCapacityFull;

    const memberCount = Math.max(1, team.member_count || (team.members ? team.members.length : 1));
    const perHeadFee = 250;
    const calculatedTotal = memberCount * perHeadFee;

    return res.json({
      success: true,
      team: {
        reg_id: team.reg_id,
        team_name: team.team_name,
        college: team.college,
        leader_name: team.leader_name,
        leader_email: team.leader_email,
        member_count: memberCount,
        per_head_fee: perHeadFee,
        calculated_total: calculatedTotal,
        status: team.status,
        is_shortlisted: isEligible, // FCFS: Any non-rejected team is eligible
        is_eligible: isEligible,
        fcfs_eligible: isEligible,
        has_paid: isPaid,
        payment_status: team.payment ? team.payment.status : 'NOT_SUBMITTED',
        confirmed_count: confirmedCount,
        max_capacity: MAX_CONFIRMED_TEAMS,
        capacity_full: isCapacityFull
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error looking up team details.' });
  }
});

router.post('/submit', upload.single('screenshot'), async (req, res) => {
  try {
    const { reg_id, utr_number, payer_name, payment_date, amount } = req.body;

    const isGateOpen = await dbAdapter.getPaymentGateStatus();
    if (!isGateOpen) {
      return res.status(403).json({
        success: false,
        message: 'Payment portal is currently locked by administrators or capacity has been reached. Please contact organizers.',
        isLocked: true
      });
    }

    if (!reg_id || !utr_number || !payer_name || !payment_date) {
      return res.status(400).json({ success: false, message: 'Registration ID, UTR Number, Payer Name, and Payment Date are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a clear payment screenshot.' });
    }

    // Verify Team exists
    const team = await dbAdapter.getTeamByRegId(reg_id.trim());
    if (!team) {
      return res.status(404).json({ success: false, message: `No registered team found with Registration ID: "${reg_id}". Please check your ID.` });
    }

    // FCFS Check: Only REJECTED teams are blocked from paying
    if (team.status === 'REJECTED') {
      return res.status(403).json({
        success: false,
        message: `Payment cannot be processed for team ${team.reg_id} because the registration has been rejected or cancelled.`,
        isLocked: true
      });
    }

    // Enforce 40 confirmed teams capacity limit
    const MAX_CONFIRMED_TEAMS = 40;
    const confirmedCount = await dbAdapter.getConfirmedPaymentCount();
    const isAlreadyPaid = team.payment && team.payment.status === 'APPROVED';
    if (confirmedCount >= MAX_CONFIRMED_TEAMS && !isAlreadyPaid) {
      return res.status(403).json({
        success: false,
        message: 'Payment submission closed: Maximum event capacity of 40 confirmed teams has been reached.',
        isLocked: true,
        capacityFull: true
      });
    }

    // Check for duplicate UTR number submission across all payments
    const sanitizedUtr = utr_number.trim();
    const existingPaymentWithUtr = await dbAdapter.getPaymentByUtr(sanitizedUtr);
    if (existingPaymentWithUtr && existingPaymentWithUtr.team_id !== team.id) {
      return res.status(400).json({
        success: false,
        message: `This UTR/Reference number (${sanitizedUtr}) has already been submitted for another registration. Please verify your reference number.`,
        isDuplicateUtr: true
      });
    }

    let fileData = null;
    try {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        const fileBuffer = fs.readFileSync(req.file.path);
        fileData = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
      }
    } catch (e) {
      console.warn("Could not read screenshot buffer:", e.message);
    }

    const screenshotUrl = `/uploads/${req.file.filename}`;

    const paymentData = {
      team_id: team.id,
      utr_number: sanitizedUtr,
      payer_name: payer_name.trim(),
      amount: parseFloat(amount) || ((team.member_count || 1) * 250),
      payment_date,
      screenshot_url: screenshotUrl,
      filename: req.file.filename,
      original_filename: req.file.originalname,
      mime_type: req.file.mimetype,
      file_data: fileData
    };

    const payment = await dbAdapter.createPayment(paymentData);
    await dbAdapter.updateTeamStatus(team.id, 'PAYMENT_PENDING');

    return res.status(201).json({
      success: true,
      message: 'Payment screenshot submitted successfully. Status updated to PAYMENT VERIFICATION PENDING.',
      status: 'PAYMENT_PENDING',
      payment
    });

  } catch (err) {
    console.error('Payment upload server error:', err);
    return res.status(400).json({ success: false, message: err.message || 'Payment submission failed.' });
  }
});

export default router;
