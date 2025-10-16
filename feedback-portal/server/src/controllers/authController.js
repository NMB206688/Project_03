// server/src/controllers/authController.js

const User = require('../models/User');       // Our Mongoose model
const { signToken } = require('../utils/jwt');

// Helper: basic field checks (keeps controller tidy)
function requireFields(obj, fields) {
  for (const f of fields) {
    if (!obj[f] || String(obj[f]).trim() === '') {
      return `Missing or empty field: ${f}`;
    }
  }
  return null;
}

// POST /api/v1/auth/register
// Body: { name, email, password, role? }
// Why: creates a user, hashes password via model hook, returns a JWT.
async function register(req, res) {
  try {
    // 1) Validate body quickly (lightweight MVP validation).
    const err = requireFields(req.body, ['name', 'email', 'password']);
    if (err) return res.status(400).json({ error: err });

    const { name, email, password, role } = req.body;

    // 2) Create user (password hashing happens in User pre-save hook).
    const user = await User.create({ name, email, password, role });

    // 3) Sign JWT containing minimal claims (sub=id, role).
    const token = signToken({ sub: user._id.toString(), role: user.role });

    // 4) Return safe user info (never include password).
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (e) {
    // Handle duplicate email cleanly (Mongo duplicate key error)
    if (e.code === 11000 && e.keyPattern?.email) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('register error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/v1/auth/login
// Body: { email, password }
// Why: verifies credentials then returns a JWT.
async function login(req, res) {
  try {
    const err = requireFields(req.body, ['email', 'password']);
    if (err) return res.status(400).json({ error: err });

    const { email, password } = req.body;

    // 1) Find user and explicitly include password (it’s select:false in schema).
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    // 2) Compare password using the model method.
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    // 3) Sign token with id + role.
    const token = signToken({ sub: user._id.toString(), role: user.role });

    // 4) Return safe user profile + token.
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (e) {
    console.error('login error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { register, login };
