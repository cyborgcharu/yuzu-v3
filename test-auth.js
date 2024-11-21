// test-auth.js
const dotenv = require('dotenv');
const { OAuth2Client } = require('google-auth-library');

dotenv.config();

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI
});

const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/meetings.participant'
];

async function testAuthSetup() {
  try {
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      include_granted_scopes: true
    });

    console.log('Auth URL generated successfully!');
    console.log('Visit this URL to test authorization:');
    console.log(authUrl);
  } catch (error) {
    console.error('Auth setup test failed:', error);
  }
}

testAuthSetup();