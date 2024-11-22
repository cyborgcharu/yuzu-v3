// src/pages/glasses/inline-display.jsx
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Mic, Camera, Settings } from 'lucide-react';

const GlassesDisplay = () => {
  const [currentTime, setCurrentTime] = useState('12:42');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participantName, setParticipantName] = useState('Alex Johnson');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
    }, 60000);

    // Listen for messages from wrist display
    window.addEventListener('message', (event) => {
      const { type, data } = event.data;
      switch(type) {
        case 'UPDATE_PARTICIPANT':
          setParticipantName(data.name);
          break;
        case 'TOGGLE_MUTE':
          setIsMuted(prev => !prev);
          break;
        case 'TOGGLE_VIDEO':
          setIsVideoOff(prev => !prev);
          break;
      }
    });

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black/90 text-white">
      {/* Time display */}
      <div className="absolute top-4 right-4">
        <span className="text-sm opacity-80">{currentTime}</span>
      </div>

      {/* Main content */}
      <div className="h-full flex flex-col items-center justify-center">
        {isVideoOff ? (
          <div className="w-16 h-16 rounded-full bg-slate-600 flex items-center justify-center text-2xl mb-4">
            {participantName.charAt(0)}
          </div>
        ) : (
          <div className="relative w-64 h-48 bg-slate-800 rounded-lg mb-4">
            <div className="absolute bottom-2 right-2">
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-sm">
                {participantName.charAt(0)}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
          <Card className="bg-slate-800/50 backdrop-blur p-2 rounded-lg">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsMuted(prev => !prev)}
                className={`p-2 rounded-full ${isMuted ? 'bg-red-500' : 'bg-slate-700'}`}
              >
                <Mic className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsVideoOff(prev => !prev)}
                className={`p-2 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-slate-700'}`}
              >
                <Camera className="w-5 h-5" />
              </button>
              <button 
                className="p-2 rounded-full bg-slate-700"
                onClick={() => console.log('Settings clicked')}
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GlassesDisplay;