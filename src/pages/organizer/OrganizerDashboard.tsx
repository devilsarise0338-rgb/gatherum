import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { events } = useData();
  const navigate = useNavigate();

  const myEvents = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return events;
    return events.filter(e => e.organizerId === user.id || !e.organizerId); 
  }, [events, user]);

  const totalTicketsSold = useMemo(() => {
    return myEvents.reduce((acc, ev) => acc + ev.registeredCount, 0);
  }, [myEvents]);

  const activeEvents = myEvents.filter(e => !e.isUnpublished);
  const draftEvents = myEvents.filter(e => e.isUnpublished);

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-[160px] pb-section-gap px-margin-mobile md:px-margin-desktop relative z-10">
        
        {/* Header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="font-metadata text-metadata text-on-surface-variant uppercase tracking-widest mb-4">
              CLEARANCE LEVEL: ORGANIZER / {user?.email}
            </div>
            <h1 className="font-display-xl text-[64px] md:text-[100px] tracking-tighter uppercase leading-none text-on-surface">
              OPERATIONS <br/> CONTROL
            </h1>
          </div>
          <Link 
            to="/organizer/events/new"
            className="inline-flex items-center justify-center bg-white text-black rounded-full px-8 py-4 font-label-sm text-label-sm uppercase tracking-widest hover:bg-primary-container hover:text-white transition-colors interactive hover-target md:mb-4"
          >
            INITIATE EVENT +
          </Link>
        </div>

        {/* Brutalist Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-gutter mb-section-gap">
          <div className="glass-panel p-6 md:p-8 flex flex-col gap-2">
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.2em] mb-4">TOTAL ALLOCATIONS</div>
            <div className="font-display-xl text-[40px] md:text-[64px] text-on-surface leading-none">{totalTicketsSold}</div>
          </div>
          <div className="glass-panel p-6 md:p-8 flex flex-col gap-2">
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.2em] mb-4">ACTIVE INITIATIVES</div>
            <div className="font-display-xl text-[40px] md:text-[64px] text-primary leading-none">{activeEvents.length}</div>
          </div>
          <div className="glass-panel p-6 md:p-8 flex flex-col gap-2">
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.2em] mb-4">DRAFT ARCHIVES</div>
            <div className="font-display-xl text-[40px] md:text-[64px] text-on-surface-variant leading-none">{draftEvents.length}</div>
          </div>
          <div className="glass-panel p-6 md:p-8 flex flex-col gap-2 bg-on-surface text-background">
            <div className="font-label-sm text-label-sm text-background/60 uppercase tracking-[0.2em] mb-4">SYSTEM STATUS</div>
            <div className="font-display-xl text-[40px] md:text-[64px] text-background leading-none">OPTIMAL</div>
          </div>
        </div>

        {/* Master Record List */}
        <div>
          <div className="border-b border-outline-variant/30 pb-4 mb-8 flex justify-between items-end">
            <h2 className="font-label-sm text-label-sm text-on-surface uppercase tracking-[0.2em]">MASTER RECORD / EVENTS</h2>
            <div className="font-metadata text-metadata text-on-surface-variant uppercase hidden md:block">SORT: CHRONOLOGICAL</div>
          </div>

          <div className="flex flex-col border-t border-outline-variant/20">
            {myEvents.length > 0 ? myEvents.map((event) => (
              <div key={event.id} className="group relative py-6 md:py-8 border-b border-outline-variant/10 flex flex-col md:flex-row md:items-center justify-between transition-colors px-4 -mx-4 md:px-8 md:-mx-8 hover:bg-surface-container-low">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 w-full md:w-auto mb-6 md:mb-0">
                  <div className={`font-metadata text-metadata px-2 py-1 border rounded-full w-max uppercase ${event.isUnpublished ? 'border-on-surface-variant/30 text-on-surface-variant' : 'border-primary/50 text-primary'}`}>
                    {event.isUnpublished ? 'DRAFT' : 'LIVE'}
                  </div>
                  <div>
                    <h3 className="font-headline-lg-mobile md:font-headline-lg text-[24px] md:text-[40px] uppercase leading-none mb-2">
                      {event.title}
                    </h3>
                    <div className="font-metadata text-metadata text-on-surface-variant uppercase">
                      {new Date(event.startTime).toLocaleDateString()} / {event.location}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between md:justify-end gap-8 w-full md:w-auto">
                  <div className="text-left md:text-right">
                    <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.2em] mb-1">CAPACITY</div>
                    <div className="font-metadata text-metadata text-on-surface text-lg">
                      {event.registeredCount} / {event.capacity}
                    </div>
                  </div>
                  <Link 
                    to={`/organizer/events/${event.id}`}
                    className="font-label-sm text-label-sm uppercase tracking-widest text-primary hover:text-white transition-colors border-b border-primary hover:border-white pb-1 interactive hover-target"
                  >
                    MANAGE
                  </Link>
                </div>
              </div>
            )) : (
              <div className="py-24 text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 block">event_busy</span>
                <p className="font-metadata text-metadata text-on-surface-variant uppercase tracking-widest">NO INITIATIVES LOGGED.</p>
              </div>
            )}
          </div>
        </div>

      </main>

      <Footer />
    </>
  );
};

export default OrganizerDashboard;
