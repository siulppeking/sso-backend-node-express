const { body } = require('express-validator');
const {
  REGEX_PATTERNS,
  PASSWORD_REQUIREMENTS,
  ERROR_MESSAGES,
} = require('../constants');

/**
 * Email validation helper
 */
function isValidEmail(email) {
  return REGEX_PATTERNS.EMAIL.test(email);
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
  const errors = [];

  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }

  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    errors.push(
      `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`
    );
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.REQUIRE_SPECIAL && !/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate username format
 */
function isValidUsername(username) {
  if (!username || typeof username !== 'string') return false;
  if (username.length < 3 || username.length > 20) return false;
  return /^[a-zA-Z0-9_-]+$/.test(username);
}

/**
 * Sanitize user object (remove sensitive fields)
 */
function sanitizeUser(user) {
  if (!user) return null;

  const sanitized = user.toObject ? user.toObject() : { ...user };

  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.passwordResetToken;
  delete sanitized.passwordResetExpires;
  delete sanitized.emailVerificationToken;
  delete sanitized.twoFactorSecret;
  delete sanitized.twoFactorBackupCodes;

  return sanitized;
}

// Express validator rules
const registerValidators = [
  body('username')
    .isString()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters')
    .custom(username => isValidUsername(username))
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .custom(email => isValidEmail(email))
    .withMessage('Invalid email format'),
  body('password')
    .isString()
    .custom(password => {
      const { isValid } = validatePasswordStrength(password);
      return isValid;
    })
    .withMessage('Password does not meet security requirements'),
];

const loginValidators = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isString()
    .notEmpty()
    .withMessage('Password is required'),
];

const passwordResetValidators = [
  body('newPassword')
    .isString()
    .custom(password => {
      const { isValid } = validatePasswordStrength(password);
      return isValid;
    })
    .withMessage('Password does not meet security requirements'),
];

module.exports = {
  isValidEmail,
  validatePasswordStrength,
  isValidUsername,
  sanitizeUser,
  registerValidators,
  loginValidators,
  passwordResetValidators,
};

