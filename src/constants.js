/**
 * Application Constants
 * Centralized constants used across the application
 */

// JWT
const JWT_DEFAULTS = {
  ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES || '15m',
  REFRESH_EXPIRES_DAYS: parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '7'),
};

// Password requirements
const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL: true,
};

// Roles
const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  REPORT: 'REPORT',
};

const ALLOWED_ROLES = Object.values(ROLES);

// HTTP Status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

// Error messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_EXISTS: 'User with this email already exists',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED_ACCESS: 'You do not have permission to access this resource',
  EMAIL_REQUIRED: 'Email is required',
  PASSWORD_REQUIRED: 'Password is required',
  WEAK_PASSWORD: 'Password does not meet security requirements',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_EMAIL: 'Please provide a valid email address',
  INVALID_ROLE: 'Invalid role provided',
};

// Success messages
const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  REGISTER_SUCCESS: 'Registration successful. Please verify your email.',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_RESET_SENT: 'Password reset email sent. Check your inbox.',
  PASSWORD_RESET_SUCCESS: 'Password reset successfully',
  EMAIL_VERIFIED: 'Email verified successfully',
  VERIFICATION_EMAIL_SENT: 'Verification email sent',
  TWO_FACTOR_ENABLED: 'Two-factor authentication enabled',
  TWO_FACTOR_DISABLED: 'Two-factor authentication disabled',
};

// 2FA
const TWO_FACTOR_CONFIG = {
  WINDOW: 2,
  BACKUP_CODES_COUNT: 10,
};

// Token expiration times
const TOKEN_EXPIRY = {
  RESET_PASSWORD: 60 * 60 * 1000, // 1 hour
  EMAIL_VERIFICATION: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_TOKEN_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Bcrypt salt rounds
const BCRYPT_SALT_ROUNDS = 10;

// Regex patterns
const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
};

module.exports = {
  JWT_DEFAULTS,
  PASSWORD_REQUIREMENTS,
  ROLES,
  ALLOWED_ROLES,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TWO_FACTOR_CONFIG,
  TOKEN_EXPIRY,
  BCRYPT_SALT_ROUNDS,
  REGEX_PATTERNS,
};
