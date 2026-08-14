import React, { useMemo } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Ticket } from '../../components/ui/Ticket';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

const StudentTickets: React.FC = () => {
  const { user } = useAuth();
  const { events, registrations } = useData();
  const navigate = useNavigate();

  const userTickets = useMemo(() => {
    if (!user) return [];
    return registrations
      .filter(r => r.studentId === user.id && r.status === 'registered')
      .map(r => {
        const ev = events.find(e => e.id === r.eventId);
        return { reg: r, event: ev };
      })
      .filter(item => item.event)
      .sort((a, b) => new Date(a.event!.startTime).getTime() - new Date(b.event!.startTime).getTime());
  }, [registrations, user, events]);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-on-primary">
      <Navbar />

      <main className="flex-grow pt-32 pb-32 px-6 md:px-16 relative">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#2A2A2A_1px,transparent_1px),linear-gradient(to_bottom,#2A2A2A_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <header className="mb-12 flex flex-col gap-4 border-b-4 border-grid-line pb-8">
            <h1 className="font-display-hero text-5xl md:text-7xl text-on-surface uppercase tracking-tight">
              My Tickets
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-3xl border-l-4 border-primary pl-4">
              Access your upcoming digital tickets and past event history.
            </p>
          </header>

          <div className="flex flex-col gap-12">
            {userTickets.length > 0 ? (
              userTickets.map(({ event, reg }) => (
                <Ticket 
                  key={reg.id}
                  eventName={event!.title} 
                  date={new Date(event!.startTime).toLocaleDateString()} 
                  location={event!.location} 
                  ticketId={reg.ticketId || reg.id} 
                  attendeeName={user?.email || "Student"} 
                />
              ))
            ) : (
              <div className="bg-surface border-4 border-grid-line p-12 text-center shadow-[8px_8px_0_0_#2A2A2A]">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">confirmation_number</span>
                <h3 className="font-subheadline-bold text-2xl uppercase mb-2">No Tickets Found</h3>
                <p className="font-body-md text-on-surface-variant uppercase tracking-widest text-sm mb-6">You haven't registered for any events yet.</p>
                <Button onClick={() => navigate('/events')}>Explore Events</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentTickets;
