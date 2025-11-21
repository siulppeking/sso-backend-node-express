const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const roleController = require('../controllers/roleController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// Create role
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  body('name').notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  body('permissions').optional().isArray(),
  roleController.createRole
);

// Get all roles
router.get('/', authenticate, roleController.listRoles);

// Get role by ID
router.get(
  '/:id',
  authenticate,
  param('id').isMongoId(),
  roleController.getRoleById
);

// Update role
router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  body('name').optional().notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  body('permissions').optional().isArray(),
  body('active').optional().isBoolean(),
  roleController.updateRole
);

// Delete role
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  roleController.deleteRole
);

// Add permission to role
router.post(
  '/:id/permissions',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  body('permission').notEmpty().trim().escape(),
  roleController.addPermission
);

// Remove permission from role
router.delete(
  '/:id/permissions/:permission',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  param('permission').notEmpty(),
  roleController.removePermission
);

module.exports = router;
