module.exports = (roles = []) => (req, res, next) => {
  if (typeof roles === 'string') roles = [roles];
  if (!roles.length) return next();
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};
