const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    feedbackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback', required: true, index: true },
    author:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    body:       { type: String, required: true, trim: true },
    authorRole: { type: String, enum: ['user','admin'], required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', CommentSchema);
