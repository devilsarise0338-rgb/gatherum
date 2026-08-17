import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../types';
import SafeImage from './SafeImage';
import { Calendar, MapPin, Users } from 'lucide-react';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

const CATEGORY_EMOJI: Record<string, string> = {
  Technical: '💻', Cultural: '🎭', Sports: '⚽', Workshop: '🔧',
  Seminar: '🎤', Competition: '🏆', Social: '🎉', Other: '📌',
};

export default function EventCard({ event }: { event: Event }) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `translate(-3px,-3px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg)`;
    card.style.boxShadow = `${8 + dx * 3}px ${8 + dy * 3}px 0 var(--shadow-color)`;
  }

  function handleMouseLeave() {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = '';
    card.style.boxShadow = '';
  }

  const emoji = CATEGORY_EMOJI[event.category ?? ''] ?? '📅';
  const isPast = new Date(event.start_time) < new Date();
  const isFull = event.registration_count !== undefined
    ? event.registration_count >= event.capacity
    : false;

  return (
    <div
      ref={cardRef}
      className="event-card tilt-card"
      onClick={() => navigate(`/events/${event.id}`)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <SafeImage
        src={event.poster_url}
        alt={event.title ?? 'Event'}
        className="event-card-image"
        fallbackEmoji={emoji}
      />
      <div className="event-card-body">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          {event.category && <span className="tag">{event.category}</span>}
          {isPast && <span className="badge badge-ink">Ended</span>}
          {isFull && !isPast && <span className="badge badge-red">Full</span>}
          {event.is_unpublished && <span className="badge badge-yellow">Draft</span>}
        </div>
        <h3 style={{ fontWeight: 700, fontSize: '1.0625rem', marginBottom: '0.625rem', lineHeight: 1.3 }}>
          {event.title ?? 'Untitled Event'}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', color: 'var(--ink-muted)', fontSize: '0.8125rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Calendar size={13} />
            {formatDate(event.start_time)} · {formatTime(event.start_time)}
          </span>
          {event.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <MapPin size={13} />
              {event.location}
            </span>
          )}
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Users size={13} />
            {event.registration_count ?? 0} / {event.capacity} seats
          </span>
        </div>
      </div>
    </div>
  );
}
