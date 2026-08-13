import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { mapCampusEventToEventItem } from '../utils/mapper';
import { EventCard } from '../components/common/EventCard';
import { CATEGORIES } from '../data/mockData';
import { Search, Filter, LayoutGrid, List, X, Calendar, MapPin, DollarSign, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export const ExplorePage: React.FC = () => {
  const { events: rawEvents } = useData();
  const events = rawEvents.map(mapCampusEventToEventItem);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Available unique locations from events
  const locations = useMemo(() => {
    const set = new Set<string>();
    events.forEach(e => {
      const city = e.address.split(',').slice(-2, -1)[0]?.trim() || e.locationName;
      if (city) set.add(city);
    });
    return Array.from(set);
  }, [events]);

  // Filter logic
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      // Category check
      if (selectedCategory !== 'All' && evt.category !== selectedCategory) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchTitle = evt.title.toLowerCase().includes(query);
        const matchDesc = evt.description.toLowerCase().includes(query);
        const matchHost = evt.host.name.toLowerCase().includes(query);
        const matchLoc = evt.locationName.toLowerCase().includes(query) || evt.address.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchHost && !matchLoc) return false;
      }

      // Price check
      const minPrice = evt.tickets.length > 0 ? Math.min(...evt.tickets.map(t => t.price)) : 0;
      if (priceFilter === 'free' && minPrice > 0) return false;
      if (priceFilter === 'paid' && minPrice === 0) return false;

      // Location check
      if (locationFilter !== 'all' && !evt.address.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }

      return true;
    });
  }, [events, selectedCategory, searchTerm, priceFilter, locationFilter]);

  const hasActiveFilters = selectedCategory !== 'All' || searchTerm || priceFilter !== 'all' || locationFilter !== 'all';

  const resetFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setPriceFilter('all');
    setLocationFilter('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Page Header */}
      <div className="space-y-4 border-l-[8px] border-neon-blue pl-6 relative">
        <div className="absolute -left-[14px] top-0 w-5 h-5 bg-neon-pink border-sharpie transform rotate-45"></div>
        <span className="text-xs font-black uppercase tracking-widest text-ink bg-neon-yellow px-2 py-1 inline-block border-sharpie transform -rotate-2">THE ARCHIVE</span>
        <h1 className="font-display text-5xl sm:text-7xl font-black text-ink uppercase">FIND EVENTS</h1>
        <p className="text-ink font-bold text-lg max-w-xl bg-white border-sharpie p-3 inline-block shadow-sharpie-sm">
          UNDERGROUND SALONS. SECRET SHOWS. FOUNDER SUMMITS.
        </p>
      </div>

      {/* Control Bar: Search + Category Pills + View Toggle */}
      <div className="bg-paper p-4 sm:p-6 border-sharpie shadow-sharpie space-y-5 relative">
        
        {/* Search input & View Toggles */}
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-6 h-6 absolute left-4 top-3 text-ink font-black" />
            <input
              type="text"
              placeholder="SEARCH BY TITLE, HOST, CITY, OR TOPIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-ink pl-12 pr-4 py-3 font-black uppercase border-sharpie focus:bg-neon-yellow focus:outline-none placeholder-ink/50 transition-colors"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-3 text-ink hover:text-neon-pink transition-colors">
                <X className="w-6 h-6 font-black" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            {/* Price Filter dropdown */}
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as any)}
              className="bg-white text-ink font-black uppercase px-4 py-3 border-sharpie focus:outline-none focus:bg-neon-blue cursor-pointer"
            >
              <option value="all">ALL PRICES</option>
              <option value="free">FREE ONLY</option>
              <option value="paid">TICKETED</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border-sharpie">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-colors border-r-sharpie ${viewMode === 'grid' ? 'bg-ink text-white' : 'text-ink hover:bg-neon-yellow'}`}
                title="GRID VIEW"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-colors ${viewMode === 'list' ? 'bg-ink text-white' : 'text-ink hover:bg-neon-yellow'}`}
                title="LIST VIEW"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none pt-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 font-black uppercase tracking-wider transition-all whitespace-nowrap border-sharpie ${
                selectedCategory === cat
                  ? 'bg-ink text-neon-yellow shadow-sharpie-sm transform -translate-y-1'
                  : 'bg-white text-ink hover:bg-neon-pink hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active Filter Indicators */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-4 border-t-sharpie">
            <span className="font-bold text-ink uppercase">
              FOUND <strong className="text-neon-pink text-xl bg-ink px-2 ml-1 mr-1">{filteredEvents.length}</strong> EVENTS
            </span>
            <button
              onClick={resetFilters}
              className="bg-neon-pink text-white hover:bg-ink px-3 py-1 font-black uppercase border-sharpie flex items-center gap-1"
            >
              <X className="w-4 h-4" /> RESET
            </button>
          </div>
        )}
      </div>

      {/* Event List / Masonry Grid */}
      {filteredEvents.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((evt, index) => (
              <EventCard key={evt.id} event={evt} index={index} />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredEvents.map((evt) => (
              <div key={evt.id} className="bg-paper p-4 border-sharpie shadow-sharpie hover-sharpie-lift flex flex-col md:flex-row gap-6 items-stretch relative overflow-hidden group">
                <div className="md:w-64 border-sharpie flex-shrink-0 bg-ink">
                  <img
                    src={evt.coverImage}
                    alt={evt.title}
                    className="w-full h-48 md:h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
                
                <div className="flex-1 flex flex-col justify-between py-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-ink font-black uppercase bg-neon-yellow inline-flex px-2 py-1 border-sharpie text-xs">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {evt.startTime} {evt.timezone}</span>
                    </div>
                    
                    <Link to={`/event/${evt.id}`} className="block">
                      <h3 className="font-display text-3xl font-black text-ink uppercase hover:text-neon-blue transition-colors line-clamp-2">{evt.title}</h3>
                    </Link>
                    
                    <p className="text-ink font-bold line-clamp-2 bg-white px-2 py-1 border-sharpie inline-block mt-2">
                      {evt.tagline}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6">
                    <div className="flex items-center gap-4 text-ink font-black uppercase text-sm">
                      <span className="flex items-center gap-1 bg-white border-sharpie px-2 py-1"><MapPin className="w-4 h-4" /> {evt.locationName}</span>
                      <span className="bg-neon-pink text-white border-sharpie px-2 py-1">{evt.tickets[0]?.price ? `${evt.tickets[0].price}` : 'FREE'}</span>
                    </div>
                    
                    <Link
                      to={`/event/${evt.id}`}
                      className="px-6 py-3 bg-ink text-white font-black uppercase border-sharpie shadow-sharpie-sm hover-sharpie-lift whitespace-nowrap inline-flex items-center gap-2"
                    >
                      VIEW DETAIL <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-24 bg-paper border-sharpie shadow-sharpie space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#0A0A0A_2px,transparent_2px)] [background-size:24px_24px] opacity-10"></div>
          
          <div className="relative z-10 space-y-6 flex flex-col items-center">
            <div className="w-24 h-24 bg-ink flex items-center justify-center transform -rotate-12 border-sharpie text-neon-yellow shadow-sharpie">
              <Search className="w-12 h-12" />
            </div>
            <div>
              <p className="font-display text-5xl font-black text-ink uppercase">NOTHING FOUND.</p>
              <p className="text-ink font-bold uppercase bg-white px-4 py-2 border-sharpie inline-block mt-4 shadow-sharpie-sm">
                TRY RESETTING FILTERS OR SEARCHING SOMETHING ELSE.
              </p>
            </div>
            <button
              onClick={resetFilters}
              className="px-8 py-4 bg-neon-pink text-white font-black uppercase border-sharpie shadow-sharpie hover-sharpie-lift"
            >
              CLEAR ALL FILTERS
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
