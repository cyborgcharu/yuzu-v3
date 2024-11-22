// src/services/googleAuthService.js
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

class GoogleAuthService {
  constructor() {
    this.oauth2Client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.REDIRECT_URI
    });

    this.SCOPES = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/meetings.space.created',
      'https://www.googleapis.com/auth/meetings.space.readonly'
    ];
  }

  generateAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.SCOPES,
      include_granted_scopes: true,
      prompt: 'consent'
    });
  }

  async getTokens(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
  }

  getClient() {
    return this.oauth2Client;
  }
}

export const googleAuthService = new GoogleAuthService();