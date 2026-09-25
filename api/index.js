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
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Accept-Ranges', 'bytes');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp'
  };

  const isDownload = req.query.download === 'true' || req.query.download === '1';

  let filePath = null;
  if (fs.existsSync(tmpPath)) {
    filePath = tmpPath;
  } else if (fs.existsSync(localPath)) {
    filePath = localPath;
  }

  if (filePath) {
    try {
      const stat = fs.statSync(filePath);
      const mimeType = mimeTypes[ext] || 'application/octet-stream';

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', stat.size);
      res.setHeader(
        'Content-Disposition',
        `${isDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(filename)}"`
      );

      if (req.method === 'HEAD') {
        return res.status(200).end();
      }
      return res.sendFile(filePath);
    } catch (e) {
      console.warn("Error reading disk file:", e);
    }
  }

  try {
    const record = await dbAdapter.getFileByFilename(filename);
    if (record && record.file_data) {
      const matches = record.file_data.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const mimeType = mimeTypes[ext] || matches[1] || 'application/octet-stream';
        const buffer = Buffer.from(matches[2], 'base64');
        const originalName = record.original_filename || filename;

        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Length', buffer.length);
        res.setHeader(
          'Content-Disposition',
          `${isDownload ? 'attachment' : 'inline'}; filename="${encodeURIComponent(originalName)}"`
        );

        if (req.method === 'HEAD') {
          return res.status(200).end();
        }
        return res.send(buffer);
      }
    }
  } catch (err) {
    console.error("Error serving uploaded file from DB:", err);
  }

  return res.status(404).send('Uploaded file not found.');
};

app.all('/uploads/:filename', serveUploadFile);
app.all('/api/uploads/:filename', serveUploadFile);

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
