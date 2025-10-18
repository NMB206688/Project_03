const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body:  { type: String, required: true, trim: true },
    category: { type: String, enum: ['bug','feature','ux','process','other'], default: 'other', index: true },
    status: { type: String, enum: ['open','in_review','resolved'], default: 'open', index: true },
    isAnonymous: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true }, // null if anonymous
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Feedback', FeedbackSchema);
