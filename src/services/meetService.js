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
        // Request latest state when tab becomes visible
        this.broadcastChannel.postMessage({ type: 'REQUEST_STATE' });
      }
    });

    // Listen for state requests from other tabs
    this.broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'REQUEST_STATE') {
        // Respond with current state
        this.broadcastChannel.postMessage({
          type: 'STATE_UPDATE',
          state: this.state
        });
      } else if (event.data.type === 'STATE_UPDATE') {
        // Update local state
        this.state = event.data.state;
        this.notifyListeners();
      }
    };
  }

  // State management
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
    
    // Broadcast state update to other tabs
    this.broadcastChannel.postMessage({
      type: 'STATE_UPDATE',
      state: this.state
    });
    
    this.notifyListeners();
  }

  // Time management
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

  // Meeting controls
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

  // Device management
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

  // Meeting management
  setCurrentMeeting(meetingDetails) {
    this.updateState({ 
      currentMeeting: meetingDetails 
    }, 'system');
  }

  updateParticipants(participants) {
    this.updateState({ participants }, 'system');
  }

  // Cleanup method
  destroy() {
    this.broadcastChannel.close();
  }
}

export const meetService = new MeetService();

// Clean up when the window unloads
window.addEventListener('unload', () => {
  meetService.destroy();
});