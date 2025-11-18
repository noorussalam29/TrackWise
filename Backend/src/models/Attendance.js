const mongoose = require('mongoose');

const PunchSchema = new mongoose.Schema({
  type: { type: String, enum: ['in', 'out'], required: true },
  time: { type: Date, required: true }
});

const AttendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  punches: [PunchSchema],
  totalHours: { type: Number, default: 0 },
  breakMinutes: { type: Number, default: 0 },
  status: { type: String, enum: ['Present', 'Absent', 'Leave', 'Half Day', 'Holiday'], default: 'Present' },
  note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
