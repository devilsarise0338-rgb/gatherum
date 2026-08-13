import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { mapCampusEventToEventItem } from '../utils/mapper';
import { Users, DollarSign, Eye, TrendingUp, Plus, Calendar as CalendarIcon, ChevronRight, UserCheck, Settings, MoveRight, MapPin } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const HostDashboardPage: React.FC = () => {
  const { events: rawEvents } = useData();
  const { user } = useAuth();
  const events = rawEvents.map(mapCampusEventToEventItem);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const hostedEvents = events.filter(e => e.host.id === user?.id || e.host.name === user?.email || e.featured);

  // Stats calculation
  const totalAttendees = hostedEvents.reduce((acc, evt) => acc + evt.guests.length, 0);
  const totalRevenue = hostedEvents.reduce((acc, evt) => {
    const evtRev = evt.tickets.reduce((tAcc, t) => tAcc + (t.price * t.sold), 0);
    return acc + evtRev;
  }, 0);
  const totalCapacity = hostedEvents.reduce((acc, evt) => acc + evt.totalCapacity, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalAttendees / totalCapacity) * 100) : 85;

  const upcomingEvents = hostedEvents.filter(e => new Date(e.date) >= new Date('2026-08-01'));
  const pastEvents = hostedEvents.filter(e => new Date(e.date) < new Date('2026-08-01'));

  const displayedEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-sharpie pb-6">
        <div className="space-y-4">
          <span className="text-xs font-black uppercase tracking-widest text-ink bg-neon-yellow px-2 py-1 inline-block border-sharpie transform -rotate-2">HOST COMMAND CENTER</span>
          <h1 className="font-display text-5xl sm:text-7xl font-black text-ink uppercase leading-none">DASHBOARD</h1>
        </div>

        <Link
          to="/create"
          className="inline-flex items-center gap-3 px-6 py-4 bg-neon-pink hover:bg-ink text-white font-black uppercase tracking-wider border-sharpie shadow-sharpie-sm hover-sharpie-lift transition-all self-start md:self-auto"
        >
          <Plus className="w-6 h-6" /> HOST NEW EVENT
        </Link>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        
        <div className="bg-paper p-6 border-sharpie shadow-sharpie space-y-4 relative overflow-hidden group hover:bg-neon-yellow transition-colors">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-white border-sharpie rounded-full opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="font-black uppercase tracking-wider text-ink/70 text-sm">TOTAL GUESTS</span>
            <div className="p-2 bg-ink text-white border-sharpie">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="font-display text-6xl font-black text-ink relative z-10">{totalAttendees}</p>
          <p className="font-bold text-xs uppercase bg-white border-sharpie inline-block px-2 py-1 relative z-10 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-neon-pink" /> +18% VS LAST MONTH
          </p>
        </div>

        <div className="bg-paper p-6 border-sharpie shadow-sharpie space-y-4 relative overflow-hidden group hover:bg-neon-blue transition-colors">
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white border-sharpie opacity-50 group-hover:opacity-100 transition-opacity transform rotate-12"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="font-black uppercase tracking-wider text-ink/70 text-sm">TICKET REVENUE</span>
            <div className="p-2 bg-ink text-neon-yellow border-sharpie">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <p className="font-display text-5xl font-black text-ink relative z-10">${totalRevenue.toLocaleString()}</p>
          <p className="font-bold text-xs uppercase text-ink/80 relative z-10">GROSS SALES ACROSS PASSES</p>
        </div>

        <div className="bg-paper p-6 border-sharpie shadow-sharpie space-y-4 relative overflow-hidden group hover:bg-neon-pink transition-colors">
          <div className="absolute -left-4 -top-4 w-16 h-16 bg-white border-sharpie transform rotate-45 opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="font-black uppercase tracking-wider text-ink/70 text-sm">OCCUPANCY RATE</span>
            <div className="p-2 bg-white text-ink border-sharpie">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="font-display text-6xl font-black text-ink relative z-10">{occupancyRate}%</p>
          <p className="font-bold text-xs uppercase text-ink/80 relative z-10">CAPACITY FILLED ACROSS EVENTS</p>
        </div>

        <div className="bg-ink text-white p-6 border-sharpie shadow-sharpie space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-black uppercase tracking-wider text-white/70 text-sm">PAGE VIEWS</span>
            <div className="p-2 bg-neon-yellow text-ink border-sharpie">
              <Eye className="w-6 h-6" />
            </div>
          </div>
          <p className="font-display text-6xl font-black text-white">4.2K</p>
          <p className="font-bold text-xs uppercase text-white/80">UNIQUE VISITOR IMPRESSIONS</p>
        </div>

      </div>

      {/* Main Content Area: Events List & Guest Actions */}
      <div className="bg-paper border-sharpie shadow-sharpie p-6 sm:p-10 space-y-8">
        
        {/* Tab switcher */}
        <div className="flex items-center border-b-sharpie">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`py-4 px-6 text-sm font-black uppercase tracking-wider border-sharpie border-b-0 transition-colors ${
              activeTab === 'upcoming' ? 'bg-neon-yellow text-ink' : 'bg-white text-ink hover:bg-neon-yellow/50'
            }`}
          >
            UPCOMING ({upcomingEvents.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`py-4 px-6 text-sm font-black uppercase tracking-wider border-sharpie border-l-0 border-b-0 transition-colors ${
              activeTab === 'past' ? 'bg-neon-yellow text-ink' : 'bg-white text-ink hover:bg-neon-yellow/50'
            }`}
          >
            PAST ({pastEvents.length})
          </button>
        </div>

        {/* Hosted Events Table */}
        <div className="space-y-6">
          {displayedEvents.length > 0 ? (
            displayedEvents.map(evt => (
              <div key={evt.id} className="p-4 bg-white border-sharpie shadow-sharpie-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover-sharpie-lift">
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full md:w-auto">
                  <div className="w-full sm:w-24 h-32 sm:h-24 bg-ink border-sharpie shrink-0">
                    <img src={evt.coverImage} alt={evt.title} className="w-full h-full object-cover grayscale opacity-90" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-black uppercase text-xs bg-neon-pink text-white px-2 py-1 border-sharpie">{evt.category}</span>
                      <span className="text-xs text-ink font-bold uppercase">{evt.date} • {evt.startTime}</span>
                    </div>
                    <Link to={`/event/${evt.id}`} className="font-display text-2xl font-black text-ink hover:text-neon-blue uppercase transition-colors line-clamp-1 block">
                      {evt.title}
                    </Link>
                    <p className="text-sm font-bold text-ink/70 uppercase"><MapPin className="w-4 h-4 inline mr-1" />{evt.locationName}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full md:w-auto md:shrink-0 pt-4 md:pt-0 border-t-sharpie md:border-t-0">
                  <div className="bg-paper border-sharpie px-4 py-2 text-center w-full sm:w-auto">
                    <p className="text-lg font-black text-ink">{evt.guests.length} / {evt.totalCapacity}</p>
                    <p className="text-[10px] text-ink font-bold uppercase">RSVPS</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full sm:w-auto">
                    <Link
                      to={`/guest-management/${evt.id}`}
                      className="px-6 py-3 bg-ink hover:bg-neon-blue text-white text-sm font-black uppercase tracking-wider border-sharpie transition-colors flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" /> GUESTS
                    </Link>
                    <Link
                      to={`/event/${evt.id}`}
                      className="px-4 py-3 bg-neon-yellow hover:bg-white text-ink text-sm font-black uppercase border-sharpie transition-colors flex items-center justify-center"
                      title="View Event Page"
                    >
                      <MoveRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>

              </div>
            ))
          ) : (
            <div className="py-20 text-center bg-white border-sharpie space-y-6">
              <p className="font-display text-4xl font-black uppercase text-ink">NO {activeTab} EVENTS.</p>
              <Link to="/create" className="inline-block px-8 py-4 bg-neon-pink text-white font-black uppercase border-sharpie shadow-sharpie hover-sharpie-lift">
                HOST A NEW EVENT
              </Link>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
