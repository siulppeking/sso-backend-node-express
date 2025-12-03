const crypto = require('crypto');
const User = require('../models/User');
const Event = require('../models/Event');

// User CRUD operations
async function createUser({ username, email, password, firstName = '', lastName = '', roles = ['user'], attributes = {} }) {
  const user = new User({
    username,
    email,
    password,
    firstName,
    lastName,
    roles,
    attributes,
  });
  await user.save();
  
  await logEvent(user._id, 'USER_CREATE', {
    username,
    email,
    roles: roles.join(','),
  });
  
  return user;
}

function findByEmail(email) {
  return User.findOne({ email }).populate('groups');
}

function findById(id) {
  return User.findById(id).populate('groups').populate('applications.applicationId');
}

function findByUsername(username) {
  return User.findOne({ username }).populate('groups');
}

async function listUsers(filters = {}, page = 1, limit = 20) {
  const query = {};
  if (filters.enabled !== undefined) query.enabled = filters.enabled;
  if (filters.emailVerified !== undefined) query.emailVerified = filters.emailVerified;
  if (filters.search) {
    query.$or = [
      { username: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
      { firstName: { $regex: filters.search, $options: 'i' } },
      { lastName: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;
  const users = await User.find(query)
    .populate('groups')
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });
  
  const total = await User.countDocuments(query);
  
  return { users, total, page, limit, pages: Math.ceil(total / limit) };
}

async function updateUser(id, updates) {
  const allowedUpdates = [
    'firstName',
    'lastName',
    'email',
    'attributes',
    'enabled',
    'twoFactorEnabled',
  ];

  const updateData = {};
  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  });

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate('groups');

  if (user) {
    await logEvent(id, 'USER_UPDATE', { fields: Object.keys(updateData).join(',') });
  }

  return user;
}

async function deleteUser(id) {
  const user = await User.findByIdAndDelete(id);
  
  if (user) {
    await logEvent(id, 'USER_DELETE', { username: user.username, email: user.email });
    // Remove user from groups
    await require('../models/Group').updateMany(
      { members: id },
      { $pull: { members: id } }
    );
  }

  return user;
}

// Email verification
async function generateEmailVerificationToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const user = await User.findByIdAndUpdate(
    userId,
    {
      emailVerificationToken: token,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    },
    { new: true }
  );
  return { user, token };
}

async function verifyEmail(token) {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) return null;

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  await logEvent(user._id, 'EMAIL_VERIFY', { email: user.email });
  return user;
}

// Password reset
async function generatePasswordResetToken(email) {
  const user = await User.findOne({ email });
  if (!user) return null;

  const token = crypto.randomBytes(32).toString('hex');
  user.passwordResetToken = token;
  user.passwordResetExpires = Date.now() + 1 * 60 * 60 * 1000; // 1 hour
  await user.save();

  await logEvent(user._id, 'PASSWORD_RESET', { email });
  return { user, token };
}

async function resetPassword(token, newPassword) {
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return null;

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  await logEvent(user._id, 'PASSWORD_CHANGE', {});
  return user;
}

async function changePassword(userId, oldPassword, newPassword) {
  const user = await User.findById(userId);
  if (!user) return null;

  const isValid = await user.comparePassword(oldPassword);
  if (!isValid) return false;

  user.password = newPassword;
  user.loginAttempts = 0;
  user.lockUntil = undefined;
  await user.save();

  await logEvent(userId, 'PASSWORD_CHANGE', {});
  return user;
}

// 2FA
function generate2FASecret() {
  return crypto.randomBytes(20).toString('hex');
}

async function enable2FA(userId, secret) {
  const backupCodes = Array.from({ length: 10 }).map(() =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  const user = await User.findByIdAndUpdate(
    userId,
    {
      twoFactorEnabled: true,
      twoFactorSecret: secret,
      twoFactorBackupCodes: backupCodes,
    },
    { new: true }
  );

  await logEvent(userId, '2FA_ENABLE', {});
  return { user, backupCodes };
}

async function disable2FA(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
      twoFactorBackupCodes: [],
    },
    { new: true }
  );

  await logEvent(userId, '2FA_DISABLE', {});
  return user;
}

// Account lock/unlock
async function lockAccount(userId, reason = '') {
  const lockUntil = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
  const user = await User.findByIdAndUpdate(
    userId,
    { lockUntil },
    { new: true }
  );

  await logEvent(userId, 'ACCOUNT_LOCK', { reason });
  return user;
}

async function unlockAccount(userId) {
  const user = await User.findByIdAndUpdate(
    userId,
    { $unset: { lockUntil: 1 }, loginAttempts: 0 },
    { new: true }
  );

  await logEvent(userId, 'ACCOUNT_UNLOCK', {});
  return user;
}

// Groups
async function addUserToGroup(userId, groupId) {
  const Group = require('../models/Group');
  
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { groups: groupId } },
    { new: true }
  ).populate('groups');

  await Group.findByIdAndUpdate(
    groupId,
    { $addToSet: { members: userId } }
  );

  await logEvent(userId, 'GROUP_ADD', { groupId: groupId.toString() });
  return user;
}

async function removeUserFromGroup(userId, groupId) {
  const Group = require('../models/Group');
  
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { groups: groupId } },
    { new: true }
  ).populate('groups');

  await Group.findByIdAndUpdate(
    groupId,
    { $pull: { members: userId } }
  );

  await logEvent(userId, 'GROUP_REMOVE', { groupId: groupId.toString() });
  return user;
}

// Roles
async function addRole(userId, role) {
  const user = await User.findById(userId);
  if (!user) return null;
  const allowedRoles = ['user', 'admin', 'REPORT'];
  if (!allowedRoles.includes(role)) return null;

  if (!user.roles.includes(role)) {
    user.roles.push(role);
    await user.save();
    await logEvent(userId, 'ROLE_ADD', { role });
  }
  return user;
}

async function removeRole(userId, role) {
  const user = await User.findById(userId);
  if (!user) return null;
  const idx = user.roles.indexOf(role);
  if (idx !== -1) {
    user.roles.splice(idx, 1);
    await user.save();
    await logEvent(userId, 'ROLE_REMOVE', { role });
  }
  return user;
}

// Application roles
async function addApplicationRole(userId, applicationId, role) {
  const user = await User.findById(userId);
  if (!user) return null;

  let appEntry = user.applications.find((a) => a.applicationId.toString() === applicationId.toString());
  if (!appEntry) {
    appEntry = { applicationId, roles: [] };
    user.applications.push(appEntry);
  }

  if (!appEntry.roles.includes(role)) {
    appEntry.roles.push(role);
    await user.save();
  }

  return user.populate('applications.applicationId');
}

async function removeApplicationRole(userId, applicationId, role) {
  const user = await User.findById(userId);
  if (!user) return null;

  const appEntry = user.applications.find((a) => a.applicationId.toString() === applicationId.toString());
  if (appEntry) {
    const idx = appEntry.roles.indexOf(role);
    if (idx !== -1) {
      appEntry.roles.splice(idx, 1);
      await user.save();
    }
  }

  return user.populate('applications.applicationId');
}

// Login tracking
async function recordLogin(userId, ipAddress = '', userAgent = '') {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      lastLogin: Date.now(),
      loginAttempts: 0,
      $unset: { lockUntil: 1 },
    },
    { new: true }
  );

  await logEvent(userId, 'LOGIN', { ipAddress, userAgent });
  return user;
}

async function recordLoginError(email, ipAddress = '', userAgent = '') {
  const user = await User.findOne({ email });
  if (!user) return null;

  await user.incLoginAttempts();
  await logEvent(user._id, 'LOGIN_ERROR', { email, ipAddress, userAgent });

  return user;
}

// Events
async function logEvent(userId, eventType, details = {}, ipAddress = '', userAgent = '') {
  const event = new Event({
    userId,
    eventType,
    details,
    ipAddress,
    userAgent,
  });
  await event.save();
  return event;
}

async function getUserEvents(userId, limit = 50) {
  return Event.find({ userId }).sort({ createdAt: -1 }).limit(limit);
}

async function getEventLog(filters = {}, limit = 100) {
  const query = {};
  if (filters.eventType) query.eventType = filters.eventType;
  if (filters.userId) query.userId = filters.userId;
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }

  return Event.find(query)
    .populate('userId', 'username email')
    .sort({ createdAt: -1 })
    .limit(limit);
}

// Legacy compatibility
function listRoles(userId) {
  return User.findById(userId).select('roles');
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  findByUsername,
  listUsers,
  updateUser,
  deleteUser,
  generateEmailVerificationToken,
  verifyEmail,
  generatePasswordResetToken,
  resetPassword,
  changePassword,
  generate2FASecret,
  enable2FA,
  disable2FA,
  lockAccount,
  unlockAccount,
  addUserToGroup,
  removeUserFromGroup,
  addRole,
  removeRole,
  addApplicationRole,
  removeApplicationRole,
  recordLogin,
  recordLoginError,
  logEvent,
  getUserEvents,
  getEventLog,
  listRoles,
};
