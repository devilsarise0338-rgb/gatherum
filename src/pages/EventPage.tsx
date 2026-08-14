import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
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
          <div className="text-center">
            <h1 className="font-display-hero text-4xl uppercase text-on-surface mb-4">Event Not Found</h1>
            <Button onClick={() => navigate('/events')}>Return to Explore</Button>
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
    ? (userRegistration.status === 'registered' ? 'Registered' : 'Waitlisted')
    : (isFull ? 'Join Waitlist' : 'Secure Entry');

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-on-primary">
      <Navbar />

      <main className="flex-grow pb-32">
        {/* Hero Section */}
        <section className="relative w-full h-[70vh] md:h-[85vh] flex items-end border-b-4 border-grid-line">
          <div 
            className="absolute inset-0 bg-cover bg-center grayscale" 
            style={{ backgroundImage: `url(${event.posterUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS0nMlMQ1AVlAkUD9P7_Z1TWLK5cK0lSGkHk21ukUWOkc01AYJcCT5PhfWMHKAcj5dcgjeRPlvW8K3K5CBcyFnNhNDE_vTHEeK-Ld4Fsmuh8bPd_tN_cUt1rInjl179JsA3KSGXhob9zAxTgeTZU4D8EbF6T1vrJp72oYqyH0ep4_R8rukEiKsIAvN4pVBffvNz7cMcir38lcWrXlU49tVaeKItBYXQShC3zOZFZaDfBREtAtsBwxU'})` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
          
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-16 pb-16">
            <div className="max-w-3xl">
              <p className="font-label-caps text-primary mb-4 tracking-widest uppercase border-b-2 border-primary inline-block pb-1">
                {event.category}
              </p>
              <h1 className="font-display-hero text-5xl md:text-8xl text-on-surface mb-6 leading-tight uppercase">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-on-surface-variant font-subheadline-bold text-lg uppercase">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[24px]">calendar_today</span>
                  <span>{new Date(event.startTime).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[24px]">location_on</span>
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Layout */}
        <section className="max-w-7xl mx-auto px-6 md:px-16 pt-16">
          <div className="flex flex-col md:flex-row gap-12 relative">
            
            {/* Main Content Column */}
            <div className="w-full md:w-2/3 lg:w-3/4 space-y-16">
              
              <div className="space-y-6">
                <h2 className="font-subheadline-bold text-[32px] text-on-surface border-b-4 border-grid-line pb-2 inline-block uppercase">
                  The Experience
                </h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                  {event.description || "Join us for an unforgettable experience."}
                </p>
              </div>

            </div>

            {/* Sidebar Sticky Column */}
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="sticky top-28">
                <Card className="p-6 border-4 border-grid-line shadow-[8px_8px_0px_0px_rgba(42,42,42,1)] bg-surface flex flex-col">
                  <div className="border-b-2 border-grid-line pb-6 mb-6">
                    <h3 className="font-display-hero text-4xl text-on-surface mb-2 uppercase">Access</h3>
                    <div className="text-on-surface-variant font-label-caps uppercase tracking-widest mb-4">
                      {isFull ? 'Waitlist Open' : 'Limited Availability'}
                    </div>
                    <div className="font-subheadline-bold text-5xl text-primary">FREE</div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm font-body-md border-b border-grid-line/50 pb-2">
                      <span className="text-on-surface-variant uppercase">Date</span>
                      <span className="text-on-surface uppercase font-bold">{new Date(event.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-body-md border-b border-grid-line/50 pb-2">
                      <span className="text-on-surface-variant uppercase">Time</span>
                      <span className="text-on-surface uppercase font-bold">
                        {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-body-md border-b border-grid-line/50 pb-2">
                      <span className="text-on-surface-variant uppercase">Venue</span>
                      <span className="text-on-surface uppercase font-bold text-right">{event.location}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-body-md pb-2">
                      <span className="text-on-surface-variant uppercase">Availability</span>
                      <span className="text-on-surface uppercase font-bold text-right">
                        {Math.max(0, event.capacity - event.registeredCount)} / {event.capacity}
                      </span>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full text-lg shadow-[4px_4px_0px_0px_rgba(212,175,55,0.4)]"
                    variant={userRegistration ? 'outline' : 'primary'}
                    onClick={handleRegistrationToggle}
                  >
                    {userRegistration ? 'Cancel Registration' : registrationStatusText}
                  </Button>
                </Card>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
};

export default EventPage;
