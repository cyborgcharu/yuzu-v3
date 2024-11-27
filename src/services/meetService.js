// src/services/meetService.js
class MeetService {
  constructor() {
    this.state = {
      currentMeeting: null,
      isMuted: false,
      isVideoOff: false,
      participants: [],
      connectedDevices: new Set()
    };
    
    this.subscribers = new Set();
    this.mediaStream = null;
  }

  createMeeting = async (params) => {
    try {
      // You might want to add your actual API call here
      const meeting = {
        meetingId: `meeting-${Date.now()}`,
        title: params.title,
        startTime: params.startTime,
        endTime: params.endTime,
        meetingUrl: `https://meet.google.com/${Date.now()}`
      };
      
      this.updateState({ currentMeeting: meeting });
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
    this.state = { ...this.state, ...newState };
    this.subscribers.forEach(callback => callback(this.state));
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
        this.updateState({ isMuted: !audioTrack.enabled });
      }
      
      console.log(`Mute toggled from ${source}:`, !audioTrack.enabled);
      return !audioTrack.enabled;
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
        this.updateState({ isVideoOff: !videoTrack.enabled });
      }
      
      console.log(`Video toggled from ${source}:`, !videoTrack.enabled);
      return !videoTrack.enabled;
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