const router = require('express').Router();
const { register, login, me, adminPing } = require('../controllers/authController');
const { requireAuth, requireSuperAdmin } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.get('/admin/ping', requireSuperAdmin, adminPing);

module.exports = router;
