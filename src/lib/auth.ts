/* Shared auth helpers: redirects, password rules, email handling, error text.
   Pure functions (no React) so they are unit-testable. */

// Only allow in-app paths: must start with exactly one "/" (no //, no http, no backslash).
export function safeRedirect(path: unknown): string {
  if (typeof path === 'string' && /^\/[^/\\]/.test(path) && !path.startsWith('//')) return path;
  if (
    path !== null &&
    typeof path === 'object' &&
    typeof (path as { pathname?: unknown }).pathname === 'string'
  ) {
    const loc = path as { pathname: string; search?: string; hash?: string };
    const full = `${loc.pathname}${loc.search ?? ''}${loc.hash ?? ''}`;
    if (/^\/[^/\\]/.test(full) && !full.startsWith('//')) return full;
  }
  return '/';
}

export const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
export const PASSWORD_RULE_TEXT = '8+ characters with upper, lower case and a number.';

export function passwordChecklist(password: string): { label: string; ok: boolean }[] {
  return [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One lowercase letter', ok: /[a-z]/.test(password) },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One number', ok: /\d/.test(password) },
  ];
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Result branching for supabase.auth.signUp (confirmations may be on or off).
export type SignupOutcome =
  | { kind: 'signed-in' }
  | { kind: 'already-registered' }
  | { kind: 'confirm-email' };

export function getSignupOutcome(data: {
  session?: unknown;
  user?: { identities?: unknown[] } | null;
}): SignupOutcome {
  if (data.session) return { kind: 'signed-in' };
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { kind: 'already-registered' };
  }
  return { kind: 'confirm-email' };
}

// Map raw Supabase/auth errors to friendly, non-leaking text.
export function mapAuthError(message: string, domain = '@poornima.org'): string {
  const m = (message || '').toLowerCase();
  if (m.includes('invalid login credentials') || m.includes('invalid email or password')) {
    return 'Incorrect email or password.';
  }
  if (m.includes('user already registered') || m.includes('already exists')) {
    return 'An account with this email already exists. Try signing in.';
  }
  if (m.includes('domain_not_allowed') || m.includes('database error saving new user')) {
    return `Only ${domain} email addresses can sign up.`;
  }
  if (m.includes('email not confirmed') || m.includes('email not verified')) {
    return 'Please confirm your email first.';
  }
  if (m.includes('rate limit') || m.includes('too many requests') || m.includes('over request rate')) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  if (m.includes('fetch failed') || m.includes('network') || m.includes('failed to fetch')) {
    return 'Network problem. Check your connection.';
  }
  if (m.includes('password')) {
    return 'Password does not meet the requirements.';
  }
  return 'Something went wrong. Please try again.';
}

export function mapOAuthError(codeOrMessage: string, domain = '@poornima.org'): string {
  const m = (codeOrMessage || '').toLowerCase();
  if (
    m.includes('database error saving new user') ||
    m.includes('server_error') ||
    m.includes('domain_not_allowed')
  ) {
    return `Only ${domain} Google accounts can sign up. Please use your college email.`;
  }
  return 'Google sign-in failed. Please try again.';
}

export const POST_LOGIN_PATH_KEY = 'gatherum:postLoginPath';

export function domainHint(domain: string): string {
  return domain.startsWith('@') ? domain.slice(1) : domain;
}
