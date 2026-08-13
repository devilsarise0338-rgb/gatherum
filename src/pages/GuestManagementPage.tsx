import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { mapCampusEventToEventItem } from '../utils/mapper';
import { Search, Download, Mail, CheckCircle, XCircle, ArrowLeft, UserPlus, Check, X, Shield } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const GuestManagementPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { events: rawEvents } = useData();
  const events = rawEvents.map(mapCampusEventToEventItem);
  const updateGuestStatus = (eventId: string, guestId: string, status: string, checkedIn: boolean) => {
    // Mocked for UI purposes since backend only supports ticket check-in via QR code.
    console.log("updateGuestStatus called", { eventId, guestId, status, checkedIn });
  };

  const event = events.find(e => e.id === eventId) || events[0];

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'checkedIn' | 'pending'>('all');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);

  const filteredGuests = event.guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase());
    if (filterStatus === 'checkedIn' && !g.checkedIn) return false;
    if (filterStatus === 'pending' && g.checkedIn) return false;
    return matchSearch;
  });

  const checkedInCount = event.guests.filter(g => g.checkedIn).length;

  const exportCSV = () => {
    const headers = ['Guest ID', 'Name', 'Email', 'Ticket Type', 'Check-In Status', 'Check-In Time'];
    const rows = event.guests.map(g => [
      g.id,
      g.name,
      g.email,
      g.ticketType,
      g.checkedIn ? 'Checked In' : 'Pending',
      g.checkInTime || 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `guestlist-${event.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    setAnnouncementSent(true);
    setTimeout(() => {
      setAnnouncementSent(false);
      setAnnouncementModalOpen(false);
      setAnnouncementText('');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Bar */}
      <div className="space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-black uppercase text-ink hover:text-neon-blue transition-colors">
          <ArrowLeft className="w-4 h-4" /> BACK TO DASHBOARD
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b-sharpie pb-6">
          <div className="space-y-2">
            <span className="bg-neon-yellow px-2 py-1 text-xs font-black uppercase tracking-widest text-ink border-sharpie inline-block">GUEST ROSTER</span>
            <h1 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase leading-none">{event.title}</h1>
            <p className="text-sm text-ink font-bold uppercase tracking-wider">{event.date} • {event.locationName}</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setAnnouncementModalOpen(true)}
              className="px-6 py-3 bg-white hover:bg-neon-yellow text-ink text-sm font-black uppercase border-sharpie shadow-sharpie-sm flex items-center gap-2 hover-sharpie-lift transition-all"
            >
              <Mail className="w-4 h-4" /> EMAIL GUESTS
            </button>

            <button
              onClick={exportCSV}
              className="px-6 py-3 bg-neon-pink hover:bg-ink text-white text-sm font-black uppercase border-sharpie shadow-sharpie-sm flex items-center gap-2 hover-sharpie-lift transition-all"
            >
              <Download className="w-4 h-4" /> EXPORT CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Header Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 border-sharpie shadow-sharpie-sm hover:bg-neon-yellow transition-colors">
          <span className="text-xs font-black uppercase tracking-wider text-ink/70">TOTAL RSVPS</span>
          <p className="font-display text-5xl font-black text-ink">{event.guests.length}</p>
        </div>

        <div className="bg-white p-6 border-sharpie shadow-sharpie-sm hover:bg-neon-blue hover:text-white transition-colors group">
          <span className="text-xs font-black uppercase tracking-wider text-ink/70 group-hover:text-white">DOOR CHECKED IN</span>
          <p className="font-display text-5xl font-black text-ink group-hover:text-white">{checkedInCount}</p>
        </div>

        <div className="bg-white p-6 border-sharpie shadow-sharpie-sm hover:bg-neon-pink hover:text-white transition-colors group">
          <span className="text-xs font-black uppercase tracking-wider text-ink/70 group-hover:text-white">ATTENDANCE RATE</span>
          <p className="font-display text-5xl font-black text-ink group-hover:text-white">
            {event.guests.length > 0 ? Math.round((checkedInCount / event.guests.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Guest Table Container */}
      <div className="bg-paper border-sharpie shadow-sharpie p-6 sm:p-8 space-y-8">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="w-5 h-5 absolute left-4 top-3.5 text-ink" />
            <input
              type="text"
              placeholder="Search guests by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white pl-12 pr-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 text-xs font-black uppercase border-sharpie transition-all ${filterStatus === 'all' ? 'bg-ink text-white shadow-sharpie-sm' : 'bg-white text-ink hover:bg-neon-yellow hover-sharpie-lift'}`}
            >
              ALL ({event.guests.length})
            </button>
            <button
              onClick={() => setFilterStatus('checkedIn')}
              className={`px-4 py-2 text-xs font-black uppercase border-sharpie transition-all ${filterStatus === 'checkedIn' ? 'bg-neon-blue text-white shadow-sharpie-sm' : 'bg-white text-ink hover:bg-neon-yellow hover-sharpie-lift'}`}
            >
              CHECKED IN ({checkedInCount})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 text-xs font-black uppercase border-sharpie transition-all ${filterStatus === 'pending' ? 'bg-neon-pink text-white shadow-sharpie-sm' : 'bg-white text-ink hover:bg-neon-yellow hover-sharpie-lift'}`}
            >
              PENDING ({event.guests.length - checkedInCount})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border-sharpie bg-white shadow-sharpie-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b-sharpie bg-ink text-white font-black uppercase tracking-wider text-xs">
                <th className="p-4">GUEST</th>
                <th className="p-4">PASS TIER</th>
                <th className="p-4">RSVP DATE</th>
                <th className="p-4">DOOR STATUS</th>
                <th className="p-4 text-right">QUICK ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y-sharpie">
              {filteredGuests.map(g => (
                <tr key={g.id} className="hover:bg-neon-yellow transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <img src={g.avatar} alt={g.name} className="w-10 h-10 object-cover border-sharpie bg-white" />
                      <div>
                        <p className="font-black text-ink uppercase">{g.name}</p>
                        <p className="text-xs font-bold text-ink/70 uppercase">{g.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="bg-white text-ink border-sharpie font-black px-3 py-1 text-xs uppercase shadow-sharpie-sm">
                      {g.ticketType}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-ink uppercase">{g.rsvpDate}</td>
                  <td className="p-4">
                    {g.checkedIn ? (
                      <span className="inline-flex items-center gap-1.5 text-white bg-ink border-sharpie px-3 py-1 font-black text-xs uppercase shadow-sharpie-sm">
                        <CheckCircle className="w-4 h-4 text-neon-yellow" /> CHECKED IN ({g.checkInTime || '18:45'})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-ink bg-white border-sharpie px-3 py-1 font-black text-xs uppercase shadow-sharpie-sm">
                        PENDING DOOR
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => updateGuestStatus(event.id, g.id, 'confirmed', !g.checkedIn)}
                      className={`px-4 py-2 text-xs font-black uppercase border-sharpie transition-all hover-sharpie-lift ${
                        g.checkedIn
                          ? 'bg-white text-ink hover:bg-neon-pink hover:text-white'
                          : 'bg-neon-blue text-white hover:bg-ink'
                      }`}
                    >
                      {g.checkedIn ? 'UNDO' : 'CHECK IN'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Announcement Modal */}
      {announcementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/80 backdrop-blur-sm">
          <div className="bg-paper border-sharpie shadow-sharpie max-w-lg w-full p-8 space-y-6 relative">
            <div className="flex items-center justify-between border-b-sharpie pb-4">
              <h3 className="font-display text-3xl font-black text-ink uppercase">EMAIL GUESTS</h3>
              <button onClick={() => setAnnouncementModalOpen(false)} className="text-ink hover:text-neon-pink transition-colors">
                <X className="w-8 h-8" />
              </button>
            </div>

            {announcementSent ? (
              <div className="p-6 bg-neon-yellow border-sharpie shadow-sharpie-sm text-ink text-lg font-black uppercase text-center flex flex-col items-center gap-4">
                <CheckCircle className="w-12 h-12" />
                DISPATCHED TO {event.guests.length} GUESTS!
              </div>
            ) : (
              <form onSubmit={handleSendAnnouncement} className="space-y-6">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">MESSAGE SUBJECT</label>
                  <input
                    type="text"
                    required
                    defaultValue={`Important Update: ${event.title}`}
                    className="w-full bg-white px-4 py-3 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-ink mb-2">MESSAGE BODY</label>
                  <textarea
                    rows={5}
                    required
                    placeholder="e.g. Doors open at 6:30 PM sharp. Please enter through Broome Street entrance..."
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    className="w-full bg-white p-4 text-sm font-bold border-sharpie focus:outline-none focus:ring-2 focus:ring-neon-blue shadow-sharpie-sm"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t-sharpie">
                  <button
                    type="button"
                    onClick={() => setAnnouncementModalOpen(false)}
                    className="px-6 py-3 text-sm font-black uppercase text-ink bg-white border-sharpie shadow-sharpie-sm hover:bg-neon-yellow hover-sharpie-lift transition-all"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-neon-blue text-white text-sm font-black uppercase border-sharpie shadow-sharpie-sm hover:bg-ink hover-sharpie-lift transition-all"
                  >
                    SEND BROADCAST
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
