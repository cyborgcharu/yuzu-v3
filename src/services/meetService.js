// src/services/meetService.js
class MeetService {
  constructor() {
    this.state = {
      currentMeeting: null,
      isMuted: JSON.parse(localStorage.getItem('isMuted') || 'false'),
      isVideoOff: JSON.parse(localStorage.getItem('isVideoOff') || 'false'),
      participants: [],
      connectedDevices: new Set()
    };
    
    this.subscribers = new Set();
    this.mediaStream = null;
  }

  createMeeting = async (params) => {
    try {
      // Check if there's already an active meeting across interfaces
      const existingMeeting = localStorage.getItem('currentMeeting');
      if (existingMeeting) {
        const meeting = JSON.parse(existingMeeting);
        this.updateState({ currentMeeting: meeting });
        return meeting;
      }
  
      // If no existing meeting, create a new one
      const meeting = {
        meetingId: `meeting-${Date.now()}`,
        title: params.title,
        startTime: params.startTime,
        endTime: params.endTime,
        meetingUrl: `https://meet.google.com/${Date.now()}`
      };
      
      this.updateState({ currentMeeting: meeting });
      localStorage.setItem('currentMeeting', JSON.stringify(meeting));
      return meeting;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  };


  subscribe = (callback) => {
    this.subscribers.add(callback);
    callback(this.state);
    return () => this.subscribers.delete(callback);
  };

  updateState = (newState) => {
    console.log('Previous state:', this.state);
    this.state = { ...this.state, ...newState };
    console.log('New state:', this.state);
    this.subscribers.forEach(callback => {
      console.log('Notifying subscriber with state:', this.state);
      callback(this.state);
    });
  };

  connectDevice = (deviceType) => {
    this.state.connectedDevices.add(deviceType);
    this.updateState({ connectedDevices: this.state.connectedDevices });
    console.log(`Device connected: ${deviceType}`);
  };

  disconnectDevice = (deviceType) => {
    this.state.connectedDevices.delete(deviceType);
    this.updateState({ connectedDevices: this.state.connectedDevices });
    console.log(`Device disconnected: ${deviceType}`);
  };

  async initializeMediaStream() {
    if (!this.mediaStream) {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });
    }
    return this.mediaStream;
  }

  toggleMute = async (source) => {
    try {
      const stream = await this.initializeMediaStream();
      const audioTrack = stream.getAudioTracks()[0];
      
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        const isMuted = !audioTrack.enabled;
        
        // Save mute state to localStorage
        localStorage.setItem('isMuted', JSON.stringify(isMuted));
        this.updateState({ isMuted });
      }
      
      console.log(`Mute toggled from ${source}:`, this.state.isMuted);
      return this.state.isMuted;
    } catch (error) {
      console.error('Error toggling mute:', error);
      return this.state.isMuted;
    }
  };
  
  toggleVideo = async (source) => {
    try {
      const stream = await this.initializeMediaStream();
      const videoTrack = stream.getVideoTracks()[0];
      
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        const isVideoOff = !videoTrack.enabled;
        
        // Save video state to localStorage
        localStorage.setItem('isVideoOff', JSON.stringify(isVideoOff));
        this.updateState({ isVideoOff });
      }
      
      console.log(`Video toggled from ${source}:`, this.state.isVideoOff);
      return this.state.isVideoOff;
    } catch (error) {
      console.error('Error toggling video:', error);
      return this.state.isVideoOff;
    }
  };

  setCurrentMeeting = (meeting) => {
    this.updateState({ currentMeeting: meeting });
  };

  updateParticipants = (participants) => {
    this.updateState({ participants });
  };

  cleanup = () => {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.subscribers.clear();
    this.state.connectedDevices.clear();
    localStorage.removeItem('currentMeeting');
    this.updateState({
      currentMeeting: null,
      isMuted: false,
      isVideoOff: false,
      participants: []
    });
  };
}

// Export both names to support existing imports
export const meetService = new MeetService();
export const googleMeetService = meetService;