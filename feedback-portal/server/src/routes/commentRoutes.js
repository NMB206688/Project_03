// server/src/routes/commentRoutes.js
const router = require("express").Router();
const { listComments, addComment } = require("../controllers/commentController");
const { authRequired, adminOnly } = require("../middleware/auth");

// Anyone can read the thread for a feedback item
// (If you ever want the server to know who is reading, swap to an authOptional middleware.)
router.get("/feedback/:id/comments", listComments);

// Admins can add internal notes/comments
router.post("/feedback/:id/comments", authRequired, adminOnly, addComment);

module.exports = router;
