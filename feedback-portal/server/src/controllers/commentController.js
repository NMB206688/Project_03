// server/src/controllers/commentController.js

const mongoose = require('mongoose');
const { Comment } = require('../models/Comment');
const { Feedback } = require('../models/Feedback');

/**
 * POST /api/v1/feedback/:id/comments
 * Body: { body }
 * Admin only (middleware enforces)
 */
async function addComment(req, res) {
  try {
    const { id } = req.params;
    const { body } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid feedback id' });
    }
    if (!body || String(body).trim().length === 0) {
      return res.status(400).json({ error: 'Comment body is required' });
    }

    // Ensure feedback exists (avoid orphan comments)
    const exists = await Feedback.exists({ _id: id });
    if (!exists) return res.status(404).json({ error: 'Feedback not found' });

    const doc = await Comment.create({
      feedbackId: id,
      author: req.user.id,     // set by requireAuth
      body: String(body).trim(),
      visibility: 'internal',  // MVP: internal only
    });

    res.status(201).json({
      comment: {
        id: doc._id,
        feedbackId: doc.feedbackId,
        author: doc.author,
        body: doc.body,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (e) {
    console.error('addComment error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/v1/feedback/:id/comments
 * Anyone can fetch the thread (still internal for MVP; fine for demo)
 */
async function listComments(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid feedback id' });
    }

    // Return newest first (matches our index)
    const items = await Comment.find({ feedbackId: id })
      .sort({ createdAt: -1 })
      .lean();

    const results = items.map((c) => ({
      id: c._id,
      feedbackId: c.feedbackId,
      author: c.author,      // could populate later
      body: c.body,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    res.json({ results, total: results.length });
  } catch (e) {
    console.error('listComments error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { addComment, listComments };
