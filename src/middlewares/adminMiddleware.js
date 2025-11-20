function requireAdmin(req, res, next) {
  const user = req.user;
  if (!user || !user.roles) {
    return res.status(403).json({ message: 'Admin role required' });
  }
  if (!user.roles.includes('admin')) {
    return res.status(403).json({ message: 'Admin role required' });
  }
  next();
}

module.exports = { requireAdmin };
