const Application = require('../models/Application');

async function createApplication({
  name,
  displayName,
  description = '',
  url,
  redirectUris = [],
  logoutUrl = '',
  allowedOrigins = [],
  accessTokenLifespan = 900,
  refreshTokenLifespan = 2592000,
  requireHttps = true,
  publicClient = false,
  roles = [],
  attributes = {},
}) {
  const application = new Application({
    name: name.toLowerCase(),
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
  await application.save();
  return application;
}

function findById(id) {
  return Application.findById(id);
}

function findByName(name) {
  return Application.findOne({ name: name.toLowerCase() });
}

async function listApplications(filters = {}) {
  const query = {};
  if (filters.enabled !== undefined) query.enabled = filters.enabled;
  if (filters.publicClient !== undefined) query.publicClient = filters.publicClient;
  
  return Application.find(query).sort({ createdAt: -1 });
}

async function updateApplication(id, updates) {
  const allowedUpdates = [
    'displayName',
    'description',
    'url',
    'redirectUris',
    'logoutUrl',
    'allowedOrigins',
    'accessTokenLifespan',
    'refreshTokenLifespan',
    'enabled',
    'requireHttps',
    'publicClient',
    'standardFlowEnabled',
    'implicitFlowEnabled',
    'directAccessGrantsEnabled',
    'serviceAccountsEnabled',
    'roles',
    'attributes',
  ];

  const updateData = {};
  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  });

  const application = await Application.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  return application;
}

async function deleteApplication(id) {
  const application = await Application.findByIdAndDelete(id);
  return application;
}

async function addRedirectUri(id, uri) {
  const application = await Application.findById(id);
  if (!application) return null;
  if (!application.redirectUris.includes(uri)) {
    application.redirectUris.push(uri);
    await application.save();
  }
  return application;
}

async function removeRedirectUri(id, uri) {
  const application = await Application.findById(id);
  if (!application) return null;
  const idx = application.redirectUris.indexOf(uri);
  if (idx !== -1) {
    application.redirectUris.splice(idx, 1);
    await application.save();
  }
  return application;
}

async function addRole(id, role) {
  const application = await Application.findById(id);
  if (!application) return null;
  if (!application.roles.includes(role)) {
    application.roles.push(role);
    await application.save();
  }
  return application;
}

async function removeRole(id, role) {
  const application = await Application.findById(id);
  if (!application) return null;
  const idx = application.roles.indexOf(role);
  if (idx !== -1) {
    application.roles.splice(idx, 1);
    await application.save();
  }
  return application;
}

async function addAllowedOrigin(id, origin) {
  const application = await Application.findById(id);
  if (!application) return null;
  if (!application.allowedOrigins.includes(origin)) {
    application.allowedOrigins.push(origin);
    await application.save();
  }
  return application;
}

async function removeAllowedOrigin(id, origin) {
  const application = await Application.findById(id);
  if (!application) return null;
  const idx = application.allowedOrigins.indexOf(origin);
  if (idx !== -1) {
    application.allowedOrigins.splice(idx, 1);
    await application.save();
  }
  return application;
}

module.exports = {
  createApplication,
  findById,
  findByName,
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
