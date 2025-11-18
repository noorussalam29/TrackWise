const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: String,
  createdAt: { type: Date, default: Date.now }
});

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
  status: { type: String, enum: ['todo','in-progress','done','blocked'], default: 'todo' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assigner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dueDate: Date,
  attachments: [String],
  comments: [CommentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);
