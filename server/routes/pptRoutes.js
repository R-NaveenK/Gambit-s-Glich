import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { dbAdapter } from '../db/dbAdapter.js';

const router = express.Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || (process.env.VERCEL ? '/tmp' : './uploads');
try {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
} catch (err) {
  console.warn("Upload dir note:", err.message);
}

// Storage for PPT files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedRegId = (req.body.reg_id || 'PPT').replace(/[^a-zA-Z0-9_-]/g, '');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `PPT_${sanitizedRegId}_${uniqueSuffix}${ext}`);
  }
});

// File filter (.ppt, .pptx, .pdf only)
const fileFilter = (req, file, cb) => {
  const allowedExts = ['.ppt', '.pptx', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid presentation file format. Only .ppt, .pptx, and .pdf files are accepted.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter
});

router.post('/upload', upload.single('ppt_file'), async (req, res) => {
  try {
    const { reg_id, project_title, summary, repo_link, demo_link } = req.body;

    if (!reg_id || !project_title || !summary) {
      return res.status(400).json({ success: false, message: 'Registration ID, Project Title, and Project Summary are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a PPT or PDF file to upload.' });
    }

    // Verify Team exists
    const team = await dbAdapter.getTeamByRegId(reg_id.trim());
    if (!team) {
      return res.status(404).json({ success: false, message: `No registered team found with Registration ID: "${reg_id}".` });
    }

    // CRITICAL SECURITY RULE: PPT Submission is strictly locked until payment is approved!
    if (team.status !== 'PAYMENT_APPROVED' && team.status !== 'PPT_SUBMITTED' && team.status !== 'UNDER_REVIEW' && team.status !== 'SHORTLISTED') {
      return res.status(403).json({
        success: false,
        message: `PPT submission is locked. Payment status for Team ${reg_id} is currently "${team.status.replace('_', ' ')}". Payment approval is required before uploading presentation files.`,
        locked: true
      });
    }

    const pptData = {
      team_id: team.id,
      project_title: project_title.trim(),
      summary: summary.trim(),
      file_url: `/uploads/${req.file.filename}`,
      original_filename: req.file.originalname,
      repo_link: repo_link ? repo_link.trim() : '',
      demo_link: demo_link ? demo_link.trim() : ''
    };

    const submission = await dbAdapter.upsertPptSubmission(pptData);

    return res.status(200).json({
      success: true,
      message: 'PPT pitch deck successfully submitted!',
      receipt: {
        receipt_id: `RCPT-${Date.now().toString(36).toUpperCase()}`,
        reg_id: team.reg_id,
        team_name: team.team_name,
        original_filename: req.file.originalname,
        file_size_bytes: req.file.size,
        version: submission.version,
        submitted_at: submission.updated_at || submission.submitted_at
      },
      submission
    });

  } catch (err) {
    console.error('PPT submission server error:', err);
    return res.status(400).json({ success: false, message: err.message || 'PPT submission failed.' });
  }
});

export default router;
