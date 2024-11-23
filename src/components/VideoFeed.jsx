// src/components/VideoFeed.jsx
import React, { useEffect } from 'react';
import { googleMeetService } from '../services/meetService';

export const VideoFeed = () => {  // Changed to named export (export const)
  useEffect(() => {
    const joinMeeting = async () => {
      try {
        const meetingDetails = await googleMeetService.joinMeeting('your-meeting-id');
        console.log('Joined meeting:', meetingDetails);
        // Handle the meeting connection here
      } catch (error) {
        console.error('Failed to join meeting:', error);
      }
    };

    joinMeeting();
  }, []);

  return (
    <div>
      {/* Your video feed UI components */}
    </div>
  );
};