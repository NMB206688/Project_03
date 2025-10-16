// server/src/models/Comment.js

const mongoose = require('mongoose');

// Each Comment belongs to one Feedback and is authored by a User (admin)
const CommentSchema = new mongoose.Schema(
  {
    feedbackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      required: true,                 // Comment must be tied to a feedback item
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,                 // We only allow authenticated admins to comment
      index: true,
    },
    body: {
      type: String,
      required: true,                 // The actual note
      trim: true,
      minlength: 1,
      maxlength: 4000,
    },
    // Optional lightweight visibility flag (kept for future):
    visibility: {
      type: String,
      enum: ['internal'],             // MVP = internal only
      default: 'internal',
    },
  },
  {
    timestamps: true,                  // createdAt/updatedAt for ordering & audits
  }
);

// Useful index for fetching a thread quickly and in order:
CommentSchema.index({ feedbackId: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = { Comment };
 