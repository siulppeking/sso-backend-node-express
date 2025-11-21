const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    attributes: { type: Map, of: String, default: new Map() },
    roles: { type: [String], default: [] },
    members: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
    parentGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

GroupSchema.index({ name: 1 });
GroupSchema.index({ enabled: 1 });

module.exports = mongoose.model('Group', GroupSchema);
