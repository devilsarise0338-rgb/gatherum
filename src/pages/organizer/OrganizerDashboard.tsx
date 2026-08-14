import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { events } = useData();
  const navigate = useNavigate();

  const myEvents = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return events; // Admin sees all events
    return events.filter(e => e.organizerId === user.id || !e.organizerId); // Assume some events are public for now
  }, [events, user]);

  const totalTicketsSold = useMemo(() => {
    return myEvents.reduce((acc, ev) => acc + ev.registeredCount, 0);
  }, [myEvents]);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-on-primary">
      <Navbar />

      <main className="flex-grow pt-32 pb-32 px-6 md:px-16 relative">
        {/* Decorative Grid */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#2A2A2A_1px,transparent_1px),linear-gradient(to_bottom,#2A2A2A_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-grid-line pb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-caps px-4 py-2 border-2 border-grid-line shadow-[4px_4px_0_0_#2A2A2A] mb-4">
                <span className="w-2 h-2 bg-on-primary animate-pulse border border-on-primary"></span>
                HOST DASHBOARD
              </div>
              <h1 className="font-display-hero text-5xl md:text-7xl text-on-surface uppercase tracking-tight">
                Your Events
              </h1>
            </div>
            <Button size="lg" className="shadow-[4px_4px_0_0_rgba(212,175,55,0.4)]" onClick={() => navigate('/organizer/events/new')}>
              + Create Event
            </Button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Quick Stats */}
            <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {[
                { label: 'Total Registrations', value: totalTicketsSold.toString() },
                { label: 'Total Events', value: myEvents.length.toString() },
                { label: 'Active Events', value: myEvents.filter(e => !e.isUnpublished).length.toString() }
              ].map((stat, i) => (
                <Card key={i} className="p-6 flex flex-col border-4 border-grid-line shadow-[8px_8px_0_0_#2A2A2A] bg-surface">
                  <span className="font-label-caps text-on-surface-variant uppercase border-b-2 border-grid-line pb-2 mb-4 tracking-widest">{stat.label}</span>
                  <span className="font-display-hero text-5xl text-primary font-bold">{stat.value}</span>
                </Card>
              ))}
            </div>

            {/* Event List */}
            <div className="col-span-1 md:col-span-12 space-y-6">
              <h2 className="font-subheadline-bold text-3xl uppercase border-l-8 border-primary pl-4">Active Events</h2>
              
              <div className="grid gap-6">
                {myEvents.length > 0 ? myEvents.map(event => (
                  <Card key={event.id} className="flex flex-col md:flex-row border-4 border-grid-line shadow-[8px_8px_0_0_#2A2A2A] bg-surface group hover:bg-surface-bright transition-colors cursor-pointer" onClick={() => navigate(`/organizer/events/${event.id}`)}>
                    <div className="md:w-1/4 bg-surface-dim border-b-4 md:border-b-0 md:border-r-4 border-grid-line grayscale group-hover:grayscale-0 transition-all">
                      <img src={event.posterUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAS0nMlMQ1AVlAkUD9P7_Z1TWLK5cK0lSGkHk21ukUWOkc01AYJcCT5PhfWMHKAcj5dcgjeRPlvW8K3K5CBcyFnNhNDE_vTHEeK-Ld4Fsmuh8bPd_tN_cUt1rInjl179JsA3KSGXhob9zAxTgeTZU4D8EbF6T1vrJp72oYqyH0ep4_R8rukEiKsIAvN4pVBffvNz7cMcir38lcWrXlU49tVaeKItBYXQShC3zOZFZaDfBREtAtsBwxU"} className="w-full h-full object-cover min-h-[150px]" alt="Event" />
                    </div>
                    <div className="p-6 md:w-3/4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-subheadline-bold text-2xl uppercase">{event.title}</h3>
                          {event.isUnpublished ? (
                            <span className="bg-surface-variant text-on-surface font-label-caps px-2 py-1 uppercase border-2 border-grid-line">Draft</span>
                          ) : (
                            <span className="bg-primary text-on-primary font-label-caps px-2 py-1 uppercase border-2 border-grid-line">Live</span>
                          )}
                        </div>
                        <p className="font-body-md text-on-surface-variant mb-4 border-l-2 border-grid-line pl-2">{new Date(event.startTime).toLocaleDateString()} • {event.location}</p>
                      </div>
                      <div className="flex justify-between items-center border-t-2 border-grid-line pt-4">
                        <div className="flex gap-8">
                          <div>
                            <p className="font-label-caps text-on-surface-variant uppercase mb-1">Registrations</p>
                            <p className="font-subheadline-bold text-lg">{event.registeredCount} / {event.capacity}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="shadow-[4px_4px_0_0_#2A2A2A]">Manage</Button>
                      </div>
                    </div>
                  </Card>
                )) : (
                  <div className="bg-surface border-4 border-grid-line p-12 text-center shadow-[8px_8px_0_0_#2A2A2A]">
                    <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">event_busy</span>
                    <h3 className="font-subheadline-bold text-2xl uppercase mb-2">No Events Found</h3>
                    <p className="font-body-md text-on-surface-variant uppercase tracking-widest text-sm mb-6">Create your first event to get started.</p>
                    <Button onClick={() => navigate('/organizer/events/new')}>Create Event</Button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default OrganizerDashboard;
