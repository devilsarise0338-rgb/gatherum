import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Registration, Event } from '../types';
import EventCard from '../components/EventCard';
import { Calendar, Ticket, User, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'react-qr-code';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [tab, setTab] = useState<'overview' | 'tickets'>('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);

      // My registrations with event data
      const { data: regs } = await supabase
        .from('registrations')
        .select('*, event:events(*, organizer:profiles!events_organizer_id_fkey(full_name))')
        .eq('user_id', profile!.id)
        .in('status', ['registered', 'waitlisted', 'attended'])
        .order('created_at', { ascending: false });

      if (regs) setRegistrations(regs as Registration[]);

      // Upcoming published events
      const { data: evts } = await supabase
        .from('events')
        .select('*, registrations(count)')
        .eq('is_unpublished', false)
        .neq('registrations.status', 'cancelled')
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(4);

      if (evts) {
        setUpcomingEvents(evts.map((e: any) => ({
          ...e, registration_count: e.registrations?.[0]?.count ?? 0,
        })));
      }

      setLoading(false);
    }
    if (profile) load();
  }, [profile]);

  async function cancelReg(regId: string) {
    const { error } = await supabase
      .from('registrations')
      .update({ status: 'cancelled' })
      .eq('id', regId);
    if (error) toast.error(error.message);
    else {
      toast.success('Registration cancelled.');
      setRegistrations(rs => rs.filter(r => r.id !== regId));
    }
  }

  const activeRegs = registrations.filter(r => r.status === 'registered' || r.status === 'attended');
  const waitlisted = registrations.filter(r => r.status === 'waitlisted');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Header */}
      <div style={{ background: 'var(--ink)', color: 'var(--white)', borderBottom: '2px solid var(--border)', padding: '2.5rem 0' }}>
        <div className="container">
          <div className="tag" style={{ background: 'var(--yellow)', marginBottom: '0.75rem' }}>Student</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Hey, {profile?.full_name?.split(' ')[0] ?? 'Student'} 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>
            {activeRegs.length} active registration{activeRegs.length !== 1 ? 's' : ''} · {waitlisted.length} waitlisted
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 1.5rem' }}>
        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Registered', value: activeRegs.length, icon: <Ticket size={20} />, color: 'var(--red)' },
            { label: 'Waitlisted', value: waitlisted.length, icon: <Bell size={20} />, color: 'var(--yellow-dark)' },
            { label: 'Attended', value: registrations.filter(r => r.status === 'attended').length, icon: <Calendar size={20} />, color: '#22C55E' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ color: s.color }}>{s.icon}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.5rem', color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)', fontWeight: 600 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>My Registrations</button>
          <button className={`tab ${tab === 'tickets' ? 'active' : ''}`} onClick={() => setTab('tickets')}>
            <Ticket size={14} style={{ display: 'inline', marginRight: 4 }} />
            Tickets
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : tab === 'overview' ? (
          <div>
            {registrations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--white)', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎟️</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>No registrations yet</h3>
                <p style={{ color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>Browse upcoming events and register for free.</p>
                <button className="btn btn-primary" onClick={() => navigate('/events')}>Explore Events</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {registrations.map(reg => {
                  const ev = reg.event as unknown as Event;
                  if (!ev) return null;
                  return (
                    <div key={reg.id} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', cursor: 'pointer' }} onClick={() => navigate(`/events/${ev.id}`)}>
                          {ev.title ?? 'Untitled Event'}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)' }}>
                          {new Date(ev.start_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {ev.location && ` · ${ev.location}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span className={`badge ${reg.status === 'registered' ? 'badge-yellow' : reg.status === 'attended' ? 'badge-ink' : 'badge-white'}`}>
                          {reg.status}
                        </span>
                        {reg.status === 'registered' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => cancelReg(reg.id)} style={{ color: 'var(--red)' }}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Upcoming events section */}
            {upcomingEvents.length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '1.25rem' }}>Discover More Events</h2>
                <div className="grid-2">
                  {upcomingEvents.map(ev => <EventCard key={ev.id} event={ev} />)}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Tickets tab */
          <div>
            {activeRegs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--white)', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎫</div>
                <p style={{ fontWeight: 600 }}>No active tickets.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {activeRegs.map(reg => {
                  const ev = reg.event as unknown as Event;
                  if (!ev) return null;
                  return (
                    <div key={reg.id} className="ticket">
                      <div className="ticket-header">
                        <div style={{ fontWeight: 700, fontSize: '1.125rem' }}>{ev.title ?? 'Event'}</div>
                        <div style={{ fontSize: '0.8125rem', opacity: 0.8, marginTop: '0.25rem' }}>
                          {new Date(ev.start_time).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                          {ev.location && ` · ${ev.location}`}
                        </div>
                      </div>
                      <div className="ticket-body">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{ background: 'white', padding: '0.5rem', borderRadius: '8px', border: '2px solid var(--border)' }}>
                              <QRCode value={reg.ticket_id} size={80} />
                            </div>
                            <div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-muted)', marginBottom: '0.25rem' }}>TICKET ID</div>
                              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9375rem', letterSpacing: '0.05em' }}>{reg.ticket_id}</div>
                            </div>
                          </div>
                          <span className={`badge ${reg.status === 'attended' ? 'badge-ink' : 'badge-yellow'}`}>
                            {reg.status === 'attended' ? '✓ Attended' : '● Registered'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
