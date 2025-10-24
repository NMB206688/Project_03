// server/src/controllers/commentController.js
const Comment = require("../models/Comment");
const Feedback = require("../models/Feedback");

// helper: normalize user id from token
function userId(req) {
  return req.user?._id || req.user?.id || null;
}

// GET /api/v1/feedback/:id/comments
// Public read (your route can still apply authOptional if you prefer)
exports.listComments = async (req, res, next) => {
  try {
    const { id } = req.params; // feedback id
    // Oldest first so the thread reads top→down
    const docs = await Comment.find({ feedback: id })
      .sort({ createdAt: 1 })
      .lean();

    res.json({
      results: docs.map(mapComment),
    });
  } catch (e) {
    next(e);
  }
};

// POST /api/v1/feedback/:id/comments
// Admin-only: enforce via route middleware (authRequired + adminOnly OR ensureAdmin)
exports.addComment = async (req, res, next) => {
  try {
    const { id } = req.params; // feedback id
    const { body } = req.body || {};

    if (!body || !body.trim()) {
      return res.status(400).json({ error: "Comment body required" });
    }

    // Ensure the feedback exists
    const fb = await Feedback.findById(id).lean();
    if (!fb) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    // Author info from authenticated user (middleware guarantees req.user)
    const uid = userId(req);
    if (!uid) {
      // Shouldn't happen if route uses authRequired/adminOnly, but be explicit.
      return res.status(401).json({ error: "Login required" });
    }

    const doc = await Comment.create({
      feedback: id,
      body: body.trim(),
      author: {
        id: uid,
        name: req.user?.name || req.user?.email || "Admin",
        role: req.user?.role || "admin",
      },
    });

    return res.status(201).json({ comment: mapComment(doc) });
  } catch (e) {
    next(e);
  }
};

function mapComment(c) {
  // c may be a doc or a lean object; access safely
  return {
    id: String(c._id),
    feedback: String(c.feedback),
    body: c.body,
    author: c.author,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}
