const { logger } = require('../utils/logger');
const { HTTP_STATUS } = require('../constants');

/**
 * Normalize error object
 */
function normalizeError(err) {
  if (err.isJoi) {
    // Joi validation error
    return {
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message: err.message,
      details: err.details,
    };
  }

  if (err.name === 'JsonWebTokenError') {
    // JWT error
    return {
      status: HTTP_STATUS.UNAUTHORIZED,
      message: 'Invalid token',
    };
  }

  if (err.name === 'TokenExpiredError') {
    // JWT expired
    return {
      status: HTTP_STATUS.UNAUTHORIZED,
      message: 'Token has expired',
    };
  }

  if (err.name === 'ValidationError') {
    // Mongoose validation error
    return {
      status: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      message: 'Validation failed',
      details: Object.values(err.errors).map(e => e.message),
    };
  }

  if (err.name === 'CastError') {
    // Mongoose cast error (invalid ObjectId)
    return {
      status: HTTP_STATUS.BAD_REQUEST,
      message: 'Invalid ID format',
    };
  }

  if (err.code === 11000) {
    // MongoDB duplicate key error
    const field = Object.keys(err.keyPattern)[0];
    return {
      status: HTTP_STATUS.CONFLICT,
      message: `${field} already exists`,
    };
  }

  // Generic error
  return {
    status: err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: err.message || 'Internal Server Error',
  };
}

/**
 * Format error response
 */
function formatErrorResponse(normalizedError, isDevelopment = false) {
  const response = {
    error: normalizedError.message,
    status: normalizedError.status,
  };

  if (isDevelopment && normalizedError.details) {
    response.details = normalizedError.details;
  }

  return response;
}

/**
 * Central error handler middleware
 */
function errorHandler(err, req, res, next) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Log error
  logger.error('Request error', {
    message: err.message,
    status: err.status || 500,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  // Normalize error
  const normalizedError = normalizeError(err);

  // Format response
  const response = formatErrorResponse(normalizedError, isDevelopment);

  // Send response
  res.status(normalizedError.status).json(response);
}

/**
 * Create custom error
 */
class AppError extends Error {
  constructor(message, status = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.status = status;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found error
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, HTTP_STATUS.NOT_FOUND);
  }
}

/**
 * Unauthorized error
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

/**
 * Forbidden error
 */
class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

/**
 * Validation error
 */
class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY);
  }
}

module.exports = {
  errorHandler,
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  normalizeError,
  formatErrorResponse,
};

