// src/services/meetService.js
class MeetService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  }

  async createMeeting(params = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/meetings/create`, {
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
  }

  async joinMeeting(meetingId) {
    try {
      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}/join`, {
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
  }

  async endMeeting(meetingId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/meetings/${meetingId}/end`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to end meeting');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error ending meeting:', error);
      throw error;
    }
  }

  async getAuthUrl() {
    try {
      const response = await fetch(`${this.baseUrl}/auth/google/url`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to get auth URL');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      throw error;
    }
  }
}

// Export a single instance of the service
export const googleMeetService = new MeetService();