// src/context/MeetContext.js
import React, { createContext, useReducer, useEffect } from 'react';
import { googleMeetService } from '../services/meetService';

export const MeetContext = createContext();

// Action types
const ACTION_TYPES = {
  SET_CURRENT_MEETING: 'SET_CURRENT_MEETING',
  SET_MUTE_STATE: 'SET_MUTE_STATE',
  SET_VIDEO_STATE: 'SET_VIDEO_STATE',
  SET_LOADING_STATE: 'SET_LOADING_STATE',
  SET_GOOGLE_AUTH_STATUS: 'SET_GOOGLE_AUTH_STATUS',
};

// Reducer function
const meetReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_CURRENT_MEETING:
      return { ...state, currentMeeting: action.payload };
    case ACTION_TYPES.SET_MUTE_STATE:
      return { ...state, isMuted: action.payload };
    case ACTION_TYPES.SET_VIDEO_STATE:
      return { ...state, isVideoOff: action.payload };
    case ACTION_TYPES.SET_LOADING_STATE:
      return { ...state, isLoading: action.payload };
    case ACTION_TYPES.SET_GOOGLE_AUTH_STATUS:
      return { ...state, googleAuthStatus: action.payload };
    default:
      return state;
  }
};

export const MeetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(meetReducer, {
    currentMeeting: null,
    isMuted: false,
    isVideoOff: false,
    isLoading: false,
    googleAuthStatus: 'checking',
  });

  useEffect(() => {
    // Check Google authentication status
    const checkGoogleAuth = async () => {
      const status = await googleMeetService.checkGoogleAuth();
      dispatch({ type: ACTION_TYPES.SET_GOOGLE_AUTH_STATUS, payload: status });
    };
    checkGoogleAuth();
  }, []);

  const toggleMute = (interfaceType) => {
    dispatch({
      type: ACTION_TYPES.SET_MUTE_STATE,
      payload: !state.isMuted,
    });
    googleMeetService.toggleMute(interfaceType, !state.isMuted);
  };

  const toggleVideo = (interfaceType) => {
    dispatch({
      type: ACTION_TYPES.SET_VIDEO_STATE,
      payload: !state.isVideoOff,
    });
    googleMeetService.toggleVideo(interfaceType, !state.isVideoOff);
  };

  const createMeeting = async (meetingDetails) => {
    dispatch({ type: ACTION_TYPES.SET_LOADING_STATE, payload: true });
    const newMeeting = await googleMeetService.createMeeting(meetingDetails);
    dispatch({ type: ACTION_TYPES.SET_CURRENT_MEETING, payload: newMeeting });
    dispatch({ type: ACTION_TYPES.SET_LOADING_STATE, payload: false });
  };

  return (
    <MeetContext.Provider
      value={{
        ...state,
        toggleMute,
        toggleVideo,
        createMeeting,
      }}
    >
      {children}
    </MeetContext.Provider>
  );
};