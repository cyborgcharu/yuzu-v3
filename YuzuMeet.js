// YuzuMeet.js
import React, { useEffect, useState } from 'react';
import { 
  Users, Mic, Video, Clock, 
  Hand, MessageSquare, 
  Share2, ChevronRight, Check
} from 'lucide-react';

const YuzuMeet = () => {
  const [meetService] = useState(new MeetService());
  const [meetingState, setMeetingState] = useState({
    isConnected: false,
    participants: [],
    isMuted: false,
    isHandRaised: false,
    messages: [],
    activeSpeaker: null,
    meetingTime: 0
  });

  useEffect(() => {
    const setupMeeting = async () => {
      try {
        // Join meeting
        const { meetingUrl, participantToken } = await meetService.joinMeeting('MEETING_CODE');
        
        // Setup real-time listeners
        await meetService.setupEventListeners('MEETING_ID', {
          participantJoined: (data) => {
            setMeetingState(prev => ({
              ...prev,
              participants: [...prev.participants, data]
            }));
          },
          audioStateChanged: (data) => {
            setMeetingState(prev => ({
              ...prev,
              isMuted: data.muted
            }));
          },
          messageReceived: (data) => {
            setMeetingState(prev => ({
              ...prev,
              messages: [...prev.messages, data]
            }));
          }
        });

        setMeetingState(prev => ({
          ...prev,
          isConnected: true
        }));

      } catch (error) {
        console.error('Error setting up meeting:', error);
      }
    };

    setupMeeting();

    // Meeting timer
    const timer = setInterval(() => {
      setMeetingState(prev => ({
        ...prev,
        meetingTime: prev.meetingTime + 1
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle ring gestures
  const handleRingGesture = async (gesture) => {
    switch (gesture) {
      case 'tap':
        await meetService.updateMeetingState({
          meetingId: 'MEETING_ID',
          action: 'mute',
          value: !meetingState.isMuted
        });
        break;
      case 'doubleTap':
        await meetService.updateMeetingState({
          meetingId: 'MEETING_ID',
          action: 'raiseHand',
          value: !meetingState.isHandRaised
        });
        break;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 space-y-12">
      {/* Glasses View */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-600">Glasses Display</h3>
        <div className="aspect-video bg-black rounded-lg p-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-black">
            {/* Main Speaker View */}
            <div className="absolute inset-4 bg-slate-800/50 rounded-lg backdrop-blur-sm">
              {meetingState.activeSpeaker && (
                <div className="absolute top-4 left-4 bg-black/30 rounded p-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-sm">
                        {meetingState.activeSpeaker.initials}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm">{meetingState.activeSpeaker.name}</p>
                      <p className="text-white/60 text-xs">{meetingState.activeSpeaker.role}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="absolute top-4 right-4 bg-black/30 rounded p-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm">
                      {meetingState.participants.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-white text-sm">
                      {formatTime(meetingState.meetingTime)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Participant Grid */}
            <div className="absolute bottom-4 right-4 w-48 grid grid-cols-2 gap-1">
              {meetingState.participants.slice(0, 4).map((participant, i) => (
                <div key={i} className="aspect-video bg-slate-800/50 rounded-sm" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wrist Display */}
      <div className="space-y-4">
        <h3 className="font-medium text-slate-600">Wrist Controls</h3>
        <div className="bg-slate-900 rounded-lg p-4">
          <div className="space-y-4">
            {/* Quick Controls */}
            <div className="grid grid-cols-4 gap-2">
              <button 
                className={`p-3 rounded flex flex-col items-center gap-1
                  ${meetingState.isMuted ? 'bg-red-500/20' : 'bg-slate-800'}`}
                onClick={() => handleRingGesture('tap')}
              >
                <Mic className={`w-4 h-4 ${meetingState.isMuted ? 'text-red-500' : 'text-blue-400'}`} />
                <span className="text-white/60 text-xs">Mute</span>
              </button>
              <button className="p-3 rounded bg-slate-800 flex flex-col items-center gap-1">
                <Video className="w-4 h-4 text-blue-400" />
                <span className="text-white/60 text-xs">Video</span>
              </button>
              <button 
                className={`p-3 rounded flex flex-col items-center gap-1
                  ${meetingState.isHandRaised ? 'bg-yellow-500/20' : 'bg-slate-800'}`}
                onClick={() => handleRingGesture('doubleTap')}
              >
                <Hand className={`w-4 h-4 ${meetingState.isHandRaised ? 'text-yellow-500' : 'text-blue-400'}`} />
                <span className="text-white/60 text-xs">Hand</span>
              </button>
              <button className="p-3 rounded bg-slate-800 flex flex-col items-center gap-1">
                <Share2 className="w-4 h-4 text-blue-400" />
                <span className="text-white/60 text-xs">Share</span>
              </button>
            </div>

            {/* Meeting Info */}
            <div className="bg-slate-800 rounded p-3">
              <h4 className="text-white text-sm mb-2">Product Review</h4>
              <div className="space-y-1">
                <p className="text-white/60 text-xs">meet.google.com/abc-defg-hij</p>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3 h-3 text-blue-400" />
                  <span className="text-white/60 text-xs">
                    {meetingState.messages.length} messages
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ring Gestures */}
      <div className="bg-slate-100 rounded-lg p-4">
        <h3 className="font-medium text-slate-600 mb-4">Ring Controls</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <ChevronRight className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm text-slate-600">Rotate: Switch View</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-sm text-slate-600">Tap: Mute/Unmute</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                <Hand className="w-4 h-4 text-yellow-500" />
              </div>
              <span className="text-sm text-slate-600">Double Tap: Hand</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YuzuMeet;