const router = require('express').Router();
const { createFeedback, listFeedback, updateStatus } = require('../controllers/feedbackController');
const { requireAuth, requireAuthOptional, requireSuperAdmin } = require('../middleware/auth');

// Create: allowed for everyone; if logged in and not anonymous, we attach createdBy
router.post('/', requireAuthOptional, createFeedback);

// List: role-based visibility handled in controller; optional auth for UX
router.get('/', requireAuthOptional, listFeedback);

// Status change: admin only
router.patch('/:id/status', requireSuperAdmin, updateStatus);

module.exports = router;
