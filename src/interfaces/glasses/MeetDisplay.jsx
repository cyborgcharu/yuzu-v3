// src/interfaces/glasses/MeetDisplay.jsx
import React, { useEffect } from 'react';
import { useMeet } from '../../hooks/useMeet';
import { Card } from '../../components/ui/card';
import { Mic, Camera, Settings } from 'lucide-react';
import { StatusIndicators } from '../../components/StatusIndicators';
import { VideoFeed } from '../../components/VideoFeed';

export function GlassesMeetDisplay() {
  const { 
    isMuted, 
    isVideoOff,
    toggleMute, 
    toggleVideo,
    connectDevice 
  } = useMeet();

  useEffect(() => {
    console.log('GlassesMeetDisplay mounted');
    connectDevice('glasses');
  }, [connectDevice]);

  return (
    <>
      <StatusIndicators />
      <VideoFeed />
      <Card className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800/50 backdrop-blur">
        <div className="flex items-center space-x-4 p-2">
          <button 
            onClick={() => toggleMute('glasses')}
            className={`p-2 rounded-full ${
              isMuted ? 'bg-red-500' : 'bg-slate-700'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>
          <button 
            onClick={() => toggleVideo('glasses')}
            className={`p-2 rounded-full ${
              isVideoOff ? 'bg-red-500' : 'bg-slate-700'
            }`}
          >
            <Camera className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full bg-slate-700">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </Card>
    </>
  );
}