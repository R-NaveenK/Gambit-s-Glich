import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

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
