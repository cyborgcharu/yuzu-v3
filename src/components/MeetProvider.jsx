// src/components/MeetProvider.jsx
import React, { useEffect } from 'react';
import { meetService } from '../services/meetService';

export function MeetProvider({ children }) {
  useEffect(() => {
    meetService.startTimeUpdate();
  }, []);

  return children;
}