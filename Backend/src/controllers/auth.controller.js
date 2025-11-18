const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const createAccessToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
const createRefreshToken = (user) => jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, passwordHash: hash });
    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role }, accessToken, refreshToken });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = createAccessToken(user);
    const refreshToken = createRefreshToken(user);
    user.refreshTokens.push(refreshToken);
    await user.save();

    res.json({ user: { id: user._id, email: user.email, name: user.name, role: user.role }, accessToken, refreshToken });
  } catch (err) { next(err); }
};

exports.refresh = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'No token' });
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);
    if (!user || !user.refreshTokens.includes(token)) return res.status(401).json({ message: 'Invalid token' });
    const accessToken = createAccessToken(user);
    res.json({ accessToken });
  } catch (err) { next(err); }
};

exports.logout = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'No token' });
    const payload = jwt.decode(token);
    if (!payload) return res.status(400).json({ message: 'Invalid token' });
    const user = await User.findById(payload.id);
    if (user) {
      user.refreshTokens = user.refreshTokens.filter(t => t !== token);
      await user.save();
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
};
