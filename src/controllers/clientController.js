const clientService = require('../services/clientService');

async function registerClient(req, res, next) {
  try {
    const { name, redirectUris, public: isPublic } = req.body;
    const { client, rawSecret } = await clientService.createClient({ name, redirectUris, isPublic });
    // rawSecret must be shown only once
    return res.status(201).json({ clientId: client.clientId, clientSecret: rawSecret, public: client.public });
  } catch (err) {
    next(err);
  }
}

module.exports = { registerClient };
