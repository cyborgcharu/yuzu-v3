// src/components/VideoFeed.jsx
import React, { useEffect } from 'react';
import meetService from '../services/meetService';

const VideoFeed = () => {
  useEffect(() => {
    const joinMeeting = async () => {
      try {
        const meetingDetails = await meetService.joinMeeting('your-meeting-id');
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

export default VideoFeed;