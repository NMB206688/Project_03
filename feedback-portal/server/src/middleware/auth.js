const { verifyToken } = require('../utils/jwt');
const SUPER = (process.env.SUPERADMIN_EMAIL || '').toLowerCase();

function attachUserFromAuthHeader(req) {
  const auth = req.headers.authorization || '';
  const [scheme, token] = auth.split(' ');
  if (scheme === 'Bearer' && token) {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role, email: (payload.email||'').toLowerCase() };
  }
}

function requireAuth(req, res, next) {
  try { attachUserFromAuthHeader(req);
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    next();
  } catch { return res.status(401).json({ error: 'Unauthorized' }); }
}

function requireAuthOptional(req, _res, next) {
  try { attachUserFromAuthHeader(req); } catch {}
  next();
}

function requireSuperAdmin(req, res, next) {
  try { attachUserFromAuthHeader(req);
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!SUPER || req.user.email !== SUPER) return res.status(403).json({ error: 'Forbidden' });
    next();
  } catch { return res.status(401).json({ error: 'Unauthorized' }); }
}

module.exports = { requireAuth, requireAuthOptional, requireSuperAdmin };
