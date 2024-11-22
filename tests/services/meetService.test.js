import { describe, it, expect, beforeEach } from 'vitest';
import { MeetService } from '@/services/meetService';

describe('MeetService', () => {
  let meetService;

  beforeEach(() => {
    meetService = new MeetService();
  });

  it('should toggle mute state', () => {
    expect(meetService.state.isMuted).toBe(false);
    meetService.toggleMute();
    expect(meetService.state.isMuted).toBe(true);
  });
});