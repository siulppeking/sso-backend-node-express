const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const TOTP_WINDOW = 1; // Allow 1 step before/after

async function generateTwoFactorSecret(email) {
  const secret = speakeasy.generateSecret({
    name: `SSO (${email})`,
    issuer: 'SSO',
    length: 32,
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode,
    manualEntryKey: secret.base32,
  };
}

function verifyTwoFactorToken(secret, token) {
  const verified = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: TOTP_WINDOW,
  });

  return verified;
}

function generateBackupCodes(count = 10) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}

function verifyBackupCode(backupCodes, code) {
  return backupCodes.includes(code.toUpperCase());
}

function removeBackupCode(backupCodes, code) {
  return backupCodes.filter(c => c !== code.toUpperCase());
}

module.exports = {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
  generateBackupCodes,
  verifyBackupCode,
  removeBackupCode,
};
