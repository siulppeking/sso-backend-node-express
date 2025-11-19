const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const Client = require('../models/Client');

async function createClient({ name, redirectUris = [], isPublic = false }) {
  const clientId = uuidv4();
  const rawSecret = uuidv4();
  const hashed = await bcrypt.hash(rawSecret, 10);
  const client = new Client({ name, clientId, clientSecret: hashed, redirectUris, public: isPublic });
  await client.save();
  return { client, rawSecret };
}

function findByClientId(clientId) {
  return Client.findOne({ clientId });
}

module.exports = { createClient, findByClientId };
