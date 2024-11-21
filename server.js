const express = require('express');
const dotenv = require('dotenv');
const { OAuth2Client } = require('google-auth-library');
const session = require('express-session');
const { google } = require('googleapis');
const path = require('path');


dotenv.config();

const app = express();

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.json());
app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const oauth2Client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI
});

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
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    req.session.tokens = tokens;
    
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

app.get('/api/meetings', async (req, res) => {
  if (!req.session.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    oauth2Client.setCredentials(req.session.tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
      q: 'meet.google.com'
    });

    const meetings = response.data.items
      .filter(event => event.hangoutLink)
      .map(event => ({
        id: event.id,
        title: event.summary,
        startTime: event.start.dateTime,
        endTime: event.end.dateTime,
        meetLink: event.hangoutLink,
        attendees: event.attendees || []
      }));

    res.json(meetings);
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/meetings/create', async (req, res) => {
  if (!req.session.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    oauth2Client.setCredentials(req.session.tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const { title, startTime, duration, attendees } = req.body;
    const attendeesList = attendees && Array.isArray(attendees) 
      ? attendees.map(email => ({ email })) 
      : [];

    const event = {
      summary: title,
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: new Date(new Date(startTime).getTime() + duration * 60000).toISOString(),
        timeZone: 'UTC'
      },
      attendees: attendeesList,
      conferenceData: {
        createRequest: {
          requestId: Date.now() + '-' + Math.random().toString(36).substring(7),
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1
    });

    res.json({
      id: response.data.id,
      meetLink: response.data.hangoutLink,
      title: response.data.summary,
      startTime: response.data.start.dateTime,
      endTime: response.data.end.dateTime
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/meetings/:meetingId/join', async (req, res) => {
  if (!req.session.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    oauth2Client.setCredentials(req.session.tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = await calendar.events.get({
      calendarId: 'primary',
      eventId: req.params.meetingId
    });

    if (!event.data.hangoutLink) {
      throw new Error('No meeting link available');
    }

    res.json({
      meetLink: event.data.hangoutLink,
      title: event.data.summary,
      startTime: event.data.start.dateTime,
      endTime: event.data.end.dateTime
    });
  } catch (error) {
    console.error('Error joining meeting:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT}/auth/google to authenticate`);
});