import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { mapCampusEventToEventItem } from '../utils/mapper';
import { EventCard } from '../components/common/EventCard';
import { Calendar, Bookmark, User as UserIcon, QrCode, ArrowRight, Settings, CheckCircle2 } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const MyEventsPage: React.FC = () => {
  const { user } = useAuth();
  const { events: rawEvents, registrations } = useData();
  const events = rawEvents.map(mapCampusEventToEventItem);
  const [activeTab, setActiveTab] = useState<'rsvps' | 'saved' | 'settings'>('rsvps');

  // State for settings form
  const [name, setName] = useState(user?.email || '');
  const [savedMsg, setSavedMsg] = useState(false);

  // Filtered saved events (Mocked since backend doesn't support bookmarking yet)
  const savedEvents: typeof events = [];

  // RSVPs events
  const rsvpEvents = registrations.map(r => {
    const evt = events.find(e => e.id === r.eventId);
    return { rsvp: { ...r, ticketTypeName: 'General Admission' }, event: evt };
  }).filter(item => item.event !== undefined);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      // Mocked save for now
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Profile Header Card */}
      <div className="bg-paper p-6 sm:p-8 border-sharpie shadow-sharpie flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative graphic */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-neon-pink rounded-full border-sharpie opacity-20 transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-6 md:gap-8">
            <div className="w-32 h-32 flex items-center justify-center bg-neon-yellow border-sharpie shadow-sharpie text-ink font-black text-6xl uppercase">
              {user?.email[0]}
            </div>
            <div className="space-y-2">
              <span className="bg-neon-pink text-white px-2 py-1 text-xs font-black uppercase border-sharpie inline-block">ATTENDEE PASS</span>
              <h1 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase leading-none">{user?.email}</h1>
              <p className="text-sm font-black uppercase bg-white border-sharpie inline-block px-3 py-1 text-ink shadow-sharpie-sm">
                LEVEL: {user?.role.toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => setActiveTab('settings')}
            className="px-6 py-3 bg-neon-yellow hover:bg-ink hover:text-white text-ink text-xs font-black uppercase border-sharpie shadow-sharpie-sm flex items-center gap-2 hover-sharpie-lift transition-all"
          >
            <Settings className="w-4 h-4" /> EDIT PROFILE
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-4 border-b-sharpie pb-4">
        <button
          onClick={() => setActiveTab('rsvps')}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition-all border-sharpie flex items-center gap-2 ${
            activeTab === 'rsvps' ? 'bg-ink text-white shadow-sharpie-sm' : 'bg-white text-ink hover:bg-neon-yellow hover-sharpie-lift'
          }`}
        >
          <Calendar className="w-4 h-4" /> MY PASSES ({registrations.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition-all border-sharpie flex items-center gap-2 ${
            activeTab === 'saved' ? 'bg-ink text-white shadow-sharpie-sm' : 'bg-white text-ink hover:bg-neon-yellow hover-sharpie-lift'
          }`}
        >
          <Bookmark className="w-4 h-4" /> BOOKMARKED ({savedEvents.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition-all border-sharpie flex items-center gap-2 ${
            activeTab === 'settings' ? 'bg-ink text-white shadow-sharpie-sm' : 'bg-white text-ink hover:bg-neon-yellow hover-sharpie-lift'
          }`}
        >
          <Settings className="w-4 h-4" /> SETTINGS
        </button>
      </div>

      {/* Tab Content: RSVPs */}
      {activeTab === 'rsvps' && (
        <div className="space-y-6">
          {rsvpEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {rsvpEvents.map(({ rsvp, event }) => evtCard(rsvp, event!))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border-sharpie shadow-sharpie p-8 space-y-4">
              <p className="font-display text-3xl font-black text-ink uppercase">NO ACTIVE PASSES.</p>
              <p className="text-sm font-bold text-ink/70">Explore upcoming events and grab a stub.</p>
              <Link to="/explore" className="inline-block px-8 py-4 bg-neon-blue text-white text-sm font-black uppercase border-sharpie shadow-sharpie-sm hover-sharpie-lift transition-all hover:bg-ink">
                BROWSE FEED
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Saved */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          {savedEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {savedEvents.map((evt, idx) => (
                <div key={evt.id} className="pt-4">
                  <EventCard event={evt} index={idx} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border-sharpie shadow-sharpie p-8 space-y-4">
              <p className="font-display text-3xl font-black text-ink uppercase">NO BOOKMARKED EVENTS.</p>
              <p className="text-sm font-bold text-ink/70">Click the bookmark icon on any event flyer to save it.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Settings */}
      {activeTab === 'settings' && (
        <div className="bg-paper p-8 border-sharpie shadow-sharpie max-w-xl space-y-8">
          <h3 className="font-display text-3xl font-black text-ink uppercase">ACCOUNT SETTINGS</h3>

          {savedMsg && (
            <div className="p-4 bg-neon-yellow text-ink text-xs font-black uppercase border-sharpie shadow-sharpie-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-ink" /> PREFERENCES UPDATED.
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase text-ink/70 mb-2">FULL NAME</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border-sharpie px-4 py-3 font-bold text-ink focus:outline-none focus:ring-2 focus:ring-neon-blue uppercase"
                  />
                </div>

            <button
              type="submit"
              className="w-full px-6 py-4 bg-neon-pink hover:bg-ink text-white text-sm font-black uppercase border-sharpie shadow-sharpie-sm hover-sharpie-lift transition-all"
            >
              SAVE PROFILE CHANGES
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

function evtCard(rsvp: any, event: any) {
  return (
    <div key={rsvp.id} className="bg-white border-sharpie p-6 shadow-sharpie hover-sharpie-lift transition-all flex flex-col justify-between space-y-6 group cursor-pointer hover:bg-neon-yellow">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
        <div className="relative w-full sm:w-32 aspect-video sm:aspect-square shrink-0 border-sharpie overflow-hidden">
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
        </div>
        <div className="space-y-3 flex-1">
          <span className="bg-ink text-white px-2 py-1 text-[10px] font-black uppercase border-sharpie">{event.category}</span>
          <h4 className="font-display text-2xl font-black text-ink uppercase leading-tight line-clamp-2">{event.title}</h4>
          <p className="text-xs font-bold text-ink/70 uppercase">
            {event.date} • {event.startTime} <br/> {event.locationName}
          </p>
        </div>
      </div>

      <div className="pt-4 border-t-sharpie flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="text-xs font-black text-ink bg-white px-3 py-1.5 border-sharpie shadow-sharpie-sm uppercase flex-1 sm:flex-none text-center">
          PASS: {rsvp.ticketTypeName}
        </span>
        <Link
          to={`/ticket/${rsvp.id}`}
          className="px-6 py-2.5 bg-neon-blue text-white text-xs font-black uppercase border-sharpie shadow-sharpie-sm flex items-center justify-center gap-2 transition-colors hover:bg-ink flex-1 sm:flex-none"
        >
          <QrCode className="w-4 h-4" /> VIEW TICKET
        </Link>
      </div>
    </div>
  );
}
