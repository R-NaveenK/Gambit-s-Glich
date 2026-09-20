import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'gambits_glitch_super_secret_jwt_key_2026_x89!';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gambitsglitch.tech';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin#glitch2026';

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  if (email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim() && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { email: ADMIN_EMAIL, role: 'ADMIN' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    return res.json({
      success: true,
      token,
      admin: { email: ADMIN_EMAIL, role: 'ADMIN' }
    });
  }

  return res.status(401).json({ success: false, message: 'Invalid admin credentials provided.' });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ authenticated: false });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ authenticated: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ authenticated: false });
  }
});

export default router;
