const User = require('../models/User')
const Attendance = require('../models/Attendance')
const Task = require('../models/Task')
const Leave = require('../models/Leave')

exports.overview = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10)
    const attendance = await Attendance.find({ date: new Date(today) })
    const present = attendance.filter(a => a.status === 'Present').length
    const absent = attendance.filter(a => a.status === 'Absent').length
    const avgHours = attendance.length > 0 ? (attendance.reduce((s, a) => s + (a.totalHours || 0), 0) / attendance.length).toFixed(2) : 0
    const pendingTasks = await Task.countDocuments({ status: { $ne: 'done' } })
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' })
    const totalEmployees = await User.countDocuments({ role: 'employee' })
    res.json({ present, absent, avgHours, pendingTasks, pendingLeaves, totalEmployees })
  } catch (err) { next(err) }
}

