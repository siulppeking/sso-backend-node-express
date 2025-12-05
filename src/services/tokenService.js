const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const RefreshToken = require('../models/RefreshToken');
const { JWT_DEFAULTS } = require('../constants');
const { logger } = require('../utils/logger');

/**
 * Token configuration
 */
const tokenConfig = {
  ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || JWT_DEFAULTS.ACCESS_EXPIRES,
  REFRESH_EXPIRES_DAYS:
    parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || JWT_DEFAULTS.REFRESH_EXPIRES_DAYS, 10),
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
};

/**
 * Validate token configuration
 */
function validateTokenConfig() {
  if (!tokenConfig.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
}

/**
 * Build JWT payload
 */
function buildAccessTokenPayload(user, client) {
  return {
    sub: user._id.toString(),
    roles: user.roles || [],
    username: user.username,
    email: user.email,
    clientId: client ? client.clientId : undefined,
  };
}

/**
 * Generate access token (short-lived)
 */
function generateAccessToken(user, client) {
  validateTokenConfig();

  const payload = buildAccessTokenPayload(user, client);

  try {
    const token = jwt.sign(payload, tokenConfig.JWT_SECRET, {
      expiresIn: tokenConfig.ACCESS_EXPIRES,
    });
    logger.debug('Access token generated', { userId: user._id });
    return token;
  } catch (error) {
    logger.error('Failed to generate access token', { error: error.message });
    throw error;
  }
}

/**
 * Create refresh token in database
 */
async function createRefreshTokenRecord(user, client) {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + tokenConfig.REFRESH_EXPIRES_DAYS);

  const refreshTokenDoc = new RefreshToken({
    token,
    user: user._id,
    client: client?._id,
    expiresAt,
  });

  await refreshTokenDoc.save();
  logger.debug('Refresh token created', { userId: user._id });
  return token;
}

/**
 * Generate refresh token (long-lived, stored in DB)
 */
async function generateRefreshToken(user, client) {
  validateTokenConfig();

  try {
    const token = await createRefreshTokenRecord(user, client);
    return token;
  } catch (error) {
    logger.error('Failed to generate refresh token', { error: error.message });
    throw error;
  }
}

/**
 * Revoke a refresh token
 */
async function revokeRefreshToken(tokenValue) {
  try {
    const refreshTokenDoc = await RefreshToken.findOne({ token: tokenValue });
    if (refreshTokenDoc) {
      refreshTokenDoc.revoked = true;
      await refreshTokenDoc.save();
      logger.debug('Refresh token revoked');
    }
  } catch (error) {
    logger.error('Failed to revoke refresh token', { error: error.message });
    throw error;
  }
}

/**
 * Rotate refresh token (revoke old, generate new)
 */
async function rotateRefreshToken(oldTokenValue, user, client) {
  try {
    await revokeRefreshToken(oldTokenValue);
    const newToken = await generateRefreshToken(user, client);
    logger.debug('Refresh token rotated', { userId: user._id });
    return newToken;
  } catch (error) {
    logger.error('Failed to rotate refresh token', { error: error.message });
    throw error;
  }
}

/**
 * Verify refresh token validity
 */
async function verifyRefreshToken(tokenValue) {
  try {
    const refreshTokenDoc = await RefreshToken.findOne({ token: tokenValue }).populate('user');

    if (!refreshTokenDoc) {
      logger.warn('Refresh token not found');
      return null;
    }

    if (refreshTokenDoc.revoked) {
      logger.warn('Refresh token is revoked');
      return null;
    }

    if (refreshTokenDoc.expiresAt < new Date()) {
      logger.warn('Refresh token has expired');
      return null;
    }

    return refreshTokenDoc;
  } catch (error) {
    logger.error('Failed to verify refresh token', { error: error.message });
    return null;
  }
}

/**
 * Verify access token (JWT verification)
 */
function verifyAccessToken(token) {
  validateTokenConfig();

  try {
    const decoded = jwt.verify(token, tokenConfig.JWT_SECRET);
    logger.debug('Access token verified');
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn('Access token expired');
    } else if (error.name === 'JsonWebTokenError') {
      logger.warn('Invalid access token');
    }
    return null;
  }
}

/**
 * Decode token without verification (for debugging)
 */
function decodeAccessToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error('Failed to decode token', { error: error.message });
    return null;
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  decodeAccessToken,
  buildAccessTokenPayload,
  validateTokenConfig,
};

