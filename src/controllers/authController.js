const { validationResult } = require('express-validator');
const userService = require('../services/userService');
const clientService = require('../services/clientService');
const tokenService = require('../services/tokenService');
const emailService = require('../services/emailService');
const passwordResetService = require('../services/passwordResetService');
const emailVerificationService = require('../services/emailVerificationService');
const User = require('../models/User');

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;
    const existing = await userService.findByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already used' });

    const user = await userService.createUser({ username, email, password });
    
    // Send welcome email
    await emailService.sendWelcomeEmail(user);
    
    // Generate and send email verification
    const { token } = await userService.generateEmailVerificationToken(user._id);
    await emailService.sendEmailVerificationEmail(user, token);
    
    return res.status(201).json({ id: user._id, username: user.username, email: user.email });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password, clientId, clientSecret } = req.body;
    const user = await userService.findByEmail(email);
    if (!user) {
      await userService.recordLoginError(email, req.ip, req.get('user-agent'));
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.isAccountLocked()) {
      return res.status(403).json({ message: 'Account is locked' });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      await userService.recordLoginError(email, req.ip, req.get('user-agent'));
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    let client = null;
    if (clientId) {
      client = await clientService.findByClientId(clientId);
      if (!client) return res.status(400).json({ message: 'Invalid client' });
      if (!client.public) {
        const secretOk = await client.compareSecret(clientSecret || '');
        if (!secretOk) return res.status(401).json({ message: 'Invalid client credentials' });
      }
    }

    // Record successful login
    await userService.recordLogin(user._id, req.ip, req.get('user-agent'));

    const accessToken = tokenService.generateAccessToken(user, client);
    const refreshToken = await tokenService.generateRefreshToken(user, client);

    return res.json({ accessToken, refreshToken, expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken: tokenValue } = req.body;
    if (!tokenValue) return res.status(400).json({ message: 'refreshToken required' });

    const stored = await tokenService.verifyRefreshToken(tokenValue);
    if (!stored) return res.status(401).json({ message: 'Invalid refresh token' });

    const user = stored.user;
    const client = stored.client ? await clientService.findByClientId(stored.client.clientId) : null;

    // rotate
    const newRefresh = await tokenService.rotateRefreshToken(tokenValue, user, client);
    const accessToken = tokenService.generateAccessToken(user, client);

    return res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'refreshToken required' });
    const stored = await tokenService.verifyRefreshToken(refreshToken);
    if (stored) {
      stored.revoked = true;
      await stored.save();
      
      // Log logout event
      if (req.user && stored.user) {
        await userService.logEvent(stored.user._id, 'LOGOUT', {}, req.ip, req.get('user-agent'));
      }
    }
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });

    const result = await passwordResetService.generateResetToken(email);
    
    // Always return success to prevent email enumeration
    if (!result) {
      return res.json({ message: 'If email exists, a reset link has been sent' });
    }

    if (!result.sent) {
      return res.status(500).json({ message: 'Failed to send reset email' });
    }

    return res.json({ message: 'Password reset link sent to email' });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token) return res.status(400).json({ message: 'token is required' });
    if (!password || password.length < 6) return res.status(400).json({ message: 'password must be at least 6 characters' });

    const user = await passwordResetService.resetPassword(token, password);
    if (!user) return res.status(401).json({ message: 'Invalid or expired reset token' });

    return res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'token is required' });

    const user = await emailVerificationService.confirmEmailVerification(token);
    if (!user) return res.status(401).json({ message: 'Invalid or expired verification token' });

    return res.json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
}

async function resendVerificationEmail(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });

    const user = await userService.findByEmail(email);
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If email exists, verification link has been sent' });
    }

    if (user.emailVerified) {
      return res.json({ message: 'Email already verified' });
    }

    const result = await emailVerificationService.generateVerificationToken(user._id);
    
    if (!result || !result.sent) {
      return res.status(500).json({ message: 'Failed to send verification email' });
    }

    return res.json({ message: 'Verification email sent' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, verifyEmail, resendVerificationEmail };
