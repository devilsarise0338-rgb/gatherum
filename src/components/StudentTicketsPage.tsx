import { Link } from "react-router-dom";
import { motion } from "motion/react";
import DashboardLayout from "./DashboardLayout";
import { useData } from "../contexts/DataContext";
import { useAuth } from "../contexts/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { Calendar, MapPin, Clock, Download, Ticket } from "lucide-react";
import { pageTransition, cardHover } from "../utils/motion";
import SkeletonLoader from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import toast from "react-hot-toast";

export default function StudentTicketsPage() {
  const { events, registrations, isLoading, error } = useData();
  const { user } = useAuth();

  if (!user) return null;

  const userTickets = registrations
    .filter(r => r.studentId === user?.id && r.status === "registered")
    .map(r => ({ reg: r, event: events.find(e => e.id === r.eventId) }))
    .filter(item => item.event)
    .sort((a, b) => new Date(b.event!.startTime).getTime() - new Date(a.event!.startTime).getTime());

  const generateICS = (event: any) => {
    const dStart = new Date(event.startTime);
    const dEnd = new Date(event.endTime);
    if (isNaN(dStart.getTime()) || isNaN(dEnd.getTime())) {
      toast.error("Event dates are invalid for calendar export.");
      return;
    }

    const formatDate = (d: Date) => {
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const escapeICS = (s: string) =>
      s.replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(dStart)}`,
      `DTEND:${formatDate(dEnd)}`,
      `SUMMARY:${escapeICS(event.title)}`,
      `DESCRIPTION:${escapeICS(event.description)}`,
      `LOCATION:${escapeICS(event.location)}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <motion.div 
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        className="max-w-5xl mx-auto space-y-8"
      >
        <header>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Tickets</h1>
          <p className="text-gray-500 dark:text-gray-400">Access your QR codes and event details.</p>
        </header>

        {error ? (
          <ErrorState 
            title="Failed to load tickets" 
            message="There was a problem connecting to the server. Please try refreshing."
            onRetry={() => window.location.reload()}
          />
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SkeletonLoader type="card" className="h-[400px]" count={2} />
          </div>
        ) : userTickets.length === 0 ? (
          <EmptyState 
            icon={<Ticket className="w-8 h-8" />}
            title="You have no tickets yet."
            description="Register for an event to see your ticket here."
            actionText="Browse Events"
            actionHref="/events"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" role="list">
            {userTickets.map(({ reg, event }, i) => (
              <motion.div 
                key={reg.id} 
                initial={{ opacity: 0, rotateX: -90, y: 50, perspective: 1000 }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20, 
                  delay: i * 0.15 
                }}
                whileHover={cardHover}
                className="bg-white dark:bg-surface-dark rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col relative"
                role="listitem"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="h-24 bg-primary/10 flex items-center justify-center relative overflow-hidden" aria-hidden="true">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${event!.posterUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                  <h3 className="relative z-10 text-xl font-bold text-gray-900 dark:text-white text-center px-4">{event!.title}</h3>
                </div>
                
                <div className="p-6 flex flex-col items-center flex-grow">
                  <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 inline-block" aria-label="Ticket QR Code">
                    {reg.ticketId ? (
                      <QRCodeSVG value={reg.ticketId} size={150} level="H" aria-hidden="true" />
                    ) : (
                      <div className="w-[150px] h-[150px] bg-gray-100 flex items-center justify-center text-gray-400 text-sm">No QR Code</div>
                    )}
                  </div>
                  
                  <div className="w-full space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4 text-primary" aria-hidden="true" />
                      <span>{new Date(event!.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <Clock className="w-4 h-4 text-accent" aria-hidden="true" />
                      <span>{new Date(event!.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 text-gray-400" aria-hidden="true" />
                      <span className="truncate">{event!.location}</span>
                    </div>
                  </div>

                  <div className="mt-auto w-full flex flex-col gap-2">
                    {reg.ticketId && (
                      <div className="text-center mb-2">
                        <span className="text-xs text-gray-400 font-mono" aria-label={`Ticket ID: ${reg.ticketId}`}>ID: {reg.ticketId}</span>
                      </div>
                    )}
                    <button 
                      onClick={() => generateICS(event)}
                      className="w-full py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label={`Download calendar invite for ${event!.title}`}
                    >
                      <Download className="w-4 h-4" aria-hidden="true" /> Add to Calendar
                    </button>
                    <Link 
                      to={`/events/${event!.id}`}
                      className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-center font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                      aria-label={`View details for ${event!.title}`}
                    >
                      View Event Details
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
