import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { mapCampusEventToEventItem } from '../utils/mapper';
import { EventCard } from '../components/common/EventCard';
import { CATEGORIES } from '../data/mockData';
import { Sparkles, ArrowRight, Compass, Plus, CircleSlash2 } from 'lucide-react';
import { motion } from 'motion/react';

export const Homepage: React.FC = () => {
  const { events: rawEvents } = useData();
  const events = rawEvents.map(mapCampusEventToEventItem);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const featuredEvent = events.find(e => e.featured) || events[0];
  const otherEvents = events.filter(e => e.id !== featuredEvent.id);

  const filteredEvents = selectedCategory === 'All'
    ? otherEvents
    : otherEvents.filter(e => e.category === selectedCategory);

  return (
    <div className="pb-16 bg-paper">
      
      {/* Brutalist Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b-sharpie bg-neon-yellow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-ink text-neon-yellow text-xs font-black uppercase border-sharpie shadow-sharpie-sm"
            >
              <Sparkles className="w-4 h-4" />
              NO BS EVENT PLATFORM
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-6xl sm:text-8xl lg:text-9xl font-black tracking-tighter text-ink leading-[0.9] uppercase break-words"
            >
              GRAB YOUR <br className="hidden sm:block" />
              <span className="text-stroke-ink bg-clip-text">DAMN TICKET.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-ink text-lg sm:text-xl font-bold leading-relaxed max-w-2xl uppercase border-l-sharpie pl-4"
            >
              Gatherum replaces noisy event listings with raw, high-impact pages, rapid guest management, and brutal ticketing for the underground scene.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="pt-4 flex flex-wrap items-center gap-6"
            >
              <Link
                to="/explore"
                className="px-8 py-4 bg-ink text-white text-lg font-black uppercase border-sharpie shadow-sharpie hover-sharpie-lift hover:bg-neon-pink flex items-center gap-2"
              >
                TONIGHT / THIS WEEKEND <ArrowRight className="w-6 h-6" />
              </Link>
              <Link
                to="/create"
                className="px-8 py-4 bg-white text-ink text-lg font-black uppercase border-sharpie shadow-sharpie hover-sharpie-lift hover:bg-neon-blue hover:text-white flex items-center gap-2"
              >
                HOST A RAGER <Plus className="w-6 h-6" />
              </Link>
            </motion.div>
          </div>

        </div>
      </section>

      {/* Featured Headline Event Section */}
      {featuredEvent && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 space-y-6">
          <div className="flex items-center justify-between border-b-sharpie pb-4">
            <h2 className="font-display text-4xl sm:text-6xl font-black text-ink uppercase">HEADLINER</h2>
            <span className="hidden sm:inline-block px-4 py-2 bg-neon-pink text-white font-black border-sharpie">HOT</span>
          </div>

          <EventCard event={featuredEvent} variant="featured" />
        </section>
      )}

      {/* Category Pills & Event Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 space-y-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b-sharpie pb-6">
          <h2 className="font-display text-4xl sm:text-6xl font-black text-ink uppercase text-stroke-ink">
            THE FEED
          </h2>

          {/* Category Pills */}
          <div className="flex items-center gap-3 overflow-x-auto w-full md:w-auto pb-4 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 font-black uppercase border-sharpie transition-all whitespace-nowrap shadow-sharpie-sm hover-sharpie-lift ${
                  selectedCategory === cat
                    ? 'bg-ink text-neon-yellow'
                    : 'bg-white text-ink hover:bg-neon-pink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Event Cards Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filteredEvents.map((evt, idx) => (
              <div key={evt.id} className="pt-4">
                <EventCard event={evt} index={idx} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-neon-blue border-sharpie shadow-sharpie space-y-6">
            <CircleSlash2 className="w-16 h-16 mx-auto text-white" />
            <p className="font-display text-4xl font-black text-white uppercase">DEAD ZONE</p>
            <p className="text-lg font-bold text-ink bg-white inline-block px-4 py-1 border-sharpie">NO EVENTS FOUND FOR THIS CATEGORY.</p>
            <br/>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 mt-4 px-8 py-3 bg-neon-yellow text-ink text-xl font-black uppercase border-sharpie shadow-sharpie hover-sharpie-lift"
            >
              START SOMETHING
            </Link>
          </div>
        )}

        <div className="text-center pt-12">
          <Link
            to="/explore"
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-ink border-sharpie shadow-sharpie text-xl font-black uppercase transition-all hover-sharpie-lift hover:bg-neon-blue hover:text-white"
          >
            ALL EVENTS <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Host CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="relative bg-ink border-sharpie shadow-sharpie p-8 sm:p-14 overflow-hidden">
          
          <div className="relative z-10 max-w-3xl space-y-8">
            <span className="inline-flex items-center gap-2 px-4 py-1 bg-neon-yellow text-ink text-sm font-black uppercase border-sharpie">
              <Sparkles className="w-4 h-4" /> ORGANIZER TOOLS
            </span>

            <h2 className="font-display text-5xl sm:text-7xl font-black leading-[0.9] text-white uppercase">
              DROP YOUR <span className="text-neon-pink">NEXT EVENT</span> LIKE A BOMB.
            </h2>

            <p className="text-white text-lg sm:text-xl font-bold leading-relaxed uppercase border-l-sharpie pl-4">
              Custom brutalist themes, automated sync, RSVP approvals, QR door scanners, and zero fluff.
            </p>

            <div className="pt-4 flex flex-wrap gap-6">
              <Link
                to="/create"
                className="px-8 py-4 bg-neon-pink hover:bg-white text-white hover:text-ink text-lg font-black uppercase border-sharpie shadow-sharpie hover-sharpie-lift transition-colors"
              >
                CREATE EVENT
              </Link>
              <Link
                to="/dashboard"
                className="px-8 py-4 bg-transparent text-white border-sharpie text-lg font-black uppercase hover:bg-neon-blue transition-colors"
              >
                HOST DASHBOARD
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
