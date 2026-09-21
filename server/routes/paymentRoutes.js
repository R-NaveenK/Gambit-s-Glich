import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { dbAdapter } from '../db/dbAdapter.js';

const router = express.Router();

// Ensure upload directory exists
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
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

router.post('/submit', upload.single('screenshot'), async (req, res) => {
  try {
    const { reg_id, utr_number, payer_name, payment_date, amount } = req.body;

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

    // Shortlist Gating Check: Only SHORTLISTED teams are permitted to submit payment
    const allowedStatuses = ['SHORTLISTED', 'PAYMENT_PENDING', 'PAYMENT_APPROVED'];
    if (!allowedStatuses.includes(team.status)) {
      return res.status(403).json({
        success: false,
        message: `Payment is locked for team ${team.reg_id}. The payment portal unlocks only after your team has been SHORTLISTED by the organizers. Current Status: ${team.status}.`,
        isLocked: true
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

    const screenshotUrl = `/uploads/${req.file.filename}`;

    const paymentData = {
      team_id: team.id,
      utr_number: sanitizedUtr,
      payer_name: payer_name.trim(),
      amount: parseFloat(amount) || 499.00,
      payment_date,
      screenshot_url: screenshotUrl
    };

    const payment = await dbAdapter.createPayment(paymentData);

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
