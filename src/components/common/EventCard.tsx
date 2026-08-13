import React from 'react';
import { Link } from 'react-router-dom';
import { EventItem } from '../../types';
import { Bookmark, MapPin, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface EventCardProps {
  event: EventItem;
  variant?: 'grid' | 'featured' | 'compact';
  index?: number;
}

export const EventCard: React.FC<EventCardProps> = ({ event, variant = 'grid', index = 0 }) => {
  const isSaved = false;
  const toggleSaveEvent = (id: string) => {};

  // Format Date
  const dateObj = new Date(event.date);
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const day = dateObj.getDate();
  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  
  // Calculate a subtle tilt based on index for the flyer effect
  const tiltDegrees = index % 2 === 0 ? 1.5 : -1.5;
  const displayImage = event.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200';

  if (variant === 'featured') {
    return (
      <Link to={`/event/${event.id}`}>
        <motion.div 
          whileHover={{ scale: 1.01, rotate: 0 }}
          initial={{ rotate: tiltDegrees }}
          className="group relative bg-white border-sharpie shadow-sharpie flex flex-col lg:flex-row h-full transition-colors hover:bg-neon-yellow"
        >
          {/* Cover Image - Brutalist Edge */}
          <div className="lg:w-2/5 relative h-72 lg:h-auto overflow-hidden border-b-sharpie lg:border-b-0 lg:border-r-sharpie">
            <img
              src={displayImage}
              alt={event.title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
            />
            
            <div className="absolute top-4 left-4 z-10 bg-neon-pink text-white px-3 py-1 text-xs font-bold uppercase border-sharpie">
              FEATURED • {event.category}
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleSaveEvent(event.id);
              }}
              className={`absolute top-4 right-4 z-10 p-2 border-sharpie shadow-sharpie-sm transition-all ${
                isSaved ? 'bg-neon-pink text-white' : 'bg-white text-ink hover:bg-neon-blue hover:text-white'
              }`}
              title={isSaved ? 'Unsave event' : 'Save event'}
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </div>

          {/* Content Details */}
          <div className="lg:w-3/5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-ink uppercase bg-neon-yellow border-sharpie px-3 py-1 self-start inline-flex">
                <Calendar className="w-4 h-4" />
                <span>{weekday}, {month} {day} • {event.startTime} {event.timezone}</span>
              </div>

              <h3 className="font-display text-4xl sm:text-5xl font-black text-ink leading-none uppercase">
                {event.title}
              </h3>

              <p className="text-ink text-sm sm:text-base font-medium line-clamp-3 leading-relaxed">
                {event.tagline}
              </p>
            </div>

            <div className="pt-4 border-t-sharpie flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={event.host.avatar}
                  alt={event.host.name}
                  className="w-10 h-10 object-cover border-sharpie bg-white"
                />
                <div>
                  <p className="text-sm font-bold text-ink uppercase">{event.host.name}</p>
                  <p className="text-xs text-ink/70 uppercase font-bold">{event.host.handle}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="px-6 py-2 bg-ink text-white text-sm font-bold uppercase border-sharpie group-hover:bg-neon-pink transition-colors">
                  GRAB STUB
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <Link to={`/event/${event.id}`} className="block h-full">
      <motion.div 
        whileHover={{ scale: 1.03, rotate: 0, zIndex: 10 }}
        initial={{ rotate: tiltDegrees }}
        className="group relative bg-white border-sharpie shadow-sharpie flex flex-col h-full hover:bg-neon-yellow transition-colors"
      >
        {/* Cover Image */}
        <div className="relative aspect-[4/3] overflow-hidden border-b-sharpie bg-ink">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
          />
          
          {/* Date Stamp Overlay */}
          <div className="absolute top-0 left-4 bg-neon-yellow border-x-sharpie border-b-sharpie px-3 py-2 text-center shadow-sharpie-sm">
            <p className="text-xs font-black uppercase text-ink">{month}</p>
            <p className="font-display text-2xl font-black text-ink leading-none">{day}</p>
          </div>

          <div className="absolute bottom-3 left-3">
            <span className="bg-ink text-white px-2 py-1 text-xs font-bold uppercase border-sharpie">
              {event.category}
            </span>
          </div>

          {/* Bookmark Action */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSaveEvent(event.id);
            }}
            className={`absolute top-3 right-3 p-2 border-sharpie shadow-sharpie-sm transition-all ${
              isSaved ? 'bg-neon-pink text-white' : 'bg-white text-ink hover:bg-neon-blue hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
          <div className="space-y-3">
            <h4 className="font-display text-2xl font-black text-ink leading-tight uppercase line-clamp-2">
              {event.title}
            </h4>
            
            <p className="text-ink text-sm font-medium line-clamp-2 leading-relaxed">
              {event.tagline}
            </p>
          </div>

          <div className="pt-4 border-t-sharpie flex items-center justify-between text-sm text-ink font-bold">
            <div className="flex items-center gap-1.5 truncate uppercase">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-[140px]">{event.locationName}</span>
            </div>

            <div className="flex items-center gap-2">
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
