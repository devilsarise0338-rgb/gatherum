import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { events, registrations } = useData();
  const navigate = useNavigate();

  const userRegistrations = useMemo(() => {
    if (!user) return [];
    return registrations.filter(r => r.studentId === user.id);
  }, [registrations, user]);

  const registeredEvents = useMemo(() => {
    return userRegistrations
      .filter(r => r.status === 'registered' || r.status === 'waitlisted')
      .map(r => {
        const ev = events.find(e => e.id === r.eventId);
        return { reg: r, event: ev };
      })
      .filter(item => item.event)
      .sort((a, b) => new Date(a.event!.startTime).getTime() - new Date(b.event!.startTime).getTime());
  }, [userRegistrations, events]);

  const pastEvents = useMemo(() => {
    const now = new Date().getTime();
    return userRegistrations
      .filter(r => r.status === 'attended')
      .map(r => {
        const ev = events.find(e => e.id === r.eventId);
        return { reg: r, event: ev };
      })
      .filter(item => item.event && new Date(item.event.endTime).getTime() < now);
  }, [userRegistrations, events]);

  const upNext = registeredEvents.length > 0 ? registeredEvents[0] : null;

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-on-primary">
      <Navbar />

      <main className="flex-grow pt-32 pb-32 px-6 md:px-16 relative">
        {/* Decorative Grid */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#2A2A2A_1px,transparent_1px),linear-gradient(to_bottom,#2A2A2A_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <header className="mb-12 flex flex-col gap-4 border-b-4 border-grid-line pb-8">
            <div className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-caps px-4 py-2 border-2 border-grid-line shadow-[4px_4px_0_0_#2A2A2A] mb-4 w-max">
              <span className="w-2 h-2 bg-on-primary animate-pulse border border-on-primary"></span>
              STUDENT DASHBOARD
            </div>
            <h1 className="font-display-hero text-5xl md:text-7xl text-on-surface uppercase tracking-tight">
              Welcome, {user?.email.split('@')[0] || 'Student'}
            </h1>
            <p className="font-body-lg text-on-surface-variant max-w-3xl border-l-4 border-primary pl-4">
              Your hub for upcoming curated experiences, saved events, and digital tickets.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Quick Actions / Up Next */}
            <div className="col-span-1 md:col-span-8 bg-surface border-4 border-grid-line p-8 shadow-[8px_8px_0_0_#2A2A2A] flex flex-col justify-center">
              <h2 className="font-subheadline-bold text-3xl uppercase mb-6 border-l-8 border-primary pl-4">Up Next</h2>
              {upNext ? (
                <div className="flex flex-col md:flex-row gap-8 items-center bg-surface-dim border-2 border-grid-line p-6">
                  <div className="md:w-1/3 w-full border-2 border-grid-line shadow-[4px_4px_0_0_#2A2A2A] grayscale hover:grayscale-0 transition-all cursor-pointer" onClick={() => navigate(`/events/${upNext.event!.id}`)}>
                    <img src={upNext.event!.posterUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAS0nMlMQ1AVlAkUD9P7_Z1TWLK5cK0lSGkHk21ukUWOkc01AYJcCT5PhfWMHKAcj5dcgjeRPlvW8K3K5CBcyFnNhNDE_vTHEeK-Ld4Fsmuh8bPd_tN_cUt1rInjl179JsA3KSGXhob9zAxTgeTZU4D8EbF6T1vrJp72oYqyH0ep4_R8rukEiKsIAvN4pVBffvNz7cMcir38lcWrXlU49tVaeKItBYXQShC3zOZFZaDfBREtAtsBwxU"} className="w-full h-[150px] object-cover" alt="Event" />
                  </div>
                  <div className="md:w-2/3 w-full flex flex-col justify-between">
                    <div>
                      <span className="font-label-caps text-primary uppercase border border-primary px-2 py-1 mb-2 inline-block">
                        {new Date(upNext.event!.startTime).toLocaleDateString()}
                      </span>
                      <h3 className="font-display-hero text-3xl uppercase text-on-surface mb-2">{upNext.event!.title}</h3>
                      <p className="font-body-md text-on-surface-variant mb-6 border-l-2 border-grid-line pl-2">
                        {new Date(upNext.event!.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {upNext.event!.location}
                      </p>
                    </div>
                    {upNext.reg.status === 'registered' ? (
                      <Button 
                        className="shadow-[4px_4px_0_0_#2A2A2A]"
                        onClick={() => navigate('/student/tickets')}
                      >
                        View Ticket
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="shadow-[4px_4px_0_0_#2A2A2A] opacity-70 cursor-not-allowed"
                        disabled
                      >
                        Waitlisted
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-surface-dim border-2 border-grid-line p-12 text-center flex flex-col items-center">
                  <span className="material-symbols-outlined text-4xl mb-4 text-on-surface-variant">event_busy</span>
                  <p className="font-body-md text-on-surface-variant uppercase tracking-widest mb-4">No upcoming events.</p>
                  <Button onClick={() => navigate('/events')}>Explore Events</Button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="col-span-1 md:col-span-4 flex flex-col gap-8">
              <Card className="p-6 flex flex-col border-4 border-grid-line shadow-[8px_8px_0_0_#2A2A2A] bg-surface flex-grow justify-center">
                <span className="font-label-caps text-on-surface-variant uppercase border-b-2 border-grid-line pb-2 mb-4 tracking-widest">Events Attended</span>
                <span className="font-display-hero text-6xl text-primary font-bold">{pastEvents.length}</span>
              </Card>
              <Card className="p-6 flex flex-col border-4 border-grid-line shadow-[8px_8px_0_0_#2A2A2A] bg-surface flex-grow justify-center">
                <span className="font-label-caps text-on-surface-variant uppercase border-b-2 border-grid-line pb-2 mb-4 tracking-widest">Upcoming</span>
                <span className="font-display-hero text-6xl text-on-surface font-bold">{registeredEvents.length}</span>
              </Card>
            </div>

            {/* Saved/Past Events */}
            <div className="col-span-1 md:col-span-12 mt-8">
              <h2 className="font-subheadline-bold text-3xl uppercase border-b-4 border-grid-line pb-4 mb-8">Recent Activity</h2>
              {registeredEvents.length > 0 || pastEvents.length > 0 ? (
                <div className="overflow-x-auto hide-scrollbar">
                  <table className="w-full text-left font-body-md border-collapse">
                    <thead>
                      <tr className="border-b-4 border-grid-line font-label-caps text-on-surface-variant uppercase tracking-widest">
                        <th className="p-4 bg-surface">Event</th>
                        <th className="p-4 bg-surface">Date</th>
                        <th className="p-4 bg-surface">Status</th>
                        <th className="p-4 bg-surface">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registeredEvents.map(({ event, reg }) => (
                        <tr key={reg.id} className="border-b-2 border-grid-line hover:bg-surface-bright transition-colors group">
                          <td className="p-4 font-subheadline-bold text-lg uppercase group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/events/${event!.id}`)}>
                            {event!.title}
                          </td>
                          <td className="p-4 text-on-surface-variant">{new Date(event!.startTime).toLocaleDateString()}</td>
                          <td className="p-4">
                            {reg.status === 'registered' ? (
                              <span className="bg-primary text-on-primary font-label-caps px-2 py-1 uppercase border border-primary">Attending</span>
                            ) : (
                              <span className="bg-surface-dim text-on-surface font-label-caps px-2 py-1 uppercase border border-grid-line">Waitlisted</span>
                            )}
                          </td>
                          <td className="p-4">
                            {reg.status === 'registered' ? (
                              <button onClick={() => navigate('/student/tickets')} className="text-primary hover:underline font-label-caps uppercase">Ticket</button>
                            ) : (
                              <span className="text-on-surface-variant font-label-caps uppercase">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {pastEvents.map(({ event, reg }) => (
                        <tr key={reg.id} className="border-b-2 border-grid-line hover:bg-surface-bright transition-colors group">
                          <td className="p-4 font-subheadline-bold text-lg uppercase group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/events/${event!.id}`)}>
                            {event!.title}
                          </td>
                          <td className="p-4 text-on-surface-variant">{new Date(event!.startTime).toLocaleDateString()}</td>
                          <td className="p-4">
                            <span className="bg-surface-dim text-on-surface-variant font-label-caps px-2 py-1 uppercase border border-grid-line">Past</span>
                          </td>
                          <td className="p-4">
                            <button className="text-on-surface hover:underline font-label-caps uppercase">Review</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-surface border-2 border-grid-line p-12 text-center shadow-[4px_4px_0_0_#2A2A2A]">
                  <p className="font-body-md text-on-surface-variant uppercase tracking-widest">No activity yet.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
