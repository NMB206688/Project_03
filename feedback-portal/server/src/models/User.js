// server/src/models/User.js

const mongoose = require('mongoose');        // ODM to define schema + model
const bcrypt = require('bcryptjs');          // For hashing & verifying passwords

// 1) Define the shape of a User document in MongoDB.
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,                        // We want a display name for UX and audit logs
      trim: true,                            // Removes extra spaces
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,                        // Email is login identifier
      unique: true,                          // Enforce uniqueness at DB level
      lowercase: true,                       // Normalize to avoid case issues
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email'], // Catch obvious mistakes
    },
    password: {
      type: String,
      required: true,                        // Stored as a hash (never plain text)
      minlength: 8,                          // Encourage stronger passwords
      select: false,                         // Exclude from queries by default (safety)
    },
    role: {
      type: String,
      enum: ['user', 'admin'],               // Minimal roles for MVP
      default: 'user',
    },
  },
  {
    timestamps: true,                        // Adds createdAt/updatedAt
  }
);

// 2) Pre-save hook: hash password if newly set or modified.
//    Why: Prevents storing plain-text passwords.
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();  // Skip if unchanged
  const salt = await bcrypt.genSalt(10);            // 10 rounds = good dev/prod tradeoff
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// 3) Instance method to verify a password during login.
UserSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// 4) Create the model. Collection name will be "users".
const User = mongoose.model('User', UserSchema);

module.exports = User;
