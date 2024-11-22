// src/interfaces/glasses/MeetDisplay.jsx
import React from 'react';
import { useMeet } from '../../hooks/useMeet';
import { Card } from '../../components/ui/card';  
import { Mic, Camera, Settings } from 'lucide-react';

export function GlassesMeetDisplay() {
  const { currentTime, isMuted, isVideoOff, currentParticipant, toggleMute, toggleVideo } = useMeet();

  return (
    <div className="fixed inset-0 bg-black/90 text-white">
      <div className="absolute top-4 right-4">
        <span className="text-sm opacity-80">{currentTime}</span>
      </div>

      <div className="h-full flex flex-col items-center justify-center">
        {isVideoOff ? (
          <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center text-2xl mb-4">
            {currentParticipant?.name.charAt(0)}
          </div>
        ) : (
          <div className="relative w-64 h-48 bg-slate-800 rounded-lg mb-4">
            {/* Video content */}
            <div className="absolute bottom-2 right-2">
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm">
                {currentParticipant?.name.charAt(0)}
              </div>
            </div>
          </div>
        )}

        <Card className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800/50 backdrop-blur">
          <div className="flex items-center space-x-4 p-2">
            <button onClick={toggleMute} className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-slate-700'}`}>
              <Mic className="w-5 h-5" />
            </button>
            <button onClick={toggleVideo} className={`p-2 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-slate-700'}`}>
              <Camera className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-slate-700">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}