const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  tasksCompleted: [String],
  hoursWorked: Number,
  challenges: String,
  planForTomorrow: String
}, { timestamps: true });

module.exports = mongoose.model('Report', ReportSchema);
