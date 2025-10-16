// server/src/models/Feedback.js

const mongoose = require('mongoose');

// 1) Enumerations keep values consistent across UI / DB / code.
const FEEDBACK_STATUS = ['open', 'in_review', 'resolved'];
const FEEDBACK_CATEGORIES = [
  'bug',
  'feature',
  'ux',
  'process',
  'other',
];

// 2) Schema describes one Feedback document in MongoDB.
const FeedbackSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,               // Always need a short summary
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    body: {
      type: String,
      required: true,               // The detailed suggestion/issue
      trim: true,
      minlength: 5,
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: FEEDBACK_CATEGORIES,    // Helps filtering & analytics
      default: 'other',
      index: true,                  // We’ll commonly filter by this
    },
    status: {
      type: String,
      enum: FEEDBACK_STATUS,        // Enforce allowed workflow states
      default: 'open',
      index: true,                  // We’ll list by status often
    },
    isAnonymous: {
      type: Boolean,                // If true, don’t expose creator identity to UI
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',                  // Who submitted it (may be hidden if isAnonymous)
      required: false,              // Anonymous submissions will omit this
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',                  // Optional: admin/reviewer who owns it
      required: false,
    },
    // Light metadata for future expansion (e.g., campus, dept, priority)
    meta: {
      type: Map,
      of: String,
      default: undefined,
    },
  },
  {
    timestamps: true,               // Adds createdAt/updatedAt for sorting & audits
  }
);

// 3) Helpful combined index for admin views (status + category + time).
FeedbackSchema.index({ status: 1, category: 1, createdAt: -1 });

// 4) Export the model.
//    Mongo collection name will be "feedback" (lowercased pluralized automatically).
const Feedback = mongoose.model('Feedback', FeedbackSchema);

module.exports = { Feedback, FEEDBACK_STATUS, FEEDBACK_CATEGORIES };
