// src/components/MeetingControls.jsx
import React, { useState } from 'react';
import { useMeet } from '../hooks/useMeet';
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
    toggleVideo
  } = useMeet();

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

      await meetService.createMeeting({
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
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={newMeetingDetails.title}
                onChange={(e) => setNewMeetingDetails(prev => ({
                  ...prev,
                  title: e.target.value
                }))}
                className="w-full px-3 py-2 bg-slate-700 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={newMeetingDetails.startTime}
                onChange={(e) => setNewMeetingDetails(prev => ({
                  ...prev,
                  startTime: e.target.value
                }))}
                className="w-full px-3 py-2 bg-slate-700 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={newMeetingDetails.duration}
                onChange={(e) => setNewMeetingDetails(prev => ({
                  ...prev,
                  duration: parseInt(e.target.value)
                }))}
                className="w-full px-3 py-2 bg-slate-700 rounded"
                min="15"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Attendees (comma-separated emails)</label>
              <input
                type="text"
                value={newMeetingDetails.attendees}
                onChange={(e) => setNewMeetingDetails(prev => ({
                  ...prev,
                  attendees: e.target.value
                }))}
                className="w-full px-3 py-2 bg-slate-700 rounded"
                placeholder="email1@example.com, email2@example.com"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsCreatingMeeting(false)}
                className="px-4 py-2 bg-slate-700 rounded hover:bg-slate-600"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
                disabled={isLoading}
              >
                Create Meeting
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}