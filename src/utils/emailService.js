const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

async function sendPasswordResetEmail(email, username, resetLink) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${username},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Support: <a href="${process.env.SUPPORT_URL}">${process.env.SUPPORT_URL}</a></p>
      `,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Failed to send email:', err);
    return false;
  }
}

async function sendEmailVerificationEmail(user, token, verifyLink) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: user.email,
      subject: 'Verify Your Email Address',
      html: `
        <h2>Email Verification</h2>
        <p>Hi ${user.username},</p>
        <p>Thank you for registering! Click the link below to verify your email address:</p>
        <p><a href="${verifyLink}">Verify Email</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create this account, please ignore this email.</p>
        <p>Support: <a href="${process.env.SUPPORT_URL}">${process.env.SUPPORT_URL}</a></p>
      `,
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (err) {
    console.error('Failed to send verification email:', err);
    return false;
  }
}

module.exports = { sendPasswordResetEmail, sendEmailVerificationEmail };
