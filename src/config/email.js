/**
 * Email Configuration
 * 
 * Centralizes email transport and settings for the SSO backend.
 * Uses nodemailer with SMTP configuration from environment variables.
 */

const nodemailer = require('nodemailer');

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // false for TLS; true for SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Verify SMTP connection
 */
async function verifyTransport() {
  try {
    await transporter.verify();
    console.log('✅ Email transporter ready');
    return true;
  } catch (error) {
    console.warn('⚠️  Email transporter not available:', error.message);
    return false;
  }
}

/**
 * Send email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML content
 * @param {string} [options.text] - Email plain text (optional)
 * @returns {Promise<Object>} - SendGrid response
 */
async function sendEmail({ to, subject, html, text }) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || 'noreply@sso.app',
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    throw error;
  }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @param {string} resetToken - Reset token
 */
async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

  const html = `
    <h2>Reset Your Password</h2>
    <p>Click the link below to reset your password. This link expires in 1 hour.</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <br/>
    <p>If you didn't request this, you can safely ignore this email.</p>
  `;

  const text = `
    Reset Your Password
    
    Click the link below to reset your password. This link expires in 1 hour.
    ${resetUrl}
    
    If you didn't request this, you can safely ignore this email.
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password',
    html,
    text,
  });
}

/**
 * Send email verification email
 * @param {string} email - User email
 * @param {string} verificationToken - Verification token
 */
async function sendEmailVerificationEmail(email, verificationToken) {
  const verifyUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;

  const html = `
    <h2>Verify Your Email</h2>
    <p>Click the link below to verify your email address.</p>
    <a href="${verifyUrl}">${verifyUrl}</a>
    <br/>
    <p>If you didn't sign up for this account, you can safely ignore this email.</p>
  `;

  const text = `
    Verify Your Email
    
    Click the link below to verify your email address.
    ${verifyUrl}
    
    If you didn't sign up for this account, you can safely ignore this email.
  `;

  return sendEmail({
    to: email,
    subject: 'Verify Your Email Address',
    html,
    text,
  });
}

/**
 * Send 2FA setup reminder email
 * @param {string} email - User email
 */
async function send2FASetupEmail(email) {
  const setupUrl = `${process.env.APP_URL}/settings/2fa`;

  const html = `
    <h2>Secure Your Account</h2>
    <p>Two-factor authentication has been enabled on your account.</p>
    <p>To complete setup, install an authenticator app and scan the QR code in your account settings.</p>
    <a href="${setupUrl}">Complete 2FA Setup</a>
    <br/>
    <p>Keep your backup codes in a safe place.</p>
  `;

  const text = `
    Secure Your Account
    
    Two-factor authentication has been enabled on your account.
    To complete setup, install an authenticator app and scan the QR code in your account settings.
    ${setupUrl}
    
    Keep your backup codes in a safe place.
  `;

  return sendEmail({
    to: email,
    subject: '2FA Setup Reminder',
    html,
    text,
  });
}

module.exports = {
  transporter,
  verifyTransport,
  sendEmail,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  send2FASetupEmail,
};
