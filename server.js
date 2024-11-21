const express = require('express');
const dotenv = require('dotenv');
const { OAuth2Client } = require('google-auth-library');
const session = require('express-session');

dotenv.config();

const app = express();

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI
});

// Updated scopes to match exactly what's configured in Google Cloud Console
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/meetings.space.readonly'
];

app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    include_granted_scopes: true,
    prompt: 'consent'
  });
  console.log('Generated Auth URL:', authUrl); // For debugging
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    console.log('Received code:', code); // For debugging
    
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    req.session.tokens = tokens;
    
    console.log('Authentication successful!');
    console.log('Access Token:', tokens.access_token);
    
    // Add a simple test API call to verify authentication
    const { google } = require('googleapis');
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    const calendarResponse = await calendar.calendarList.list();
    console.log('Successfully accessed calendar:', calendarResponse.data.items.length, 'calendars found');
    
    res.send(`
      <html>
        <body>
          <h1>Authentication successful!</h1>
          <p>You can close this window and return to the application.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
});

// Add a test endpoint
app.get('/test', async (req, res) => {
  if (!req.session.tokens) {
    return res.status(401).send('Not authenticated. Please visit /auth/google first');
  }

  try {
    oauth2Client.setCredentials(req.session.tokens);
    const { google } = require('googleapis');
    
    // Test Calendar API
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarResponse = await calendar.calendarList.list();
    
    // Test Meet API
    const meet = google.calendar({ version: 'v1', auth: oauth2Client });
    // Note: We'll add specific Meet API calls here once auth is working
    
    res.json({
      status: 'success',
      calendars: calendarResponse.data.items.length,
      message: 'APIs accessed successfully'
    });
  } catch (error) {
    console.error('API Test Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Auth endpoint: http://localhost:${PORT}/auth/google`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
});