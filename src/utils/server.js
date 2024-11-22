// src/utils/server.js
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SESSION_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${PORT}`;

// OAuth client setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${BACKEND_URL}/auth/callback`
);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  },
  name: 'sessionId'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth routes
app.get('/auth/google', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
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

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user information
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Save user data and tokens in session
    req.session.tokens = tokens;
    req.session.user = {
      id: userInfo.data.id,
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture,
      locale: userInfo.data.locale
    };

    // Save session explicitly
    await new Promise((resolve, reject) => {
      req.session.save(err => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.redirect(`${FRONTEND_URL}/auth/success`);
  } catch (error) {
    console.error('Auth callback error:', error);
    res.redirect(`${FRONTEND_URL}/auth/failure?error=${encodeURIComponent(error.message)}`);
  }
});

app.get('/auth/user', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'No user session found'
    });
  }
  res.json(req.session.user);
});

app.get('/auth/success', (req, res) => {
  if (!req.session?.user) {
    return res.redirect(`${FRONTEND_URL}/auth/failure?error=no_session`);
  }
  res.redirect(`${FRONTEND_URL}/dashboard`);
});

app.post('/auth/logout', (req, res) => {
  if (!req.session?.user) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'No user session found'
    });
  }

  req.session.destroy(err => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Failed to destroy session'
      });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Error handling middleware
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

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

