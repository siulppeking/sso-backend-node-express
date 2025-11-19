const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const RefreshToken = require('../models/RefreshToken');

const ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || '15m';
const REFRESH_EXPIRES_DAYS = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '7', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function generateAccessToken(user, client) {
  const payload = {
    sub: user._id.toString(),
    roles: user.roles || [],
    username: user.username,
    clientId: client ? client.clientId : undefined,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES });
}

async function generateRefreshToken(user, client) {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);

  const doc = new RefreshToken({ token, user: user._id, client: client?._id, expiresAt });
  await doc.save();
  return token;
}

async function rotateRefreshToken(oldTokenValue, user, client) {
  // revoke old
  const old = await RefreshToken.findOne({ token: oldTokenValue });
  if (old) {
    old.revoked = true;
    await old.save();
  }
  const newToken = await generateRefreshToken(user, client);
  return newToken;
}

async function verifyRefreshToken(tokenValue) {
  const token = await RefreshToken.findOne({ token: tokenValue }).populate('user');
  if (!token) return null;
  if (token.revoked) return null;
  if (token.expiresAt < new Date()) return null;
  return token;
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = { generateAccessToken, generateRefreshToken, verifyAccessToken, verifyRefreshToken, rotateRefreshToken };
