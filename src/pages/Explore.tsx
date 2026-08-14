import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useData } from '../contexts/DataContext';
import { Link } from 'react-router-dom';

const Explore: React.FC = () => {
  const { events } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Social', 'Academic', 'Sports', 'Arts', 'Club'];

  const publishedEvents = useMemo(() => events.filter(e => !e.isUnpublished).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()), [events]);

  const filteredEvents = useMemo(() => {
    return publishedEvents.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [publishedEvents, searchTerm, selectedCategory]);

  return (
    <>
      <Navbar />

      <main className="flex-grow pt-[160px] pb-section-gap flex flex-col px-margin-mobile md:px-margin-desktop relative z-10">
        {/* Header & Search */}
        <div className="mb-16">
          <h1 className="font-display-xl text-[64px] md:text-[120px] tracking-tighter uppercase leading-none mb-8 text-on-surface">DISCOVER</h1>
          
          <div className="relative group max-w-2xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder="SEARCH THE ARCHIVES..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-b border-outline-variant/30 py-4 pl-12 pr-4 font-metadata text-metadata uppercase tracking-widest text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors interactive hover-target"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-4 overflow-x-auto pb-8 mb-8 hide-scrollbar">
          {categories.map((cat, i) => (
            <button 
              key={i} 
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-6 py-2 rounded-full border uppercase font-label-sm text-label-sm tracking-[0.2em] transition-all interactive hover-target ${
                selectedCategory === cat 
                  ? 'border-primary text-primary bg-primary/10' 
                  : 'border-outline-variant/30 text-on-surface-variant hover:border-on-surface hover:text-on-surface'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* List View */}
        <div className="flex flex-col border-t border-outline-variant/20">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => (
              <Link 
                key={event.id}
                to={`/events/${event.id}`}
                className="group relative py-8 border-b border-outline-variant/10 flex flex-col md:flex-row md:items-center justify-between interactive hover-target hover:bg-surface-container-low transition-colors px-4 -mx-4 md:px-8 md:-mx-8"
              >
                <div className="flex items-start gap-8 z-10 relative pointer-events-none w-full md:w-auto">
                  <span className="font-metadata text-metadata text-outline/30 mt-2">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-grow">
                    <h3 className="font-headline-lg-mobile md:font-headline-lg text-[32px] md:text-[64px] uppercase group-hover:pl-4 transition-all duration-300 leading-none">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-4 font-metadata text-metadata text-on-surface-variant uppercase">
                      <span className="px-2 py-1 border border-outline-variant/30 rounded-full">{event.category}</span>
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {event.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="font-metadata text-metadata uppercase mt-6 md:mt-0 z-10 relative md:text-right pointer-events-none flex justify-between md:block w-full md:w-auto">
                  <span>{new Date(event.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="md:block md:mt-1 text-on-surface-variant">{new Date(event.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                </div>

                <div className="absolute inset-y-0 right-1/3 w-1/4 hover-reveal-img pointer-events-none z-0 mix-blend-lighten hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <img 
                    alt={event.title}
                    className="w-full h-full object-cover rounded-xl" 
                    src={event.posterUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBnrmzkr6KRJT2iHSpngDmF5Ry1Wqlz6S6AK1OxcTFlHkI5gZfTwViAR_oYXzvw9jltE9ZOnktMV3MBVQ1BXKDaSMdcsOfBQ1UtsliJbs0-QwdtUmu3AcCdjokrhydE0DLC6AZ2JDdTjh2ABDqpbWS0XxexNnwcCTNHw8uP_AZ0xuLeMoLZ0LR4eQ7i4sQObuS2PK1iIxFgE6W69pXVPe18LEopaezd_jwHWifLfcJB809-7vbYz0C1"}
                  />
                </div>
              </Link>
            ))
          ) : (
            <div className="py-24 text-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 block">search_off</span>
              <p className="font-metadata text-metadata text-on-surface-variant uppercase tracking-widest">No matching records found in the archive.</p>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default Explore;
