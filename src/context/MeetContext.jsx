// src/context/MeetContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { googleMeetService } from '../services/meetService';

export const MeetContext = createContext(null);

export function MeetProvider({ children }) {
  const [meetState, setMeetState] = useState(googleMeetService.state);

  useEffect(() => {
    const unsubscribe = googleMeetService.subscribe(state => {
      setMeetState(state);
      console.log('Meet state updated:', state);
    });

    const path = window.location.pathname;
    const interfaceType = path.split('/')[1] || 'web';
    googleMeetService.connectDevice(interfaceType);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        googleMeetService.connectDevice(interfaceType);
      } else {
        googleMeetService.disconnectDevice(interfaceType);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      googleMeetService.disconnectDevice(interfaceType);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const value = React.useMemo(() => ({
    ...meetState,
    createMeeting: (params) => googleMeetService.createMeeting(params),
    toggleMute: (source) => googleMeetService.toggleMute(source),
    toggleVideo: (source) => googleMeetService.toggleVideo(source),
    connectDevice: (deviceType) => googleMeetService.connectDevice(deviceType),
    disconnectDevice: (deviceType) => googleMeetService.disconnectDevice(deviceType),
    setCurrentMeeting: (meeting) => googleMeetService.setCurrentMeeting(meeting),
    updateParticipants: (participants) => googleMeetService.updateParticipants(participants)
  }), [meetState]);

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