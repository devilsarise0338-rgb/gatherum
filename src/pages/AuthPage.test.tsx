// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AuthPage from './AuthPage';
import { supabase } from '../lib/supabase';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      resend: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}));

vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
}));

const mockSignUp = vi.mocked(supabase.auth.signUp);
const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);

function renderAuth() {
  return render(
    <MemoryRouter initialEntries={['/auth']}>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<div>home-marker</div>} />
      </Routes>
    </MemoryRouter>
  );
}

async function fillSignup(email: string, password: string) {
  fireEvent.click(screen.getByRole('tab', { name: 'Sign Up' }));
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: password } });
  fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('AuthPage', () => {
  it('sign-up with a returned session navigates away without the inbox screen', async () => {
    mockSignUp.mockResolvedValue({
      data: {
        session: { access_token: 'tok' },
        user: { id: 'u1', email: 'new@poornima.org' },
      },
      error: null,
    } as never);
    renderAuth();
    await fillSignup('new@poornima.org', 'Abcdef12');
    expect(await screen.findByText('home-marker')).toBeInTheDocument();
    expect(screen.queryByText('Check Your Inbox')).toBeNull();
  });

  it("identities: [] shows the already-exists message and keeps the email", async () => {
    mockSignUp.mockResolvedValue({
      data: { session: null, user: { id: 'u1', identities: [] } },
      error: null,
    } as never);
    renderAuth();
    await fillSignup('taken@poornima.org', 'Abcdef12');
    expect(await screen.findByText(/already exists/)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('taken@poornima.org');
    expect(screen.queryByText('Check Your Inbox')).toBeNull();
  });

  it('sign-in applies NO domain check: x@gmail.com reaches signInWithPassword', async () => {
    mockSignIn.mockResolvedValue({ data: {}, error: null } as never);
    renderAuth();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'x@gmail.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'whatever123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    expect(mockSignIn).toHaveBeenCalledWith({ email: 'x@gmail.com', password: 'whatever123' });
    expect(screen.queryByText(/Only @poornima.org emails can sign up/)).toBeNull();
    expect(await screen.findByText('home-marker')).toBeInTheDocument();
  });

  it('domain helper text only appears on Sign Up', () => {
    renderAuth();
    expect(screen.queryByText(/Only @poornima.org emails can sign up/)).toBeNull();
    fireEvent.click(screen.getByRole('tab', { name: 'Sign Up' }));
    expect(screen.getByText(/Only @poornima.org emails can sign up/)).toBeInTheDocument();
  });
});
