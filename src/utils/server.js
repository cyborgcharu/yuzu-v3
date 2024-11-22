// src/utils/server.js
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// OAuth client setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/auth/callback'
);

// Middleware setup
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

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
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    req.session.tokens = tokens;
    req.session.user = userInfo.data;

    await new Promise((resolve, reject) => {
      req.session.save(err => {
        if (err) reject(err);
        else resolve();
      });
    });

    res.redirect('http://localhost:8080/auth/success');
  } catch (error) {
    console.error('Auth error:', error);
    res.redirect('http://localhost:8080/auth/failure');
  }
});

app.get('/auth/user', (req, res) => {
  if (req.session?.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) res.status(500).json({ error: 'Logout failed' });
    else res.json({ success: true });
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});