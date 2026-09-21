import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import pptRoutes from './routes/pptRoutes.js';
import statusRoutes from './routes/statusRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy headers on Render.com / Heroku for rate-limiting
app.set('trust proxy', 1);

// Security & Middleware Configuration
app.use(helmet({
  contentSecurityPolicy: false, // Disabled for local dev & Vite inline styles/scripts compatibility
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter for authentication & submission APIs
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: { success: false, message: 'Too many requests from this IP, please try again later.' }
});

app.use('/api/', apiLimiter);

// Serve uploads static folder
const uploadDir = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

// Also serve public assets if needed
const publicDir = path.join(__dirname, '../public');
app.use('/assets', express.static(publicDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/register', registrationRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/ppt', pptRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: "GAMBIT'S GLITCH Engine",
    timestamp: new Date().toISOString()
  });
});

// Serve frontend dist build in production mode
const distDir = path.join(__dirname, '../dist');
app.use(express.static(distDir));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found.' });
  }
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>GAMBIT'S GLITCH Engine</title></head>
        <body style="background:#050505;color:#C7FF18;font-family:monospace;padding:40px;">
          <h1>⚡ GAMBIT'S GLITCH API SERVER RUNNING</h1>
          <p>Status: ONLINE | Port: ${PORT}</p>
          <p>Please run <code>npm run dev</code> for Vite frontend client development.</p>
        </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`⚡ GAMBIT'S GLITCH API Engine listening on port ${PORT}`);
  console.log(`⚡ Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`==================================================\n`);
});
