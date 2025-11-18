const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' },
  department: { type: String },
  position: { type: String },
  avatarUrl: { type: String },
  timezone: { type: String },
  workStart: { type: String },
  workEnd: { type: String },
  refreshTokens: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
