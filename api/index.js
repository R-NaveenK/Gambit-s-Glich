import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

import { dbAdapter } from '../server/db/dbAdapter.js';
import authRoutes from '../server/routes/authRoutes.js';
import registrationRoutes from '../server/routes/registrationRoutes.js';
import paymentRoutes from '../server/routes/paymentRoutes.js';
import pptRoutes from '../server/routes/pptRoutes.js';
import statusRoutes from '../server/routes/statusRoutes.js';
import adminRoutes from '../server/routes/adminRoutes.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});

app.use('/api/', apiLimiter);

// Serve uploaded files dynamically from /tmp, ./uploads, or Base64 DB store
const serveUploadFile = async (req, res) => {
  const filename = path.basename(req.params.filename);
  const tmpPath = path.join('/tmp', filename);
  const localPath = path.join(process.cwd(), 'uploads', filename);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

  const isDownload = req.query.download === 'true' || req.query.download === '1';

  if (fs.existsSync(tmpPath)) {
    if (isDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    }
    return res.sendFile(tmpPath);
  } else if (fs.existsSync(localPath)) {
    if (isDownload) {
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    }
    return res.sendFile(localPath);
  }

  try {
    const record = await dbAdapter.getFileByFilename(filename);
    if (record && record.file_data) {
      const matches = record.file_data.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const originalName = record.original_filename || filename;

        res.setHeader('Content-Type', mimeType);
        res.setHeader(
          'Content-Disposition',
          `${isDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(originalName)}"`
        );
        return res.send(buffer);
      }
    }
  } catch (err) {
    console.error("Error serving uploaded file from DB:", err);
  }

  return res.status(404).send('Uploaded file not found.');
};

app.get('/uploads/:filename', serveUploadFile);
app.get('/api/uploads/:filename', serveUploadFile);

app.use('/api/auth', authRoutes);
app.use('/api/register', registrationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/ppt', pptRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: "GAMBIT'S GLITCH Engine",
    timestamp: new Date().toISOString()
  });
});

export default app;
