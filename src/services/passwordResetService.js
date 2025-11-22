const { v4: uuidv4 } = require('uuid');
const PasswordReset = require('../models/PasswordReset');
const userService = require('./userService');
const { sendPasswordResetEmail } = require('../utils/emailService');

const RESET_TOKEN_EXPIRES_MS = 60 * 60 * 1000; // 1 hour

async function generateResetToken(email) {
  const user = await userService.findByEmail(email);
  if (!user) return null;

  // Invalidate old tokens
  await PasswordReset.updateMany({ user: user._id }, { used: true });

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_MS);
  const resetDoc = new PasswordReset({ user: user._id, token, expiresAt });
  await resetDoc.save();

  // Send email
  const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;
  const sent = await sendPasswordResetEmail(user.email, user.username, resetLink);

  return { user, token, sent };
}

async function verifyResetToken(token) {
  const resetDoc = await PasswordReset.findOne({ token }).populate('user');
  if (!resetDoc) return null;
  if (resetDoc.used) return null;
  if (resetDoc.expiresAt < new Date()) return null;
  return resetDoc;
}

async function resetPassword(token, newPassword) {
  const resetDoc = await verifyResetToken(token);
  if (!resetDoc) return null;

  const user = resetDoc.user;
  user.password = newPassword;
  await user.save();

  // Mark token as used
  resetDoc.used = true;
  await resetDoc.save();

  return user;
}

module.exports = { generateResetToken, verifyResetToken, resetPassword };
