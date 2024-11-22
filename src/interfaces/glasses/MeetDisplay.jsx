// src/interfaces/glasses/MeetDisplay.jsx
import React, { useEffect } from 'react';
import { useMeet } from '../../hooks/useMeet';
import { Card } from '../../components/ui/card';
import { Mic, Camera, Settings } from 'lucide-react';

export function GlassesMeetDisplay() {
  const { 
    currentTime, 
    isMuted, 
    isVideoOff, 
    currentMeeting,
    deviceStates,
    toggleMute, 
    toggleVideo 
  } = useMeet();

  // Always pass the source of the action
  const handleToggleMute = () => toggleMute('glasses');
  const handleToggleVideo = () => toggleVideo('glasses');

  return (
    <div className="fixed inset-0 bg-black/90 text-white">
      <div className="absolute top-4 right-4 flex items-center space-x-4">
        <span className="text-sm opacity-80">{currentTime}</span>
        {Object.entries(deviceStates).map(([device, state]) => (
          <div key={device} className={`h-2 w-2 rounded-full ${
            state.connected ? 'bg-green-500' : 'bg-red-500'
          }`} title={`${device}: ${state.connected ? 'Connected' : 'Disconnected'}`} />
        ))}
      </div>

      {/* Rest of your component */}
      
      <Card className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800/50 backdrop-blur">
        <div className="flex items-center space-x-4 p-2">
          <button onClick={handleToggleMute} 
                  className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-slate-700'}`}>
            <Mic className="w-5 h-5" />
          </button>
          <button onClick={handleToggleVideo}
                  className={`p-2 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-slate-700'}`}>
            <Camera className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full bg-slate-700">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </Card>
    </div>
  );
}