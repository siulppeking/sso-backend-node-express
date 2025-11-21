const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const userManagementController = require('../controllers/userManagementController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// Admin - User Management
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  body('username').notEmpty().trim().escape(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').optional().trim().escape(),
  body('lastName').optional().trim().escape(),
  body('roles').optional().isArray(),
  userManagementController.createUser
);

router.get('/', authenticate, requireRole('admin'), userManagementController.listUsers);

router.get('/:id', authenticate, param('id').isMongoId(), userManagementController.getUserById);

router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  body('firstName').optional().trim().escape(),
  body('lastName').optional().trim().escape(),
  body('email').optional().isEmail(),
  body('enabled').optional().isBoolean(),
  userManagementController.updateUser
);

router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  userManagementController.deleteUser
);

// Email Verification
router.post(
  '/:id/send-verification',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  userManagementController.sendEmailVerification
);

router.post(
  '/verify-email',
  body('token').notEmpty(),
  userManagementController.verifyEmail
);

// Password Management
router.post(
  '/request-password-reset',
  body('email').isEmail(),
  userManagementController.requestPasswordReset
);

router.post(
  '/reset-password',
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  userManagementController.resetPassword
);

router.post(
  '/change-password',
  authenticate,
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  userManagementController.changePassword
);

// 2FA Management
router.post(
  '/2fa/enable',
  authenticate,
  userManagementController.enable2FA
);

router.post(
  '/2fa/disable',
  authenticate,
  userManagementController.disable2FA
);

// Groups
router.post(
  '/:userId/groups/:groupId',
  authenticate,
  requireRole('admin'),
  param('userId').isMongoId(),
  param('groupId').isMongoId(),
  userManagementController.addUserToGroup
);

router.delete(
  '/:userId/groups/:groupId',
  authenticate,
  requireRole('admin'),
  param('userId').isMongoId(),
  param('groupId').isMongoId(),
  userManagementController.removeUserFromGroup
);

// Application Roles
router.post(
  '/:userId/applications/:applicationId/roles',
  authenticate,
  requireRole('admin'),
  param('userId').isMongoId(),
  param('applicationId').isMongoId(),
  body('role').notEmpty().trim().escape(),
  userManagementController.addApplicationRole
);

router.delete(
  '/:userId/applications/:applicationId/roles/:role',
  authenticate,
  requireRole('admin'),
  param('userId').isMongoId(),
  param('applicationId').isMongoId(),
  param('role').notEmpty(),
  userManagementController.removeApplicationRole
);

// Events
router.get(
  '/:userId/events',
  authenticate,
  param('userId').isMongoId(),
  userManagementController.getUserEvents
);

router.get(
  '/admin/events',
  authenticate,
  requireRole('admin'),
  userManagementController.getEventLog
);

// Account Lock/Unlock
router.post(
  '/:id/lock',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  body('reason').optional().trim().escape(),
  userManagementController.lockAccount
);

router.post(
  '/:id/unlock',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  userManagementController.unlockAccount
);

module.exports = router;
