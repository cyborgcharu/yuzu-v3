// src/tests/interfaces/glasses/MeetDisplay.test.jsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GlassesMeetDisplay } from '@/interfaces/glasses/MeetDisplay';
import { MeetProvider } from '@/components/MeetProvider';

describe('GlassesMeetDisplay', () => {
  it('should render participant name', () => {
    render(
      <MeetProvider>
        <GlassesMeetDisplay />
      </MeetProvider>
    );
    
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
  });

  it('should toggle mute when mic button clicked', () => {
    render(
      <MeetProvider>
        <GlassesMeetDisplay />
      </MeetProvider>
    );
    
    const micButton = screen.getByRole('button', { name: /mic/i });
    fireEvent.click(micButton);
    
    // Check for muted state (red background)
    expect(micButton).toHaveClass('bg-red-500');
  });
});