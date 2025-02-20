// scripts/debug-oauth.js
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

console.log('🔍 OAuth Configuration Debug Script');
console.log('==================================\n');

// 1. Check environment variables
console.log('📋 Checking environment variables:');
const requiredVars = ['AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET', 'NEXTAUTH_URL', 'NEXTAUTH_SECRET'];
const missingVars = [];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
    console.log(`❌ ${varName}: Missing`);
  } else {
    // Show part of the value for verification without exposing credentials
    const value = process.env[varName];
    const maskedValue = value.substring(0, 4) + '...' + value.substring(value.length - 4);
    console.log(`✅ ${varName}: ${maskedValue}`);
  }
});

if (missingVars.length > 0) {
  console.log(`\n⚠️ Missing required environment variables: ${missingVars.join(', ')}\n`);
} else {
  console.log(`\n✅ All required environment variables are present.\n`);
}

// 2. Verify NEXTAUTH_URL format and resolution
console.log('🔗 Checking NEXTAUTH_URL configuration:');
const nextAuthUrl = process.env.NEXTAUTH_URL || '';

if (!nextAuthUrl) {
  console.log('❌ NEXTAUTH_URL is not set');
} else {
  console.log(`📝 NEXTAUTH_URL = ${nextAuthUrl}`);
  
  try {
    const url = new URL(nextAuthUrl);
    console.log(`✅ NEXTAUTH_URL is a valid URL`);
    console.log(`📝 Protocol: ${url.protocol}`);
    console.log(`📝 Host: ${url.host}`);
    console.log(`📝 Port: ${url.port || 'default'}`);
    
    // Check if it's localhost
    if (url.hostname === 'localhost') {
      console.log(`ℹ️ Using localhost - make sure Google OAuth is configured for localhost testing`);
    }
  } catch (error) {
    console.log(`❌ NEXTAUTH_URL is not a valid URL: ${error.message}`);
  }
}

// 3. Generate and show redirect URIs
console.log('\n🔀 Generated redirect URIs:');
const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

const redirectUris = [
  `${baseUrl}/api/auth/callback/google`,
  `${baseUrl}/api/calendars/secondary/callback`
];

redirectUris.forEach(uri => {
  console.log(`📝 ${uri}`);
});

// 4. Check if the redirect URIs are registered in the file
console.log('\n🔍 Checking redirect URIs in files:');

const searchInFiles = [
  'app/api/calendars/secondary/connect/route.ts',
  'app/api/calendars/secondary/callback/route.ts',
  'auth.ts'
];

searchInFiles.forEach(filePath => {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      let fileValid = true;
      
      console.log(`📄 Checking ${filePath}:`);
      
      redirectUris.forEach(uri => {
        // Create a simpler version for matching
        const simplifiedUri = uri.replace(/^https?:\/\/[^/]+/, '');
        
        if (content.includes(uri) || content.includes(simplifiedUri) || 
            content.includes('/api/auth/callback/google') || 
            content.includes('/api/calendars/secondary/callback')) {
          console.log(`  ✅ Found reference to ${uri}`);
        } else {
          console.log(`  ❌ No reference to ${uri}`);
          fileValid = false;
        }
      });
      
      if (!fileValid) {
        console.log(`  ⚠️ Some redirect URIs might be missing in ${filePath}`);
      }
    } else {
      console.log(`❌ File not found: ${filePath}`);
    }
  } catch (error) {
    console.log(`❌ Error reading ${filePath}: ${error.message}`);
  }
});

// 5. Check Google OAuth configuration
console.log('\n🔐 Google OAuth Configuration:');
const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

if (!googleClientId || !googleClientSecret) {
  console.log('❌ Google OAuth credentials are missing');
} else {
  console.log('✅ Google OAuth credentials are present');
  
  // Generate the command to test OAuth
  console.log('\n🧪 To test OAuth authorization URL manually, run:');
  const testAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(`${baseUrl}/api/calendars/secondary/callback`)}&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcalendar&access_type=offline&prompt=consent`;
  
  console.log(`\ncurl -v "${testAuthUrl}"\n`);
}

// 6. Final checklist and recommendations
console.log('📋 OAuth Debug Checklist:');
console.log('1. Verify both redirect URIs are added in Google Cloud Console');
console.log('2. Make sure there are no typos in the URIs');
console.log('3. Confirm your Google OAuth credentials are correct');
console.log('4. Check that all environment variables are properly loaded');
console.log('5. If using https locally, make sure certificates are valid');
console.log('6. Check for any CORS issues in browser console');
console.log('\n🔄 After making changes to Google Cloud Console, wait a few minutes for changes to propagate');