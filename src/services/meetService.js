// src/services/meetService.js
class MeetService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
    this.mediaStream = null;
  }

  // Existing API methods
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
      
      // Cleanup media stream when meeting ends
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
        this.mediaStream = null;
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

  // New media control methods
  async initializeMediaStream() {
    if (!this.mediaStream) {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
    }
    return this.mediaStream;
  }

  async toggleMute(interfaceType) {
    try {
      const stream = await this.initializeMediaStream();
      const audioTrack = stream.getAudioTracks()[0];
      
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled; // Returns true if muted
      }
      return false;
    } catch (error) {
      console.error('Error toggling mute:', error);
      throw new Error('Failed to toggle mute');
    }
  }

  async toggleVideo(interfaceType) {
    try {
      const stream = await this.initializeMediaStream();
      const videoTrack = stream.getVideoTracks()[0];
      
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return !videoTrack.enabled; // Returns true if video is off
      }
      return false;
    } catch (error) {
      console.error('Error toggling video:', error);
      throw new Error('Failed to toggle video');
    }
  }

  getMediaStream() {
    return this.mediaStream;
  }

  setMediaStream(stream) {
    this.mediaStream = stream;
  }

  stopMediaStream() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }
}

// Export a single instance of the service
export const googleMeetService = new MeetService();