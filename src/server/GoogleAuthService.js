// src/services/GoogleAuthService.js
import { google } from 'googleapis';

class GoogleAuthService {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/auth/callback' 
    );
  }

  generateAuthUrl() {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    });
  }

  async getTokens(code) {
    return await this.oauth2Client.getToken(code);
  }

  getClient() {
    return this.oauth2Client;
  }
}

export default GoogleAuthService;