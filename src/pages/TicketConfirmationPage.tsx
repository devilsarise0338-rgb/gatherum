import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { mapCampusEventToEventItem } from '../utils/mapper';
import confetti from 'canvas-confetti';
import { Calendar, MapPin, Share2, Download, Check, Sparkles, ExternalLink, QrCode, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const TicketConfirmationPage: React.FC = () => {
  const { rsvpId } = useParams<{ rsvpId: string }>();
  const { registrations, events: rawEvents } = useData();
  const { user } = useAuth();
  const events = rawEvents.map(mapCampusEventToEventItem);

  const rsvp = registrations.find(r => r.id === rsvpId) || registrations[0];
  const event = events.find(e => e.id === rsvp?.eventId) || events[0];

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Launch celebratory confetti with brutalist colors
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#0A0A0A', '#E5FF00', '#0055FF', '#FF0055'],
        shapes: ['square']
      });
    } catch (e) {
      /* fallback */
    }
  }, []);

  const copyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Google Calendar Link
  const gcalUrl = (() => {
    const startTimeClean = event.startTime.replace(':', '') + '00';
    const endTimeClean = event.endTime.replace(':', '') + '00';
    const dateClean = event.date.replace(/-/g, '');
    const startIso = `${dateClean}T${startTimeClean}`;
    const endIso = `${dateClean}T${endTimeClean}`;
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startIso}/${endIso}&location=${encodeURIComponent(event.address)}`;
  })();

  const ticketId = rsvp?.id || `RSVP-${Math.floor(Math.random() * 9000) + 1000}`;

  return (
    <div className="min-h-screen bg-neon-blue flex items-center justify-center p-4 sm:p-8 overflow-hidden relative">
      
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 text-9xl font-black text-ink transform -rotate-12">PASS</div>
        <div className="absolute bottom-10 right-10 text-9xl font-black text-ink transform rotate-12">SECURED</div>
      </div>

      <div className="max-w-xl w-full mx-auto relative z-10 space-y-8">
        
        {/* Header Banner */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-neon-yellow border-sharpie shadow-sharpie-sm transform -rotate-2 text-ink">
            <Sparkles className="w-5 h-5" /> 
            <span className="font-black uppercase tracking-widest text-sm">TICKET READY.</span>
          </div>
          <h1 className="font-display text-5xl font-black text-ink uppercase bg-white border-sharpie inline-block px-6 py-2 shadow-sharpie">
            YOU'RE GOING!
          </h1>
        </div>

        {/* Digital Ticket Stub */}
        <motion.div 
          initial={{ y: 50, opacity: 0, rotate: 5 }}
          animate={{ y: 0, opacity: 1, rotate: -2 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
          className="bg-paper border-sharpie shadow-sharpie flex flex-col relative"
        >
          
          {/* Top Hole Punch Detail */}
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-neon-blue rounded-full border-sharpie border-b-0 z-20"></div>

          {/* Cover Header */}
          <div className="h-40 border-b-sharpie bg-ink relative overflow-hidden">
            <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover grayscale mix-blend-screen opacity-80" />
            <div className="absolute inset-0 bg-ink/20 mix-blend-overlay"></div>
            
            <div className="absolute top-4 left-4">
              <span className="bg-neon-pink text-white px-3 py-1 font-black uppercase border-sharpie shadow-sharpie-sm text-xs">
                {event.category}
              </span>
            </div>
            
            <div className="absolute bottom-4 right-4 text-right">
               <span className="font-mono text-neon-yellow font-black text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                  {ticketId.substring(0,8)}
               </span>
            </div>
          </div>

          {/* Ticket Body Details */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="space-y-4">
              <div className="inline-block bg-neon-yellow px-2 py-1 border-sharpie text-ink font-black uppercase text-xs">
                {event.date} • {event.startTime} {event.timezone}
              </div>
              
              <p className="font-display text-3xl font-black text-ink uppercase mt-1">{user?.email}</p>
              <h2 className="font-display text-4xl font-black text-ink uppercase leading-none">{event.title}</h2>
              
              <div className="border-l-sharpie pl-4 text-ink space-y-1">
                <p className="font-black uppercase text-sm">{event.locationName}</p>
                <p className="font-bold text-xs uppercase opacity-80">{event.address}</p>
              </div>
            </div>

            <div className="pt-6 border-t-[4px] border-dashed border-ink/30 grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <p className="font-black uppercase text-ink text-lg">{user?.email || 'GUEST EMAIL'}</p>
              </div>
              <div className="space-y-1">
                <p className="font-bold uppercase text-ink/50 text-xs">PASS TYPE</p>
                <p className="font-black uppercase text-ink text-lg">GENERAL ADMISSION</p>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="pt-6 mt-2 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="bg-white p-4 border-sharpie shadow-sharpie-sm inline-block">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GATHERUM-TICKET-${event.id}`}
                  alt="Ticket QR Code"
                  className="w-32 h-32"
                />
              </div>
              <div className="flex-1 text-center sm:text-right space-y-2">
                 <p className="font-black text-ink uppercase text-xl">SCAN AT DOOR</p>
                 <p className="font-bold text-ink/70 uppercase text-xs">DO NOT REPLICATE.</p>
                 <p className="font-mono font-black bg-ink text-white px-2 py-1 text-xs inline-block mt-2">
                   ID: {ticketId}
                 </p>
              </div>
            </div>
          </div>

        </motion.div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={gcalUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-4 bg-ink text-neon-yellow font-black uppercase text-sm border-sharpie shadow-sharpie hover-sharpie-lift transition-all flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-5 h-5" /> ADD TO CALENDAR
          </a>

          <button
            onClick={copyShare}
            className="flex-1 py-4 bg-white text-ink font-black uppercase text-sm border-sharpie shadow-sharpie hover-sharpie-lift transition-all flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-5 h-5 text-neon-pink" /> : <Share2 className="w-5 h-5" />}
            {copied ? 'LINK COPIED!' : 'SHARE PASS'}
          </button>
        </div>

        <div className="text-center pt-4">
          <Link to="/my-events" className="inline-flex items-center gap-2 text-ink font-black uppercase bg-neon-yellow px-4 py-2 border-sharpie hover-sharpie-lift transition-all">
            VIEW ALL MY TICKETS <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};
