const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, lowercase: true },
    displayName: { type: String, required: true },
    description: { type: String },
    url: { type: String, required: true },
    redirectUris: { type: [String], default: [] },
    logoutUrl: { type: String },
    allowedOrigins: { type: [String], default: [] },
    accessTokenLifespan: { type: Number, default: 900 }, // seconds (15 minutes)
    refreshTokenLifespan: { type: Number, default: 2592000 }, // seconds (30 days)
    enabled: { type: Boolean, default: true },
    requireHttps: { type: Boolean, default: true },
    publicClient: { type: Boolean, default: false },
    standardFlowEnabled: { type: Boolean, default: true },
    implicitFlowEnabled: { type: Boolean, default: false },
    directAccessGrantsEnabled: { type: Boolean, default: true },
    serviceAccountsEnabled: { type: Boolean, default: false },
    roles: { type: [String], default: [] },
    attributes: { type: Map, of: String, default: new Map() },
  },
  { timestamps: true }
);

ApplicationSchema.index({ name: 1 });
ApplicationSchema.index({ enabled: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
