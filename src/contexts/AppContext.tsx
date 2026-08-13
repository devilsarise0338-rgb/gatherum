import React, { createContext, useContext, useState, useEffect } from 'react';
import { EventItem, UserProfile, RSVPRecord, Guest } from '../types';
import { MOCK_EVENTS, CURRENT_USER } from '../data/mockData';

interface AppContextType {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  events: EventItem[];
  addEvent: (eventData: Omit<EventItem, 'id' | 'slug' | 'guests' | 'host'>) => EventItem;
  savedEventIds: string[];
  toggleSaveEvent: (eventId: string) => void;
  rsvps: RSVPRecord[];
  addRSVP: (rsvpData: { eventId: string; ticketTypeId: string; ticketTypeName: string; guestName: string; guestEmail: string; quantity: number; totalPrice: number }) => RSVPRecord;
  updateGuestStatus: (eventId: string, guestId: string, status: Guest['status'], checkedIn?: boolean) => void;
  showSplash: boolean;
  setShowSplash: (show: boolean) => void;
  replaySplash: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_EVENTS = 'gatherum_events_v1';
const LOCAL_STORAGE_KEY_SAVED = 'gatherum_saved_v1';
const LOCAL_STORAGE_KEY_RSVPS = 'gatherum_rsvps_v1';
const LOCAL_STORAGE_KEY_USER = 'gatherum_user_v1';
const LOCAL_STORAGE_KEY_SPLASH_SHOWN = 'gatherum_splash_seen_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_USER);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return CURRENT_USER;
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_EVENTS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return MOCK_EVENTS;
  });

  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SAVED);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return ['evt_01', 'evt_02'];
  });

  const [rsvps, setRsvps] = useState<RSVPRecord[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_RSVPS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [
      {
        id: 'rsvp_9910',
        eventId: 'evt_01',
        ticketTypeId: 't_01',
        ticketTypeName: 'General Admission',
        guestName: CURRENT_USER.name,
        guestEmail: CURRENT_USER.email,
        quantity: 1,
        totalPrice: 45,
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GATHERUM-TICKET-evt_01-usr_curated_01',
        confirmedAt: new Date().toISOString(),
        status: 'valid'
      }
    ];
  });

  const [showSplash, setShowSplash] = useState<boolean>(() => {
    const seen = sessionStorage.getItem(LOCAL_STORAGE_KEY_SPLASH_SHOWN);
    return !seen; // show splash on first load in session
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_USER, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SAVED, JSON.stringify(savedEventIds));
  }, [savedEventIds]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_RSVPS, JSON.stringify(rsvps));
  }, [rsvps]);

  const toggleSaveEvent = (eventId: string) => {
    setSavedEventIds(prev => 
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  const addEvent = (eventData: Omit<EventItem, 'id' | 'slug' | 'guests' | 'host'>): EventItem => {
    const id = `evt_custom_${Date.now()}`;
    const slug = eventData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const newEvent: EventItem = {
      ...eventData,
      id,
      slug,
      host: {
        id: user?.id || 'host_curated',
        name: user?.name || 'Elena Rostova',
        handle: user?.handle || '@elenarostova',
        avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
        bio: user?.bio || 'Curator & host',
        verified: true,
        totalEventsHosted: 5,
        totalAttendees: 140,
        location: 'New York, NY',
      },
      guests: [
        {
          id: `g_${Date.now()}`,
          name: user?.name || 'Elena Rostova',
          email: user?.email || 'elena.rostova@designworks.co',
          avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          ticketType: eventData.tickets[0]?.name || 'Standard',
          checkedIn: true,
          rsvpDate: new Date().toISOString().split('T')[0],
          status: 'confirmed'
        }
      ]
    };

    setEvents(prev => [newEvent, ...prev]);
    return newEvent;
  };

  const addRSVP = (data: { eventId: string; ticketTypeId: string; ticketTypeName: string; guestName: string; guestEmail: string; quantity: number; totalPrice: number }): RSVPRecord => {
    const id = `rsvp_${Math.floor(100000 + Math.random() * 900000)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=GATHERUM-TICKET-${data.eventId}-${id}`;
    
    const newRSVP: RSVPRecord = {
      ...data,
      id,
      qrCodeUrl,
      confirmedAt: new Date().toISOString(),
      status: 'valid'
    };

    setRsvps(prev => [newRSVP, ...prev]);

    // Also update event sold counts and guest list
    setEvents(prev => prev.map(evt => {
      if (evt.id === data.eventId) {
        const updatedTickets = evt.tickets.map(t => {
          if (t.id === data.ticketTypeId) {
            return { ...t, sold: t.sold + data.quantity };
          }
          return t;
        });

        const newGuest: Guest = {
          id: `g_new_${Date.now()}`,
          name: data.guestName,
          email: data.guestEmail,
          avatar: user?.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200`,
          ticketType: data.ticketTypeName,
          checkedIn: false,
          rsvpDate: new Date().toISOString().split('T')[0],
          status: 'confirmed'
        };

        return {
          ...evt,
          tickets: updatedTickets,
          guests: [newGuest, ...evt.guests]
        };
      }
      return evt;
    }));

    return newRSVP;
  };

  const updateGuestStatus = (eventId: string, guestId: string, status: Guest['status'], checkedIn?: boolean) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const updatedGuests = evt.guests.map(g => {
          if (g.id === guestId) {
            return {
              ...g,
              status,
              checkedIn: checkedIn !== undefined ? checkedIn : g.checkedIn,
              checkInTime: checkedIn ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : g.checkInTime
            };
          }
          return g;
        });
        return { ...evt, guests: updatedGuests };
      }
      return evt;
    }));
  };

  const dismissSplash = () => {
    setShowSplash(false);
    sessionStorage.setItem(LOCAL_STORAGE_KEY_SPLASH_SHOWN, 'true');
  };

  const replaySplash = () => {
    setShowSplash(true);
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      events,
      addEvent,
      savedEventIds,
      toggleSaveEvent,
      rsvps,
      addRSVP,
      updateGuestStatus,
      showSplash,
      setShowSplash: dismissSplash,
      replaySplash,
      searchTerm,
      setSearchTerm,
      selectedCategory,
      setSelectedCategory
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
