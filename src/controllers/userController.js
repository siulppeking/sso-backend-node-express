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

async function addRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'role is required' });
    const user = await userService.addRole(id, role);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ id: user._id, roles: user.roles });
  } catch (err) {
    next(err);
  }
}

async function removeRole(req, res, next) {
  try {
    const { id, role } = req.params;
    const user = await userService.removeRole(id, role);
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ id: user._id, roles: user.roles });
  } catch (err) {
    next(err);
  }
}

module.exports = { me, addRole, removeRole };
