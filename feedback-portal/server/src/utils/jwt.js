// server/src/utils/jwt.js

const jwt = require('jsonwebtoken'); // Signs & verifies tokens

// Create a JWT for a user id + role.
// Why: single place to control token shape & expiry.
function signToken(payload, options = {}) {
  const secret = process.env.JWT_SECRET || 'change_this_dev_secret';
  // 1h expiry for MVP; we’ll add refresh tokens later if needed.
  return jwt.sign(payload, secret, { expiresIn: '1h', ...options });
}

function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'change_this_dev_secret';
  return jwt.verify(token, secret);
}

module.exports = { signToken, verifyToken };
