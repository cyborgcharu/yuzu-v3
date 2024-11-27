// src/components/MeetingControls.jsx
import React, { useState, useContext } from 'react';
import { MeetContext } from '../context/MeetContext';
import { Card } from './ui/card';
import { Mic, Camera, Settings, Video, Plus, UserPlus } from 'lucide-react';

export function MeetingControls({ interfaceType }) {
  const { 
    currentMeeting,
    isMuted,
    isVideoOff,
    isLoading,
    googleAuthStatus,
    toggleMute,
    toggleVideo,
    createMeeting
  } = useContext(MeetContext);

  const [isCreatingMeeting, setIsCreatingMeeting] = useState(false);
  const [newMeetingDetails, setNewMeetingDetails] = useState({
    title: '',
    startTime: new Date().toISOString().slice(0, 16),
    duration: 30,
    attendees: ''
  });

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      const attendeesList = newMeetingDetails.attendees
        .split(',')
        .map(email => email.trim())
        .filter(Boolean);

      await createMeeting({
        ...newMeetingDetails,
        attendees: attendeesList
      });
      
      setIsCreatingMeeting(false);
    } catch (error) {
      console.error('Failed to create meeting:', error);
    }
  };

  if (googleAuthStatus !== 'authorized') {
    return (
      <Card className="p-4 bg-slate-800 text-white">
        <p>Please authenticate with Google Meet to continue</p>
        <a 
          href="/auth/google" 
          className="mt-2 inline-block px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          Sign in with Google
        </a>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current Meeting Info */}
      {currentMeeting && (
        <Card className="p-4 bg-slate-800 text-white">
          <h3 className="text-lg font-semibold">{currentMeeting.title}</h3>
          <p className="text-sm opacity-80">
            {new Date(currentMeeting.startTime).toLocaleString()}
          </p>
          <a 
            href={currentMeeting.meetLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-2 inline-block px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            Join Meeting
          </a>
        </Card>
      )}

      {/* Meeting Controls */}
      <Card className="p-4 bg-slate-800 text-white">
        <div className="flex justify-center space-x-4">
          <button 
            onClick={() => toggleMute(interfaceType)}
            className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-slate-700'}`}
            disabled={isLoading}
          >
            <Mic className="w-6 h-6" />
          </button>
          <button 
            onClick={() => toggleVideo(interfaceType)}
            className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-slate-700'}`}
            disabled={isLoading}
          >
            <Camera className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setIsCreatingMeeting(true)}
            className="p-3 rounded-full bg-green-600 hover:bg-green-700"
            disabled={isLoading}
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </Card>

      {/* Create Meeting Form */}
      {isCreatingMeeting && (
        <Card className="p-4 bg-slate-800 text-white">
          <form onSubmit={handleCreateMeeting} className="space-y-4">
            {/* Form fields */}
          </form>
        </Card>
      )}
    </div>
  );
}