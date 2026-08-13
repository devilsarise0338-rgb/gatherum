import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { mapCampusEventToEventItem } from '../utils/mapper';
import { EventCard } from '../components/common/EventCard';
import { ShieldCheck, MapPin, Globe, UserPlus, Check, Link as LinkIcon } from 'lucide-react';

export const HostPublicProfilePage: React.FC = () => {
  const { hostId } = useParams<{ hostId: string }>();
  const { events: rawEvents } = useData();
  const events = rawEvents.map(mapCampusEventToEventItem);

  const host = {
    id: hostId || 'host1',
    name: 'Event Organizer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    handle: '@organizer',
    bio: 'Gatherum Organizer',
    verified: true,
    location: 'Campus',
    totalEventsHosted: events.length,
    totalAttendees: 0
  };

  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(384);

  const hostedEvents = events.filter(e => e.host.id === host.id || e.host.name === host.name);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
    setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Host Profile Hero Header */}
      <div className="bg-paper border-sharpie shadow-sharpie p-6 sm:p-12 space-y-8 relative overflow-hidden">
        {/* Background Graphic */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue rounded-full border-sharpie opacity-20 transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 md:gap-8">
            <div className="relative">
              <img
                src={host.avatar}
                alt={host.name}
                className="w-32 h-32 object-cover border-sharpie shadow-sharpie-sm bg-white"
              />
              {host.verified && (
                <div className="absolute -bottom-3 -right-3 bg-neon-pink text-white p-1 border-sharpie shadow-sharpie-sm" title="Verified Host">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="bg-neon-yellow text-ink px-2 py-1 text-xs font-black uppercase border-sharpie inline-block">HOST PROFILE</span>
                <h1 className="font-display text-5xl sm:text-6xl font-black text-ink uppercase leading-none">{host.name}</h1>
              </div>

              <p className="text-sm font-black uppercase bg-white border-sharpie inline-block px-3 py-1 text-ink shadow-sharpie-sm">
                {host.handle} • {host.location}
              </p>
              
              <p className="text-ink text-base font-bold max-w-xl border-l-sharpie pl-4">
                {host.bio}
              </p>

              {/* Socials */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {/* Removed missing twitter/website fields */}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-stretch md:items-end w-full md:w-auto gap-4 pt-6 md:pt-0 border-t-sharpie md:border-t-0">
            <button
              onClick={toggleFollow}
              className={`px-8 py-4 text-sm font-black uppercase tracking-wider transition-all flex justify-center items-center gap-3 border-sharpie shadow-sharpie hover-sharpie-lift ${
                isFollowing
                  ? 'bg-ink text-white'
                  : 'bg-neon-pink text-white hover:bg-ink'
              }`}
            >
              {isFollowing ? <Check className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {isFollowing ? 'FOLLOWING' : 'FOLLOW HOST'}
            </button>

            <div className="bg-white border-sharpie px-4 py-2 text-center shadow-sharpie-sm w-full">
               <p className="font-display text-3xl font-black text-ink">{followerCount}</p>
               <p className="text-xs text-ink font-bold uppercase tracking-wider">FOLLOWERS</p>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="pt-8 border-t-sharpie grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10">
          <div className="bg-white border-sharpie p-4 hover:bg-neon-yellow transition-colors">
            <p className="font-display text-4xl font-black text-ink">{host.totalEventsHosted}</p>
            <p className="text-xs font-bold uppercase text-ink/70">EVENTS</p>
          </div>
          <div className="bg-white border-sharpie p-4 hover:bg-neon-blue hover:text-white transition-colors">
            <p className="font-display text-4xl font-black text-ink current-color">{host.totalAttendees}</p>
            <p className="text-xs font-bold uppercase text-ink/70 current-color">GUESTS</p>
          </div>
          <div className="bg-white border-sharpie p-4 hover:bg-neon-pink hover:text-white transition-colors">
            <p className="font-display text-4xl font-black text-ink current-color">4.9 ★</p>
            <p className="text-xs font-bold uppercase text-ink/70 current-color">RATING</p>
          </div>
          <div className="bg-ink text-white border-sharpie p-4 hover:bg-neon-yellow hover:text-ink transition-colors">
            <p className="font-display text-4xl font-black current-color">100%</p>
            <p className="text-xs font-bold uppercase current-color/70">RESPONSE</p>
          </div>
        </div>

      </div>

      {/* Host Events List */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 border-b-sharpie pb-4">
          <h2 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase">HOSTED EVENTS</h2>
          <span className="bg-neon-yellow px-3 py-1 font-black text-ink border-sharpie transform rotate-2">{hostedEvents.length}</span>
        </div>

        {hostedEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {hostedEvents.map((evt, idx) => (
              <div key={evt.id} className="pt-4">
                <EventCard event={evt} index={idx} />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center bg-white border-sharpie shadow-sharpie">
            <p className="font-display text-4xl font-black text-ink uppercase">NO PUBLIC EVENTS YET.</p>
          </div>
        )}
      </div>

    </div>
  );
};

