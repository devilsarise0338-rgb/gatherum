import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

const OrganizerEventManagement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { events, registrations, deleteEvent } = useData();

  const event = events.find(e => e.id === id);

  const eventRegistrations = useMemo(() => {
    return registrations.filter(r => r.eventId === id && r.status !== 'cancelled');
  }, [registrations, id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this event? This action cannot be undone.")) {
      await deleteEvent(id!);
      navigate('/organizer');
    }
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

  const tableData = eventRegistrations.map(reg => ({
    name: reg.studentEmail || reg.studentId,
    status: reg.status === 'attended' ? 'Checked In' : reg.status === 'registered' ? 'Pending' : 'Waitlisted',
    id: reg.ticketId || reg.id
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-on-primary">
      <Navbar />

      <main className="flex-grow pt-32 pb-32 px-6 md:px-16 relative">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#2A2A2A_1px,transparent_1px),linear-gradient(to_bottom,#2A2A2A_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-4 border-b-4 border-grid-line pb-8">
            <div>
              <h1 className="font-display-hero text-5xl md:text-7xl text-on-surface uppercase tracking-tight">
                Event Management
              </h1>
              <p className="font-body-lg text-on-surface-variant max-w-3xl border-l-4 border-primary pl-4 mt-4 uppercase font-bold">
                {event.title}
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="shadow-[4px_4px_0_0_#2A2A2A]" onClick={() => navigate(`/organizer/checkin/${event.id}`)}>Check-in Mode</Button>
              <Button className="shadow-[4px_4px_0_0_#2A2A2A] bg-error hover:bg-error/90 text-on-error border-error" onClick={handleDelete}>Delete Event</Button>
            </div>
          </header>

          <div className="space-y-12">
            <div className="bg-surface border-4 border-grid-line p-8 shadow-[8px_8px_0_0_#2A2A2A]">
              <h2 className="font-subheadline-bold text-3xl uppercase border-l-8 border-primary pl-4 mb-6">
                Attendees ({event.registeredCount}/{event.capacity})
              </h2>
              {tableData.length > 0 ? (
                <Table 
                  columns={[
                    { key: 'name', header: 'Email / ID' },
                    { key: 'id', header: 'Ticket ID' },
                    { key: 'status', header: 'Status' }
                  ]}
                  data={tableData}
                />
              ) : (
                <div className="text-center p-8 border-2 border-grid-line border-dashed">
                  <p className="text-on-surface-variant uppercase font-label-caps tracking-widest">No registrations yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrganizerEventManagement;
