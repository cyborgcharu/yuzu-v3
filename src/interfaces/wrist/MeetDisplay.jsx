// src/interfaces/wrist/MeetDisplay.jsx
import React from 'react';
import { useMeet } from '../../hooks/useMeet';
import { Card } from '../../components/ui/card';
import { Mic, Camera, Settings } from 'lucide-react';

export function WristMeetDisplay() {
  const { currentTime, isMuted, isVideoOff, currentParticipant, toggleMute, toggleVideo } = useMeet();

  return (
    <div className="max-w-sm mx-auto mt-4">
      <Card className="bg-slate-900 text-white">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg">{currentParticipant?.name || 'Alex Johnson'}</span>
            <span className="text-sm opacity-80">{currentTime}</span>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button 
              onClick={toggleMute}
              className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-slate-700'}`}
            >
              <Mic className="w-6 h-6" />
            </button>
            <button 
              onClick={toggleVideo}
              className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-slate-700'}`}
            >
              <Camera className="w-6 h-6" />
            </button>
            <button className="p-3 rounded-full bg-slate-700">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}