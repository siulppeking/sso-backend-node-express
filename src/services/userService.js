const User = require('../models/User');

async function createUser({ username, email, password, roles = ['user'] }) {
  const user = new User({ username, email, password, roles });
  await user.save();
  return user;
}

function findByEmail(email) {
  return User.findOne({ email });
}

function findById(id) {
  return User.findById(id);
}

async function addRole(userId, role) {
  const user = await User.findById(userId);
  if (!user) return null;
  if (!user.roles) user.roles = [];
  if (!user.roles.includes(role)) {
    user.roles.push(role);
    await user.save();
  }
  return user;
}

async function removeRole(userId, role) {
  const user = await User.findById(userId);
  if (!user) return null;
  if (!user.roles) user.roles = [];
  const idx = user.roles.indexOf(role);
  if (idx !== -1) {
    user.roles.splice(idx, 1);
    await user.save();
  }
  return user;
}

function listRoles(userId) {
  return User.findById(userId).select('roles');
}

module.exports = { createUser, findByEmail, findById, addRole, removeRole, listRoles };
