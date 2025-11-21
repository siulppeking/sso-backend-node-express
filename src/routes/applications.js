const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const applicationController = require('../controllers/applicationController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// Create application
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  body('name').notEmpty().trim().escape(),
  body('displayName').notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  body('url').isURL(),
  body('redirectUris').optional().isArray(),
  body('logoutUrl').optional().isURL(),
  body('allowedOrigins').optional().isArray(),
  body('accessTokenLifespan').optional().isInt({ min: 60 }),
  body('refreshTokenLifespan').optional().isInt({ min: 300 }),
  body('requireHttps').optional().isBoolean(),
  body('publicClient').optional().isBoolean(),
  body('roles').optional().isArray(),
  applicationController.createApplication
);

// Get all applications
router.get('/', authenticate, applicationController.listApplications);

// Get application by ID
router.get(
  '/:id',
  authenticate,
  param('id').isMongoId(),
  applicationController.getApplicationById
);

// Update application
router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  body('displayName').optional().notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  body('url').optional().isURL(),
  body('logoutUrl').optional().isURL(),
  body('redirectUris').optional().isArray(),
  body('allowedOrigins').optional().isArray(),
  body('accessTokenLifespan').optional().isInt({ min: 60 }),
  body('refreshTokenLifespan').optional().isInt({ min: 300 }),
  body('enabled').optional().isBoolean(),
  body('requireHttps').optional().isBoolean(),
  body('publicClient').optional().isBoolean(),
  body('standardFlowEnabled').optional().isBoolean(),
  body('implicitFlowEnabled').optional().isBoolean(),
  body('directAccessGrantsEnabled').optional().isBoolean(),
  body('serviceAccountsEnabled').optional().isBoolean(),
  body('roles').optional().isArray(),
  applicationController.updateApplication
);

// Delete application
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  applicationController.deleteApplication
);

// Add redirect URI
router.post(
  '/:id/redirect-uris',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  body('uri').isURL(),
  applicationController.addRedirectUri
);

// Remove redirect URI
router.delete(
  '/:id/redirect-uris/:uri',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  applicationController.removeRedirectUri
);

// Add role
router.post(
  '/:id/roles',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  body('role').notEmpty().trim().escape(),
  applicationController.addRole
);

// Remove role
router.delete(
  '/:id/roles/:role',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  param('role').notEmpty(),
  applicationController.removeRole
);

// Add allowed origin
router.post(
  '/:id/allowed-origins',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  body('origin').notEmpty().trim().escape(),
  applicationController.addAllowedOrigin
);

// Remove allowed origin
router.delete(
  '/:id/allowed-origins/:origin',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  param('origin').notEmpty(),
  applicationController.removeAllowedOrigin
);

module.exports = router;
