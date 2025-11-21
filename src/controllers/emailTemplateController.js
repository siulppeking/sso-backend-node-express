const { validationResult } = require('express-validator');
const emailService = require('../services/emailService');
const EmailTemplate = require('../models/EmailTemplate');

async function createTemplate(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, subject, htmlTemplate, textTemplate, description, variables } = req.body;

    const existing = await emailService.getTemplate(name);
    if (existing) return res.status(409).json({ message: 'Template already exists' });

    const template = await emailService.createTemplate({
      name,
      subject,
      htmlTemplate,
      textTemplate,
      description,
      variables,
    });

    return res.status(201).json(formatTemplateResponse(template));
  } catch (err) {
    next(err);
  }
}

async function listTemplates(req, res, next) {
  try {
    const templates = await emailService.listTemplates();
    return res.json(templates.map(formatTemplateResponse));
  } catch (err) {
    next(err);
  }
}

async function getTemplateById(req, res, next) {
  try {
    const { name } = req.params;
    const template = await emailService.getTemplate(name);
    if (!template) return res.status(404).json({ message: 'Template not found' });

    return res.json(formatTemplateResponse(template));
  } catch (err) {
    next(err);
  }
}

async function updateTemplate(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name } = req.params;
    const updates = req.body;

    const template = await emailService.updateTemplate(name, updates);
    if (!template) return res.status(404).json({ message: 'Template not found' });

    return res.json(formatTemplateResponse(template));
  } catch (err) {
    next(err);
  }
}

async function deleteTemplate(req, res, next) {
  try {
    const { name } = req.params;
    const template = await EmailTemplate.findOneAndDelete({ name });
    if (!template) return res.status(404).json({ message: 'Template not found' });

    return res.json({ message: 'Template deleted successfully' });
  } catch (err) {
    next(err);
  }
}

async function testTemplate(req, res, next) {
  try {
    const { name } = req.params;
    const { email, variables } = req.body;

    if (!email) return res.status(400).json({ message: 'email is required' });

    const result = await emailService.sendEmail({
      to: email,
      templateName: name,
      variables,
    });

    if (!result.success) {
      return res.status(400).json({ message: 'Failed to send test email', error: result.error });
    }

    return res.json({
      message: 'Test email sent successfully',
      messageId: result.messageId,
    });
  } catch (err) {
    next(err);
  }
}

function formatTemplateResponse(template) {
  return {
    id: template._id,
    name: template.name,
    subject: template.subject,
    htmlTemplate: template.htmlTemplate,
    textTemplate: template.textTemplate,
    description: template.description,
    variables: template.variables,
    enabled: template.enabled,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt,
  };
}

module.exports = {
  createTemplate,
  listTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  testTemplate,
};
