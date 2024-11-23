// src/services/meetService.js
import { google } from 'googleapis';

export const meetService = {
  async createMeeting(params = {}) {
    try {
      const response = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  },

  async joinMeeting(meetingId) {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/join`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to join meeting');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error joining meeting:', error);
      throw error;
    }
  },

  getAuthUrl() {
    const oauth2Client = new google.auth.OAuth2(
      import.meta.env.VITE_GOOGLE_CLIENT_ID,
      import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
      import.meta.env.VITE_GOOGLE_REDIRECT_URI
    );

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events'
      ]
    });
  }
};