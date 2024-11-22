// src/components/MeetProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { meetService } from '../services/meetService';  // Use named import

const MeetContext = createContext(null);

export function MeetProvider({ children }) {
  const [meetState, setMeetState] = useState(meetService.state);
  
  useEffect(() => {
    const unsubscribe = meetService.subscribe(state => {
      setMeetState(state);
      console.log('Meet state updated:', state);
    });

    const path = window.location.pathname;
    const interfaceType = path.split('/')[1] || 'web';
    meetService.connectDevice(interfaceType);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        meetService.connectDevice(interfaceType);
      } else {
        meetService.disconnectDevice(interfaceType);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      meetService.disconnectDevice(interfaceType);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const value = {
    ...meetState,
    toggleMute: (source) => meetService.toggleMute(source),
    toggleVideo: (source) => meetService.toggleVideo(source),
    connectDevice: (deviceType) => meetService.connectDevice(deviceType),
    disconnectDevice: (deviceType) => meetService.disconnectDevice(deviceType),
    createMeeting: (details) => meetService.createMeeting(details),
    fetchUpcomingMeetings: () => meetService.fetchUpcomingMeetings()
  };

  return (
    <MeetContext.Provider value={value}>
      {children}
    </MeetContext.Provider>
  );
}

export function useMeet() {
  const context = useContext(MeetContext);
  if (!context) {
    throw new Error('useMeet must be used within a MeetProvider');
  }
  return context;
}