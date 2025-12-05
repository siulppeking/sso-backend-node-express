const tokenService = require('../services/tokenService');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../constants');
const { logger } = require('../utils/logger');

/**
 * Extract Bearer token from Authorization header
 */
function extractTokenFromHeader(authHeader) {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Authenticate user via JWT token
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      logger.warn('Missing Authorization header');
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      logger.warn('Invalid Authorization header format');
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: 'Invalid Authorization header format',
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    const payload = tokenService.verifyAccessToken(token);

    if (!payload) {
      logger.warn('Invalid or expired access token');
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: ERROR_MESSAGES.TOKEN_EXPIRED,
        status: HTTP_STATUS.UNAUTHORIZED,
      });
    }

    req.user = payload;
    req.token = token;

    next();
  } catch (error) {
    logger.error('Authentication error', { error: error.message });
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: 'Authentication failed',
      status: HTTP_STATUS.UNAUTHORIZED,
    });
  }
}

/**
 * Optional authentication (doesn't fail if no token)
 */
function authenticateOptional(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return next();
    }

    const payload = tokenService.verifyAccessToken(token);

    if (payload) {
      req.user = payload;
      req.token = token;
    }

    next();
  } catch (error) {
    logger.error('Optional authentication error', { error: error.message });
    next();
  }
}

module.exports = {
  authenticate,
  authenticateOptional,
  extractTokenFromHeader,
};

