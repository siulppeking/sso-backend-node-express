const twoFactorUtils = require('../utils/twoFactorService');
const User = require('../models/User');
const bcrypt = require('bcrypt');

async function enableTwoFactor(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  const { secret, qrCode, manualEntryKey } = await twoFactorUtils.generateTwoFactorSecret(user.email);
  const backupCodes = twoFactorUtils.generateBackupCodes(10);

  return {
    secret,
    qrCode,
    manualEntryKey,
    backupCodes,
  };
}

async function confirmTwoFactor(userId, token, secret, backupCodes) {
  const user = await User.findById(userId);
  if (!user) return null;

  const isValid = twoFactorUtils.verifyTwoFactorToken(secret, token);
  if (!isValid) return null;

  // Hash backup codes before saving
  const hashedCodes = await Promise.all(
    backupCodes.map(code => bcrypt.hash(code, 10))
  );

  user.twoFactorEnabled = true;
  user.twoFactorSecret = secret;
  user.twoFactorBackupCodes = hashedCodes;
  await user.save();

  return user;
}

async function disableTwoFactor(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  user.twoFactorEnabled = false;
  user.twoFactorSecret = null;
  user.twoFactorBackupCodes = [];
  await user.save();

  return user;
}

async function verifyTwoFactorToken(userId, token) {
  const user = await User.findById(userId);
  if (!user || !user.twoFactorSecret) return false;

  return twoFactorUtils.verifyTwoFactorToken(user.twoFactorSecret, token);
}

async function verifyBackupCode(userId, code) {
  const user = await User.findById(userId);
  if (!user || !user.twoFactorBackupCodes || user.twoFactorBackupCodes.length === 0) return false;

  // Check against hashed codes
  for (const hashedCode of user.twoFactorBackupCodes) {
    const isMatch = await bcrypt.compare(code.toUpperCase(), hashedCode);
    if (isMatch) {
      // Remove used backup code
      user.twoFactorBackupCodes = user.twoFactorBackupCodes.filter(h => h !== hashedCode);
      await user.save();
      return true;
    }
  }

  return false;
}

module.exports = {
  enableTwoFactor,
  confirmTwoFactor,
  disableTwoFactor,
  verifyTwoFactorToken,
  verifyBackupCode,
};
