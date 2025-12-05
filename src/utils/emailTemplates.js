/**
 * Email Templates
 * Centralized email templates for consistency and easy maintenance
 */

const { APP_URL } = require('../constants');

/**
 * Password reset email template
 */
function getPasswordResetEmailTemplate(resetToken) {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;

  return {
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p style="color: #666;">Click the link below to reset your password. This link expires in 1 hour.</p>
        <p style="margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p style="color: #999; font-size: 12px;">Or copy this link: ${resetUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
    text: `
      Reset Your Password
      
      Click the link below to reset your password. This link expires in 1 hour.
      ${resetUrl}
      
      If you didn't request this, you can safely ignore this email.
    `,
  };
}

/**
 * Email verification template
 */
function getEmailVerificationTemplate(verificationToken) {
  const verifyUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;

  return {
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Verify Your Email</h2>
        <p style="color: #666;">Click the link below to verify your email address and complete your registration.</p>
        <p style="margin: 20px 0;">
          <a href="${verifyUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p style="color: #999; font-size: 12px;">Or copy this link: ${verifyUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">If you didn't sign up for this account, you can safely ignore this email.</p>
      </div>
    `,
    text: `
      Verify Your Email
      
      Click the link below to verify your email address and complete your registration.
      ${verifyUrl}
      
      If you didn't sign up for this account, you can safely ignore this email.
    `,
  };
}

/**
 * 2FA setup email template
 */
function get2FASetupTemplate() {
  const setupUrl = `${process.env.APP_URL}/settings/2fa`;

  return {
    subject: 'Two-Factor Authentication Enabled',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Secure Your Account</h2>
        <p style="color: #666;">Two-factor authentication has been enabled on your account.</p>
        <p style="color: #666;">To complete setup, install an authenticator app (Google Authenticator, Microsoft Authenticator, etc.) and scan the QR code in your account settings.</p>
        <p style="margin: 20px 0;">
          <a href="${setupUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Complete 2FA Setup
          </a>
        </p>
        <div style="background-color: #f8d7da; border-left: 4px solid #f5c6cb; padding: 12px; margin: 20px 0;">
          <p style="color: #721c24; margin: 0;"><strong>Important:</strong> Keep your backup codes in a safe place. You can use them if you lose access to your authenticator app.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">If you didn't enable 2FA, please secure your account immediately by changing your password.</p>
      </div>
    `,
    text: `
      Secure Your Account
      
      Two-factor authentication has been enabled on your account.
      To complete setup, install an authenticator app and scan the QR code in your account settings.
      ${setupUrl}
      
      IMPORTANT: Keep your backup codes in a safe place. You can use them if you lose access to your authenticator app.
      
      If you didn't enable 2FA, please secure your account immediately by changing your password.
    `,
  };
}

/**
 * Welcome email template
 */
function getWelcomeEmailTemplate(username) {
  return {
    subject: 'Welcome to Our Platform',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome, ${username}!</h2>
        <p style="color: #666;">Your account has been created successfully. You can now log in to your account.</p>
        <p style="margin: 20px 0;">
          <a href="${process.env.APP_URL}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Go to Dashboard
          </a>
        </p>
        <div style="background-color: #d1ecf1; border-left: 4px solid #bee5eb; padding: 12px; margin: 20px 0;">
          <p style="color: #0c5460; margin: 0;"><strong>Pro Tip:</strong> Enable two-factor authentication to secure your account.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Need help? Contact our support team at ${process.env.SUPPORT_URL}</p>
      </div>
    `,
    text: `
      Welcome, ${username}!
      
      Your account has been created successfully. You can now log in to your account.
      ${process.env.APP_URL}
      
      Pro Tip: Enable two-factor authentication to secure your account.
      
      Need help? Contact our support team at ${process.env.SUPPORT_URL}
    `,
  };
}

module.exports = {
  getPasswordResetEmailTemplate,
  getEmailVerificationTemplate,
  get2FASetupTemplate,
  getWelcomeEmailTemplate,
};
