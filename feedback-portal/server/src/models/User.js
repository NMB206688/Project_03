// server/src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },

    // Do NOT return password by default; auth controller can use .select('+password')
    password: { type: String, required: true, select: false },

    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  },
  { timestamps: true }
);

// Helpful indexes
UserSchema.index({ createdAt: -1 });

// Hash password on create/change
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (e) {
    next(e);
  }
});

// Instance method to compare a plain password
UserSchema.methods.comparePassword = function(plain) {
  // when selected explicitly: doc.password is available
  return bcrypt.compare(plain, this.password);
};

// Clean API output
UserSchema.set('toJSON', {
  virtuals: false,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.password; // just in case it was selected
    return ret;
  }
});

module.exports = mongoose.model('User', UserSchema);
