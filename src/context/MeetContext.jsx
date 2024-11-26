// src/context/MeetContext.js
import React, { createContext, useReducer, useCallback } from 'react';
import { googleMeetService } from '../services/meetService';

export const MeetContext = createContext();

const ACTION_TYPES = {
  SET_CURRENT_MEETING: 'SET_CURRENT_MEETING',
  SET_MUTE_STATE: 'SET_MUTE_STATE',
  SET_VIDEO_STATE: 'SET_VIDEO_STATE',
  SET_LOADING_STATE: 'SET_LOADING_STATE',
  SET_GOOGLE_AUTH_STATUS: 'SET_GOOGLE_AUTH_STATUS',
  CLEAR_MEETING: 'CLEAR_MEETING',
  SET_ERROR: 'SET_ERROR'
};

const meetReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SET_CURRENT_MEETING:
      return { 
        ...state, 
        currentMeeting: action.payload,
        error: null 
      };
    case ACTION_TYPES.SET_MUTE_STATE:
      return { ...state, isMuted: action.payload };
    case ACTION_TYPES.SET_VIDEO_STATE:
      return { ...state, isVideoOff: action.payload };
    case ACTION_TYPES.SET_LOADING_STATE:
      return { ...state, isLoading: action.payload };
    case ACTION_TYPES.SET_GOOGLE_AUTH_STATUS:
      return { ...state, googleAuthStatus: action.payload };
    case ACTION_TYPES.CLEAR_MEETING:
      return { 
        ...state, 
        currentMeeting: null,
        isMuted: false,
        isVideoOff: false 
      };
    case ACTION_TYPES.SET_ERROR:
      return { ...state, error: action.payload };
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
    error: null
  });

  const createMeeting = useCallback(async (meetingDetails) => {
    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING_STATE, payload: true });
      const newMeeting = await googleMeetService.createMeeting(meetingDetails);
      dispatch({ type: ACTION_TYPES.SET_CURRENT_MEETING, payload: newMeeting });
    } catch (error) {
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING_STATE, payload: false });
    }
  }, []);

  const endMeeting = useCallback(async () => {
    try {
      dispatch({ type: ACTION_TYPES.SET_LOADING_STATE, payload: true });
      
      if (state.currentMeeting?.meetingId) {
        await googleMeetService.endMeeting(state.currentMeeting.meetingId);
      }
      
      dispatch({ type: ACTION_TYPES.CLEAR_MEETING });
    } catch (error) {
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: ACTION_TYPES.SET_LOADING_STATE, payload: false });
    }
  }, [state.currentMeeting]);

  const toggleMute = useCallback(async (interfaceType) => {
    try {
      await googleMeetService.toggleMute(interfaceType);
      dispatch({ 
        type: ACTION_TYPES.SET_MUTE_STATE, 
        payload: !state.isMuted 
      });
    } catch (error) {
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    }
  }, [state.isMuted]);

  const toggleVideo = useCallback(async (interfaceType) => {
    try {
      await googleMeetService.toggleVideo(interfaceType);
      dispatch({ 
        type: ACTION_TYPES.SET_VIDEO_STATE, 
        payload: !state.isVideoOff 
      });
    } catch (error) {
      dispatch({ type: ACTION_TYPES.SET_ERROR, payload: error.message });
    }
  }, [state.isVideoOff]);

  return (
    <MeetContext.Provider
      value={{
        ...state,
        createMeeting,
        endMeeting,
        toggleMute,
        toggleVideo
      }}
    >
      {children}
    </MeetContext.Provider>
  );
};