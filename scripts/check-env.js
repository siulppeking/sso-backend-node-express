#!/usr/bin/env node

/**
 * Check environment variables for SSO backend
 * Usage: node scripts/check-env.js
 */

require('dotenv').config();

const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'PORT'
];

const OPTIONAL_VARS = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'SMTP_FROM',
  'APP_URL',
  'SUPPORT_URL',
  'NODE_ENV'
];

console.log('🔍 Checking environment variables...\n');

let missingRequired = [];
let missingOptional = [];

// Check required variables
REQUIRED_VARS.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: configured`);
  } else {
    console.log(`❌ ${varName}: MISSING (required)`);
    missingRequired.push(varName);
  }
});

console.log('\n--- Optional variables ---\n');

// Check optional variables
OPTIONAL_VARS.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ ${varName}: configured`);
  } else {
    console.log(`⚠️  ${varName}: not set (optional)`);
    missingOptional.push(varName);
  }
});

console.log('\n--- Summary ---\n');

if (missingRequired.length > 0) {
  console.log(`❌ Missing ${missingRequired.length} required variable(s):`);
  missingRequired.forEach(v => console.log(`   - ${v}`));
  console.log('\n💡 Copy .env.example to .env and configure these values.\n');
  process.exit(1);
} else {
  console.log('✅ All required variables are configured!');
  if (missingOptional.length > 0) {
    console.log(`⚠️  ${missingOptional.length} optional variable(s) not set (email/2FA features may be limited).`);
  }
  console.log('\n🚀 Ready to run: npm run dev\n');
  process.exit(0);
}
