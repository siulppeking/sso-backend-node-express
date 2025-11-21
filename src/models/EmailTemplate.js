const mongoose = require('mongoose');

const EmailTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: [
        'WELCOME',
        'EMAIL_VERIFICATION',
        'PASSWORD_RESET',
        'PASSWORD_CHANGED',
        'EMAIL_CHANGED',
        'ACCOUNT_LOCKED',
        'ACCOUNT_UNLOCKED',
        '2FA_ENABLED',
        '2FA_DISABLED',
        'LOGIN_ALERT',
        'SUSPICIOUS_ACTIVITY',
      ],
    },
    subject: { type: String, required: true },
    htmlTemplate: { type: String, required: true }, // Handlebars template
    textTemplate: { type: String }, // Plain text version
    description: { type: String },
    variables: { type: [String], default: [] }, // List of required variables
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmailTemplate', EmailTemplateSchema);
