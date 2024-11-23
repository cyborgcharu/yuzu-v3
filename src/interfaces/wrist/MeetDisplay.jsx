// src/interfaces/wrist/MeetDisplay.jsx
import React, { useEffect, useContext } from 'react';
import { MeetContext } from '@/context/MeetContext';
import { Card } from '@/components/ui/card';
import { Mic, Camera, Settings } from 'lucide-react';
import { StatusIndicators } from '@/components/StatusIndicators';

export function WristMeetDisplay() {
  console.log('Rendering WristMeetDisplay');

  const meetContext = useContext(MeetContext);
  console.log('MeetContext:', meetContext);

  const { 
    isMuted, 
    isVideoOff,
    toggleMute, 
    toggleVideo,
    connectDevice 
  } = meetContext;

  console.log('isMuted:', isMuted);
  console.log('isVideoOff:', isVideoOff);

  useEffect(() => {
    console.log('Connecting wrist device...');
    connectDevice('wrist');
  }, [connectDevice]);

  return (
    <div className="fixed inset-0 bg-gray-100/95">
      {/* Status Indicators */}
      <StatusIndicators />
      
      {/* Wrist Controls */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <Card className="w-[300px] bg-slate-900 text-white shadow-lg">
          <div className="p-4">
            <h2 className="text-xl mb-4">Alex Johnson</h2>
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => {
                  console.log('Mute button clicked');
                  toggleMute('wrist');
                }}
                className={`p-4 rounded-full ${
                  isMuted ? 'bg-red-500' : 'bg-slate-700'
                } hover:opacity-90 transition-opacity`}
              >
                <Mic className="w-6 h-6" />
              </button>
              <button 
                onClick={() => {
                  console.log('Video button clicked');
                  toggleVideo('wrist');
                }}
                className={`p-4 rounded-full ${
                  isVideoOff ? 'bg-red-500' : 'bg-slate-700'
                } hover:opacity-90 transition-opacity`}
              >
                <Camera className="w-6 h-6" />
              </button>
              <button 
                className="p-4 rounded-full bg-slate-700 hover:opacity-90 transition-opacity"
              >
                <Settings className="w-6 h-6" />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}