import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { events, registrations } = useData();
  const navigate = useNavigate();

  const userRegistrations = useMemo(() => {
    if (!user) return [];
    return registrations.filter(r => r.studentId === user.id && r.status !== 'cancelled');
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
      .filter(r => r.status === 'attended' || (r.status === 'registered' && new Date(events.find(e => e.id === r.eventId)?.endTime || 0).getTime() < now))
      .map(r => {
        const ev = events.find(e => e.id === r.eventId);
        return { reg: r, event: ev };
      })
      .filter(item => item.event)
      .sort((a, b) => new Date(b.event!.startTime).getTime() - new Date(a.event!.startTime).getTime());
  }, [userRegistrations, events]);

  const upNext = registeredEvents.length > 0 ? registeredEvents[0] : null;

  const sequenceItems = [...registeredEvents, ...pastEvents].slice(0, 4); // Show top 4 in timeline

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-[160px] pb-section-gap px-margin-mobile md:px-margin-desktop relative z-10">
        
        {/* Header */}
        <div className="mb-16">
          <div className="font-metadata text-metadata text-on-surface-variant uppercase tracking-widest mb-4">
            SUBJECT IDENTIFIER: {user?.email}
          </div>
          <h1 className="font-display-xl text-[48px] md:text-[80px] tracking-tighter uppercase leading-none text-on-surface">
            DASHBOARD <br/><span className="text-outline-variant/50">— NOIR</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          
          {/* Left Column: Sequence Timeline */}
          <div className="md:col-span-4 flex flex-col gap-8">
            <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.2em]">SEQUENCE</h2>
            
            <div className="relative border-l border-outline-variant/20 ml-2 pl-8 flex flex-col gap-12">
              {sequenceItems.length > 0 ? sequenceItems.map((item, idx) => {
                 const isPast = new Date(item.event!.endTime).getTime() < new Date().getTime();
                 return (
                  <div key={item.reg.id} className="relative group">
                    <div className={`absolute -left-[37px] top-1 w-2 h-2 rounded-full ${isPast ? 'bg-outline-variant/40' : 'bg-primary'} transition-colors`}></div>
                    <div className="font-metadata text-metadata text-on-surface-variant uppercase mb-2">
                      {new Date(item.event!.startTime).toLocaleDateString()} — {isPast ? 'ARCHIVED' : 'PENDING'}
                    </div>
                    <Link to={`/events/${item.event!.id}`} className="font-headline-lg-mobile text-[24px] uppercase text-on-surface hover:text-primary transition-colors hover-target interactive">
                      {item.event!.title}
                    </Link>
                  </div>
                 )
              }) : (
                 <div className="font-metadata text-metadata text-on-surface-variant uppercase">NO RECORDS FOUND.</div>
              )}
            </div>
          </div>

          {/* Right Column: Focus & Stats */}
          <div className="md:col-span-7 md:col-start-6 flex flex-col gap-gutter">
            <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.2em] mb-2">PRIMARY FOCUS</h2>
            
            {/* Main Focus Card */}
            {upNext ? (
              <Link to={`/events/${upNext.event!.id}`} className="glass-panel p-8 md:p-12 relative overflow-hidden group interactive hover-target block">
                <div className="absolute top-0 right-0 p-8 font-metadata text-metadata text-on-surface-variant text-right hidden md:block">
                  STATUS: {upNext.reg.status.toUpperCase()}<br/>
                  LOC: {upNext.event!.location.substring(0, 15).toUpperCase()}
                </div>
                
                <div className="font-display-xl text-[64px] md:text-[88px] text-outline-variant/10 absolute -bottom-4 -left-4 pointer-events-none group-hover:text-primary/10 transition-colors">
                  01
                </div>
                
                <div className="relative z-10 flex flex-col gap-6">
                  <span className="font-label-sm text-label-sm text-primary uppercase tracking-[0.2em] border border-primary/30 rounded-full px-4 py-1 self-start">
                    {upNext.event!.category}
                  </span>
                  
                  <h3 className="font-headline-lg text-[40px] md:text-[56px] uppercase leading-none">
                    {upNext.event!.title}
                  </h3>
                  
                  <div className="font-body-md text-body-md text-on-surface-variant max-w-sm">
                    {upNext.event!.description.substring(0, 100)}...
                  </div>
                </div>
              </Link>
            ) : (
              <div className="glass-panel p-8 md:p-12 text-center text-on-surface-variant font-metadata text-metadata uppercase tracking-widest">
                NO UPCOMING EVENTS.
              </div>
            )}

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mt-4">
              <div className="glass-panel p-8 flex flex-col gap-4 group">
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.2em]">REGISTERED EVENTS</div>
                <div className="font-display-xl text-[48px] text-on-surface group-hover:text-primary transition-colors">{registeredEvents.length}</div>
                <div className="font-metadata text-metadata text-outline-variant uppercase">AWAITING ATTENDANCE</div>
              </div>
              
              <div className="glass-panel p-8 flex flex-col gap-4 group">
                <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.2em]">EVENTS ATTENDED</div>
                <div className="font-display-xl text-[48px] text-on-surface group-hover:text-primary transition-colors">{pastEvents.length}</div>
                <div className="font-metadata text-metadata text-outline-variant uppercase">HISTORICAL RECORDS</div>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
};

export default StudentDashboard;
