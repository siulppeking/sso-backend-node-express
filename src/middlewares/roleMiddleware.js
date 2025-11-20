function requireRole(role) {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !user.roles) return res.status(403).json({ message: 'Insufficient privileges' });
    if (!user.roles.includes(role)) return res.status(403).json({ message: 'Insufficient privileges' });
    next();
  };
}

module.exports = { requireRole };
