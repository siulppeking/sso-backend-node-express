const tokenService = require('../services/tokenService');

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'Missing Authorization header' });
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Invalid Authorization header' });
  const token = parts[1];
  const payload = tokenService.verifyAccessToken(token);
  if (!payload) return res.status(401).json({ message: 'Invalid or expired token' });
  req.user = payload;
  next();
}

module.exports = { authenticate };
