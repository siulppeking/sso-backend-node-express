const Role = require('../models/Role');

async function createRole({ name, description = '', permissions = [] }) {
  const role = new Role({ name, description, permissions });
  await role.save();
  return role;
}

function findById(id) {
  return Role.findById(id);
}

function findByName(name) {
  return Role.findOne({ name: name.toLowerCase() });
}

async function listRoles(filters = {}) {
  const query = {};
  if (filters.active !== undefined) query.active = filters.active;
  return Role.find(query);
}

async function updateRole(id, { name, description, permissions, active }) {
  const updates = {};
  if (name !== undefined) updates.name = name.toLowerCase();
  if (description !== undefined) updates.description = description;
  if (permissions !== undefined) updates.permissions = permissions;
  if (active !== undefined) updates.active = active;

  const role = await Role.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  return role;
}

async function deleteRole(id) {
  const role = await Role.findByIdAndDelete(id);
  return role;
}

async function addPermission(id, permission) {
  const role = await Role.findById(id);
  if (!role) return null;
  if (!role.permissions.includes(permission)) {
    role.permissions.push(permission);
    await role.save();
  }
  return role;
}

async function removePermission(id, permission) {
  const role = await Role.findById(id);
  if (!role) return null;
  const idx = role.permissions.indexOf(permission);
  if (idx !== -1) {
    role.permissions.splice(idx, 1);
    await role.save();
  }
  return role;
}

module.exports = {
  createRole,
  findById,
  findByName,
  listRoles,
  updateRole,
  deleteRole,
  addPermission,
  removePermission,
};
