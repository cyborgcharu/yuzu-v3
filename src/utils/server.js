// src/utils/server.js
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import { google } from 'googleapis';
import GoogleAuthService from '../server/GoogleAuthService.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const googleAuthService = new GoogleAuthService();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: true,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    sameSite: 'lax',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
};

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
app.use(session(sessionConfig));

app.get('/auth/google', (req, res) => {
  const authUrl = googleAuthService.generateAuthUrl(req.session.id);
  res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const tokens = await googleAuthService.getTokens(code);
    
    const oauth2Client = googleAuthService.getClient();
    oauth2Client.setCredentials(tokens);
    
    const userInfo = await google.oauth2('v2').userinfo.get({ auth: oauth2Client });
    
    req.session.tokens = tokens;
    req.session.user = {
      email: userInfo.data.email,
      name: userInfo.data.name,
      picture: userInfo.data.picture
    };
    
    await new Promise((resolve, reject) => {
      req.session.save(err => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    res.redirect(`${FRONTEND_URL}/auth/success`);
  } catch (error) {
    console.error('Auth callback error:', error);
    res.redirect(`${FRONTEND_URL}/auth/failure`);
  }
});

app.get('/auth/user', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.post('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: 'Logout failed' });
    } else {
      res.json({ success: true });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});