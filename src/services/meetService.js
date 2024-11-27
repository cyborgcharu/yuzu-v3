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
      switch (event.data.type) {
        case 'VIDEO_TOGGLE':
          this._handleVideoToggle(event.data.isVideoOff);
          break;
        case 'AUDIO_TOGGLE':
          this._handleAudioToggle(event.data.isMuted);
          break;
        case 'END_MEETING':
          this._handleEndMeeting();
          break;
      }
    };
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

  _handleAudioToggle(isMuted) {
    if (this._mediaStream) {
      const audioTrack = this._mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isMuted;
        this.updateState({ isMuted });
      }
    }
  }

  _handleEndMeeting() {
    this.cleanup();
  }

  async initializeMediaStream() {
    try {
      if (!this._mediaStream) {
        console.log('Creating new MediaStream');
        this._mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true
        });
        
        // Set initial states based on localStorage
        const videoTrack = this._mediaStream.getVideoTracks()[0];
        const audioTrack = this._mediaStream.getAudioTracks()[0];
        
        if (videoTrack) {
          videoTrack.enabled = !this.state.isVideoOff;
        }
        if (audioTrack) {
          audioTrack.enabled = !this.state.isMuted;
        }
      }
      return this._mediaStream;
    } catch (error) {
      console.error('Error initializing media stream:', error);
      throw error;
    }
  }

  toggleVideo = async (source) => {
    try {
      await this.initializeMediaStream();
      const newIsVideoOff = !this.state.isVideoOff;
      
      this.channel.postMessage({
        type: 'VIDEO_TOGGLE',
        isVideoOff: newIsVideoOff
      });
      
      this._handleVideoToggle(newIsVideoOff);
      console.log(`Video toggled by ${source}, isVideoOff: ${newIsVideoOff}`);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  }

  toggleMute = async (source) => {
    try {
      await this.initializeMediaStream();
      const newIsMuted = !this.state.isMuted;
      
      this.channel.postMessage({
        type: 'AUDIO_TOGGLE',
        isMuted: newIsMuted
      });
      
      this._handleAudioToggle(newIsMuted);
      console.log(`Audio toggled by ${source}, isMuted: ${newIsMuted}`);
    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  }

  endMeeting = async () => {
    try {
      this.channel.postMessage({
        type: 'END_MEETING'
      });
      
      this._handleEndMeeting();
    } catch (error) {
      console.error('Error ending meeting:', error);
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

  updateState = (newState) => {
    this.state = { ...this.state, ...newState };
    this.subscribers.forEach(callback => callback(this.state));
  }

  subscribe = (callback) => {
    this.subscribers.add(callback);
    callback(this.state);
    return () => this.subscribers.delete(callback);
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