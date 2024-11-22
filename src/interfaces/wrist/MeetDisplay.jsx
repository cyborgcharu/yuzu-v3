// src/interfaces/wrist/MeetDisplay.jsx
import React from 'react';
import { useMeet } from '../../hooks/useMeet';
import { Card } from '@/components/ui/card';

export function WristMeetDisplay() {
  const { currentTime, isMuted, isVideoOff, currentParticipant, toggleMute, toggleVideo } = useMeet();

  return (
    <Card className="bg-slate-900 text-white p-4">
      <div className="flex justify-between items-center">
        <span>{currentParticipant?.name}</span>
        <span>{currentTime}</span>
      </div>
      <div className="flex space-x-2 mt-4">
        <button onClick={toggleMute} className={`p-2 rounded ${isMuted ? 'bg-red-500' : 'bg-slate-700'}`}>Mic</button>
        <button onClick={toggleVideo} className={`p-2 rounded ${isVideoOff ? 'bg-red-500' : 'bg-slate-700'}`}>Cam</button>
        <button className="p-2 rounded bg-slate-700">Set</button>
      </div>
    </Card>
  );
}