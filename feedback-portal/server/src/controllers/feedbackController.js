const Feedback = require('../models/Feedback');

exports.createFeedback = async (req, res) => {
  try {
    const { title, body, category = 'other', isAnonymous = true } = req.body;
    if (!title?.trim() || !body?.trim()) return res.status(400).json({ error: 'Title and details are required' });

    const createdBy = isAnonymous ? null : (req.user?.id || null);
    const doc = await Feedback.create({ title: title.trim(), body: body.trim(), category, isAnonymous, createdBy });

    return res.status(201).json({ feedback: serialize(doc) });
  } catch (err) {
    console.error('createFeedback error:', err);
    return res.status(500).json({ error: 'Could not create feedback' });
  }
};

/**
 * List feedback.
 * - Admin: all feedback.
 * - Authenticated user: their own feedback only.
 * - Not authed: empty set by default (you can relax if you want).
 */
exports.listFeedback = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '8', 10)));
    const skip = (page - 1) * limit;

    const sort = req.query.sort || '-createdAt';
    const status = req.query.status || undefined; // open/in_review/resolved
    const category = req.query.category || undefined; // bug/...
    const q = req.query.q?.trim();

    const filter = {};
    if (status) filter.status = status;
    if (category && category !== 'all') filter.category = category;

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { body:  { $regex: q, $options: 'i' } },
      ];
    }

    // Role-based visibility
    if (!req.user) {
      // unauthenticated: no listing (or show nothing)
      filter._id = { $in: [] };
    } else if (req.user.role !== 'admin') {
      filter.createdBy = req.user.id;
    }

    const [total, docs] = await Promise.all([
      Feedback.countDocuments(filter),
      Feedback.find(filter).sort(sort).skip(skip).limit(limit),
    ]);

    return res.json({
      page, limit, total,
      results: docs.map(serialize),
    });
  } catch (err) {
    console.error('listFeedback error:', err);
    return res.status(500).json({ error: 'Could not list feedback' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    if (!['open','in_review','resolved'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const doc = await Feedback.findByIdAndUpdate(id, { status }, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });

    return res.json({ feedback: serialize(doc) });
  } catch (err) {
    console.error('updateStatus error:', err);
    return res.status(500).json({ error: 'Could not update status' });
  }
};

function serialize(f) {
  return {
    id: f.id,
    title: f.title,
    body: f.body,
    category: f.category,
    status: f.status,
    isAnonymous: f.isAnonymous,
    createdBy: f.createdBy,
    assignedTo: f.assignedTo,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
  };
}
