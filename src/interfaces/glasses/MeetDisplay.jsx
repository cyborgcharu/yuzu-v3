// src/interfaces/glasses/MeetDisplay.jsx
import React from 'react';
import { useMeet } from '../../hooks/useMeet';
import { MeetingControls } from '../../components/MeetingControls';

export function GlassesMeetDisplay() {
  const { currentMeeting, currentTime, deviceStates } = useMeet();

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

      <div className="h-full flex flex-col items-center justify-center">
        {currentMeeting ? (
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold">{currentMeeting.title}</h2>
            <p className="text-sm opacity-80">
              {new Date(currentMeeting.startTime).toLocaleString()}
            </p>
          </div>
        ) : (
          <div className="text-center mb-8 opacity-50">
            <p>No active meeting</p>
          </div>
        )}

        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-md">
          <MeetingControls interfaceType="glasses" />
        </div>
      </div>
    </div>
  );
}