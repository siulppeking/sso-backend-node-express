const { validationResult } = require('express-validator');
const roleService = require('../services/roleService');

async function createRole(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description, permissions } = req.body;
    
    const existing = await roleService.findByName(name);
    if (existing) return res.status(409).json({ message: 'Role already exists' });

    const role = await roleService.createRole({ name, description, permissions });
    return res.status(201).json({
      id: role._id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      active: role.active,
    });
  } catch (err) {
    next(err);
  }
}

async function getRoleById(req, res, next) {
  try {
    const { id } = req.params;
    const role = await roleService.findById(id);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    return res.json({
      id: role._id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      active: role.active,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    });
  } catch (err) {
    next(err);
  }
}

async function listRoles(req, res, next) {
  try {
    const { active } = req.query;
    const filters = {};
    if (active !== undefined) filters.active = active === 'true';

    const roles = await roleService.listRoles(filters);
    return res.json(
      roles.map((role) => ({
        id: role._id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        active: role.active,
        createdAt: role.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
}

async function updateRole(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { name, description, permissions, active } = req.body;

    // Check if name is already used by another role
    if (name) {
      const existing = await roleService.findByName(name);
      if (existing && existing._id.toString() !== id) {
        return res.status(409).json({ message: 'Role name already exists' });
      }
    }

    const role = await roleService.updateRole(id, { name, description, permissions, active });
    if (!role) return res.status(404).json({ message: 'Role not found' });

    return res.json({
      id: role._id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      active: role.active,
      updatedAt: role.updatedAt,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteRole(req, res, next) {
  try {
    const { id } = req.params;
    const role = await roleService.deleteRole(id);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    return res.json({ message: 'Role deleted successfully' });
  } catch (err) {
    next(err);
  }
}

async function addPermission(req, res, next) {
  try {
    const { id } = req.params;
    const { permission } = req.body;
    if (!permission) return res.status(400).json({ message: 'permission is required' });

    const role = await roleService.addPermission(id, permission);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    return res.json({
      id: role._id,
      name: role.name,
      permissions: role.permissions,
    });
  } catch (err) {
    next(err);
  }
}

async function removePermission(req, res, next) {
  try {
    const { id, permission } = req.params;
    const role = await roleService.removePermission(id, permission);
    if (!role) return res.status(404).json({ message: 'Role not found' });

    return res.json({
      id: role._id,
      name: role.name,
      permissions: role.permissions,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createRole,
  getRoleById,
  listRoles,
  updateRole,
  deleteRole,
  addPermission,
  removePermission,
};
