// src/services/meetService.js
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import firebase from 'firebase/app';
import 'firebase/database';

class MeetService {
  constructor() {
    this.oauth2Client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.REDIRECT_URI
    });

    this.SCOPES = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/meetings.space.created',
      'https://www.googleapis.com/auth/meetings.participant'
    ];
  }

  async joinMeeting(meetingCode) {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
      const meeting = await calendar.events.get({
        calendarId: 'primary',
        eventId: meetingCode
      });

      return {
        meetingUrl: meeting.data.hangoutLink,
        participantToken: meeting.data.conferenceData?.entryPoints?.[0]?.pin
      };
    } catch (error) {
      console.error('Error joining meeting:', error);
      throw error;
    }
  }

  async updateMeetingState({ meetingId, action, value }) {
    try {
      const meetHardware = google.meetings({ version: 'v1', auth: this.oauth2Client });
      
      switch (action) {
        case 'mute':
          await meetHardware.spaces.devices.updateAudioState({
            name: meetingId,
            requestBody: { muted: value }
          });
          break;

        case 'raiseHand':
          await meetHardware.spaces.participants.updateParticipantState({
            name: meetingId,
            requestBody: { raisedHand: value }
          });
          break;

        case 'camera':
          await meetHardware.spaces.devices.updateVideoState({
            name: meetingId,
            requestBody: { enabled: value }
          });
          break;
      }
    } catch (error) {
      console.error('Error updating meeting state:', error);
      throw error;
    }
  }

  async setupEventListeners(meetingId, callbacks) {
    const meetHardware = google.meetings({ version: 'v1', auth: this.oauth2Client });
    
    const stream = await meetHardware.spaces.watch({
      name: meetingId,
      requestBody: {
        eventTypes: [
          'participantJoined',
          'participantLeft',
          'audioStateChanged',
          'videoStateChanged',
          'presentationStarted',
          'messageReceived'
        ]
      }
    });

    stream.on('data', (event) => {
      if (callbacks[event.type]) {
        callbacks[event.type](event.data);
      }
    });

    return stream;
  }
}

const getMeetData = async () => {
  const snapshot = await firebase.database().ref('meetData').once('value');
  return snapshot.val();
};

const toggleMute = async () => {
  await firebase.database().ref('meetData/isMuted').set(!isMuted);
};

const toggleVideo = async () => {
  await firebase.database().ref('meetData/isVideoOn').set(!isVideoOn);
};

const toggleCamera = async () => {
  await firebase.database().ref('meetData/cameraActive').set(!cameraActive);
};

export default {
  getMeetData,
  toggleMute,
  toggleVideo,
  toggleCamera
};