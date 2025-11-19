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

module.exports = { createUser, findByEmail, findById };
