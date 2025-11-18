const Report = require('../models/Report')
const Attendance = require('../models/Attendance')
const Task = require('../models/Task')

exports.createDaily = async (req, res, next) => {
  try {
    const { tasksCompleted, hoursWorked, challenges, planForTomorrow } = req.body
    const today = new Date().toISOString().slice(0, 10)
    const report = await Report.create({ userId: req.user.id, date: new Date(today), tasksCompleted, hoursWorked, challenges, planForTomorrow })
    res.status(201).json(report)
  } catch (err) { next(err) }
}

exports.list = async (req, res, next) => {
  try {
    const { userId } = req.params
    const { from, to } = req.query
    const query = { userId }
    if (from || to) query.date = {}
    if (from) query.date.$gte = new Date(from)
    if (to) query.date.$lte = new Date(to)
    const reports = await Report.find(query).sort({ date: -1 })
    res.json(reports)
  } catch (err) { next(err) }
}

exports.overview = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const attendance = await Attendance.find({ date: new Date(today) })
    const present = attendance.filter(a => a.status === 'Present').length
    const absent = attendance.filter(a => a.status === 'Absent').length
    const avgHours = attendance.length > 0 ? (attendance.reduce((s, a) => s + (a.totalHours || 0), 0) / attendance.length).toFixed(2) : 0
    const pendingTasks = await Task.countDocuments({ status: { $ne: 'done' } })
    res.json({ present, absent, avgHours, pendingTasks, totalEmployees: attendance.length })
  } catch (err) { next(err) }
}

