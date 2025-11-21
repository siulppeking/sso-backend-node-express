const Group = require('../models/Group');
const User = require('../models/User');

async function createGroup({ name, description = '', attributes = {}, roles = [], parentGroup = null }) {
  const group = new Group({
    name,
    description,
    attributes,
    roles,
    parentGroup,
  });
  await group.save();
  return group.populate('parentGroup');
}

function findById(id) {
  return Group.findById(id).populate('members').populate('parentGroup');
}

function findByName(name) {
  return Group.findOne({ name }).populate('members').populate('parentGroup');
}

async function listGroups(filters = {}) {
  const query = {};
  if (filters.enabled !== undefined) query.enabled = filters.enabled;
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
    ];
  }

  return Group.find(query)
    .populate('members', 'username email')
    .populate('parentGroup')
    .sort({ name: 1 });
}

async function updateGroup(id, updates) {
  const allowedUpdates = ['description', 'attributes', 'roles', 'parentGroup', 'enabled'];

  const updateData = {};
  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  });

  return Group.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('members')
    .populate('parentGroup');
}

async function deleteGroup(id) {
  const group = await Group.findByIdAndDelete(id);
  if (group) {
    // Remove group from users
    await User.updateMany({ groups: id }, { $pull: { groups: id } });
    // Remove as parent from subgroups
    await Group.updateMany({ parentGroup: id }, { $unset: { parentGroup: 1 } });
  }
  return group;
}

async function addMember(groupId, userId) {
  const group = await Group.findByIdAndUpdate(
    groupId,
    { $addToSet: { members: userId } },
    { new: true }
  ).populate('members');

  // Also add group to user
  await User.findByIdAndUpdate(userId, { $addToSet: { groups: groupId } });

  return group;
}

async function removeMember(groupId, userId) {
  const group = await Group.findByIdAndUpdate(
    groupId,
    { $pull: { members: userId } },
    { new: true }
  ).populate('members');

  // Also remove group from user
  await User.findByIdAndUpdate(userId, { $pull: { groups: groupId } });

  return group;
}

async function addRole(groupId, role) {
  const group = await Group.findById(groupId);
  if (!group) return null;
  if (!group.roles.includes(role)) {
    group.roles.push(role);
    await group.save();
  }
  return group;
}

async function removeRole(groupId, role) {
  const group = await Group.findById(groupId);
  if (!group) return null;
  const idx = group.roles.indexOf(role);
  if (idx !== -1) {
    group.roles.splice(idx, 1);
    await group.save();
  }
  return group;
}

module.exports = {
  createGroup,
  findById,
  findByName,
  listGroups,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  addRole,
  removeRole,
};
