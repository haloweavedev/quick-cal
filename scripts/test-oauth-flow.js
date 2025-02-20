// scripts/test-oauth-flow.js
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const express = require('express');
const open = require('open');

// Load environment variables
dotenv.config();

// Create a simple Express server
const app = express();
const PORT = 3333;

// Check environment variables
const clientId = process.env.AUTH_GOOGLE_ID;
const clientSecret = process.env.AUTH_GOOGLE_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

if (!clientId || !clientSecret) {
  console.error('Error: Missing AUTH_GOOGLE_ID or AUTH_GOOGLE_SECRET environment variables');
  process.exit(1);
}

// Create a test state value
const stateValue = jwt.sign(
  { userId: 'test-user-id', label: 'Test Calendar', timestamp: Date.now() },
  'test-secret',
  { expiresIn: '15m' }
);

// Build Google OAuth URL for testing the redirect
const buildTestUrl = (redirectUri) => {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar',
    access_type: 'offline',
    prompt: 'consent',
    state: stateValue,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

// Routes
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>OAuth Test</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .button { display: inline-block; padding: 10px 15px; background: #4285F4; color: white; 
                   text-decoration: none; border-radius: 4px; margin: 10px 0; }
          .uri { font-family: monospace; background: #f1f1f1; padding: 10px; margin: 10px 0; border-radius: 4px; }
          .warning { background: #fff3cd; padding: 10px; border-left: 5px solid #ffc107; margin: 15px 0; }
        </style>
      </head>
      <body>
        <h1>OAuth Redirect URI Test</h1>
        
        <div class="warning">
          <p><strong>Note:</strong> This test checks if your redirect URIs are properly configured in Google Cloud Console.
          If the redirects fail with a "redirect_uri_mismatch" error, you need to add them to your OAuth configuration.</p>
        </div>
        
        <h2>Primary Account Flow</h2>
        <div class="uri">Redirect URI: ${nextAuthUrl}/api/auth/callback/google</div>
        <a href="${buildTestUrl(`${nextAuthUrl}/api/auth/callback/google`)}" target="_blank" class="button">
          Test Primary Account Redirect
        </a>
        
        <h2>Secondary Account Flow</h2>
        <div class="uri">Redirect URI: ${nextAuthUrl}/api/calendars/secondary/callback</div>
        <a href="${buildTestUrl(`${nextAuthUrl}/api/calendars/secondary/callback`)}" target="_blank" class="button">
          Test Secondary Account Redirect
        </a>
        
        <h2>Troubleshooting Tips</h2>
        <ul>
          <li>Ensure both redirect URIs are registered in Google Cloud Console</li>
          <li>Check that the URIs match exactly, including http/https protocol</li>
          <li>If the primary flow works but secondary doesn't, focus on adding the secondary URI</li>
          <li>After updating Google Cloud Console, changes may take a few minutes to propagate</li>
        </ul>
      </body>
    </html>
  `);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OAuth test server running at http://localhost:${PORT}`);
  console.log(`📝 Testing redirect URIs:`);
  console.log(`   1. ${nextAuthUrl}/api/auth/callback/google (Primary)`);
  console.log(`   2. ${nextAuthUrl}/api/calendars/secondary/callback (Secondary)`);
  
  // Open browser automatically
  open(`http://localhost:${PORT}`);
});