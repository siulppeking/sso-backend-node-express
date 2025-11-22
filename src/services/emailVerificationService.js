const { v4: uuidv4 } = require('uuid');
const EmailVerification = require('../models/EmailVerification');
const userService = require('./userService');
const { sendEmailVerificationEmail } = require('../utils/emailService');

const VERIFICATION_TOKEN_EXPIRES_MS = 24 * 60 * 60 * 1000; // 24 hours

async function generateVerificationToken(userId) {
  const user = await userService.findById(userId);
  if (!user) return null;

  // Invalidate old tokens
  await EmailVerification.updateMany({ user: userId }, { verified: true });

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRES_MS);
  const verifyDoc = new EmailVerification({ user: userId, token, expiresAt });
  await verifyDoc.save();

  // Send email
  const verifyLink = `${process.env.APP_URL}/verify-email?token=${token}`;
  const sent = await sendEmailVerificationEmail(user, token, verifyLink);

  return { user, token, sent };
}

async function verifyEmailToken(token) {
  const verifyDoc = await EmailVerification.findOne({ token }).populate('user');
  if (!verifyDoc) return null;
  if (verifyDoc.verified) return null;
  if (verifyDoc.expiresAt < new Date()) return null;
  return verifyDoc;
}

async function confirmEmailVerification(token) {
  const verifyDoc = await verifyEmailToken(token);
  if (!verifyDoc) return null;

  const user = verifyDoc.user;
  user.emailVerified = true;
  await user.save();

  // Mark token as verified
  verifyDoc.verified = true;
  await verifyDoc.save();

  return user;
}

module.exports = { generateVerificationToken, verifyEmailToken, confirmEmailVerification };
