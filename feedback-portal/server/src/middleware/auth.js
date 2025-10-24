// server/src/middlewares/auth.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

/**
 * Extract a Bearer token from Authorization header.
 */
function getBearer(req) {
  const auth = req.headers.authorization || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

/**
 * Required auth: 401 if token is missing/invalid.
 */
function authRequired(req, res, next) {
  const token = getBearer(req);
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET); // e.g. { _id, email, role }
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * Optional auth: attach req.user if valid token, otherwise continue as guest.
 * Never throws 401 here; that’s for authRequired.
 */
function authOptional(req, res, next) {
  const token = getBearer(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
  } catch {
    // ignore invalid token for optional auth
  }
  return next();
}

/**
 * Admin only: requires req.user.role === "admin".
 */
function adminOnly(req, res, next) {
  if (!req.user) return res.status(401).json({ error: "Missing token" });
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  return next();
}

module.exports = {
  authRequired,
  authOptional,
  adminOnly,

  // Backward-compatible aliases (if some files still import older names)
  requireAuth: authRequired,
  requireAuthOptional: authOptional,
  requireSuperAdmin: adminOnly,
};
