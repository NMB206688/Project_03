const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    // selectable for login; controller will .select('+password')
    password: { type: String, required: true, select: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);
