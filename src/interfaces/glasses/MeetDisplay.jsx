// src/interfaces/glasses/MeetDisplay.jsx
import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMeet } from '../../hooks/useMeet';
import { Card } from '../../components/ui/card';

export function GlassesMeetDisplay() {
  const { user } = useAuth();
  const { 
    toggleMute, 
    toggleVideo, 
    connectDevice,
    disconnectDevice,
    isMuted,
    isVideoOn,
    isConnected,
    currentMeeting,
    upcomingMeetings,
    fetchUpcomingMeetings
  } = useMeet();

  useEffect(() => {
    // Connect glasses device when component mounts
    connectDevice('glasses');
    fetchUpcomingMeetings();

    // Cleanup on unmount
    return () => disconnectDevice('glasses');
  }, []);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Glasses Interface</h2>
        
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => toggleMute('glasses')}
            className={`px-4 py-2 rounded ${
              isMuted ? 'bg-red-500' : 'bg-green-500'
            } text-white`}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          
          <button
            onClick={() => toggleVideo('glasses')}
            className={`px-4 py-2 rounded ${
              isVideoOn ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            {isVideoOn ? 'Turn Off Video' : 'Turn On Video'}
          </button>
        </div>

        {currentMeeting && (
          <div className="mb-4">
            <h3 className="font-bold">Current Meeting</h3>
            <p>{currentMeeting.title}</p>
            <p>Duration: {currentMeeting.duration} minutes</p>
          </div>
        )}

        {upcomingMeetings?.length > 0 && (
          <div>
            <h3 className="font-bold mb-2">Upcoming Meetings</h3>
            <ul className="space-y-2">
              {upcomingMeetings.map(meeting => (
                <li key={meeting.id} className="p-2 bg-gray-100 rounded">
                  <p className="font-medium">{meeting.title}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(meeting.startTime).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}