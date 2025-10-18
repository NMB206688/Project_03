const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_TTL = '4h';

exports.signToken = (user) =>
  jwt.sign(
    { sub: user.id || user._id?.toString(), role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_TTL }
  );

exports.verifyToken = (t) => jwt.verify(t, JWT_SECRET);
