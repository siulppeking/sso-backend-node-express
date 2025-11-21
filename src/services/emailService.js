const nodemailer = require('nodemailer');
const Handlebars = require('handlebars');
const EmailTemplate = require('../models/EmailTemplate');

// Initialize transporter
let transporter = null;

function initializeTransporter() {
  if (transporter) return transporter;

  // For development, use ethereal or custom SMTP
  if (process.env.NODE_ENV === 'development') {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // For production, configure your SMTP
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  return transporter;
}

async function sendEmail({ to, templateName, variables = {}, attachments = [] }) {
  try {
    // Get template from database
    const template = await EmailTemplate.findOne({ name: templateName, enabled: true });
    if (!template) {
      throw new Error(`Email template '${templateName}' not found or disabled`);
    }

    // Compile and render templates
    const subjectCompiled = Handlebars.compile(template.subject);
    const htmlCompiled = Handlebars.compile(template.htmlTemplate);
    const subject = subjectCompiled(variables);
    const html = htmlCompiled(variables);

    let text = null;
    if (template.textTemplate) {
      const textCompiled = Handlebars.compile(template.textTemplate);
      text = textCompiled(variables);
    }

    // Initialize transporter if needed
    const mailTransporter = initializeTransporter();

    // Send email
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
      attachments,
    };

    const result = await mailTransporter.sendMail(mailOptions);

    console.log(`Email sent to ${to}: ${result.messageId}`);
    return { success: true, messageId: result.messageId };
  } catch (err) {
    console.error(`Error sending email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

async function sendWelcomeEmail(user) {
  return sendEmail({
    to: user.email,
    templateName: 'WELCOME',
    variables: {
      userName: user.firstName || user.username,
      username: user.username,
      appUrl: process.env.APP_URL || 'http://localhost:3000',
    },
  });
}

async function sendEmailVerificationEmail(user, token) {
  const verificationUrl = `${process.env.APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  return sendEmail({
    to: user.email,
    templateName: 'EMAIL_VERIFICATION',
    variables: {
      userName: user.firstName || user.username,
      verificationUrl,
      expiresIn: '24 hours',
    },
  });
}

async function sendPasswordResetEmail(user, token) {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  return sendEmail({
    to: user.email,
    templateName: 'PASSWORD_RESET',
    variables: {
      userName: user.firstName || user.username,
      resetUrl,
      expiresIn: '1 hour',
    },
  });
}

async function sendPasswordChangedEmail(user) {
  return sendEmail({
    to: user.email,
    templateName: 'PASSWORD_CHANGED',
    variables: {
      userName: user.firstName || user.username,
      timestamp: new Date().toLocaleString(),
    },
  });
}

async function sendEmailChangedEmail(user, newEmail) {
  return sendEmail({
    to: user.email,
    templateName: 'EMAIL_CHANGED',
    variables: {
      userName: user.firstName || user.username,
      newEmail,
      timestamp: new Date().toLocaleString(),
    },
  });
}

async function sendAccountLockedEmail(user, reason = '') {
  return sendEmail({
    to: user.email,
    templateName: 'ACCOUNT_LOCKED',
    variables: {
      userName: user.firstName || user.username,
      reason: reason || 'Multiple failed login attempts',
      supportUrl: process.env.SUPPORT_URL || 'https://support.example.com',
    },
  });
}

async function sendAccountUnlockedEmail(user) {
  return sendEmail({
    to: user.email,
    templateName: 'ACCOUNT_UNLOCKED',
    variables: {
      userName: user.firstName || user.username,
      loginUrl: `${process.env.APP_URL || 'http://localhost:3000'}/login`,
    },
  });
}

async function send2FAEnabledEmail(user) {
  return sendEmail({
    to: user.email,
    templateName: '2FA_ENABLED',
    variables: {
      userName: user.firstName || user.username,
      timestamp: new Date().toLocaleString(),
    },
  });
}

async function send2FADisabledEmail(user) {
  return sendEmail({
    to: user.email,
    templateName: '2FA_DISABLED',
    variables: {
      userName: user.firstName || user.username,
      timestamp: new Date().toLocaleString(),
    },
  });
}

async function sendLoginAlertEmail(user, ipAddress, userAgent) {
  return sendEmail({
    to: user.email,
    templateName: 'LOGIN_ALERT',
    variables: {
      userName: user.firstName || user.username,
      ipAddress,
      userAgent,
      timestamp: new Date().toLocaleString(),
    },
  });
}

async function sendSuspiciousActivityEmail(user, details) {
  return sendEmail({
    to: user.email,
    templateName: 'SUSPICIOUS_ACTIVITY',
    variables: {
      userName: user.firstName || user.username,
      details,
      supportUrl: process.env.SUPPORT_URL || 'https://support.example.com',
      timestamp: new Date().toLocaleString(),
    },
  });
}

// Template management
async function createTemplate({ name, subject, htmlTemplate, textTemplate, description, variables = [] }) {
  const template = new EmailTemplate({
    name,
    subject,
    htmlTemplate,
    textTemplate,
    description,
    variables,
  });
  await template.save();
  return template;
}

async function getTemplate(name) {
  return EmailTemplate.findOne({ name });
}

async function updateTemplate(name, updates) {
  const allowedUpdates = ['subject', 'htmlTemplate', 'textTemplate', 'description', 'variables', 'enabled'];
  const updateData = {};
  
  allowedUpdates.forEach((field) => {
    if (updates[field] !== undefined) {
      updateData[field] = updates[field];
    }
  });

  return EmailTemplate.findOneAndUpdate({ name }, updateData, { new: true });
}

async function listTemplates() {
  return EmailTemplate.find().sort({ name: 1 });
}

// Initialize default templates
async function initializeDefaultTemplates() {
  const defaultTemplates = [
    {
      name: 'WELCOME',
      subject: 'Bienvenido a {{appName}}',
      htmlTemplate: `
        <h1>¡Hola {{userName}}!</h1>
        <p>Bienvenido a nuestro servicio.</p>
        <p>Tu usuario es: <strong>{{username}}</strong></p>
        <p><a href="{{appUrl}}">Acceder a la aplicación</a></p>
      `,
      description: 'Email de bienvenida para nuevos usuarios',
      variables: ['userName', 'username', 'appUrl'],
    },
    {
      name: 'EMAIL_VERIFICATION',
      subject: 'Verifica tu email en {{appName}}',
      htmlTemplate: `
        <h1>Verificación de Email</h1>
        <p>Hola {{userName}},</p>
        <p>Por favor, verifica tu email haciendo clic en el siguiente enlace:</p>
        <p><a href="{{verificationUrl}}">Verificar Email</a></p>
        <p>Este enlace expira en {{expiresIn}}</p>
        <p>Si no realizaste esta solicitud, ignora este email.</p>
      `,
      description: 'Email para verificación de dirección de email',
      variables: ['userName', 'verificationUrl', 'expiresIn'],
    },
    {
      name: 'PASSWORD_RESET',
      subject: 'Restablecer contraseña en {{appName}}',
      htmlTemplate: `
        <h1>Restablecer Contraseña</h1>
        <p>Hola {{userName}},</p>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p><a href="{{resetUrl}}">Restablecer Contraseña</a></p>
        <p>Este enlace expira en {{expiresIn}}</p>
        <p>Si no realizaste esta solicitud, ignora este email.</p>
      `,
      description: 'Email para restablecer contraseña',
      variables: ['userName', 'resetUrl', 'expiresIn'],
    },
    {
      name: 'PASSWORD_CHANGED',
      subject: 'Tu contraseña ha sido cambiada',
      htmlTemplate: `
        <h1>Contraseña Cambiada</h1>
        <p>Hola {{userName}},</p>
        <p>Tu contraseña ha sido cambiada exitosamente.</p>
        <p>Fecha y hora: {{timestamp}}</p>
        <p>Si no realizaste este cambio, contacta a nuestro equipo de soporte inmediatamente.</p>
      `,
      description: 'Confirmación de cambio de contraseña',
      variables: ['userName', 'timestamp'],
    },
    {
      name: 'EMAIL_CHANGED',
      subject: 'Tu email ha sido actualizado',
      htmlTemplate: `
        <h1>Email Actualizado</h1>
        <p>Hola {{userName}},</p>
        <p>Tu email ha sido actualizado a: <strong>{{newEmail}}</strong></p>
        <p>Fecha y hora: {{timestamp}}</p>
        <p>Si no realizaste este cambio, contacta a nuestro equipo de soporte.</p>
      `,
      description: 'Confirmación de cambio de email',
      variables: ['userName', 'newEmail', 'timestamp'],
    },
    {
      name: 'ACCOUNT_LOCKED',
      subject: 'Tu cuenta ha sido bloqueada',
      htmlTemplate: `
        <h1>Cuenta Bloqueada</h1>
        <p>Hola {{userName}},</p>
        <p>Tu cuenta ha sido bloqueada por seguridad.</p>
        <p>Razón: {{reason}}</p>
        <p>Por favor, contacta a <a href="{{supportUrl}}">nuestro equipo de soporte</a></p>
      `,
      description: 'Notificación de bloqueo de cuenta',
      variables: ['userName', 'reason', 'supportUrl'],
    },
    {
      name: 'ACCOUNT_UNLOCKED',
      subject: 'Tu cuenta ha sido desbloqueada',
      htmlTemplate: `
        <h1>Cuenta Desbloqueada</h1>
        <p>Hola {{userName}},</p>
        <p>Tu cuenta ha sido desbloqueada y puedes acceder nuevamente.</p>
        <p><a href="{{loginUrl}}">Acceder</a></p>
      `,
      description: 'Notificación de desbloqueo de cuenta',
      variables: ['userName', 'loginUrl'],
    },
    {
      name: '2FA_ENABLED',
      subject: 'Autenticación de dos factores habilitada',
      htmlTemplate: `
        <h1>2FA Habilitado</h1>
        <p>Hola {{userName}},</p>
        <p>La autenticación de dos factores ha sido habilitada en tu cuenta.</p>
        <p>Fecha y hora: {{timestamp}}</p>
        <p>Si no realizaste esto, contacta a soporte inmediatamente.</p>
      `,
      description: 'Confirmación de habilitación de 2FA',
      variables: ['userName', 'timestamp'],
    },
    {
      name: '2FA_DISABLED',
      subject: 'Autenticación de dos factores deshabilitada',
      htmlTemplate: `
        <h1>2FA Deshabilitado</h1>
        <p>Hola {{userName}},</p>
        <p>La autenticación de dos factores ha sido deshabilitada en tu cuenta.</p>
        <p>Fecha y hora: {{timestamp}}</p>
        <p>Si no realizaste esto, contacta a soporte inmediatamente.</p>
      `,
      description: 'Confirmación de deshabilitación de 2FA',
      variables: ['userName', 'timestamp'],
    },
    {
      name: 'LOGIN_ALERT',
      subject: 'Nuevo acceso a tu cuenta',
      htmlTemplate: `
        <h1>Alerta de Acceso</h1>
        <p>Hola {{userName}},</p>
        <p>Se ha detectado un nuevo acceso a tu cuenta:</p>
        <ul>
          <li>Dirección IP: {{ipAddress}}</li>
          <li>Navegador: {{userAgent}}</li>
          <li>Fecha y hora: {{timestamp}}</li>
        </ul>
        <p>Si no fuiste tú, cambia tu contraseña inmediatamente.</p>
      `,
      description: 'Alerta de acceso a la cuenta',
      variables: ['userName', 'ipAddress', 'userAgent', 'timestamp'],
    },
    {
      name: 'SUSPICIOUS_ACTIVITY',
      subject: 'Actividad sospechosa detectada',
      htmlTemplate: `
        <h1>Actividad Sospechosa</h1>
        <p>Hola {{userName}},</p>
        <p>Hemos detectado actividad sospechosa en tu cuenta:</p>
        <p>{{details}}</p>
        <p>Si no fuiste tú, por favor <a href="{{supportUrl}}">contacta a soporte</a> inmediatamente.</p>
        <p>Fecha y hora: {{timestamp}}</p>
      `,
      description: 'Alerta de actividad sospechosa',
      variables: ['userName', 'details', 'supportUrl', 'timestamp'],
    },
  ];

  for (const templateData of defaultTemplates) {
    const exists = await EmailTemplate.findOne({ name: templateData.name });
    if (!exists) {
      await createTemplate(templateData);
      console.log(`Created email template: ${templateData.name}`);
    }
  }
}

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendEmailChangedEmail,
  sendAccountLockedEmail,
  sendAccountUnlockedEmail,
  send2FAEnabledEmail,
  send2FADisabledEmail,
  sendLoginAlertEmail,
  sendSuspiciousActivityEmail,
  createTemplate,
  getTemplate,
  updateTemplate,
  listTemplates,
  initializeDefaultTemplates,
};
