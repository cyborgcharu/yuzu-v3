// src/components/MeetProvider.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { meetService } from '../services/meetService';

const MeetContext = createContext(null);

export function MeetProvider({ children }) {
  const [meetState, setMeetState] = useState(meetService.state);
  const [googleAuthStatus, setGoogleAuthStatus] = useState('unauthorized');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check auth status when mounted
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking auth status...');
        const response = await fetch('http://localhost:3000/auth/status', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        const data = await response.json();
        console.log('Auth status response:', data);
        
        if (data.isAuthenticated) {
          setGoogleAuthStatus('authorized');
          setUser(data.user);
        } else {
          setGoogleAuthStatus('unauthorized');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setGoogleAuthStatus('unauthorized');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Meet service subscription
  useEffect(() => {
    if (googleAuthStatus !== 'authorized') return;

    const unsubscribe = meetService.subscribe(state => {
      setMeetState(state);
      console.log('Meet state updated:', state);
    });

    return () => unsubscribe();
  }, [googleAuthStatus]);

  const updateAuthStatus = (status) => {
    console.log('Updating auth status to:', status);
    setGoogleAuthStatus(status);
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:3000/auth/logout', {
        method: 'GET',
        credentials: 'include',
      });
      setGoogleAuthStatus('unauthorized');
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    // Auth-related values
    googleAuthStatus,
    isLoading,
    user,
    updateAuthStatus,
    logout,

    // Meet-related values
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