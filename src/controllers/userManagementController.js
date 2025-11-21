const { validationResult } = require('express-validator');
const userService = require('../services/userService');

// User Management
async function createUser(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password, firstName, lastName, roles, attributes } = req.body;

    const existing = await userService.findByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already in use' });

    const user = await userService.createUser({
      username,
      email,
      password,
      firstName,
      lastName,
      roles,
      attributes,
    });

    return res.status(201).json(formatUserResponse(user));
  } catch (err) {
    next(err);
  }
}

async function listUsers(req, res, next) {
  try {
    const { enabled, emailVerified, search, page = 1, limit = 20 } = req.query;
    const filters = {};
    if (enabled !== undefined) filters.enabled = enabled === 'true';
    if (emailVerified !== undefined) filters.emailVerified = emailVerified === 'true';
    if (search) filters.search = search;

    const result = await userService.listUsers(filters, parseInt(page), parseInt(limit));
    return res.json({
      users: result.users.map(formatUserResponse),
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        pages: result.pages,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userService.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json(formatUserResponse(user));
  } catch (err) {
    next(err);
  }
}

async function updateUser(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const user = await userService.updateUser(id, req.body);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json(formatUserResponse(user));
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userService.deleteUser(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// Email verification
async function sendEmailVerification(req, res, next) {
  try {
    const { id } = req.params;
    const { token, user } = await userService.generateEmailVerificationToken(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // TODO: Send email with verification link
    // For now, return token for testing
    return res.json({
      message: 'Verification email sent',
      verificationToken: token, // Only for development
    });
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'token is required' });

    const user = await userService.verifyEmail(token);
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    return res.json({
      message: 'Email verified successfully',
      user: formatUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

// Password management
async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });

    const result = await userService.generatePasswordResetToken(email);
    if (!result) return res.status(404).json({ message: 'User not found' });

    // TODO: Send email with reset link
    return res.json({
      message: 'Password reset email sent',
      resetToken: result.token, // Only for development
    });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'token and newPassword are required' });
    }

    const user = await userService.resetPassword(token, newPassword);
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    return res.json({
      message: 'Password reset successfully',
      user: formatUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'oldPassword and newPassword are required' });
    }

    const userId = req.user.sub;
    const result = await userService.changePassword(userId, oldPassword, newPassword);
    if (result === false) return res.status(401).json({ message: 'Invalid current password' });
    if (!result) return res.status(404).json({ message: 'User not found' });

    return res.json({
      message: 'Password changed successfully',
      user: formatUserResponse(result),
    });
  } catch (err) {
    next(err);
  }
}

// 2FA
async function enable2FA(req, res, next) {
  try {
    const userId = req.user.sub;
    const secret = userService.generate2FASecret();
    const { user, backupCodes } = await userService.enable2FA(userId, secret);

    return res.json({
      message: '2FA enabled',
      secret,
      backupCodes,
      user: formatUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

async function disable2FA(req, res, next) {
  try {
    const userId = req.user.sub;
    const user = await userService.disable2FA(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      message: '2FA disabled',
      user: formatUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

// Groups
async function addUserToGroup(req, res, next) {
  try {
    const { userId, groupId } = req.params;
    const user = await userService.addUserToGroup(userId, groupId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      message: 'User added to group',
      user: formatUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

async function removeUserFromGroup(req, res, next) {
  try {
    const { userId, groupId } = req.params;
    const user = await userService.removeUserFromGroup(userId, groupId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      message: 'User removed from group',
      user: formatUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

// Application roles
async function addApplicationRole(req, res, next) {
  try {
    const { userId, applicationId } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'role is required' });

    const user = await userService.addApplicationRole(userId, applicationId, role);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      message: 'Application role added',
      user: formatUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

async function removeApplicationRole(req, res, next) {
  try {
    const { userId, applicationId, role } = req.params;
    const user = await userService.removeApplicationRole(userId, applicationId, role);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      message: 'Application role removed',
      user: formatUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

// Events
async function getUserEvents(req, res, next) {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;
    const events = await userService.getUserEvents(userId, parseInt(limit));

    return res.json(events);
  } catch (err) {
    next(err);
  }
}

async function getEventLog(req, res, next) {
  try {
    const { eventType, userId, startDate, endDate, limit = 100 } = req.query;
    const filters = {};
    if (eventType) filters.eventType = eventType;
    if (userId) filters.userId = userId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const events = await userService.getEventLog(filters, parseInt(limit));
    return res.json(events);
  } catch (err) {
    next(err);
  }
}

// Account lock/unlock
async function lockAccount(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const user = await userService.lockAccount(id, reason || '');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      message: 'Account locked',
      user: formatUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

async function unlockAccount(req, res, next) {
  try {
    const { id } = req.params;
    const user = await userService.unlockAccount(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      message: 'Account unlocked',
      user: formatUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

function formatUserResponse(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles,
    groups: user.groups,
    attributes: Object.fromEntries(user.attributes || []),
    enabled: user.enabled,
    emailVerified: user.emailVerified,
    lastLogin: user.lastLogin,
    twoFactorEnabled: user.twoFactorEnabled,
    applications: user.applications,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

module.exports = {
  createUser,
  listUsers,
  getUserById,
  updateUser,
  deleteUser,
  sendEmailVerification,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  changePassword,
  enable2FA,
  disable2FA,
  addUserToGroup,
  removeUserFromGroup,
  addApplicationRole,
  removeApplicationRole,
  getUserEvents,
  getEventLog,
  lockAccount,
  unlockAccount,
};
