// server/src/controllers/feedbackController.js

const mongoose = require('mongoose');
const { Feedback, FEEDBACK_STATUS, FEEDBACK_CATEGORIES } = require('../models/Feedback');

/**
 * POST /api/v1/feedback
 * Body: { title, body, category?, isAnonymous? }
 * - If authenticated, we attach createdBy unless isAnonymous=true
 * - Anonymous submissions are allowed (no token required)
 */
async function createFeedback(req, res) {
  try {
    const { title, body, category = 'other', isAnonymous = false } = req.body || {};

    // Basic validation (lightweight for MVP)
    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required' });
    }
    if (!FEEDBACK_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: `category must be one of: ${FEEDBACK_CATEGORIES.join(', ')}` });
    }

    const doc = await Feedback.create({
      title: String(title).trim(),
      body: String(body).trim(),
      category,
      isAnonymous: !!isAnonymous,
      createdBy: isAnonymous ? undefined : req.user?.id, // attach if logged-in & not anonymous
    });

    // Hide creator if anonymous
    const safe = {
      id: doc._id,
      title: doc.title,
      body: doc.body,
      category: doc.category,
      status: doc.status,
      isAnonymous: doc.isAnonymous,
      createdBy: doc.isAnonymous ? null : doc.createdBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };

    return res.status(201).json({ feedback: safe });
  } catch (e) {
    console.error('createFeedback error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/v1/feedback
 * Query (optional):
 *   - page (default 1), limit (default 10)
 *   - status (open|in_review|resolved)
 *   - category (bug|feature|ux|process|other)
 *   - q (text search in title/body)
 *   - sort (createdAt, -createdAt, status, category)
 */
async function listFeedback(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const skip = (page - 1) * limit;

    // Build filters
    const filter = {};
    if (req.query.status && FEEDBACK_STATUS.includes(req.query.status)) {
      filter.status = req.query.status;
    }
    if (req.query.category && FEEDBACK_CATEGORIES.includes(req.query.category)) {
      filter.category = req.query.category;
    }
    if (req.query.q) {
      const q = String(req.query.q).trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { body: { $regex: q, $options: 'i' } },
      ];
    }

    // Sort handling
    const sortParam = String(req.query.sort || '-createdAt');
    const sort = {};
    if (sortParam.startsWith('-')) {
      sort[sortParam.substring(1)] = -1;
    } else {
      sort[sortParam] = 1;
    }

    const [items, total] = await Promise.all([
      Feedback.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Feedback.countDocuments(filter),
    ]);

    // Redact creator if anonymous and caller is not admin
    const isAdmin = req.user?.role === 'admin';
    const data = items.map((doc) => ({
      id: doc._id,
      title: doc.title,
      body: doc.body,
      category: doc.category,
      status: doc.status,
      isAnonymous: !!doc.isAnonymous,
      createdBy: doc.isAnonymous && !isAdmin ? null : doc.createdBy,
      assignedTo: doc.assignedTo || null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return res.json({
      page,
      limit,
      total,
      results: data,
    });
  } catch (e) {
    console.error('listFeedback error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * PATCH /api/v1/feedback/:id/status
 * Body: { status } where status ∈ FEEDBACK_STATUS
 * - Admin only (enforced by middleware on route)
 */
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    if (!FEEDBACK_STATUS.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${FEEDBACK_STATUS.join(', ')}` });
    }

    const doc = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).lean();

    if (!doc) return res.status(404).json({ error: 'Feedback not found' });

    const isAdmin = req.user?.role === 'admin';
    return res.json({
      feedback: {
        id: doc._id,
        title: doc.title,
        body: doc.body,
        category: doc.category,
        status: doc.status,
        isAnonymous: !!doc.isAnonymous,
        createdBy: doc.isAnonymous && !isAdmin ? null : doc.createdBy,
        assignedTo: doc.assignedTo || null,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      },
    });
  } catch (e) {
    console.error('updateStatus error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createFeedback, listFeedback, updateStatus };
