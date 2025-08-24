#!/usr/bin/env node

/**
 * Postmark Configuration Script
 * This script helps you set up Postmark for the Evergreen Way project
 */

const fs = require('fs');
const path = require('path');

// Your Postmark API key
const POSTMARK_API_KEY = 'e297544f-690e-4de4-b14d-15133b77e652';

// Configuration template
const envContent = `# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Postmark Configuration (Required for direct email sending)
# Get your API key from: https://account.postmarkapp.com/api_tokens
VITE_POSTMARK_API_KEY=${POSTMARK_API_KEY}
# Use a verified sender email from your Postmark account
VITE_POSTMARK_FROM_EMAIL=your_verified_sender@yourdomain.com

# Silicon Flow AI Configuration
VITE_SILICON_FLOW_API_KEY=your_silicon_flow_api_key
VITE_SILICON_FLOW_API_URL=https://api.siliconflow.com/v1/chat/completions

# Google Maps Configuration
# Get your API key from: https://console.cloud.google.com/apis/credentials
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Application Configuration
VITE_APP_NAME=Evergreen Way
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development

# =============================================================================
# QUICK SETUP GUIDE:
# =============================================================================
# 1. Copy this file to .env.local
# 2. Fill in your Firebase configuration
# 3. For Postmark (optional but recommended):
#    - Sign up at https://postmarkapp.com
#    - Create an API token
#    - Verify your sender email
#    - Add the API token and email below
# 4. For Silicon Flow AI:
#    - Get your API key from Silicon Flow
#    - Add it below
# 5. For Google Maps:
#    - Go to https://console.cloud.google.com/apis/credentials
#    - Create a new project or select existing one
#    - Enable Maps JavaScript API and Places API
#    - Create credentials (API key)
#    - Add the API key below
# =============================================================================
`;

// Firebase Functions configuration
const firebaseConfigContent = `{
  "postmark": {
    "api_key": "${POSTMARK_API_KEY}",
    "from_email": "your_verified_sender@yourdomain.com"
  }
}`;

function setupPostmark() {
  console.log('🚀 Setting up Postmark for Evergreen Way...\n');

  // Create .env.local file
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file with Postmark configuration');
  } else {
    console.log('⚠️  .env.local already exists - please update it manually');
  }

  // Create Firebase config file
  const firebaseConfigPath = path.join(process.cwd(), 'firebase-config.json');
  fs.writeFileSync(firebaseConfigPath, firebaseConfigContent);
  console.log('✅ Created firebase-config.json for Firebase Functions');

  console.log('\n📧 Postmark Configuration Summary:');
  console.log(`   API Key: ${POSTMARK_API_KEY}`);
  console.log('   Status: Ready to configure');
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Update VITE_POSTMARK_FROM_EMAIL in .env.local with your verified sender email');
  console.log('2. Set Firebase Functions configuration:');
  console.log(`   firebase functions:config:set postmark.api_key="${POSTMARK_API_KEY}"`);
  console.log('   firebase functions:config:set postmark.from_email="your_verified_sender@yourdomain.com"');
  console.log('3. Deploy Firebase Functions: firebase deploy --only functions');
  console.log('4. Test email sending in the Email Management page');
  
  console.log('\n📚 For more information, see POSTMARK_SETUP_GUIDE.md');
}

// Run the setup
if (require.main === module) {
  setupPostmark();
}

module.exports = { setupPostmark };
