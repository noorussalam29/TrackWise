const Attendance = require('../models/Attendance');
const calculateHours = require('../utils/calculateHours');

exports.punch = async (req, res, next) => {
  try {
    const { type } = req.body; // 'in' or 'out'
    const userId = req.user.id;
    const dateOnly = new Date().toISOString().slice(0,10);

    let attendance = await Attendance.findOne({ userId, date: new Date(dateOnly) });
    if (!attendance) {
      attendance = await Attendance.create({ userId, date: new Date(dateOnly), punches: [] });
    }

    const lastPunch = attendance.punches[attendance.punches.length - 1];
    if (lastPunch && lastPunch.type === type) {
      return res.status(400).json({ message: 'Double punch not allowed' });
    }

    attendance.punches.push({ type, time: new Date() });
    attendance.totalHours = calculateHours(attendance.punches);
    await attendance.save();
    res.json(attendance);
  } catch (err) { next(err); }
};

exports.me = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;
    const query = { userId };
    if (from || to) query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
    const rows = await Attendance.find(query).sort({ date: -1 });
    res.json(rows);
  } catch (err) { next(err); }
};

exports.forUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { from, to } = req.query;
    const query = { userId };
    if (from || to) query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
    const rows = await Attendance.find(query).sort({ date: -1 });
    res.json(rows);
  } catch (err) { next(err); }
};

exports.manual = async (req, res, next) => {
  try {
    // Admin-only: create or correct attendance
    const { userId, date, punches, totalHours, status, note } = req.body;
    let attendance = await Attendance.findOne({ userId, date: new Date(date) });
    if (!attendance) attendance = await Attendance.create({ userId, date, punches });
    attendance.punches = punches || attendance.punches;
    attendance.totalHours = totalHours || attendance.totalHours;
    attendance.status = status || attendance.status;
    attendance.note = note || attendance.note;
    await attendance.save();
    res.json(attendance);
  } catch (err) { next(err); }
};

exports.all = async (req, res, next) => {
  try {
    const rows = await Attendance.find().populate('userId', 'name email').sort({ date: -1 })
    res.json(rows)
  } catch (err) { next(err) }
}

exports.requestLeave = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { date, reason } = req.body
    const dateOnly = date ? new Date(date).toISOString().slice(0,10) : new Date().toISOString().slice(0,10)

    let attendance = await Attendance.findOne({ userId, date: new Date(dateOnly) })
    if (!attendance) {
      attendance = await Attendance.create({ userId, date: new Date(dateOnly), punches: [], status: 'Leave', totalHours: 0, note: reason || '' })
    } else {
      attendance.status = 'Leave'
      attendance.totalHours = 0
      attendance.note = reason || attendance.note
      await attendance.save()
    }
    return res.json(attendance)
  } catch (err) { next(err) }
}

exports.setStatus = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { status, date, reason } = req.body
    if (!['Present','Leave','Holiday','Absent'].includes(status)) return res.status(400).json({ message: 'Invalid status' })
    const dateOnly = date ? new Date(date).toISOString().slice(0,10) : new Date().toISOString().slice(0,10)

    let attendance = await Attendance.findOne({ userId, date: new Date(dateOnly) })
    if (!attendance) {
      attendance = await Attendance.create({ userId, date: new Date(dateOnly), punches: [], status, totalHours: status === 'Present' ? 0 : 0, note: reason || '' })
    } else {
      // Prevent editing a completed day with multiple punches (considered finalized)
      if (attendance.punches && attendance.punches.length >= 2 && status === 'Present') {
        return res.status(400).json({ message: 'Cannot change to Present for a completed day' })
      }
      attendance.status = status
      attendance.note = reason || attendance.note
      if (status !== 'Present') attendance.totalHours = 0
      await attendance.save()
    }
    res.json(attendance)
  } catch (err) { next(err) }
}
