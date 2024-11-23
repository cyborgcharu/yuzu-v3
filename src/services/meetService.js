// src/services/meetService.js
class MeetService {
  constructor() {
    // Initialize state
    this.state = {
      // Meeting state
      currentMeeting: null,
      meetings: [],
      participants: [],

      // Global meeting controls
      isMuted: false,
      isVideoOff: false,
      currentTime: this.getCurrentTime(),
      isLoading: false,
      error: null,

      // Device states
      deviceStates: {
        glasses: { connected: false, batteryLevel: 100 },
        wrist: { connected: false, batteryLevel: 100 },
        ring: { connected: false, batteryLevel: 100 }
      },

      // Status flags
      isLoading: false,
      error: null
    };

    // Set up listeners and channels
    this.listeners = new Set();
    this.initializeBroadcastChannel();
    this.startTimeUpdate();
  }

  // Channel setup for cross-tab communication
  initializeBroadcastChannel() {
    this.broadcastChannel = new BroadcastChannel('yuzu-meet-state');

    this.broadcastChannel.onmessage = (event) => {
      if (event.data.type === 'STATE_UPDATE') {
        this.state = event.data.state;
        this.notifyListeners();
      } else if (event.data.type === 'REQUEST_STATE') {
        this.broadcastChannel.postMessage({
          type: 'STATE_UPDATE',
          state: this.state
        });
      }
    };

    // Handle tab visibility
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.broadcastChannel.postMessage({ type: 'REQUEST_STATE' });
      }
    });
  }

  // State management
  subscribe(listener) {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  updateState(updates, source = 'system') {
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
      this.updateState({ currentTime: this.getCurrentTime() });
    }, 60000); // Update every minute
  }

  // Device controls
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

  // Device connection management
  connectDevice(deviceType) {
    if (!['glasses', 'wrist', 'ring'].includes(deviceType)) {
      console.error('Invalid device type:', deviceType);
      return;
    }

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
    if (!['glasses', 'wrist', 'ring'].includes(deviceType)) {
      console.error('Invalid device type:', deviceType);
      return;
    }

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
  async fetchUpcomingMeetings() {
    this.updateState({ isLoading: true });

    try {
      const response = await fetch('/api/meetings');
      if (!response.ok) throw new Error('Failed to fetch meetings');

      const meetings = await response.json();
      this.updateState({
        meetings,
        isLoading: false,
        error: null
      });

      return meetings;
    } catch (error) {
      this.updateState({
        error: error.message,
        isLoading: false
      });
      throw error;
    }
  }

  async createMeeting(meetingDetails) {
    this.updateState({ isLoading: true });

    try {
      const response = await fetch('/api/meetings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingDetails),
      });

      if (!response.ok) throw new Error('Failed to create meeting');

      const meeting = await response.json();

      this.updateState({
        meetings: [...this.state.meetings, meeting],
        currentMeeting: meeting,
        isLoading: false,
        error: null
      });

      return meeting;
    } catch (error) {
      this.updateState({
        error: error.message,
        isLoading: false
      });
      throw error;
    }
  }

  // Cleanup
  destroy() {
    this.broadcastChannel.close();
    clearInterval(this.timeInterval);
  }

  // Debug helper
  getState() {
    return { ...this.state };
  }
}

// Export singleton instance
export const meetService = new MeetService();