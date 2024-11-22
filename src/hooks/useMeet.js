// src/hooks/useMeet.js
import { useState, useEffect } from 'react';
import { meetService } from '../services/meetService';  // Use named import

export function useMeet() {
  const [meetState, setMeetState] = useState(meetService.state);

  useEffect(() => {
    return meetService.subscribe(state => setMeetState(state));
  }, []);

  return {
    ...meetState,
    toggleMute: (source) => meetService.toggleMute(source),
    toggleVideo: (source) => meetService.toggleVideo(source),
    connectDevice: (deviceType) => meetService.connectDevice(deviceType),
    disconnectDevice: (deviceType) => meetService.disconnectDevice(deviceType),
    createMeeting: (details) => meetService.createMeeting(details),
    fetchUpcomingMeetings: () => meetService.fetchUpcomingMeetings()
  };
}