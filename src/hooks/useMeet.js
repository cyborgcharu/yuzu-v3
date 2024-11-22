// src/hooks/useMeet.js
import { useState, useEffect } from 'react';
import { meetService } from '../services/meetService';
import { useAuth } from '../context/AuthContext';

export function useMeet() {
  const { isAuthenticated } = useAuth();
  const [meetState, setMeetState] = useState(meetService.state);

  useEffect(() => {
    if (!isAuthenticated) return;

    const unsubscribe = meetService.subscribe(state => {
      setMeetState(state);
      console.log('Meet state updated:', state);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

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