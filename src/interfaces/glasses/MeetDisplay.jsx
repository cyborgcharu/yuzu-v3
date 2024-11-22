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
    isVideoOff,
    deviceStates,
    currentMeeting,
    meetings,
    isLoading,
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
            } text-white transition-colors`}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          
          <button
            onClick={() => toggleVideo('glasses')}
            className={`px-4 py-2 rounded ${
              isVideoOff ? 'bg-red-500' : 'bg-green-500'
            } text-white transition-colors`}
          >
            {isVideoOff ? 'Turn On Video' : 'Turn Off Video'}
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-bold mb-2">Device Status</h3>
          <p className="text-sm">
            Glasses: {deviceStates.glasses.connected ? 'Connected' : 'Disconnected'}
            {deviceStates.glasses.connected && 
              ` - Battery: ${deviceStates.glasses.batteryLevel}%`
            }
          </p>
        </div>

        {currentMeeting && (
          <div className="mb-4">
            <h3 className="font-bold">Current Meeting</h3>
            <p>{currentMeeting.title}</p>
            <p>Duration: {currentMeeting.duration} minutes</p>
          </div>
        )}

        {meetings?.length > 0 && (
          <div>
            <h3 className="font-bold mb-2">Upcoming Meetings</h3>
            <ul className="space-y-2">
              {meetings.map(meeting => (
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

        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          </div>
        )}
      </Card>
    </div>
  );
}