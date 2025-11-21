const { validationResult } = require('express-validator');
const groupService = require('../services/groupService');

async function createGroup(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, description, attributes, roles, parentGroup } = req.body;

    const existing = await groupService.findByName(name);
    if (existing) return res.status(409).json({ message: 'Group already exists' });

    const group = await groupService.createGroup({
      name,
      description,
      attributes,
      roles,
      parentGroup,
    });

    return res.status(201).json(formatGroupResponse(group));
  } catch (err) {
    next(err);
  }
}

async function listGroups(req, res, next) {
  try {
    const { enabled, search } = req.query;
    const filters = {};
    if (enabled !== undefined) filters.enabled = enabled === 'true';
    if (search) filters.search = search;

    const groups = await groupService.listGroups(filters);
    return res.json(groups.map(formatGroupResponse));
  } catch (err) {
    next(err);
  }
}

async function getGroupById(req, res, next) {
  try {
    const { id } = req.params;
    const group = await groupService.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    return res.json(formatGroupResponse(group));
  } catch (err) {
    next(err);
  }
}

async function updateGroup(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const group = await groupService.updateGroup(id, req.body);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    return res.json(formatGroupResponse(group));
  } catch (err) {
    next(err);
  }
}

async function deleteGroup(req, res, next) {
  try {
    const { id } = req.params;
    const group = await groupService.deleteGroup(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    return res.json({ message: 'Group deleted successfully' });
  } catch (err) {
    next(err);
  }
}

async function addMember(req, res, next) {
  try {
    const { id, userId } = req.params;
    const group = await groupService.addMember(id, userId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    return res.json({
      message: 'Member added to group',
      group: formatGroupResponse(group),
    });
  } catch (err) {
    next(err);
  }
}

async function removeMember(req, res, next) {
  try {
    const { id, userId } = req.params;
    const group = await groupService.removeMember(id, userId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    return res.json({
      message: 'Member removed from group',
      group: formatGroupResponse(group),
    });
  } catch (err) {
    next(err);
  }
}

async function addRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'role is required' });

    const group = await groupService.addRole(id, role);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    return res.json({
      message: 'Role added to group',
      group: formatGroupResponse(group),
    });
  } catch (err) {
    next(err);
  }
}

async function removeRole(req, res, next) {
  try {
    const { id, role } = req.params;
    const group = await groupService.removeRole(id, role);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    return res.json({
      message: 'Role removed from group',
      group: formatGroupResponse(group),
    });
  } catch (err) {
    next(err);
  }
}

function formatGroupResponse(group) {
  return {
    id: group._id,
    name: group.name,
    description: group.description,
    attributes: Object.fromEntries(group.attributes || []),
    roles: group.roles,
    members: group.members,
    memberCount: group.members ? group.members.length : 0,
    parentGroup: group.parentGroup,
    enabled: group.enabled,
    createdAt: group.createdAt,
    updatedAt: group.updatedAt,
  };
}

module.exports = {
  createGroup,
  listGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  addRole,
  removeRole,
};
