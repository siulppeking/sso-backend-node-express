const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const groupController = require('../controllers/groupController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// Create group
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  body('name').notEmpty().trim().escape(),
  body('description').optional().trim().escape(),
  body('roles').optional().isArray(),
  groupController.createGroup
);

// Get all groups
router.get('/', authenticate, groupController.listGroups);

// Get group by ID
router.get(
  '/:id',
  authenticate,
  param('id').isMongoId(),
  groupController.getGroupById
);

// Update group
router.put(
  '/:id',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  body('description').optional().trim().escape(),
  body('roles').optional().isArray(),
  body('enabled').optional().isBoolean(),
  groupController.updateGroup
);

// Delete group
router.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  groupController.deleteGroup
);

// Add member
router.post(
  '/:id/members/:userId',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  param('userId').isMongoId(),
  groupController.addMember
);

// Remove member
router.delete(
  '/:id/members/:userId',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  param('userId').isMongoId(),
  groupController.removeMember
);

// Add role
router.post(
  '/:id/roles',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  body('role').notEmpty().trim().escape(),
  groupController.addRole
);

// Remove role
router.delete(
  '/:id/roles/:role',
  authenticate,
  requireRole('admin'),
  param('id').isMongoId(),
  param('role').notEmpty(),
  groupController.removeRole
);

module.exports = router;
