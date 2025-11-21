const express = require('express');
const { body, param } = require('express-validator');
const router = express.Router();

const emailTemplateController = require('../controllers/emailTemplateController');
const { authenticate } = require('../middlewares/authMiddleware');
const { requireRole } = require('../middlewares/roleMiddleware');

// Create template
router.post(
  '/',
  authenticate,
  requireRole('admin'),
  body('name').notEmpty().trim().escape(),
  body('subject').notEmpty().trim(),
  body('htmlTemplate').notEmpty().trim(),
  body('textTemplate').optional().trim(),
  body('description').optional().trim(),
  body('variables').optional().isArray(),
  emailTemplateController.createTemplate
);

// Get all templates
router.get('/', authenticate, requireRole('admin'), emailTemplateController.listTemplates);

// Get template by name
router.get(
  '/:name',
  authenticate,
  requireRole('admin'),
  emailTemplateController.getTemplateById
);

// Update template
router.put(
  '/:name',
  authenticate,
  requireRole('admin'),
  body('subject').optional().notEmpty().trim(),
  body('htmlTemplate').optional().notEmpty().trim(),
  body('textTemplate').optional().trim(),
  body('description').optional().trim(),
  body('variables').optional().isArray(),
  body('enabled').optional().isBoolean(),
  emailTemplateController.updateTemplate
);

// Delete template
router.delete(
  '/:name',
  authenticate,
  requireRole('admin'),
  emailTemplateController.deleteTemplate
);

// Test template
router.post(
  '/:name/test',
  authenticate,
  requireRole('admin'),
  body('email').isEmail(),
  body('variables').optional().isObject(),
  emailTemplateController.testTemplate
);

module.exports = router;
