const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_TTL = '4h';

/**
 * Create a JWT that includes fields your controllers expect.
 * - sub: standard subject claim
 * - id:  convenience so req.user.id exists after verify()
 * - role, email, name: used in admin checks / UI labels
 */
exports.signToken = (user) => {
  const id = user.id || user._id?.toString();
  return jwt.sign(
    {
      sub: id,
      id,
      role: user.role,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_TTL }
  );
};

exports.verifyToken = (t) => jwt.verify(t, JWT_SECRET);
