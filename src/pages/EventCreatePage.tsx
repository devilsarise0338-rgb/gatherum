import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { EventCategory, EventColorTheme, TicketType, EventItem } from '../types';
import { CATEGORIES } from '../data/mockData';
import { EventCard } from '../components/common/EventCard';
import { Sparkles, Calendar, MapPin, Upload, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, Eye, CircleX } from 'lucide-react';

const COVER_PRESETS = [
  { url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&q=80&w=1200', theme: 'amber' as EventColorTheme, label: 'Warm Studio Lighting' },
  { url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1200', theme: 'terracotta' as EventColorTheme, label: 'Woodfired Hearth' },
  { url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200', theme: 'burgundy' as EventColorTheme, label: 'Subterranean Vault' },
  { url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200', theme: 'emerald' as EventColorTheme, label: 'Botanical Garden' },
  { url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200', theme: 'cobalt' as EventColorTheme, label: 'Modern Penthouse' },
  { url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=1200', theme: 'amber' as EventColorTheme, label: 'Gallery Canvas' },
];

export const EventCreatePage: React.FC = () => {
  const { createEvent } = useData();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);

  // Form State
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>('Design & Tech');
  const [date, setDate] = useState('2026-09-15');
  const [startTime, setStartTime] = useState('18:30');
  const [endTime, setEndTime] = useState('21:30');
  const [timezone, setTimezone] = useState('EST');
  const [locationName, setLocationName] = useState('');
  const [address, setAddress] = useState('');
  const [isVirtual, setIsVirtual] = useState(false);
  
  // Theme & Cover Image
  const [coverImage, setCoverImage] = useState(COVER_PRESETS[0].url);
  const [themeColor, setThemeColor] = useState<EventColorTheme>('amber');
  const [customCoverUrl, setCustomCoverUrl] = useState('');

  // Tickets
  const [tickets, setTickets] = useState<TicketType[]>([
    { id: 't_custom_1', name: 'General Admission', price: 35, capacity: 40, sold: 0, description: 'Includes entry & complimentary welcome drink.' }
  ]);

  // Requirements
  const [requirements, setRequirements] = useState<string[]>([
    'Bring photo ID for door verification',
    'Dress code: Smart Casual / Minimalist'
  ]);
  const [newRequirement, setNewRequirement] = useState('');

  const handleAddTicket = () => {
    const newId = `t_custom_${Date.now()}`;
    setTickets(prev => [...prev, { id: newId, name: 'VIP Pass', price: 75, capacity: 15, sold: 0, description: 'VIP seating & exclusive gift bag.' }]);
  };

  const handleRemoveTicket = (id: string) => {
    if (tickets.length > 1) {
      setTickets(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setRequirements(prev => [...prev, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const handlePublish = async () => {
    const totalCapacity = tickets.reduce((acc, t) => acc + t.capacity, 0);

    try {
      const eventId = await createEvent({
        title: title || 'Untitled Design Salon',
        description: tagline ? `${tagline}\n\n${description}` : (description || 'Join us for a curated gathering.'),
        category: category as any,
        posterUrl: customCoverUrl || coverImage,
        startTime: `${date}T${startTime}:00`,
        endTime: `${date}T${endTime}:00`,
        location: address ? `${locationName} - ${address}` : (locationName || 'Location TBD'),
        department: 'General',
        capacity: totalCapacity,
        isUnpublished: false,
      });

      navigate(`/event/${eventId}`);
    } catch (err) {
      alert("Failed to create event. Please check the console.");
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header & Multi-Step Progress Indicator */}
      <div className="space-y-4">
        <span className="bg-neon-yellow px-2 py-1 text-[11px] font-black uppercase tracking-widest text-ink border-sharpie shadow-sharpie-sm inline-block">HOST STUDIO</span>
        <h1 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase">CREATE NEW GATHERING</h1>
        
        {/* Step Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-b-sharpie pb-4">
          {[
            { num: 1, label: '1. EVENT DETAILS' },
            { num: 2, label: '2. COVER & THEME' },
            { num: 3, label: '3. TICKETS' },
            { num: 4, label: '4. PUBLISH' }
          ].map((s) => (
            <button
              key={s.num}
              onClick={() => setStep(s.num)}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider transition-all border-sharpie ${
                step === s.num
                  ? 'bg-ink text-white shadow-sharpie-sm'
                  : step > s.num
                  ? 'bg-neon-yellow text-ink hover-sharpie-lift'
                  : 'bg-white text-ink hover-sharpie-lift'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* STEP 1: Basic Event Details Form */}
      {step === 1 && (
        <div className="bg-paper p-6 sm:p-8 border-sharpie shadow-sharpie space-y-8">
          <h3 className="font-display text-3xl font-black text-ink uppercase">STEP 1: EVENT INFO</h3>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                EVENT TITLE *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aesthetic Systems: Design Leaders Salon"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                TAGLINE / SUBTITLE
              </label>
              <input
                type="text"
                placeholder="A concise, elegant one-sentence summary"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                  CATEGORY *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EventCategory)}
                  className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm appearance-none rounded-none"
                >
                  {CATEGORIES.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                  DATE *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                  START TIME
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                  END TIME
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                  TIMEZONE
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm appearance-none rounded-none"
                >
                  <option value="EST">EST (New York)</option>
                  <option value="PST">PST (San Francisco)</option>
                  <option value="CST">CST (Austin)</option>
                  <option value="CET">CET (Berlin / Paris)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                  VENUE / LOCATION NAME *
                </label>
                <input
                  type="text"
                  placeholder="e.g. KIN Studio Atrium"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                  FULL ADDRESS
                </label>
                <input
                  type="text"
                  placeholder="e.g. 452 Broome St, New York, NY"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">
                FULL EVENT DESCRIPTION
              </label>
              <textarea
                rows={5}
                placeholder="Describe the schedule, key speakers, atmosphere, and what guests should expect..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end border-t-sharpie">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-neon-pink text-white text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-colors flex items-center gap-2 hover:bg-ink hover-sharpie-lift"
            >
              CONTINUE TO COVER <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Cover Image & Auto Theme Preview */}
      {step === 2 && (
        <div className="bg-paper p-6 sm:p-8 border-sharpie shadow-sharpie space-y-8">
          <div className="space-y-2">
            <h3 className="font-display text-3xl font-black text-ink uppercase">STEP 2: IMAGERY & THEME</h3>
            <p className="text-ink text-sm font-bold">Select a curated magazine cover or paste an image URL.</p>
          </div>

          {/* Cover Presets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {COVER_PRESETS.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setCoverImage(preset.url);
                  setThemeColor(preset.theme);
                  setCustomCoverUrl('');
                }}
                className={`relative aspect-video overflow-hidden cursor-pointer border-sharpie transition-all group ${
                  coverImage === preset.url && !customCoverUrl ? 'shadow-sharpie-sm -translate-y-1' : 'opacity-80 hover:opacity-100 hover-sharpie-lift'
                }`}
              >
                <img src={preset.url} alt={preset.label} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300" />
                <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-xs bg-white text-ink px-2 py-1 font-black border-sharpie uppercase tracking-wider">{preset.label}</span>
                </div>
                {coverImage === preset.url && !customCoverUrl && (
                  <div className="absolute top-2 right-2 bg-neon-yellow text-ink p-1 border-sharpie shadow-sharpie-sm">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Custom Image URL Option */}
          <div className="space-y-2 pt-4">
            <label className="block text-xs font-black uppercase tracking-wider text-ink">
              OR CUSTOM COVER IMAGE URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={customCoverUrl}
              onChange={(e) => {
                setCustomCoverUrl(e.target.value);
                if (e.target.value) setCoverImage(e.target.value);
              }}
              className="w-full bg-white text-ink px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
            />
          </div>

          {/* Manual Theme Color Override */}
          <div className="space-y-4 pt-6 border-t-sharpie">
            <label className="block text-xs font-black uppercase tracking-wider text-ink">
              ACCENT PALETTE TINT
            </label>
            <div className="flex flex-wrap gap-4">
              {(['amber', 'emerald', 'terracotta', 'cobalt', 'burgundy'] as EventColorTheme[]).map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setThemeColor(c)}
                  className={`px-4 py-2 text-sm font-black uppercase transition-all border-sharpie ${
                    themeColor === c ? 'bg-ink text-white shadow-sharpie-sm' : 'bg-white text-ink hover-sharpie-lift hover:bg-neon-yellow'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 flex justify-between border-t-sharpie">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-white text-ink text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-colors flex items-center gap-2 hover:bg-neon-yellow hover-sharpie-lift"
            >
              <ArrowLeft className="w-5 h-5" /> BACK
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-neon-pink text-white text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-colors flex items-center gap-2 hover:bg-ink hover-sharpie-lift"
            >
              CONTINUE TO TICKETS <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Ticketing & Capacity Setup */}
      {step === 3 && (
        <div className="bg-paper p-6 sm:p-8 border-sharpie shadow-sharpie space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-3xl font-black text-ink uppercase">STEP 3: TICKETS</h3>
              <p className="text-ink text-sm font-bold">Set pass tiers, pricing, and maximum attendance limits.</p>
            </div>
            <button
              onClick={handleAddTicket}
              className="px-6 py-3 bg-neon-yellow text-ink text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie hover-sharpie-lift flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> ADD PASS TIER
            </button>
          </div>

          <div className="space-y-6">
            {tickets.map((t, index) => (
              <div key={t.id} className="p-6 bg-white border-sharpie shadow-sharpie-sm space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="bg-ink text-white px-3 py-1 text-xs font-black uppercase border-sharpie inline-block">PASS #{index + 1}</span>
                  {tickets.length > 1 && (
                    <button
                      onClick={() => handleRemoveTicket(t.id)}
                      className="text-white bg-neon-pink p-1.5 border-sharpie shadow-sharpie-sm hover-sharpie-lift"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase text-ink mb-2">NAME</label>
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTickets(prev => prev.map(item => item.id === t.id ? { ...item, name: val } : item));
                      }}
                      className="w-full bg-white px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-ink mb-2">PRICE ($USD, 0 = FREE)</label>
                    <input
                      type="number"
                      min={0}
                      value={t.price}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTickets(prev => prev.map(item => item.id === t.id ? { ...item, price: val } : item));
                      }}
                      className="w-full bg-white px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-ink mb-2">CAPACITY LIMIT</label>
                    <input
                      type="number"
                      min={1}
                      value={t.capacity}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setTickets(prev => prev.map(item => item.id === t.id ? { ...item, capacity: val } : item));
                      }}
                      className="w-full bg-white px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-ink mb-2">PERKS / DESCRIPTION</label>
                  <input
                    type="text"
                    value={t.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTickets(prev => prev.map(item => item.id === t.id ? { ...item, description: val } : item));
                    }}
                    className="w-full bg-white px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 flex justify-between border-t-sharpie">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-white text-ink text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-colors flex items-center gap-2 hover:bg-neon-yellow hover-sharpie-lift"
            >
              <ArrowLeft className="w-5 h-5" /> BACK
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 bg-neon-pink text-white text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-colors flex items-center gap-2 hover:bg-ink hover-sharpie-lift"
            >
              PREVIEW & PUBLISH <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Review & Live Card Preview */}
      {step === 4 && (
        <div className="bg-paper p-6 sm:p-8 border-sharpie shadow-sharpie space-y-10">
          <div className="space-y-2 text-center">
            <span className="bg-neon-yellow px-3 py-1 text-sm font-black uppercase border-sharpie inline-block shadow-sharpie-sm transform -rotate-2">FINAL STEP</span>
            <h3 className="font-display text-4xl font-black text-ink uppercase mt-4">REVIEW & PUBLISH</h3>
            <p className="text-ink text-sm font-bold">Verify how your event card looks.</p>
          </div>

          {/* Live Card Preview Box */}
          <div className="max-w-md mx-auto relative group">
            <EventCard 
              event={{
                id: 'preview',
                title: title || 'UNTITLED GATHERING',
                tagline: tagline || 'No tagline provided.',
                description: description || '...',
                category: category,
                coverImage: customCoverUrl || coverImage,
                themeColor: themeColor,
                date: date,
                startTime: startTime,
                endTime: endTime,
                timezone: timezone,
                locationName: locationName || 'Location TBD',
                address: address || '',
                isVirtual: isVirtual,
                host: {
                  id: 'host_you',
                  name: 'You',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                  handle: '@yourhandle',
                  bio: '',
                  verified: true,
                  totalEventsHosted: 1,
                  totalAttendees: 0
                },
                tickets: tickets,
                totalCapacity: tickets.reduce((a, b) => a + b.capacity, 0),
                tags: [],
                requirements: []
              } as EventItem}
              index={0}
            />
          </div>

          <div className="pt-8 flex justify-between border-t-sharpie">
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-white text-ink text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-colors flex items-center gap-2 hover:bg-neon-yellow hover-sharpie-lift"
            >
              <ArrowLeft className="w-5 h-5" /> BACK
            </button>

            <button
              onClick={handlePublish}
              className="px-8 py-4 bg-neon-blue text-white text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-colors flex items-center gap-2 hover:bg-ink hover-sharpie-lift"
            >
              <Sparkles className="w-5 h-5" /> PUBLISH LIVE
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
