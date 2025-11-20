const userService = require('../services/userService');

/**
 * Middleware factory: checks whether the user referenced by req.params.id
 * has the specified role. Useful for protecting actions that depend on the
 * target user's roles (e.g. prevent removing the last admin, etc.).
 *
 * Usage: router.post('/:id/some', authenticate, checkUserRole('admin'), handler)
 */
function checkUserRole(role) {
  return async (req, res, next) => {
    try {
      const targetId = req.params.id;
      if (!targetId) return res.status(400).json({ message: 'target user id required' });
      const doc = await userService.listRoles(targetId);
      if (!doc) return res.status(404).json({ message: 'Target user not found' });
      const roles = doc.roles || [];
      if (!roles.includes(role)) return res.status(403).json({ message: `Target user does not have role: ${role}` });
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { checkUserRole };
