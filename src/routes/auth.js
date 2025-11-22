const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

router.post(
  '/register',
  [body('username').isLength({ min: 3 }), body('email').isEmail(), body('password').isLength({ min: 6 })],
  authController.register
);

router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification-email', authController.resendVerificationEmail);

// Two-Factor Authentication routes (require authentication)
router.post('/2fa/setup', authenticate, authController.setupTwoFactor);
router.post('/2fa/confirm', authenticate, authController.confirmTwoFactor);
router.post('/2fa/disable', authenticate, authController.disableTwoFactor);
router.post('/2fa/verify', authenticate, authController.verifyTwoFactorToken);

module.exports = router;
