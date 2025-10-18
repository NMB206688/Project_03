const Comment = require('../models/Comment');
const Feedback = require('../models/Feedback');

/**
 * Anyone who can see the feedback can see the comments for that feedback.
 * - Admin: any feedback
 * - User: only their own feedback
 */
exports.listComments = async (req, res) => {
  try {
    const id = req.params.id;
    const fb = await Feedback.findById(id);
    if (!fb) return res.status(404).json({ error: 'Feedback not found' });

    // Visibility gate
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== 'admin' && String(fb.createdBy) !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const comments = await Comment.find({ feedbackId: id }).sort('createdAt');
    return res.json({
      results: comments.map(c => ({
        id: c.id, feedbackId: c.feedbackId, author: c.author, body: c.body,
        authorRole: c.authorRole, createdAt: c.createdAt, updatedAt: c.updatedAt
      }))
    });
  } catch (err) {
    console.error('listComments error:', err);
    return res.status(500).json({ error: 'Could not fetch comments' });
  }
};

/**
 * Add comment:
 * - Admin: can always comment on any feedback.
 * - User: can comment only on their own feedback AND only if
 *   at least one admin comment exists AND the last comment is not by the user
 *   (prevents double-posting by user).
 */
exports.addComment = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const id = req.params.id;
    const body = (req.body.body || '').trim();
    if (!body) return res.status(400).json({ error: 'Comment cannot be empty' });

    const fb = await Feedback.findById(id);
    if (!fb) return res.status(404).json({ error: 'Feedback not found' });

    if (req.user.role === 'admin') {
      const created = await Comment.create({
        feedbackId: id, author: req.user.id, authorRole: 'admin', body
      });
      return res.status(201).json({ comment: serialize(created) });
    }

    // user flow — only their own feedback
    if (String(fb.createdBy) !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const comments = await Comment.find({ feedbackId: id }).sort('createdAt');
    const hasAdmin = comments.some(c => c.authorRole === 'admin');
    if (!hasAdmin) return res.status(400).json({ error: 'You can reply after an admin responds.' });

    const last = comments[comments.length - 1];
    if (last && String(last.author) === req.user.id) {
      return res.status(400).json({ error: 'Wait for admin reply before posting again.' });
    }

    const created = await Comment.create({
      feedbackId: id, author: req.user.id, authorRole: 'user', body
    });
    return res.status(201).json({ comment: serialize(created) });
  } catch (err) {
    console.error('addComment error:', err);
    return res.status(500).json({ error: 'Could not add comment' });
  }
};

function serialize(c) {
  return {
    id: c.id, feedbackId: c.feedbackId, author: c.author,
    authorRole: c.authorRole, body: c.body, createdAt: c.createdAt, updatedAt: c.updatedAt
  };
}
