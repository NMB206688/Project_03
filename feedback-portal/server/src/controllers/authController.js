const User = require('../models/User');
const { signToken } = require('../utils/jwt');

const SUPER = (process.env.SUPERADMIN_EMAIL || '').toLowerCase();

/**
 * POST /api/v1/auth/register
 */
exports.register = async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = (req.body.password || '').trim();

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const exists = await User.findOne({ email }).lean();
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    // role: auto-admin if matches SUPERADMIN_EMAIL
    const role = email === SUPER ? 'admin' : 'user';

    // IMPORTANT: pass the raw password — User model will hash it in the pre('save') hook
    const user = await User.create({ name, email, password, role });

    const token = signToken(user); // typically encodes { _id, email, role, name }
    return res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error('register error:', err);
    if (err?.code === 11000) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    return res.status(500).json({ error: 'Failed to register' });
  }
};

/**
 * POST /api/v1/auth/login
 */
exports.login = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = (req.body.password || '').trim();

    // Need '+password' because schema has select: false for security
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Use schema helper
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    return res.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ error: 'Failed to login' });
  }
};

/**
 * GET /api/v1/auth/me
 */
exports.me = async (req, res) => {
  return res.json({ user: req.user || null });
};

/**
 * GET /api/v1/auth/admin-ping
 */
exports.adminPing = async (req, res) => {
  return res.json({ ok: true, msg: 'admin access confirmed' });
};
