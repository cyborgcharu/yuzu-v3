// src/components/MeetProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { meetService } from '../services/meetService';

const MeetContext = createContext(null);

export function MeetProvider({ children }) {
  const [meetState, setMeetState] = useState(meetService.state);
  
  useEffect(() => {
    // Subscribe to state changes
    const unsubscribe = meetService.subscribe(state => {
      setMeetState(state);
      console.log('Meet state updated:', state);
    });

    // Connect the current interface based on the route
    const path = window.location.pathname;
    const interfaceType = path.split('/')[1] || 'web';
    meetService.connectDevice(interfaceType);

    // Handle tab visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        meetService.connectDevice(interfaceType);
      } else {
        meetService.disconnectDevice(interfaceType);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
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
    setCurrentMeeting: (meeting) => meetService.setCurrentMeeting(meeting),
    updateParticipants: (participants) => meetService.updateParticipants(participants)
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