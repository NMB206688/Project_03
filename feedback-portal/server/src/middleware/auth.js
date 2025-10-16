// server/src/middleware/auth.js

const jwt = require('jsonwebtoken');

/**
 * requireAuth:
 * - Expects header: Authorization: Bearer <JWT>
 * - Verifies token using JWT_SECRET
 * - Attaches { id, role } as req.user
 */
function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const secret = process.env.JWT_SECRET || 'change_this_dev_secret';
    const payload = jwt.verify(token, secret); // throws if invalid/expired

    // Minimal identity we pass downstream
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (e) {
    // Normalize all failures to 401; don’t leak details
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * requireAdmin:
 * - Must be used AFTER requireAuth
 * - Checks req.user.role === 'admin'
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: admin only' });
  }
  return next();
}

module.exports = { requireAuth, requireAdmin };
