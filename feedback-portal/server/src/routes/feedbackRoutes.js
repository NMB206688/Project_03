// server/src/routes/feedbackRoutes.js

const express = require('express');
const router = express.Router();
const commentRoutes = require('./commentRoutes');


const { createFeedback, listFeedback, updateStatus } = require('../controllers/feedbackController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// Submit feedback (anonymous allowed):
// - If you include an Authorization header, we’ll link it to your user unless isAnonymous=true.
router.post('/', createFeedback);

// List feedback (anyone can view; admin sees creator on anonymous items)
router.get('/', listFeedback);

// Update status (admin only)
router.patch('/:id/status', requireAuth, requireAdmin, updateStatus);
// Nested routes: /api/v1/feedback/:id/comments
router.use('/:id/comments', commentRoutes);


module.exports = router;
