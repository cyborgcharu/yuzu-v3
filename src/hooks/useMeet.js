// src/hooks/useMeet.js
import { useState, useEffect } from 'react';
import { meetService } from '../services/meetService';

export function useMeet() {
  const [meetState, setMeetState] = useState(meetService.state);

  useEffect(() => {
    return meetService.subscribe(state => setMeetState(state));
  }, []);

  return {
    ...meetState,
    toggleMute: () => meetService.toggleMute(),
    toggleVideo: () => meetService.toggleVideo(),
    updateParticipant: (participant) => meetService.updateParticipant(participant)
  };
}