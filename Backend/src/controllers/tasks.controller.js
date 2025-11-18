const Task = require('../models/Task')

exports.list = async (req, res, next) => {
  try {
    const { status, assignee, page = 1, limit = 10 } = req.query
    const query = {}
    if (status) query.status = status
    if (assignee) query.assignee = assignee
    const skip = (page - 1) * limit
    const tasks = await Task.find(query).populate('assignee assigner').skip(skip).limit(limit).sort({ createdAt: -1 })
    const total = await Task.countDocuments(query)
    res.json({ tasks, total, page, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

exports.get = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignee assigner comments.userId')
    if (!task) return res.status(404).json({ message: 'Task not found' })
    res.json(task)
  } catch (err) { next(err) }
}

exports.create = async (req, res, next) => {
  try {
    const { title, description, priority, status, assignee, dueDate } = req.body
    const task = await Task.create({ title, description, priority, status, assignee, assigner: req.user.id, dueDate })
    await task.populate('assignee assigner')
    res.status(201).json(task)
  } catch (err) { next(err) }
}

exports.update = async (req, res, next) => {
  try {
    const { title, description, priority, status, assignee, dueDate } = req.body
    const task = await Task.findByIdAndUpdate(req.params.id, { title, description, priority, status, assignee, dueDate }, { new: true }).populate('assignee assigner')
    res.json(task)
  } catch (err) { next(err) }
}

exports.delete = async (req, res, next) => {
  try {
    await Task.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (err) { next(err) }
}

exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body
    const task = await Task.findByIdAndUpdate(req.params.id, { $push: { comments: { userId: req.user.id, text } } }, { new: true }).populate('comments.userId')
    res.json(task)
  } catch (err) { next(err) }
}

