const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'No auth header' });
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-passwordHash -refreshTokens');
    if (!user) return res.status(401).json({ message: 'Invalid token' });
    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (err) { return res.status(401).json({ message: 'Unauthorized' }); }
};
