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
 secret: process.env.SESSION_SECRET || 'dev-secret-key',
 resave: true,
 saveUninitialized: true,
 cookie: { 
   secure: false,  // false for development
   sameSite: 'lax',
   httpOnly: true,
   maxAge: 24 * 60 * 60 * 1000,  // 24 hours
   path: '/',
   domain: 'localhost'
 },
 name: 'session.id'
};

// CORS configuration
const corsOptions = {
 origin: FRONTEND_URL,
 credentials: true,
 methods: ['GET', 'POST', 'OPTIONS'],
 allowedHeaders: ['Content-Type', 'Authorization'],
 exposedHeaders: ['Set-Cookie'],
 preflightContinue: true,
 optionsSuccessStatus: 204
};

// Middleware setup
app.use(cors(corsOptions));
app.use(express.json());
app.use(session(sessionConfig));

// Debug middleware
if (isDevelopment) {
 app.use((req, res, next) => {
   console.log(`${req.method} ${req.path}`, {
     sessionId: req.sessionID,
     hasTokens: !!req.session?.tokens,
     hasUser: !!req.session?.user,
     cookies: req.headers.cookie
   });
   next();
 });
}

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

   // Save session and wait for completion
   await new Promise((resolve, reject) => {
     req.session.save((err) => {
       if (err) {
         console.error('Session save error:', err);
         reject(err);
       } else {
         console.log('Session saved successfully');
         resolve();
       }
     });
   });

   console.log('Redirecting to frontend with success');
   return res.redirect(`${FRONTEND_URL}/auth/google?auth=success`);

 } catch (error) {
   console.error('Auth error:', error);
   res.redirect(`${FRONTEND_URL}/auth/google?error=${encodeURIComponent(error.message)}`);
 }
});

app.get('/auth/status', (req, res) => {
 console.log('Checking auth status', {
   sessionId: req.sessionID,
   hasTokens: !!req.session?.tokens,
   hasUser: !!req.session?.user,
   cookies: req.headers.cookie
 });

 const hasTokens = !!req.session?.tokens;
 const hasUser = !!req.session?.user;
 
 res.json({
   hasTokens,
   hasUser,
   isAuthenticated: hasTokens && hasUser,
   user: hasUser ? req.session.user : null,
   sessionId: req.sessionID
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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
 console.log(`Server running on http://localhost:${PORT}`);
 console.log('Environment:', process.env.NODE_ENV);
 console.log('Frontend URL:', FRONTEND_URL);
});