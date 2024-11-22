// src/services/meetService.js
class MeetService {
  constructor() {
    this.state = {
      currentParticipant: null,
      isMuted: false,
      isVideoOff: false,
      participants: [],
      currentTime: null
    };
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  updateState(updates) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  toggleMute() {
    this.updateState({ isMuted: !this.state.isMuted });
  }

  toggleVideo() {
    this.updateState({ isVideoOff: !this.state.isVideoOff });
  }

  updateParticipant(participant) {
    this.updateState({ currentParticipant: participant });
  }

  startTimeUpdate() {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      this.updateState({ currentTime: timeString });
    };
    updateTime();
    setInterval(updateTime, 60000);
  }
}

// Create a singleton instance
export const meetService = new MeetService();