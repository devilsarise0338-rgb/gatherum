import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { useData } from '../../contexts/DataContext';

const OrganizerCheckIn: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { checkInUser, events } = useData();
  
  const [ticketId, setTicketId] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const event = events.find(e => e.id === eventId);

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketId) return;

    try {
      const result = await checkInUser(ticketId);
      if (result.success) {
        setStatus({ type: 'success', message: result.message });
        setTicketId('');
      } else {
        setStatus({ type: 'error', message: result.message });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'An error occurred during check-in.' });
    }
    
    // Clear message after 3 seconds
    setTimeout(() => {
      setStatus(null);
    }, 3000);
  };

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center pt-32 gap-4">
          <h1 className="font-display-hero text-4xl uppercase text-on-surface">Event Not Found</h1>
          <Button onClick={() => navigate('/organizer')}>Back to Dashboard</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-on-primary">
      <Navbar />

      <main className="flex-grow pt-32 pb-32 px-6 md:px-16 relative">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#2A2A2A_1px,transparent_1px),linear-gradient(to_bottom,#2A2A2A_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="max-w-4xl mx-auto w-full relative z-10 flex flex-col items-center">
          <header className="mb-8 flex flex-col items-center gap-4 pb-4 w-full">
            <h2 className="font-label-caps tracking-widest text-primary uppercase border border-primary px-4 py-1">
              Event Door Mode
            </h2>
            <h1 className="font-display-hero text-4xl md:text-5xl text-on-surface uppercase tracking-tight text-center">
              {event.title}
            </h1>
          </header>

          {/* Status Message */}
          <div className="h-16 mb-4 w-full max-w-md">
            {status && (
              <div className={`p-4 border-2 font-subheadline-bold uppercase text-center ${
                status.type === 'success' ? 'bg-primary/20 border-primary text-primary' : 'bg-error text-on-error border-error'
              }`}>
                {status.message}
              </div>
            )}
          </div>

          <div className="w-full max-w-md aspect-square bg-surface-dim border-8 border-primary flex items-center justify-center shadow-[16px_16px_0_0_#2A2A2A] mb-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/10 animate-pulse"></div>
            <div className="w-full h-1 bg-primary absolute top-1/2 left-0 shadow-[0_0_15px_2px_rgba(212,175,55,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
            <span className="material-symbols-outlined text-6xl text-grid-line z-10 opacity-50">photo_camera</span>
            
            <style>{`
              @keyframes scan {
                0%, 100% { top: 10%; }
                50% { top: 90%; }
              }
            `}</style>
          </div>

          <form onSubmit={handleManualEntry} className="w-full max-w-md flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-label-caps uppercase text-on-surface-variant tracking-widest text-sm">Manual Ticket Entry</label>
              <div className="flex gap-2">
                <input 
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Enter Ticket ID (e.g. TKT-123)"
                  className="flex-grow bg-surface border-2 border-grid-line p-3 text-on-surface uppercase focus-visible:outline-none focus-visible:border-primary"
                />
                <Button type="submit" className="shadow-[4px_4px_0_0_#2A2A2A]" disabled={!ticketId}>
                  Submit
                </Button>
              </div>
            </div>
            <Button variant="outline" className="shadow-[4px_4px_0_0_#2A2A2A] mt-4" onClick={() => navigate(`/organizer/events/${event.id}`)}>
              Back to Event Management
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default OrganizerCheckIn;
