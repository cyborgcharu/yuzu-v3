// src/services/meetService.js
class MeetService {
  constructor() {
    this.state = {
      currentMeeting: null,
      isMuted: false,
      isVideoOff: false,
      participants: [],
      currentTime: this.getCurrentTime(),
      activeInterface: null,
      meetings: [],
      isLoading: false,
      error: null,
      googleAuthStatus: 'unauthorized',
      deviceStates: {
        glasses: { connected: false, batteryLevel: 100 },
        wrist: { connected: false, batteryLevel: 100 },
        ring: { connected: false, batteryLevel: 100 }
      }
    };
    
    this.listeners = new Set();
    this.startTimeUpdate();

    // Initialize BroadcastChannel for cross-tab communication
    this.broadcastChannel = new BroadcastChannel('yuzu-meet-state');
    
    // Listen for updates from other tabs
    this.broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'STATE_UPDATE') {
        this.state = event.data.state;
        this.notifyListeners();
      }
    };

    // Handle tab visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.broadcastChannel.postMessage({ type: 'REQUEST_STATE' });
      }
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  updateState(updates, source) {
    this.state = {
      ...this.state,
      ...updates,
      activeInterface: source
    };
    
    this.broadcastChannel.postMessage({
      type: 'STATE_UPDATE',
      state: this.state
    });
    
    this.notifyListeners();
  }

  getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  startTimeUpdate() {
    setInterval(() => {
      this.updateState({ currentTime: this.getCurrentTime() }, 'system');
    }, 60000);
  }

  toggleMute(source) {
    this.updateState({ 
      isMuted: !this.state.isMuted 
    }, source);
  }

  toggleVideo(source) {
    this.updateState({ 
      isVideoOff: !this.state.isVideoOff 
    }, source);
  }

  connectDevice(deviceType) {
    const deviceStates = {
      ...this.state.deviceStates,
      [deviceType]: { 
        ...this.state.deviceStates[deviceType],
        connected: true
      }
    };
    this.updateState({ deviceStates }, deviceType);
  }

  disconnectDevice(deviceType) {
    const deviceStates = {
      ...this.state.deviceStates,
      [deviceType]: { 
        ...this.state.deviceStates[deviceType],
        connected: false
      }
    };
    this.updateState({ deviceStates }, deviceType);
  }

  async fetchUpcomingMeetings() {
    this.updateState({ isLoading: true }, 'system');
    try {
      const response = await fetch('/api/meetings');
      if (!response.ok) throw new Error('Failed to fetch meetings');
      
      const meetings = await response.json();
      this.updateState({ 
        meetings,
        isLoading: false 
      }, 'system');
      
      return meetings;
    } catch (error) {
      this.updateState({ 
        error: error.message,
        isLoading: false 
      }, 'system');
      throw error;
    }
  }

  async createMeeting({ title, startTime, duration = 30, attendees = [] }) {
    this.updateState({ isLoading: true }, 'system');
    try {
      const response = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          startTime,
          duration,
          attendees
        }),
      });

      if (!response.ok) throw new Error('Failed to create meeting');
      
      const meeting = await response.json();
      const updatedMeetings = [...this.state.meetings, meeting];
      
      this.updateState({ 
        meetings: updatedMeetings,
        currentMeeting: meeting,
        isLoading: false 
      }, 'system');
      
      return meeting;
    } catch (error) {
      this.updateState({ 
        error: error.message,
        isLoading: false 
      }, 'system');
      throw error;
    }
  }

  destroy() {
    this.broadcastChannel.close();
  }
}

export const meetService = new MeetService();
