import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const AuthPage: React.FC = () => {
  const { login, loginWithGoogle, user, authError, clearAuthError, isLoading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'organizer') navigate('/organizer');
      else if (user.role === 'student') navigate('/student');
      else navigate('/events');
    }
  }, [user, navigate]);

  const getErrorMessage = () => {
    if (localError) return localError;
    switch (authError) {
      case 'invalid_email': return 'INVALID EMAIL FORMAT.';
      case 'domain_restricted': return 'ACCESS RESTRICTED. USE YOUR INSTITUTE EMAIL.';
      case 'signups_disabled': return 'SIGNUPS ARE CURRENTLY DISABLED.';
      case 'user_banned': return 'THIS ACCOUNT HAS BEEN BANNED.';
      case 'unknown': return 'AN ERROR OCCURRED. TRY AGAIN.';
      default: return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();
    setIsSubmitting(true);
    setMagicLinkSent(false);

    const result = await login(email);
    setIsSubmitting(false);

    if (result.success) {
      setMagicLinkSent(true);
    }
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-on-primary">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-32 px-6 md:px-16 flex items-center justify-center relative">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#2A2A2A_1px,transparent_1px),linear-gradient(to_bottom,#2A2A2A_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="w-full max-w-md relative z-10 bg-surface border-4 border-grid-line p-8 shadow-[8px_8px_0_0_#2A2A2A]">
          <div className="mb-8">
            <h1 className="font-display-hero text-4xl text-on-surface uppercase tracking-tight mb-2">
              {mode === 'signin' ? 'Access Portal' : 'Join Gatherum'}
            </h1>
            <p className="font-body-md text-on-surface-variant uppercase tracking-widest text-xs border-l-2 border-primary pl-2">
              {mode === 'signin' ? 'Authenticate with your identity' : 'Create a new identity'}
            </p>
          </div>

          {errorMessage && (
            <div className="bg-error text-on-error p-3 mb-6 border-2 border-grid-line font-label-caps flex items-center gap-2">
              <span className="w-2 h-2 bg-on-error animate-pulse border border-on-error"></span>
              {errorMessage}
            </div>
          )}

          {magicLinkSent ? (
            <div className="bg-primary/20 text-on-surface p-4 border-2 border-primary mb-6 text-center">
              <h3 className="font-subheadline-bold text-xl uppercase mb-2">Transmission Sent</h3>
              <p className="font-body-md">Check your email for the magic link to access your account.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@poornima.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || isLoading}
                required
              />
              
              <Button 
                className="w-full shadow-[4px_4px_0_0_#2A2A2A]"
                disabled={isSubmitting || isLoading}
                type="submit"
              >
                {isSubmitting ? 'Transmitting...' : 'Continue via Magic Link'}
              </Button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t-2 border-grid-line">
            <Button 
              variant="outline"
              className="w-full mb-4 shadow-[4px_4px_0_0_#2A2A2A] flex justify-center items-center gap-2"
              onClick={() => loginWithGoogle()}
              disabled={isSubmitting || isLoading}
            >
              Google Authentication
            </Button>

            <p className="text-center font-body-sm text-on-surface-variant uppercase tracking-wider text-xs">
              {mode === 'signin' ? 'No identity?' : 'Already identified?'}
              <button 
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setLocalError(null);
                  clearAuthError();
                  setMagicLinkSent(false);
                }}
                className="ml-2 text-primary hover:underline underline-offset-4 font-bold"
              >
                {mode === 'signin' ? 'Initialize here.' : 'Access here.'}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
