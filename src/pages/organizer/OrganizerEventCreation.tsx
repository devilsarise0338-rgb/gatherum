import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useData, EventCategory } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

const OrganizerEventCreation: React.FC = () => {
  const { createEvent } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('50');
  const [category, setCategory] = useState<EventCategory>('Social');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean) => {
    e.preventDefault();
    if (!title || !date || !location) {
      alert('Title, date, and location are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simplistic splitting of date input (datetime-local) to start and end
      const d = new Date(date);
      const startIso = d.toISOString();
      d.setHours(d.getHours() + 2); // default 2 hours long
      const endIso = d.toISOString();

      await createEvent({
        title,
        description,
        startTime: startIso,
        endTime: endIso,
        location,
        department: 'General',
        category,
        capacity: parseInt(capacity) || 50,
        posterUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS0nMlMQ1AVlAkUD9P7_Z1TWLK5cK0lSGkHk21ukUWOkc01AYJcCT5PhfWMHKAcj5dcgjeRPlvW8K3K5CBcyFnNhNDE_vTHEeK-Ld4Fsmuh8bPd_tN_cUt1rInjl179JsA3KSGXhob9zAxTgeTZU4D8EbF6T1vrJp72oYqyH0ep4_R8rukEiKsIAvN4pVBffvNz7cMcir38lcWrXlU49tVaeKItBYXQShC3zOZFZaDfBREtAtsBwxU',
        isUnpublished: isDraft
      });
      navigate('/organizer');
    } catch (err) {
      console.error(err);
      alert('Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-on-primary">
      <Navbar />

      <main className="flex-grow pt-32 pb-32 px-6 md:px-16 relative">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#2A2A2A_1px,transparent_1px),linear-gradient(to_bottom,#2A2A2A_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="max-w-3xl mx-auto w-full relative z-10">
          <header className="mb-12 border-b-4 border-grid-line pb-8">
            <h1 className="font-display-hero text-5xl md:text-7xl text-on-surface uppercase tracking-tight">
              Create Event
            </h1>
          </header>

          <form className="space-y-8 bg-surface border-4 border-grid-line p-8 shadow-[8px_8px_0_0_#2A2A2A]">
            <div className="space-y-4">
              <h2 className="font-subheadline-bold text-2xl uppercase border-l-4 border-primary pl-4">Basic Details</h2>
              <Input 
                label="Event Name" 
                placeholder="e.g. Aura: Immersive Soundscapes" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <div className="flex flex-col gap-1">
                <label className="font-label-caps uppercase text-on-surface-variant tracking-widest text-sm">Description</label>
                <textarea 
                  className="bg-surface border-2 border-grid-line p-3 text-on-surface font-body-md focus-visible:outline-none focus-visible:border-primary transition-colors min-h-[100px]"
                  placeholder="Tell us about your event..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Input 
                label="Date & Time" 
                type="datetime-local" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
              <Input 
                label="Location" 
                placeholder="Venue name or address" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <div className="flex flex-col gap-1">
                <label className="font-label-caps uppercase text-on-surface-variant tracking-widest text-sm">Category</label>
                <select 
                  className="h-12 bg-surface border-2 border-grid-line px-3 text-on-surface uppercase font-label-caps focus-visible:outline-none focus-visible:border-primary transition-colors"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                >
                  <option value="Social">Social</option>
                  <option value="Academic">Academic</option>
                  <option value="Sports">Sports</option>
                  <option value="Arts">Arts</option>
                  <option value="Club">Club</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t-2 border-grid-line">
              <h2 className="font-subheadline-bold text-2xl uppercase border-l-4 border-primary pl-4">Ticketing</h2>
              <Input 
                label="Total Capacity" 
                type="number" 
                placeholder="50" 
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                min="1"
              />
            </div>

            <div className="pt-6 border-t-2 border-grid-line flex justify-end gap-4">
              <Button 
                variant="outline" 
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting}
              >
                Save Draft
              </Button>
              <Button 
                onClick={(e) => handleSubmit(e, false)}
                disabled={isSubmitting}
              >
                Publish Event
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default OrganizerEventCreation;
