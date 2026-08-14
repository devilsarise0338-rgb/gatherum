import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { useData } from '../../contexts/DataContext';

const VolunteerDashboard: React.FC = () => {
  const { events, registrations } = useData();
  const navigate = useNavigate();

  const activeEvents = useMemo(() => {
    return events.filter(e => !e.isUnpublished);
  }, [events]);

  const stats = useMemo(() => {
    let checkedIn = 0;
    let remaining = 0;
    
    registrations.forEach(r => {
      if (r.status === 'attended') checkedIn++;
      else if (r.status === 'registered') remaining++;
    });

    return { checkedIn, remaining };
  }, [registrations]);

  const recentCheckIns = useMemo(() => {
    return registrations
      .filter(r => r.status === 'attended')
      .slice(0, 5) // Mock recent by taking first 5 for now
      .map(r => {
        const ev = events.find(e => e.id === r.eventId);
        return {
          id: r.ticketId || r.id,
          name: r.studentEmail || r.studentId,
          eventName: ev?.title || 'Unknown Event'
        };
      });
  }, [registrations, events]);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-on-primary font-body-md text-on-surface">
      <Navbar />

      <main className="flex-grow pt-32 pb-32 px-6 md:px-16 relative">
        {/* Decorative Grid */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#2A2A2A_1px,transparent_1px),linear-gradient(to_bottom,#2A2A2A_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="max-w-[1440px] mx-auto w-full relative z-10">
          <header className="mb-12 flex flex-col gap-4 border-b-4 border-grid-line pb-8">
            <div className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-caps px-4 py-2 border-2 border-grid-line w-max shadow-[4px_4px_0_0_#2A2A2A] uppercase">
              <span className="w-2 h-2 bg-on-primary animate-pulse border border-on-primary"></span>
              TEMPORARY MODE: VOLUNTEER
            </div>
            <h1 className="font-display-hero text-5xl md:text-7xl text-on-surface uppercase tracking-tight">
              Operational Hub
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-3xl border-l-4 border-primary pl-4">
              Welcome to your operational dashboard. Use this hub to manage check-ins, monitor live statistics, and assist attendees efficiently.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Primary Action */}
            <div className="col-span-1 md:col-span-8 bg-surface border-4 border-grid-line p-12 flex flex-col justify-center items-center text-center relative overflow-hidden group shadow-[8px_8px_0_0_#2A2A2A]">
              <span className="material-symbols-outlined text-8xl text-primary mb-6 drop-shadow-[4px_4px_0_rgba(42,42,42,1)]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
                qr_code_scanner
              </span>
              <h2 className="font-subheadline-bold text-4xl text-on-surface mb-4 uppercase">Select Event to Scan</h2>
              <div className="w-full max-w-lg flex flex-col gap-4 mt-6">
                {activeEvents.map(event => (
                  <Button 
                    key={event.id}
                    size="lg" 
                    className="shadow-[4px_4px_0_0_#2A2A2A] w-full text-left justify-between"
                    onClick={() => navigate(`/volunteer/checkin/${event.id}`)}
                  >
                    <span>{event.title}</span>
                    <span className="material-symbols-outlined ml-3">document_scanner</span>
                  </Button>
                ))}
                {activeEvents.length === 0 && (
                  <p className="text-on-surface-variant uppercase font-label-caps tracking-widest">No active events.</p>
                )}
              </div>
            </div>

            {/* Stats Overview */}
            <div className="col-span-1 md:col-span-4 bg-surface border-4 border-grid-line flex flex-col shadow-[8px_8px_0_0_#2A2A2A]">
              <h3 className="font-label-caps bg-surface-dim text-on-surface p-4 uppercase tracking-widest border-b-4 border-grid-line">Global Live Check-in Stats</h3>
              <div className="flex flex-col flex-grow">
                <div className="flex justify-between items-end p-6 border-b-2 border-grid-line bg-surface hover:bg-surface-bright transition-colors cursor-default">
                  <div className="flex flex-col gap-1">
                    <span className="font-label-caps text-on-surface-variant uppercase">Checked In</span>
                    <span className="font-display-hero text-6xl text-primary font-bold">{stats.checkedIn}</span>
                  </div>
                  <span className="material-symbols-outlined text-primary text-4xl">check_circle</span>
                </div>
                <div className="flex justify-between items-end p-6 bg-surface hover:bg-surface-bright transition-colors cursor-default">
                  <div className="flex flex-col gap-1">
                    <span className="font-label-caps text-on-surface-variant uppercase">Remaining</span>
                    <span className="font-display-hero text-6xl text-on-surface font-bold">{stats.remaining}</span>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-4xl">group</span>
                </div>
              </div>
            </div>

            {/* Attendee List Quick View */}
            <div className="col-span-1 md:col-span-12 mt-4 bg-surface border-4 border-grid-line shadow-[8px_8px_0_0_#2A2A2A]">
              <div className="flex justify-between items-center p-6 border-b-4 border-grid-line">
                <h3 className="font-subheadline-bold text-2xl uppercase">Recent Check-ins</h3>
                <Button variant="outline">View All</Button>
              </div>
              <table className="w-full text-left font-body-md border-collapse">
                <tbody>
                  {recentCheckIns.length > 0 ? recentCheckIns.map((row, i) => (
                    <tr key={i} className="border-b-2 border-grid-line last:border-0 hover:bg-surface-bright transition-colors group">
                      <td className="p-4 font-label-caps text-primary uppercase w-1/4">{row.id}</td>
                      <td className="p-4 font-subheadline-bold text-lg uppercase w-1/2 group-hover:text-primary transition-colors">{row.name}</td>
                      <td className="p-4 text-on-surface-variant font-label-caps text-right">{row.eventName}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-on-surface-variant uppercase font-label-caps tracking-widest">
                        No recent check-ins.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default VolunteerDashboard;
