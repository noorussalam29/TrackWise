const User = require('../models/User')

exports.list = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query
    const query = { role: { $ne: 'admin' } }
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }]
    const skip = (page - 1) * limit
    const employees = await User.find(query).select('-passwordHash -refreshTokens').skip(skip).limit(limit)
    const total = await User.countDocuments(query)
    res.json({ employees, total, page, pages: Math.ceil(total / limit) })
  } catch (err) { next(err) }
}

exports.get = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -refreshTokens')
    if (!user) return res.status(404).json({ message: 'Employee not found' })
    res.json(user)
  } catch (err) { next(err) }
}

exports.create = async (req, res, next) => {
  try {
    const { name, email, role, department, position } = req.body
    const user = await User.create({ name, email, role: role || 'employee', department, position, passwordHash: '' })
    res.status(201).json(user)
  } catch (err) { next(err) }
}

exports.update = async (req, res, next) => {
  try {
    const { name, department, position, avatarUrl } = req.body
    const user = await User.findByIdAndUpdate(req.params.id, { name, department, position, avatarUrl }, { new: true }).select('-passwordHash -refreshTokens')
    res.json(user)
  } catch (err) { next(err) }
}

exports.delete = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ ok: true })
  } catch (err) { next(err) }
}

