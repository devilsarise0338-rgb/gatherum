import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MapPin, Share2, Check, ExternalLink, Scissors, User as UserIcon, LogIn, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { events, registerForEvent } = useData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const event = events.find(e => e.id === id) || events[0];
  
  // Adapt real event to mock UI expectations
  const tickets = [{ id: 'general', name: 'General Admission', description: 'Standard Entry', price: 0, sold: event?.registeredCount || 0 }];
  const totalCapacity = event?.capacity || 0;
  const coverImage = event?.posterUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200';
  const displayDate = event?.startTime || new Date().toISOString();

  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [ticketQuantity, setTicketQuantity] = useState<number>(1);
  const [guestName, setGuestName] = useState<string>(user?.email || '');
  const [guestEmail, setGuestEmail] = useState<string>(user?.email || '');
  const [rsvpSuccess, setRsvpSuccess] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0];

  // Format Date for display
  const dateObj = new Date(displayDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !event) return;
    
    // Simulate API / processing time then trigger the tear and navigate
    try {
      await registerForEvent(event.id);
      setRsvpSuccess(true);
      setTimeout(() => {
        navigate(`/my-events`);
      }, 1500);
    } catch (err) {
      alert("Failed to register. You may already be registered or the event is full.");
    }
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const totalSold = tickets.reduce((acc, t) => acc + t.sold, 0);
  const remainingSpots = Math.max(0, totalCapacity - totalSold);
  const priceLabel = selectedTicket?.price === 0 ? 'FREE' : `${(selectedTicket?.price || 0) * ticketQuantity}`;

  if (!event) return <div className="p-20 text-center font-black text-4xl uppercase">Event Not Found</div>;

  return (
    <div className="min-h-screen bg-neon-blue flex items-center justify-center p-4 sm:p-8 overflow-hidden relative">
      
      {/* Background abstract elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 text-9xl font-black text-ink transform -rotate-12">HYPE</div>
        <div className="absolute bottom-10 right-10 text-9xl font-black text-ink transform rotate-12">STUB</div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        
        {/* Navigation Bar for Ticket View */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/explore" className="px-4 py-2 bg-ink text-white font-black uppercase text-sm border-sharpie shadow-sharpie-sm hover-sharpie-lift flex items-center gap-2">
            ← BACK TO FEED
          </Link>
          <button
            onClick={copyShareLink}
            className="px-4 py-2 bg-neon-yellow text-ink font-black uppercase text-sm border-sharpie shadow-sharpie-sm hover-sharpie-lift flex items-center gap-2"
          >
            {copiedLink ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copiedLink ? 'COPIED!' : 'SHARE'}
          </button>
        </div>

        {/* MASSIVE TICKET STUB */}
        <div className="relative">
          
          <AnimatePresence>
            {/* Top Half (Event Details) */}
            <motion.div
              initial={{ y: 0 }}
              animate={rsvpSuccess ? { y: -100, rotate: -2, opacity: 0 } : { y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
              className="bg-paper border-sharpie shadow-sharpie relative z-20"
            >
              <div className="grid grid-cols-1 md:grid-cols-3">
                {/* Image Section */}
                <div className="md:col-span-1 border-b-sharpie md:border-b-0 md:border-r-sharpie bg-ink aspect-square md:aspect-auto">
                  <img src={coverImage} alt={event.title} className="w-full h-full object-cover grayscale" />
                </div>
                
                {/* Content Section */}
                <div className="md:col-span-2 p-6 sm:p-10 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <span className="bg-neon-pink text-white px-3 py-1 font-black uppercase border-sharpie inline-block">
                        {event.category}
                      </span>
                      <span className="text-xl font-black text-ink">{formattedDate}</span>
                    </div>

                    <h1 className="font-display text-5xl sm:text-7xl font-black text-ink leading-none uppercase break-words">
                      {event.title}
                    </h1>

                    <p className="text-lg font-bold text-ink border-l-sharpie pl-4">
                      {event.description}
                    </p>
                  </div>

                  <div className="mt-10 pt-6 border-t-sharpie grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-ink">
                        <MapPin className="w-5 h-5 font-bold" />
                        <span className="font-black uppercase">LOCATION</span>
                      </div>
                      <p className="font-bold text-ink/80 text-sm uppercase">{event.location}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-ink">
                        <Calendar className="w-5 h-5 font-bold" />
                        <span className="font-black uppercase">TIME</span>
                      </div>
                      <p className="font-bold text-ink/80 text-sm uppercase">{new Date(event.startTime).toLocaleTimeString()} - {new Date(event.endTime).toLocaleTimeString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Perforation Line (Middle) */}
            <motion.div 
              animate={rsvpSuccess ? { opacity: 0 } : { opacity: 1 }}
              className="h-10 bg-paper border-x-sharpie relative flex items-center justify-center overflow-hidden z-10 my-0"
            >
              <div className="w-full h-0 border-t-4 border-dashed border-ink absolute top-1/2 transform -translate-y-1/2"></div>
              <div className="absolute left-[-20px] top-1/2 transform -translate-y-1/2 w-10 h-10 bg-neon-blue rounded-full border-sharpie z-20"></div>
              <div className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 w-10 h-10 bg-neon-blue rounded-full border-sharpie z-20"></div>
              <div className="bg-paper px-4 relative z-10 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-ink" />
                <span className="text-xs font-black uppercase text-ink">TEAR HERE TO ENTER</span>
              </div>
            </motion.div>

            {/* Bottom Half (RSVP Form) */}
            <motion.div
              initial={{ y: 0 }}
              animate={rsvpSuccess ? { y: 100, rotate: 2, opacity: 0 } : { y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: "easeInOut" }}
              className="bg-paper border-sharpie shadow-sharpie p-6 sm:p-10 relative z-20"
            >
              <div className="flex flex-col md:flex-row gap-10">
                <div className="md:w-1/2 space-y-6">
                  <div>
                    <h3 className="font-display text-4xl font-black uppercase text-ink">SECURE STUB</h3>
                    <p className="font-bold text-ink/60 uppercase">{remainingSpots} SPOTS LEFT</p>
                  </div>
                  
                  <div className="space-y-4">
                    {tickets.map(ticket => (
                      <label
                        key={ticket.id}
                        className={`block p-4 border-sharpie cursor-pointer transition-colors ${
                          selectedTicketId === ticket.id ? 'bg-neon-yellow' : 'bg-white hover:bg-neon-yellow/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="ticketType"
                              value={ticket.id}
                              checked={selectedTicketId === ticket.id}
                              onChange={() => setSelectedTicketId(ticket.id)}
                              className="w-5 h-5 accent-ink"
                            />
                            <div>
                              <span className="font-black uppercase text-ink block">{ticket.name}</span>
                              <span className="font-bold text-ink/60 text-xs uppercase block">{ticket.description}</span>
                            </div>
                          </div>
                          <span className="font-black text-xl text-ink">
                            {ticket.price === 0 ? 'FREE' : `${ticket.price}`}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:w-1/2">
                  <form onSubmit={handleRSVPSubmit} className="space-y-6 flex flex-col h-full justify-between">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-black uppercase text-ink mb-2">FULL NAME</label>
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full bg-white text-ink px-4 py-3 font-bold border-sharpie focus:outline-none focus:bg-neon-pink focus:text-white"
                          placeholder="JANE DOE"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black uppercase text-ink mb-2">EMAIL ADDRESS</label>
                        <input
                          type="email"
                          required
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full bg-white text-ink px-4 py-3 font-bold border-sharpie focus:outline-none focus:bg-neon-pink focus:text-white"
                          placeholder="JANE@EXAMPLE.COM"
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t-sharpie">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-black uppercase text-ink text-xl">TOTAL DUE</span>
                        <span className="font-display font-black text-4xl text-ink">{priceLabel}</span>
                      </div>

                      <button
                        type="submit"
                        disabled={rsvpSuccess || remainingSpots === 0}
                        className="w-full py-4 bg-ink text-neon-yellow text-2xl font-black uppercase border-sharpie shadow-sharpie hover-sharpie-lift transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3"
                      >
                        {rsvpSuccess ? 'TEARING TICKET...' : remainingSpots === 0 ? 'SOLD OUT' : 'GRAB TICKET'}
                        {!rsvpSuccess && remainingSpots > 0 && <ArrowRight className="w-6 h-6" />}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Success Fallback Message (visible while tearing) */}
          {rsvpSuccess && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-0 text-white space-y-4">
              <span className="font-display text-5xl font-black uppercase text-ink bg-neon-yellow px-4 py-2 border-sharpie transform -rotate-3">
                TICKET ACQUIRED.
              </span>
              <span className="font-bold text-xl uppercase bg-ink px-4 py-2 border-sharpie text-white">
                SEE YOU IN THE PIT.
              </span>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
