const { HTTP_STATUS, ERROR_MESSAGES, ROLES } = require('../constants');
const { logger } = require('../utils/logger');

/**
 * Check if user has specific role
 */
function hasRole(user, role) {
  if (!user || !user.roles || !Array.isArray(user.roles)) {
    return false;
  }
  return user.roles.includes(role);
}

/**
 * Check if user has any of the specified roles
 */
function hasAnyRole(user, roles) {
  if (!user || !user.roles || !Array.isArray(user.roles)) {
    return false;
  }
  return roles.some(role => user.roles.includes(role));
}

/**
 * Require admin role middleware
 */
function requireAdmin(req, res, next) {
  const user = req.user;

  if (!user) {
    logger.warn('Unauthorized admin access attempt: no user');
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
      status: HTTP_STATUS.UNAUTHORIZED,
    });
  }

  if (!hasRole(user, ROLES.ADMIN)) {
    logger.warn('Forbidden admin access attempt', { userId: user.sub, roles: user.roles });
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      error: 'Admin role required',
      status: HTTP_STATUS.FORBIDDEN,
    });
  }

  next();
}

/**
 * Require specific role(s) middleware
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      logger.warn('Unauthorized role access attempt: no user');
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    if (!hasAnyRole(user, allowedRoles)) {
      logger.warn('Forbidden role access attempt', {
        userId: user.sub,
        required: allowedRoles,
        has: user.roles,
      });
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: `One of these roles is required: ${allowedRoles.join(', ')}`,
        status: HTTP_STATUS.FORBIDDEN,
      });
    }

    next();
  };
}

module.exports = {
  requireAdmin,
  requireRole,
  hasRole,
  hasAnyRole,
};

