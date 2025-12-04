#!/usr/bin/env node

/**
 * Seed script to create an initial admin user
 * Usage: node scripts/seed-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/models/User');

const ADMIN_USER = {
  username: process.env.ADMIN_USERNAME || 'admin',
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'Admin123!',
  roles: ['admin'],
  enabled: true,
  emailVerified: true
};

async function seedAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_USER.email });
    
    if (existingAdmin) {
      console.log(`⚠️  Admin user already exists: ${ADMIN_USER.email}`);
      console.log('   No changes made.');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User(ADMIN_USER);
    await adminUser.save();

    console.log('\n🎉 Admin user created successfully!\n');
    console.log('Credentials:');
    console.log(`   Email:    ${ADMIN_USER.email}`);
    console.log(`   Username: ${ADMIN_USER.username}`);
    console.log(`   Password: ${ADMIN_USER.password}`);
    console.log(`   Roles:    ${ADMIN_USER.roles.join(', ')}\n`);
    console.log('⚠️  Change the password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error.message);
    process.exit(1);
  }
}

seedAdmin();
