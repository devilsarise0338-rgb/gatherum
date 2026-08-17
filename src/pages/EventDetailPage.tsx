import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Event, Registration, RegistrationStatus } from '../types';
import SafeImage from '../components/SafeImage';
import {
  Calendar, Clock, MapPin, Users, ArrowLeft,
  CheckCircle, XCircle, AlertCircle, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [myReg, setMyReg] = useState<Registration | null>(null);
  const [regCount, setRegCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  async function fetchEvent() {
    if (!id) return;
    const { data, error } = await supabase
      .from('events')
      .select('*, organizer:profiles!events_organizer_id_fkey(full_name, avatar_url, email)')
      .eq('id', id)
      .single();
    if (error || !data) { setLoading(false); return; }
    setEvent(data as Event);

    const { count } = await supabase
      .from('registrations')
      .select('id', { count: 'exact' })
      .eq('event_id', id)
      .eq('status', 'registered');
    setRegCount(count ?? 0);

    if (user) {
      const { data: reg } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      setMyReg(reg as Registration | null);
    }
    setLoading(false);
  }

  useEffect(() => { fetchEvent(); }, [id, user]);

  async function handleRegister() {
    if (!user) { navigate('/auth'); return; }
    setActionLoading(true);
    const { data, error } = await supabase.rpc('register_for_event', { p_event_id: id });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(data === 'registered' ? '🎉 Registered!' : '⏳ Added to waitlist!');
      await fetchEvent();
    }
    setActionLoading(false);
  }

  async function handleCancel() {
    if (!user || !myReg) return;
    setActionLoading(true);
    const { error } = await supabase
      .from('registrations')
      .update({ status: 'cancelled' })
      .eq('id', myReg.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Registration cancelled.');
      await fetchEvent();
    }
    setActionLoading(false);
  }

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" />
    </div>
  );

  if (!event) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ fontSize: '4rem' }}>🔍</div>
      <h2 style={{ fontWeight: 700 }}>Event not found</h2>
      <button className="btn btn-ghost" onClick={() => navigate('/events')}><ArrowLeft size={16} /> Back to Events</button>
    </div>
  );

  const now = new Date();
  const startTime = new Date(event.start_time);
  const isPast = startTime < now;
  const isDeadlinePast = event.registration_deadline ? new Date(event.registration_deadline) < now : false;
  const isFull = regCount >= event.capacity;
  const activeStatus = myReg?.status;

  const fillPct = Math.min(100, (regCount / event.capacity) * 100);

  function RegistrationSection() {
    if (isPast) return (
      <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏁</div>
        <p style={{ fontWeight: 700 }}>This event has ended.</p>
      </div>
    );

    if (!activeStatus && isDeadlinePast) return (
      <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⏰</div>
        <p style={{ fontWeight: 700 }}>Registration Closed</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '0.25rem' }}>The deadline has passed.</p>
      </div>
    );

    if (activeStatus === 'registered' || activeStatus === 'attended') return (
      <div className="card card-yellow" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <CheckCircle size={24} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>
              {activeStatus === 'attended' ? 'Attended ✓' : 'You\'re Registered!'}
            </div>
            <div style={{ fontSize: '0.8125rem', opacity: 0.8 }}>Ticket ID: {myReg?.ticket_id?.slice(0, 8)}…</div>
          </div>
        </div>
        {activeStatus === 'registered' && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleCancel}
            disabled={actionLoading}
            style={{ width: '100%' }}
          >
            {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
            Cancel Registration
          </button>
        )}
      </div>
    );

    if (activeStatus === 'waitlisted') return (
      <div className="card" style={{ padding: '1.5rem', background: 'var(--cream)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <AlertCircle size={24} color="var(--red)" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.0625rem' }}>You're on the Waitlist</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--ink-muted)' }}>We'll notify you if a spot opens up.</div>
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleCancel} disabled={actionLoading} style={{ width: '100%' }}>
          {actionLoading ? <Loader2 size={14} /> : <XCircle size={14} />}
          Leave Waitlist
        </button>
      </div>
    );

    if (!user) return (
      <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ marginBottom: '1rem', color: 'var(--ink-muted)' }}>Sign in to register for this event.</p>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/auth')}>
          Sign In to Register
        </button>
      </div>
    );

    return (
      <div className="card" style={{ padding: '1.5rem' }}>
        {isFull && (
          <div className="alert alert-warn" style={{ marginBottom: '1rem' }}>
            Event is full — you'll be added to the waitlist.
          </div>
        )}
        <button
          className="btn btn-primary"
          style={{ width: '100%' }}
          onClick={handleRegister}
          disabled={actionLoading}
        >
          {actionLoading
            ? <Loader2 size={16} />
            : isFull
              ? '➕ Join Waitlist'
              : '🎟️ Register Now'
          }
        </button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      {/* Back */}
      <div style={{ background: 'var(--ink)', padding: '1rem 0', borderBottom: '2px solid var(--border)' }}>
        <div className="container">
          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--white)' }} onClick={() => navigate('/events')}>
            <ArrowLeft size={16} /> Back to Events
          </button>
        </div>
      </div>

      <div className="container" style={{ padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem', alignItems: 'start' }}>
          {/* ── Left column ── */}
          <div>
            {/* Poster */}
            <div style={{ marginBottom: '2rem', border: '2px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)' }}>
              <SafeImage
                src={event.poster_url}
                alt={event.title ?? 'Event'}
                style={{ width: '100%', height: 340, objectFit: 'cover' }}
                fallbackEmoji="🎭"
              />
            </div>

            {/* Tags + title */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
              {event.category && <span className="tag">{event.category}</span>}
              {isPast && !event.is_archived && <span className="badge badge-ink">Ended</span>}
              {event.is_archived && <span className="badge badge-ink">🗃️ Archived</span>}
              {event.is_unpublished && <span className="badge badge-yellow">Draft</span>}
            </div>

            <h1 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, marginBottom: '1rem' }}>
              {event.title ?? 'Untitled Event'}
            </h1>

            {/* Organizer */}
            {(event as any).organizer && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', padding: '0.75rem', background: 'var(--cream)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                <SafeImage
                  src={(event as any).organizer.avatar_url}
                  alt="Organizer"
                  className="avatar avatar-sm"
                  fallbackEmoji="👤"
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{(event as any).organizer.full_name ?? 'Organizer'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>Event Organizer</div>
                </div>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '0.8125rem', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ink-muted)' }}>About this Event</h2>
                <div style={{
                  background: 'var(--white)', border: '2px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  padding: '1.25rem', lineHeight: 1.8, whiteSpace: 'pre-wrap',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  {event.description}
                </div>
              </div>
            )}

            {/* Details grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { icon: <Calendar size={16} />, label: 'Date', value: fmt(event.start_time) },
                { icon: <Clock size={16} />, label: 'Time', value: `${fmtTime(event.start_time)}${event.end_time ? ' – ' + fmtTime(event.end_time) : ''}` },
                { icon: <MapPin size={16} />, label: 'Location', value: event.location ?? 'TBA' },
                { icon: <Users size={16} />, label: 'Capacity', value: `${regCount} / ${event.capacity} registered` },
                ...(event.registration_deadline ? [{ icon: <Clock size={16} />, label: 'Deadline', value: `${fmt(event.registration_deadline)} at ${fmtTime(event.registration_deadline)}` }] : []),
              ].map(d => (
                <div key={d.label} className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--red)', marginBottom: '0.375rem', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {d.icon} {d.label}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{d.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Registration CTA */}
            <RegistrationSection />

            {/* Capacity bar */}
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8125rem', fontWeight: 700 }}>
                <span>Spots Filled</span>
                <span>{Math.round(fillPct)}%</span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill${fillPct >= 100 ? '' : fillPct > 70 ? '' : ' green'}`}
                  style={{ width: `${fillPct}%`, background: fillPct >= 100 ? 'var(--red)' : fillPct > 70 ? 'var(--yellow-dark)' : '#22C55E' }}
                />
              </div>
              <div style={{ marginTop: '0.375rem', fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
                {event.capacity - regCount > 0 ? `${event.capacity - regCount} spots left` : 'No spots remaining'}
              </div>
            </div>

            {/* Go-to-tickets button for registered users */}
            {myReg && myReg.status === 'registered' && (
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => navigate('/student/tickets')}>
                🎟️ View My Ticket
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile right-col becomes stacked */}
      <style>{`
        @media (max-width: 900px) {
          .container > div[style*="grid-template-columns: 1fr 340px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
