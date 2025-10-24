// server/src/middleware/auth.js
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

/**
 * Extract a Bearer token from the Authorization header.
 * Returns null if header is missing or malformed.
 */
function getBearerToken(req) {
  const auth = (req.headers.authorization || "").trim();
  if (!auth) return null;
  // Case-insensitive "Bearer " + token
  const [scheme, token] = auth.split(/\s+/);
  if (!scheme || !token) return null;
  if (scheme.toLowerCase() !== "bearer") return null;
  return token;
}

/**
 * Required auth: validates JWT and populates req.user.
 * 401 if token is missing or invalid.
 */
function authRequired(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // payload typically contains {_id, email, role, name?}
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * Optional auth: if a valid token is present, sets req.user; otherwise continues.
 * If a header is present but invalid, we still 401 (helps catch bad clients).
 */
function authOptional(req, res, next) {
  const token = getBearerToken(req);
  if (!token) return next();
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

/**
 * Admin guard: requires req.user.role === "admin".
 * Use after authRequired (or use ensureAdmin shortcut below).
 */
function adminOnly(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Missing token" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}

/**
 * Convenience composition for routes:
 *   router.patch(..., ensureAdmin, handler)
 */
const ensureAdmin = [authRequired, adminOnly];

// Named exports
module.exports = {
  authRequired,
  authOptional,
  adminOnly,
  ensureAdmin,

  // Friendly aliases (compat with earlier code styles)
  requireAuth: authRequired,
  requireAuthOptional: authOptional,
  requireAdmin: adminOnly,
  requireSuperAdmin: adminOnly, // same guard in this app
};
