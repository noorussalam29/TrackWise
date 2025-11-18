const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  type: { type: String },
  reason: { type: String },
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Leave', LeaveSchema);
