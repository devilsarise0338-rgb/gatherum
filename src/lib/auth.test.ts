import { describe, expect, it } from 'vitest';
import {
  safeRedirect,
  normalizeEmail,
  PASSWORD_RE,
  passwordChecklist,
  getSignupOutcome,
  mapAuthError,
  mapOAuthError,
} from './auth';

describe('safeRedirect', () => {
  it('accepts plain in-app paths', () => {
    expect(safeRedirect('/events/123?x=1#y')).toBe('/events/123?x=1#y');
  });
  it('rejects protocol-relative, absolute, and backslash paths', () => {
    expect(safeRedirect('//evil.com')).toBe('/');
    expect(safeRedirect('https://evil.com')).toBe('/');
    expect(safeRedirect('\\\\evil')).toBe('/');
    expect(safeRedirect('')).toBe('/');
    expect(safeRedirect(null)).toBe('/');
    expect(safeRedirect(undefined)).toBe('/');
  });
  it('accepts location-like objects with pathname+search+hash', () => {
    expect(safeRedirect({ pathname: '/events/1', search: '?a=b', hash: '#c' })).toBe('/events/1?a=b#c');
  });
  it('rejects location-like objects with bad pathnames', () => {
    expect(safeRedirect({ pathname: 'https://evil.com' })).toBe('/');
  });
});

describe('normalizeEmail', () => {
  it('trims and lowercases', () => {
    expect(normalizeEmail('  Student@Poornima.ORG ')).toBe('student@poornima.org');
  });
});

describe('password rules', () => {
  it('accepts strong passwords and rejects weak ones', () => {
    expect(PASSWORD_RE.test('Abcdef12')).toBe(true);
    expect(PASSWORD_RE.test('abcdef12')).toBe(false);
    expect(PASSWORD_RE.test('ABCDEF12')).toBe(false);
    expect(PASSWORD_RE.test('Abcdefgh')).toBe(false);
    expect(PASSWORD_RE.test('Ab1')).toBe(false);
  });
  it('checklist reports each rule', () => {
    const all = passwordChecklist('Abcdef12');
    expect(all.every(c => c.ok)).toBe(true);
    expect(passwordChecklist('abc')[0].ok).toBe(false);
  });
});

describe('getSignupOutcome', () => {
  it('branches on session / empty identities / neither', () => {
    expect(getSignupOutcome({ session: {}, user: null }).kind).toBe('signed-in');
    expect(getSignupOutcome({ user: { identities: [] } }).kind).toBe('already-registered');
    expect(getSignupOutcome({ user: { identities: [{}] } }).kind).toBe('confirm-email');
    expect(getSignupOutcome({ user: null }).kind).toBe('confirm-email');
  });
});

describe('mapAuthError', () => {
  it('maps known errors to friendly text without leaking internals', () => {
    expect(mapAuthError('Invalid login credentials')).toBe('Incorrect email or password.');
    expect(mapAuthError('User already registered')).toContain('already exists');
    expect(mapAuthError('DOMAIN_NOT_ALLOWED: nope', '@poornima.org')).toContain('@poornima.org');
    expect(mapAuthError('Database error saving new user')).toContain('Only @poornima.org');
    expect(mapAuthError('Too many requests, rate limit')).toContain('Too many attempts');
    expect(mapAuthError('fetch failed')).toContain('Network problem');
    expect(mapAuthError('Email not confirmed')).toContain('confirm your email');
    expect(mapAuthError('something totally new')).toBe('Something went wrong. Please try again.');
  });
});

describe('mapOAuthError', () => {
  it('maps trigger/domain failures to the college message', () => {
    expect(mapOAuthError('server_error Database error saving new user')).toContain('@poornima.org');
    expect(mapOAuthError('access_denied')).toBe('Google sign-in failed. Please try again.');
  });
});

describe('sign-in has no domain gate', () => {
  it('documents that only sign-up checks the domain (see AuthPage handleSubmit)', () => {
    // AuthPage applies endsWith(allowedDomain) in the signup branch only.
    // This test pins the helper both branches share.
    expect(normalizeEmail('STUDENT@POORNIMA.ORG').endsWith('@poornima.org')).toBe(true);
  });
});
