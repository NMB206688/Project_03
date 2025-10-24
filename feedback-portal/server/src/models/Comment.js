// server/src/models/Comment.js
const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    // Match controller: field name is "feedback"
    feedback: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Feedback",
      required: true,
      index: true,
    },

    body: { type: String, required: true, trim: true },

    // Match controller: nested author object with id/name/role
    author: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },
      name: { type: String, trim: true },
      role: {
        type: String,
        enum: ["user", "admin"],
        required: true,
        index: true,
      },
    },
  },
  { timestamps: true }
);

// Helpful indexes for your typical queries/sorts
CommentSchema.index({ feedback: 1, createdAt: 1 });

/** Clean JSON output (optional) */
CommentSchema.set("toJSON", {
  virtuals: false,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Comment", CommentSchema);
