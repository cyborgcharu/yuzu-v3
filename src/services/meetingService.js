// src/services/meetingService.js
import { google } from 'googleapis';
import { googleAuthService } from './googleAuthService';

class MeetingService {
  constructor() {
    this.calendar = google.calendar({ 
      version: 'v3', 
      auth: googleAuthService.getClient() 
    });
  }

  async listMeetings(tokens) {
    googleAuthService.setCredentials(tokens);
    const response = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
      q: 'meet.google.com'
    });

    return response.data.items
      .filter(event => event.hangoutLink)
      .map(event => ({
        id: event.id,
        title: event.summary,
        startTime: event.start.dateTime,
        endTime: event.end.dateTime,
        meetLink: event.hangoutLink,
        attendees: event.attendees || []
      }));
  }

  async createMeeting(tokens, { title, startTime, duration, attendees }) {
    googleAuthService.setCredentials(tokens);
    
    const event = {
      summary: title,
      start: {
        dateTime: new Date(startTime).toISOString(),
        timeZone: 'UTC'
      },
      end: {
        dateTime: new Date(new Date(startTime).getTime() + duration * 60000).toISOString(),
        timeZone: 'UTC'
      },
      attendees: attendees?.map(email => ({ email })) || [],
      conferenceData: {
        createRequest: {
          requestId: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    const response = await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1
    });

    return {
      id: response.data.id,
      meetLink: response.data.hangoutLink,
      title: response.data.summary,
      startTime: response.data.start.dateTime,
      endTime: response.data.end.dateTime
    };
  }

  async getMeeting(tokens, meetingId) {
    googleAuthService.setCredentials(tokens);
    const event = await this.calendar.events.get({
      calendarId: 'primary',
      eventId: meetingId
    });

    if (!event.data.hangoutLink) {
      throw new Error('No meeting link available');
    }

    return {
      meetLink: event.data.hangoutLink,
      title: event.data.summary,
      startTime: event.data.start.dateTime,
      endTime: event.data.end.dateTime
    };
  }
}

export const meetingService = new MeetingService();