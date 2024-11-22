// src/interfaces/ring/MeetControls.jsx
import React from 'react';
import { useMeet } from '../../hooks/useMeet';
import { Card } from '../../components/ui/card';

export function RingMeetControls() {
  const { isMuted, isVideoOff, toggleMute, toggleVideo } = useMeet();

  return (
    <div className="max-w-xs mx-auto mt-4">
      <Card className="bg-slate-900 text-white p-4">
        <h2 className="text-lg font-semibold mb-4">Ring Controls</h2>
        
        <div className="space-y-4">
          <button
            onClick={toggleMute}
            className={`w-full p-3 rounded-lg ${
              isMuted ? 'bg-red-500' : 'bg-slate-700'
            } text-white text-sm font-medium`}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`w-full p-3 rounded-lg ${
              isVideoOff ? 'bg-red-500' : 'bg-slate-700'
            } text-white text-sm font-medium`}
          >
            {isVideoOff ? 'Start Video' : 'Stop Video'}
          </button>
        </div>
      </Card>
    </div>
  );
}