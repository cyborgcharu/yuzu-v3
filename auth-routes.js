// auth-routes.js
import express from 'express';
import { getAuthUrl, getTokens } from './auth';

const router = express.Router();

router.get('/auth/google', (req, res) => {
  const authUrl = getAuthUrl();
  res.redirect(authUrl);
});

router.get('/auth/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const tokens = await getTokens(code);
    
    // Store tokens securely (use your preferred storage method)
    req.session.tokens = tokens;
    
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Auth Error:', error);
    res.redirect('/error');
  }
});

export default router;
