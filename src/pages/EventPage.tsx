import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const EventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { events, registrations, registerForEvent, cancelRegistration } = useData();
  const { user } = useAuth();

  const event = useMemo(() => events.find(e => e.id === id), [events, id]);

  const userRegistration = useMemo(() => {
    if (!user) return null;
    return registrations.find(r => r.eventId === id && r.studentId === user.id && r.status !== 'cancelled');
  }, [registrations, id, user]);

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-32">
          <div className="text-center font-metadata text-metadata uppercase tracking-widest text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-4 block">error</span>
            RECORD NOT FOUND
          </div>
        </main>
      </div>
    );
  }

  const handleRegistrationToggle = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (userRegistration) {
      if (window.confirm('Are you sure you want to cancel your registration?')) {
        await cancelRegistration(event.id);
      }
    } else {
      await registerForEvent(event.id);
    }
  };

  const isFull = event.registeredCount >= event.capacity;
  const registrationStatusText = userRegistration 
    ? (userRegistration.status === 'registered' ? 'REVOKE ATTENDANCE' : 'REVOKE WAITLIST')
    : (isFull ? 'JOIN WAITLIST' : 'AUTHORIZE ATTENDANCE');

  return (
    <>
      <Navbar />

      <main className="flex-grow relative">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] md:h-[70vh] flex items-end">
          <div className="absolute inset-0 z-0">
            <img 
              src={event.posterUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAS0nMlMQ1AVlAkUD9P7_Z1TWLK5cK0lSGkHk21ukUWOkc01AYJcCT5PhfWMHKAcj5dcgjeRPlvW8K3K5CBcyFnNhNDE_vTHEeK-Ld4Fsmuh8bPd_tN_cUt1rInjl179JsA3KSGXhob9zAxTgeTZU4D8EbF6T1vrJp72oYqyH0ep4_R8rukEiKsIAvN4pVBffvNz7cMcir38lcWrXlU49tVaeKItBYXQShC3zOZFZaDfBREtAtsBwxU"} 
              alt="Event Hero" 
              className="w-full h-full object-cover mix-blend-luminosity opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
          </div>
          
          <div className="relative z-10 w-full px-margin-mobile md:px-margin-desktop pb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-4xl">
              <div className="font-metadata text-metadata text-primary uppercase tracking-[0.2em] mb-4 border border-primary/30 rounded-full px-3 py-1 inline-block">
                {event.category}
              </div>
              <h1 className="font-display-xl text-[64px] md:text-[100px] text-on-surface leading-none uppercase">
                {event.title}
              </h1>
            </div>
            <div className="font-metadata text-metadata text-on-surface-variant uppercase text-right hidden md:block">
              SUBJECT IDENTIFIER: {user ? user.email : 'ANONYMOUS'}<br/>
              DATE: {new Date(event.startTime).toLocaleDateString()}
            </div>
          </div>
          
          <div className="absolute top-32 right-12 font-display-xl text-[120px] text-outline-variant/10 pointer-events-none hidden md:block">
            {event.id.substring(0, 2)}
          </div>
        </section>

        {/* Content Layout */}
        <section className="px-margin-mobile md:px-margin-desktop py-section-gap grid grid-cols-1 md:grid-cols-12 gap-gutter relative z-10">
            
          {/* Main Content Column */}
          <div className="md:col-span-7 flex flex-col gap-12">
            <div>
              <h2 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-[0.2em] mb-6 border-b border-outline-variant/20 pb-4">
                THE DIRECTIVE
              </h2>
              <div className="font-body-md text-body-md text-on-surface leading-relaxed max-w-2xl">
                {event.description || "NO DIRECTIVE PROVIDED."}
              </div>
            </div>
          </div>

          {/* Sidebar Sticky Column */}
          <div className="md:col-span-4 md:col-start-9">
            <div className="sticky top-[160px] glass-panel p-8 flex flex-col gap-8">
              <div>
                <h3 className="font-label-sm text-label-sm text-on-surface uppercase tracking-[0.2em] mb-6">ACCESS PARAMETERS</h3>
                <div className="flex flex-col gap-4 border-l border-outline-variant/20 pl-4">
                  <div>
                    <div className="font-metadata text-metadata text-on-surface-variant uppercase">DATE</div>
                    <div className="font-label-sm text-label-sm text-on-surface">{new Date(event.startTime).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="font-metadata text-metadata text-on-surface-variant uppercase">TIME</div>
                    <div className="font-label-sm text-label-sm text-on-surface">
                      {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div>
                    <div className="font-metadata text-metadata text-on-surface-variant uppercase">COORDINATES</div>
                    <div className="font-label-sm text-label-sm text-on-surface uppercase">{event.location}</div>
                  </div>
                  <div>
                    <div className="font-metadata text-metadata text-on-surface-variant uppercase">CAPACITY</div>
                    <div className="font-label-sm text-label-sm text-primary">
                      {Math.max(0, event.capacity - event.registeredCount)} REMAINING
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-outline-variant/20">
                <button 
                  className={`w-full py-4 font-label-sm text-label-sm uppercase tracking-[0.2em] transition-all interactive hover-target ${userRegistration ? 'border border-primary text-primary hover:bg-primary/10' : 'bg-primary text-on-primary hover:bg-primary-container'}`}
                  onClick={handleRegistrationToggle}
                >
                  {registrationStatusText}
                </button>
                {userRegistration && (
                  <div className="mt-4 text-center font-metadata text-metadata text-primary uppercase">
                    STATUS: {userRegistration.status.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

        </section>
      </main>

      <Footer />
    </>
  );
};

export default EventPage;
