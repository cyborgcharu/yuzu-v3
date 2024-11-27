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
    this._mediaStream = null;
    
    // Create a broadcast channel for cross-interface communication
    this.channel = new BroadcastChannel('yuzu-meet');
    this.channel.onmessage = (event) => {
      if (event.data.type === 'VIDEO_TOGGLE') {
        this._handleVideoToggle(event.data.isVideoOff);
      }
    };
  }

  async initializeMediaStream() {
    try {
      if (!this._mediaStream) {
        this._mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });
        console.log('Created new MediaStream');
      }
      return this._mediaStream;
    } catch (error) {
      console.error('Error initializing media stream:', error);
      throw error;
    }
  }

  createMeeting = async (params) => {
    try {
      const existingMeeting = localStorage.getItem('currentMeeting');
      if (existingMeeting) {
        const meeting = JSON.parse(existingMeeting);
        this.updateState({ currentMeeting: meeting });
        return meeting;
      }

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
  }

  _handleVideoToggle(isVideoOff) {
    if (this._mediaStream) {
      const videoTrack = this._mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoOff;
        this.updateState({ isVideoOff });
      }
    }
  }

  toggleVideo = async (source) => {
    try {
      await this.initializeMediaStream();
      const newIsVideoOff = !this.state.isVideoOff;
      
      // Broadcast the change to all interfaces
      this.channel.postMessage({
        type: 'VIDEO_TOGGLE',
        isVideoOff: newIsVideoOff
      });
      
      // Handle locally
      this._handleVideoToggle(newIsVideoOff);
      
      console.log(`Video toggled by ${source}, isVideoOff: ${newIsVideoOff}`);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  }

  toggleMute = async (source) => {
    try {
      const stream = await this.initializeMediaStream();
      const audioTrack = stream.getAudioTracks()[0];
      
      if (audioTrack) {
        const newIsMuted = !this.state.isMuted;
        audioTrack.enabled = !newIsMuted;
        this.updateState({ isMuted: newIsMuted });
        console.log(`Audio toggled by ${source}, isMuted: ${newIsMuted}`);
      }
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  }

  connectDevice = (deviceType) => {
    this.state.connectedDevices.add(deviceType);
    this.updateState({ connectedDevices: this.state.connectedDevices });
    console.log(`Device connected: ${deviceType}`);
  }

  disconnectDevice = (deviceType) => {
    this.state.connectedDevices.delete(deviceType);
    this.updateState({ connectedDevices: this.state.connectedDevices });
    console.log(`Device disconnected: ${deviceType}`);
  }

  subscribe = (callback) => {
    this.subscribers.add(callback);
    callback(this.state);
    return () => this.subscribers.delete(callback);
  }

  updateState = (newState) => {
    this.state = { ...this.state, ...newState };
    this.subscribers.forEach(callback => callback(this.state));
  }

  cleanup = () => {
    if (this._mediaStream) {
      this._mediaStream.getTracks().forEach(track => track.stop());
      this._mediaStream = null;
    }
    this.channel.close();
    this.subscribers.clear();
    this.state.connectedDevices.clear();
    localStorage.removeItem('currentMeeting');
    this.updateState({
      currentMeeting: null,
      isMuted: false,
      isVideoOff: false,
      participants: []
    });
  }
}

export const meetService = new MeetService();
export const googleMeetService = meetService;