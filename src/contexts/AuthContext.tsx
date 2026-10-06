import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  profileError: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  profile: null,
  loading: true,
  profileLoading: false,
  profileError: null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

// Throttle for focus-triggered profile refreshes (re-checks bans/roles).
const FOCUS_REFRESH_MS = 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const lastFocusRefresh = React.useRef(0);

  // Retry once, then surface profileError (callers show Retry/Sign out).
  // Never leaves a stale profile in place after a failed refresh.
  async function fetchProfile(userId: string, attempt = 1): Promise<void> {
    setProfileLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (!error && data) {
      setProfile(data as Profile);
      setProfileError(null);
      setProfileLoading(false);
      return;
    }
    if (attempt < 2) {
      await new Promise(r => setTimeout(r, 500));
      return fetchProfile(userId, attempt + 1);
    }
    setProfile(null);
    setProfileError(error?.message ?? 'Could not load your profile.');
    setProfileLoading(false);
  }

  async function refreshProfile() {
    const {
      data: { session: s },
    } = await supabase.auth.getSession();
    setSession(s);
    if (s?.user) await fetchProfile(s.user.id);
    else {
      setProfile(null);
      setProfileError(null);
    }
  }

  useEffect(() => {
    // Initial load: `loading` stays true until the session AND the first
    // profile fetch (if any) settle. Later auth events use profileLoading
    // instead, so token refreshes never flash the full-page loader.
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) fetchProfile(s.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      // Defer: never call Supabase synchronously inside the auth callback
      // (avoids deadlocks in some client versions).
      setTimeout(() => {
        setSession(s);
        if (s?.user) {
          fetchProfile(s.user.id);
        } else {
          setProfile(null);
          setProfileError(null);
          setProfileLoading(false);
        }
      }, 0);
    });

    // Re-check bans/role changes when the tab regains focus (max once/min).
    function onFocus() {
      const now = Date.now();
      if (now - lastFocusRefresh.current < FOCUS_REFRESH_MS) return;
      lastFocusRefresh.current = now;
      refreshProfile();
    }
    window.addEventListener('focus', onFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, profile, loading, profileLoading, profileError, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
