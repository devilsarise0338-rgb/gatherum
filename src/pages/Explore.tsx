import React, { useState, useMemo } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { EventCard } from '../components/events/EventCard';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useData } from '../contexts/DataContext';

const Explore: React.FC = () => {
  const { events } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Social', 'Academic', 'Sports', 'Arts', 'Club'];

  const publishedEvents = useMemo(() => events.filter(e => !e.isUnpublished), [events]);

  const filteredEvents = useMemo(() => {
    return publishedEvents.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase()) || e.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [publishedEvents, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow pt-32 px-6 md:px-16 max-w-7xl mx-auto w-full mb-24">
        <div className="mb-12 border-b-2 border-grid-line pb-8">
          <h1 className="font-display-hero text-6xl md:text-8xl text-on-surface uppercase tracking-tighter mb-8">
            Explore
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search curated experiences..." 
                className="w-full pl-12 h-14 border-2 border-grid-line bg-surface font-body-lg uppercase tracking-wider focus-visible:outline-none focus-visible:border-primary transition-colors" 
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-4 hide-scrollbar">
          {categories.map((cat, i) => (
            <button 
              key={i} 
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-6 py-2 border-2 border-grid-line uppercase font-label-caps transition-colors ${selectedCategory === cat ? 'bg-primary text-charcoal-base border-primary' : 'bg-surface text-on-surface hover:bg-surface-bright'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id}
                id={event.id}
                title={event.title}
                category={event.category}
                date={new Date(event.startTime).toLocaleDateString()}
                location={event.location}
                imageUrl={event.posterUrl}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-4 border-grid-line bg-surface shadow-[8px_8px_0_0_#2A2A2A]">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant mb-4">search_off</span>
            <h3 className="font-subheadline-bold text-2xl uppercase mb-2">No Events Found</h3>
            <p className="font-body-md text-on-surface-variant uppercase tracking-widest text-sm">Adjust your search parameters.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Explore;
