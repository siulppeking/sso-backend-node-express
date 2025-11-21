require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const morgan = require('morgan');

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const userManagementRoutes = require('./routes/userManagement');
const clientRoutes = require('./routes/clients');
const reportRoutes = require('./routes/reports');
const roleRoutes = require('./routes/roles');
const applicationRoutes = require('./routes/applications');
const groupRoutes = require('./routes/groups');
const emailTemplateRoutes = require('./routes/emailTemplates');
const { errorHandler } = require('./middlewares/errorHandler');
const emailService = require('./services/emailService');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/users', userManagementRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/admin/email-templates', emailTemplateRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

connectDB()
  .then(async () => {
    // Initialize default email templates
    await emailService.initializeDefaultTemplates();
    
    app.listen(PORT, () => {
      console.log(`SSO server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to DB', err);
    process.exit(1);
  });
