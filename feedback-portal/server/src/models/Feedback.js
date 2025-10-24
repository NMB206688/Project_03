// server/src/models/Feedback.js
const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    body:        { type: String, required: true, trim: true },
    category:    { type: String, enum: ['bug','feature','ux','process','other'], default: 'other', index: true },
    status:      { type: String, enum: ['open','in_review','resolved'], default: 'open', index: true },
    isAnonymous: { type: Boolean, default: true },
    createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true }, // null if anonymous
    assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

// Useful indexes for list/search patterns
FeedbackSchema.index({ createdAt: -1 });
FeedbackSchema.index({ status: 1, createdAt: -1 });
FeedbackSchema.index({ category: 1, createdAt: -1 });

// Light text index to speed up q= searches (regex fallback still works if you don’t use $text)
FeedbackSchema.index({ title: 'text', body: 'text' });

// Clean API output
FeedbackSchema.set('toJSON', {
  virtuals: false,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
