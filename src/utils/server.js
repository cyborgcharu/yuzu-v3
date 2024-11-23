// src/utils/server.js
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Load and validate environment variables
dotenv.config();

const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SESSION_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Server configuration
const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

// Initialize OAuth client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${BACKEND_URL}/auth/callback`
);

// Middleware setup
// 1. Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.SESSION_SECRET));

// 2. CORS configuration
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
    domain: 'localhost'
  },
  name: 'sessionId'
}));

// 4. Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Session:', {
    id: req.sessionID,
    hasSession: !!req.session,
    hasUser: !!req.session?.user
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication Routes
app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events'
    ]
  });
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      console.error('No authorization code received');
      return res.redirect(`${FRONTEND_URL}/auth/failure?error=no_code`);
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    req.session.tokens = tokens;
    req.session.user = {
      id: userInfo.data.id,
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture
    };

    await new Promise((resolve, reject) => {
      req.session.save(err => {
        if (err) {
          console.error('Session save error:', err);
          reject(err);
        } else {
          console.log('Session saved successfully');
          resolve();
        }
      });
    });

    // Redirect to frontend success route
    res.redirect(`${FRONTEND_URL}/auth/success`);
  } catch (error) {
    console.error('Auth callback error:', error);
    res.redirect(`${FRONTEND_URL}/auth/failure?error=${encodeURIComponent(error.message)}`);
  }
});

app.get('/auth/success', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'No user session found'
    });
  }

  res.json({
    success: true,
    user: req.session.user
  });
});

// Add failure route handler
app.get('/auth/failure', (req, res) => {
  const error = req.query.error || 'Unknown error';
  res.json({
    success: false,
    error: error
  });
});

// Update the user route to handle session checks
app.get('/auth/user', (req, res) => {
  console.log('Session in /auth/user:', req.session);
  
  if (!req.session?.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'No user session found'
    });
  }

  res.json(req.session.user);
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('sessionId');
    res.json({ success: true });
  });
});

// Google Meet API Routes
app.post('/api/meetings/create', async (req, res) => {
  if (!req.session?.tokens) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    oauth2Client.setCredentials(req.session.tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = {
      summary: req.body.title || 'New Meeting',
      start: {
        dateTime: req.body.startTime || new Date().toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: req.body.endTime || new Date(Date.now() + 3600000).toISOString(),
        timeZone: 'UTC',
      },
      conferenceData: {
        createRequest: {
          requestId: `meet-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: event
    });

    res.json({
      meetingId: response.data.id,
      meetingUrl: response.data.hangoutLink,
      startTime: response.data.start.dateTime,
      endTime: response.data.end.dateTime
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/meetings/:meetingId/join', async (req, res) => {
  if (!req.session?.tokens) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    oauth2Client.setCredentials(req.session.tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const event = await calendar.events.get({
      calendarId: 'primary',
      eventId: req.params.meetingId
    });

    res.json({
      meetingUrl: event.data.hangoutLink,
      startTime: event.data.start.dateTime,
      endTime: event.data.end.dateTime
    });
  } catch (error) {
    console.error('Join meeting error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on ${BACKEND_URL}`);
  console.log(`Accepting requests from ${FRONTEND_URL}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});