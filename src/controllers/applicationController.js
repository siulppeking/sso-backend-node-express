const { validationResult } = require('express-validator');
const applicationService = require('../services/applicationService');

async function createApplication(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      name,
      displayName,
      description,
      url,
      redirectUris,
      logoutUrl,
      allowedOrigins,
      accessTokenLifespan,
      refreshTokenLifespan,
      requireHttps,
      publicClient,
      roles,
      attributes,
    } = req.body;

    const existing = await applicationService.findByName(name);
    if (existing) return res.status(409).json({ message: 'Application already exists' });

    const application = await applicationService.createApplication({
      name,
      displayName,
      description,
      url,
      redirectUris,
      logoutUrl,
      allowedOrigins,
      accessTokenLifespan,
      refreshTokenLifespan,
      requireHttps,
      publicClient,
      roles,
      attributes,
    });

    return res.status(201).json(formatApplicationResponse(application));
  } catch (err) {
    next(err);
  }
}

async function getApplicationById(req, res, next) {
  try {
    const { id } = req.params;
    const application = await applicationService.findById(id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    return res.json(formatApplicationResponse(application));
  } catch (err) {
    next(err);
  }
}

async function listApplications(req, res, next) {
  try {
    const { enabled, publicClient } = req.query;
    const filters = {};
    if (enabled !== undefined) filters.enabled = enabled === 'true';
    if (publicClient !== undefined) filters.publicClient = publicClient === 'true';

    const applications = await applicationService.listApplications(filters);
    return res.json(applications.map(formatApplicationResponse));
  } catch (err) {
    next(err);
  }
}

async function updateApplication(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const updates = req.body;

    const application = await applicationService.updateApplication(id, updates);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    return res.json(formatApplicationResponse(application));
  } catch (err) {
    next(err);
  }
}

async function deleteApplication(req, res, next) {
  try {
    const { id } = req.params;
    const application = await applicationService.deleteApplication(id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    return res.json({ message: 'Application deleted successfully' });
  } catch (err) {
    next(err);
  }
}

async function addRedirectUri(req, res, next) {
  try {
    const { id } = req.params;
    const { uri } = req.body;
    if (!uri) return res.status(400).json({ message: 'uri is required' });

    const application = await applicationService.addRedirectUri(id, uri);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    return res.json({
      id: application._id,
      name: application.name,
      redirectUris: application.redirectUris,
    });
  } catch (err) {
    next(err);
  }
}

async function removeRedirectUri(req, res, next) {
  try {
    const { id, uri } = req.params;
    const application = await applicationService.removeRedirectUri(id, uri);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    return res.json({
      id: application._id,
      name: application.name,
      redirectUris: application.redirectUris,
    });
  } catch (err) {
    next(err);
  }
}

async function addRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'role is required' });

    const application = await applicationService.addRole(id, role);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    return res.json({
      id: application._id,
      name: application.name,
      roles: application.roles,
    });
  } catch (err) {
    next(err);
  }
}

async function removeRole(req, res, next) {
  try {
    const { id, role } = req.params;
    const application = await applicationService.removeRole(id, role);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    return res.json({
      id: application._id,
      name: application.name,
      roles: application.roles,
    });
  } catch (err) {
    next(err);
  }
}

async function addAllowedOrigin(req, res, next) {
  try {
    const { id } = req.params;
    const { origin } = req.body;
    if (!origin) return res.status(400).json({ message: 'origin is required' });

    const application = await applicationService.addAllowedOrigin(id, origin);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    return res.json({
      id: application._id,
      name: application.name,
      allowedOrigins: application.allowedOrigins,
    });
  } catch (err) {
    next(err);
  }
}

async function removeAllowedOrigin(req, res, next) {
  try {
    const { id, origin } = req.params;
    const application = await applicationService.removeAllowedOrigin(id, origin);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    return res.json({
      id: application._id,
      name: application.name,
      allowedOrigins: application.allowedOrigins,
    });
  } catch (err) {
    next(err);
  }
}

function formatApplicationResponse(app) {
  return {
    id: app._id,
    name: app.name,
    displayName: app.displayName,
    description: app.description,
    url: app.url,
    redirectUris: app.redirectUris,
    logoutUrl: app.logoutUrl,
    allowedOrigins: app.allowedOrigins,
    accessTokenLifespan: app.accessTokenLifespan,
    refreshTokenLifespan: app.refreshTokenLifespan,
    enabled: app.enabled,
    requireHttps: app.requireHttps,
    publicClient: app.publicClient,
    standardFlowEnabled: app.standardFlowEnabled,
    implicitFlowEnabled: app.implicitFlowEnabled,
    directAccessGrantsEnabled: app.directAccessGrantsEnabled,
    serviceAccountsEnabled: app.serviceAccountsEnabled,
    roles: app.roles,
    attributes: app.attributes,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  };
}

module.exports = {
  createApplication,
  getApplicationById,
  listApplications,
  updateApplication,
  deleteApplication,
  addRedirectUri,
  removeRedirectUri,
  addRole,
  removeRole,
  addAllowedOrigin,
  removeAllowedOrigin,
};
