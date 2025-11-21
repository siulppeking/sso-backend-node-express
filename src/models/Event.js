const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    eventType: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'LOGIN_ERROR',
        'REGISTER',
        'PASSWORD_CHANGE',
        'PASSWORD_RESET',
        'EMAIL_VERIFY',
        'EMAIL_CHANGE',
        'ROLE_ADD',
        'ROLE_REMOVE',
        'GROUP_ADD',
        'GROUP_REMOVE',
        'ACCOUNT_LOCK',
        'ACCOUNT_UNLOCK',
        '2FA_ENABLE',
        '2FA_DISABLE',
        'USER_CREATE',
        'USER_UPDATE',
        'USER_DELETE',
      ],
      required: true,
    },
    ipAddress: { type: String },
    userAgent: { type: String },
    details: { type: Map, of: String, default: new Map() },
  },
  { timestamps: true }
);

EventSchema.index({ userId: 1, createdAt: -1 });
EventSchema.index({ eventType: 1, createdAt: -1 });
EventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Event', EventSchema);
