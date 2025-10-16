// server/src/routes/commentRoutes.js

const express = require('express');
const router = express.Router({ mergeParams: true });
// mergeParams lets us read :id from parent route (/feedback/:id)

const { addComment, listComments } = require('../controllers/commentController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// List thread for a feedback item (anyone for demo; could lock down later)
router.get('/', listComments);

// Add an internal comment (admin only)
router.post('/', requireAuth, requireAdmin, addComment);

module.exports = router;
