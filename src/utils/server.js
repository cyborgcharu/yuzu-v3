// src/utils/server.js
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { google } from 'googleapis';
import { googleAuthService } from '../services/googleAuthService.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Constants
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
const isDevelopment = process.env.NODE_ENV === 'development';

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: !isDevelopment, // true in production
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  name: 'yuzu.sid'
};

// Middleware setup
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(express.json());
app.use(session(sessionConfig));

// Debug middleware for development
if (isDevelopment) {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
      sessionId: req.sessionID,
      hasTokens: !!req.session?.tokens,
      hasUser: !!req.session?.user
    });
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Auth routes
app.get('/auth/google', (req, res) => {
  console.log('Starting Google auth flow');
  const authUrl = googleAuthService.generateAuthUrl();
  console.log('Redirecting to:', authUrl);
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  console.log('Received auth callback');
  try {
    const { code } = req.query;
    if (!code) {
      console.log('No auth code received');
      return res.redirect(`${FRONTEND_URL}/auth/google`);
    }

    // Get tokens from Google
    console.log('Getting tokens from Google');
    const tokens = await googleAuthService.getTokens(code);
    
    // Get user info
    console.log('Getting user info');
    const oauth2Client = googleAuthService.getClient();
    oauth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    
    // Save to session
    req.session.tokens = tokens;
    req.session.user = {
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture
    };

    // Save session explicitly before redirect
    console.log('Saving session');
    return new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          res.redirect(`${FRONTEND_URL}/auth/google`);
          reject(err);
        } else {
          console.log('Session saved, redirecting to frontend');
          res.redirect(`${FRONTEND_URL}/auth/google?auth=success`);
          resolve();
        }
      });
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.redirect(`${FRONTEND_URL}/auth/google?error=${encodeURIComponent(error.message)}`);
  }
});

app.get('/auth/status', (req, res) => {
  console.log('Checking auth status');
  const isAuthenticated = !!req.session?.tokens;
  
  res.json({
    isAuthenticated,
    user: isAuthenticated ? req.session.user : null
  });
});

app.get('/auth/logout', (req, res) => {
  console.log('Processing logout');
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: isDevelopment ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Frontend URL:', FRONTEND_URL);
});