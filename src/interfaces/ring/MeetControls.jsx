// src/interfaces/ring/MeetControls.jsx
import React from 'react';
import { useMeet } from '../../hooks/useMeet';

export function RingMeetControls() {
  const { toggleMute, toggleVideo } = useMeet();

  return (
    <div className="space-y-2">
      <button onClick={toggleMute} className="w-full p-2 bg-slate-800 rounded">Toggle Mute</button>
      <button onClick={toggleVideo} className="w-full p-2 bg-slate-800 rounded">Toggle Video</button>
    </div>
  );
}
