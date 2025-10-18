const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const SUPER = (process.env.SUPERADMIN_EMAIL || '').toLowerCase();

exports.register = async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const password = (req.body.password || '').trim();

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email, and password are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const role = email === SUPER ? 'admin' : 'user';
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hash, role });
    const token = signToken(user);

    return res.status(201).json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      token,
    });
  } catch (err) {
    console.error('register error:', err);
    // Handle duplicate key just in case
    if (err?.code === 11000) return res.status(400).json({ error: 'Email already registered' });
    return res.status(500).json({ error: 'Failed to register' });
  }
};

exports.login = async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = (req.body.password || '').trim();

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
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

exports.me = async (req, res) => {
  return res.json({ user: req.user || null });
};

exports.adminPing = async (req, res) => {
  return res.json({ ok: true, msg: 'admin access confirmed' });
};
