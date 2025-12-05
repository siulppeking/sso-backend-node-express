/**
 * Base Schema Methods
 * Common methods shared across Mongoose models
 */

const { logger } = require('../utils/logger');

/**
 * Add timestamps plugin configuration
 */
function getTimestampConfig() {
  return {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
    },
  };
}

/**
 * Add soft delete plugin configuration
 */
function getSoftDeleteConfig() {
  return {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  };
}

/**
 * Add index configuration helper
 */
function createIndexConfig(field, options = {}) {
  return {
    [field]: {
      type: String,
      index: true,
      ...options,
    },
  };
}

/**
 * Create unique index helper
 */
function createUniqueField(fieldName, options = {}) {
  return {
    [fieldName]: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      ...options,
    },
  };
}

/**
 * Create TTL index helper (for auto-expiration)
 */
function createTTLField(fieldName, ttlSeconds = 86400) {
  return {
    [fieldName]: {
      type: Date,
      default: () => new Date(),
      index: { expireAfterSeconds: ttlSeconds },
    },
  };
}

/**
 * Standard audit fields configuration
 */
function getAuditFields() {
  return {
    createdAt: {
      type: Date,
      default: () => new Date(),
    },
    updatedAt: {
      type: Date,
      default: () => new Date(),
    },
    createdBy: String,
    updatedBy: String,
  };
}

/**
 * Pre-save logging helper
 */
function setupPreSaveLogging(schema, modelName) {
  schema.pre('save', function(next) {
    if (this.isNew) {
      logger.debug(`Creating new ${modelName}`, { id: this._id });
    } else {
      logger.debug(`Updating ${modelName}`, { id: this._id });
    }
    next();
  });
}

/**
 * Post-save logging helper
 */
function setupPostSaveLogging(schema, modelName) {
  schema.post('save', function() {
    logger.debug(`${modelName} saved successfully`, { id: this._id });
  });
}

/**
 * Post-remove logging helper
 */
function setupPostRemoveLogging(schema, modelName) {
  schema.post('remove', function() {
    logger.debug(`${modelName} removed`, { id: this._id });
  });
}

/**
 * Convert response helper (remove sensitive fields)
 */
function getSensitiveFieldsConfig() {
  return {
    password: 0,
    passwordResetToken: 0,
    passwordResetExpires: 0,
    emailVerificationToken: 0,
    emailVerificationExpires: 0,
    twoFactorSecret: 0,
    twoFactorBackupCodes: 0,
    __v: 0,
  };
}

/**
 * Pagination helper
 */
async function paginate(model, query, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    model.find(query).skip(skip).limit(limit),
    model.countDocuments(query),
  ]);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
}

module.exports = {
  getTimestampConfig,
  getSoftDeleteConfig,
  createIndexConfig,
  createUniqueField,
  createTTLField,
  getAuditFields,
  setupPreSaveLogging,
  setupPostSaveLogging,
  setupPostRemoveLogging,
  getSensitiveFieldsConfig,
  paginate,
};
