// src/interfaces/glasses/MeetDisplay.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Mic, Camera, Settings, Video, PhoneOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { googleMeetService } from '@/services/meetService';

export const GlassesMeetDisplay = () => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        // First create or join a meeting
        const meetDetails = await googleMeetService.createMeeting({
          title: `Yuzu Glass Meeting - ${user?.name}`,
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
        });

        console.log('Meeting created:', meetDetails);
        setMeetingDetails(meetDetails);

        // Then get local media stream
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
      } catch (error) {
        console.error('Failed to initialize meeting:', error);
        setError(error.message);
      }
    };

    initializeMeeting();

    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [user]);

  const toggleMute = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const endCall = async () => {
    try {
      if (meetingDetails?.meetingId) {
        await googleMeetService.endMeeting(meetingDetails.meetingId);
      }
      // Stop local media tracks
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      // Redirect or handle meeting end
    } catch (error) {
      console.error('Failed to end meeting:', error);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-900">
      {/* Meeting Info */}
      {meetingDetails && (
        <div className="fixed top-4 right-4 bg-slate-800/80 backdrop-blur-sm rounded-lg p-2 text-white">
          <p className="text-sm">Meeting ID: {meetingDetails.meetingId}</p>
          <a 
            href={meetingDetails.meetingUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Join on web →
          </a>
        </div>
      )}

      {/* Main Video Feed */}
      <div className="flex-1 relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        
        {isVideoOff && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
            <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center">
              <span className="text-3xl text-white">
                {user?.name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <Card className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-800/50 backdrop-blur">
        <div className="flex items-center space-x-4 p-2">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <Mic className="w-5 h-5 text-white" />
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'
            }`}
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
          
          <button
            onClick={endCall}
            className="p-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-5 h-5 text-white" />
          </button>
          
          <button
            className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </Card>
    </div>
  );
};