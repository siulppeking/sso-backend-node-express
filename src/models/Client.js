const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    clientId: { type: String, required: true, unique: true },
    clientSecret: { type: String, required: true },
    redirectUris: { type: [String], default: [] },
    public: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ClientSchema.methods.compareSecret = function (candidate) {
  return bcrypt.compare(candidate, this.clientSecret);
};

module.exports = mongoose.model('Client', ClientSchema);
