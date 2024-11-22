// src/utils/server.js
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { googleAuthService } from '../services/googleAuthService';
import { meetingService } from '../services/meetingService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.use(express.json());
app.use(express.static('public'));

// Auth routes
app.get('/auth/google', (req, res) => {
  console.log('Redirecting to Google OAuth');
  const authUrl = googleAuthService.generateAuthUrl();
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  try {
    const tokens = await googleAuthService.getTokens(req.query.code);
    req.session.tokens = tokens;
    res.redirect('/');
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send(`Authentication failed: ${error.message}`);
  }
});

// Meeting routes
app.get('/api/meetings', async (req, res) => {
  if (!req.session.tokens) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const meetings = await meetingService.listMeetings(req.session.tokens);
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
    const meeting = await meetingService.createMeeting(req.session.tokens, req.body);
    res.json(meeting);
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
    const meeting = await meetingService.getMeeting(req.session.tokens, req.params.meetingId);
    res.json(meeting);
  } catch (error) {
    console.error('Error joining meeting:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT}/auth/google to authenticate`);
});