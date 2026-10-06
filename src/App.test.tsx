// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { RequireAuth } from './App';
import { useAuth } from './contexts/AuthContext';
import type { Profile } from './types';

vi.mock('./contexts/AuthContext', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const mockUseAuth = vi.mocked(useAuth);

const baseProfile: Profile = {
  id: 'user-1',
  role: 'student',
  email: 'student@poornima.org',
  full_name: 'Test Student',
  roll_number: 'POO2024CS001',
  branch: 'CSE',
  year_of_study: 2,
  phone_number: null,
  avatar_url: null,
  public_rsvp: true,
  profile_completed: true,
  is_banned: false,
  must_change_password: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const baseUser = { id: 'user-1' } as unknown as User;

function setAuth(overrides: {
  user?: User | null;
  profile?: Profile | null;
  loading?: boolean;
  profileError?: string | null;
}) {
  mockUseAuth.mockReturnValue({
    session: overrides.user ? ({ user: overrides.user } as never) : null,
    user: overrides.user ?? null,
    profile: overrides.profile ?? null,
    loading: overrides.loading ?? false,
    profileLoading: false,
    profileError: overrides.profileError ?? null,
    signOut: vi.fn(),
    refreshProfile: vi.fn(),
  });
}

function authValue() {
  return mockUseAuth.mock.results[0]?.value as {
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
  };
}

function LocationProbe() {
  const l = useLocation();
  return <div data-testid="loc">{JSON.stringify({ path: l.pathname, state: l.state })}</div>;
}

function renderAt(path: string, guard: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/student" element={guard} />
        <Route path="/admin" element={guard} />
        <Route path="/profile" element={<LocationProbe />} />
        <Route path="/auth" element={<LocationProbe />} />
        <Route path="/" element={<div>home-page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const child = <div>secret-content</div>;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('RequireAuth', () => {
  it('never renders children when profile is null (shows loader)', () => {
    setAuth({ user: baseUser, profile: null });
    renderAt('/student', <RequireAuth role="student">{child}</RequireAuth>);
    expect(screen.queryByText('secret-content')).toBeNull();
    expect(document.querySelector('.page-loader')).not.toBeNull();
  });

  it('shows the profile-error screen with Retry and Sign out', () => {
    setAuth({ user: baseUser, profile: null, profileError: 'boom' });
    renderAt('/student', <RequireAuth role="student">{child}</RequireAuth>);
    expect(screen.getByText("Couldn't load your profile")).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(authValue().refreshProfile).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(authValue().signOut).toHaveBeenCalled();
  });

  it('shows the suspended screen when banned', () => {
    setAuth({ user: baseUser, profile: { ...baseProfile, is_banned: true } });
    renderAt('/student', <RequireAuth role="student">{child}</RequireAuth>);
    expect(screen.getByText('Account Suspended')).toBeInTheDocument();
    expect(screen.queryByText('secret-content')).toBeNull();
  });

  it('redirects incomplete profiles to /profile with mustComplete', () => {
    setAuth({ user: baseUser, profile: { ...baseProfile, profile_completed: false } });
    renderAt('/student', <RequireAuth role="student">{child}</RequireAuth>);
    const loc = JSON.parse(screen.getByTestId('loc').textContent ?? '{}');
    expect(loc.path).toBe('/profile');
    expect(loc.state?.mustComplete).toBe(true);
  });

  it('redirects a student away from an admin-only route', () => {
    setAuth({ user: baseUser, profile: baseProfile });
    renderAt('/admin', <RequireAuth role="admin">{child}</RequireAuth>);
    expect(screen.getByText('home-page')).toBeInTheDocument();
    expect(screen.queryByText('secret-content')).toBeNull();
  });

  it('redirects anonymous users to /auth with state.from', () => {
    setAuth({ user: null, profile: null });
    renderAt('/student', <RequireAuth role="student">{child}</RequireAuth>);
    const loc = JSON.parse(screen.getByTestId('loc').textContent ?? '{}');
    expect(loc.path).toBe('/auth');
    expect(loc.state?.from?.pathname).toBe('/student');
  });

  it('renders children for a complete, correctly-roled profile', () => {
    setAuth({ user: baseUser, profile: baseProfile });
    renderAt('/student', <RequireAuth role="student">{child}</RequireAuth>);
    expect(screen.getByText('secret-content')).toBeInTheDocument();
  });
});
