const router = require('express').Router();
const { listComments, addComment } = require('../controllers/commentController');
const { requireAuth, requireAuthOptional } = require('../middleware/auth');

// list: must be authed and authorized by controller
router.get('/feedback/:id/comments', requireAuthOptional, listComments);

// add: must be authed (controller enforces finer rules)
router.post('/feedback/:id/comments', requireAuth, addComment);

module.exports = router;
