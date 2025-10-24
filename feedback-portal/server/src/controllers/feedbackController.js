// server/src/controllers/feedbackController.js
const Feedback = require("../models/Feedback");

const ALLOWED_STATUS = ["open", "in_review", "resolved"];
const ALLOWED_CATEGORY = ["bug", "feature", "ux", "process", "other"];

// Utility: pick user id from token payload
function userId(req) {
  return req.user?._id || req.user?.id || null;
}

exports.createFeedback = async (req, res) => {
  try {
    const {
      title,
      body,
      category = "other",
      isAnonymous = true,
    } = req.body || {};

    if (!title?.trim() || !body?.trim()) {
      return res
        .status(400)
        .json({ error: "Title and details are required" });
    }

    const catNorm = ALLOWED_CATEGORY.includes(String(category))
      ? String(category)
      : "other";

    // If not anonymous, require auth (so createdBy is valid)
    if (!isAnonymous && !userId(req)) {
      return res
        .status(401)
        .json({ error: "Login required to submit non-anonymously" });
    }

    const createdBy = isAnonymous ? null : userId(req);

    const doc = await Feedback.create({
      title: title.trim(),
      body: body.trim(),
      category: catNorm,
      isAnonymous: !!isAnonymous,
      createdBy,
    });

    return res.status(201).json({ feedback: serialize(doc) });
  } catch (err) {
    console.error("createFeedback error:", err);
    return res.status(500).json({ error: "Could not create feedback" });
  }
};

/**
 * List feedback.
 * - Admin: all feedback.
 * - Authenticated user: their own feedback only.
 * - Not authed: empty set by default.
 */
exports.listFeedback = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "8", 10)));
    const skip = (page - 1) * limit;

    const rawSort = String(req.query.sort || "-createdAt");
    // Allow only these fields (prefix "-" allowed for desc)
    const SORT_FIELDS = ["createdAt", "updatedAt", "category", "status", "title"];
    const sortField = rawSort.replace(/^-/, "");
    const sortAllowed = SORT_FIELDS.includes(sortField);
    const sort = sortAllowed ? rawSort : "-createdAt";

    const status = req.query.status || undefined; // open/in_review/resolved
    const category = req.query.category || undefined; // bug/feature/...
    const q = req.query.q?.trim();

    const filter = {};
    if (status && ALLOWED_STATUS.includes(status)) filter.status = status;
    if (category && category !== "all" && ALLOWED_CATEGORY.includes(category)) {
      filter.category = category;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { body: { $regex: q, $options: "i" } },
      ];
    }

    // Role-based visibility
    if (!req.user) {
      // unauthenticated: nothing by default
      filter._id = { $in: [] };
    } else if (req.user.role !== "admin") {
      filter.createdBy = userId(req);
    }

    const [total, docs] = await Promise.all([
      Feedback.countDocuments(filter),
      Feedback.find(filter).sort(sort).skip(skip).limit(limit),
    ]);

    return res.json({
      page,
      limit,
      total,
      results: docs.map(serialize),
    });
  } catch (err) {
    console.error("listFeedback error:", err);
    return res.status(500).json({ error: "Could not list feedback" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body || {};

    if (!ALLOWED_STATUS.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const doc = await Feedback.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!doc) return res.status(404).json({ error: "Not found" });

    return res.json({ feedback: serialize(doc) });
  } catch (err) {
    console.error("updateStatus error:", err);
    return res.status(500).json({ error: "Could not update status" });
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
