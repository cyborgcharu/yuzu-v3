// src/interfaces/ring/MeetDisplay.jsx
import React, { useEffect } from 'react';
import { useMeet } from '../../hooks/useMeet';
import { Card } from '../../components/ui/card';
import { StatusIndicators } from '../../components/StatusIndicators';
export function RingMeetDisplay() {
const {
isMuted,
isVideoOff,
toggleMute,
toggleVideo,
connectDevice
} = useMeet();
useEffect(() => {
console.log('Connecting ring device...');
connectDevice('ring');
}, []);
return (
<div className="fixed inset-0 bg-slate-900">
<StatusIndicators />
Copy  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
    <Card className="w-[300px] bg-slate-800 text-white p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-6">Ring Controls</h2>
      
      <div className="space-y-4">
        <button
          onClick={() => toggleMute('ring')}
          className={`w-full p-3 rounded-lg font-medium transition-colors ${
            isMuted
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-slate-700 hover:bg-slate-600'
          }`}
        >
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
        
        <button
          onClick={() => toggleVideo('ring')}
          className={`w-full p-3 rounded-lg font-medium transition-colors ${
            isVideoOff
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {isVideoOff ? 'Start Video' : 'Stop Video'}
        </button>
      </div>
    </Card>
  </div>
</div>
);
}