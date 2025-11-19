const userService = require('../services/userService');

async function me(req, res, next) {
  try {
    const user = await userService.findById(req.user.sub);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ id: user._id, username: user.username, email: user.email, roles: user.roles });
  } catch (err) {
    next(err);
  }
}

module.exports = { me };
