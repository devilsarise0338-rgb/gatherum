import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, ArrowRight, Check, AlertTriangle, Mail } from 'lucide-react';

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
      if (!user.profileCompleted) {
        navigate('/complete-profile');
      } else {
        navigate('/my-events');
      }
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

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    clearAuthError();
    setIsSubmitting(true);
    await loginWithGoogle();
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-neon-yellow border-sharpie rounded-full transform -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-neon-pink border-sharpie transform rotate-12 -z-10"></div>

      <div className="max-w-md w-full bg-paper border-sharpie shadow-sharpie p-8 space-y-8 relative">
        <div className="absolute -top-4 -right-4 bg-neon-blue text-white px-3 py-1 font-black uppercase text-sm border-sharpie transform rotate-6">
          HOST / GUEST
        </div>

        {/* Brand Header */}
        <div className="space-y-4">
          <h1 className="font-display text-4xl sm:text-5xl font-black text-ink uppercase leading-none">
            {mode === 'signin' ? 'ENTER THE ARCHIVE' : 'JOIN THE ARCHIVE'}
          </h1>
          <p className="text-ink font-bold bg-white border-sharpie px-3 py-2 inline-block">
            ACCESS PRIVATE SALONS & HOST MANAGEMENT.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-white border-sharpie shadow-sharpie-sm">
          <button
            onClick={() => { setMode('signin'); setLocalError(null); clearAuthError(); setMagicLinkSent(false); }}
            className={`flex-1 py-3 text-sm font-black uppercase tracking-wider transition-colors border-r-sharpie ${
              mode === 'signin' ? 'bg-ink text-neon-yellow' : 'text-ink hover:bg-neon-yellow/50'
            }`}
          >
            SIGN IN
          </button>
          <button
            onClick={() => { setMode('signup'); setLocalError(null); clearAuthError(); setMagicLinkSent(false); }}
            className={`flex-1 py-3 text-sm font-black uppercase tracking-wider transition-colors ${
              mode === 'signup' ? 'bg-ink text-neon-yellow' : 'text-ink hover:bg-neon-yellow/50'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Error Banner */}
        {getErrorMessage() && (
          <div className="bg-neon-pink text-white p-4 border-sharpie shadow-sharpie-sm flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-black uppercase tracking-wider">AUTHENTICATION FAILED</p>
              <p className="font-bold text-sm uppercase">{getErrorMessage()}</p>
            </div>
          </div>
        )}

        {/* Magic Link Success Banner */}
        {magicLinkSent && (
          <div className="bg-neon-yellow text-ink p-4 border-sharpie shadow-sharpie-sm flex items-start gap-3">
            <Mail className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-black uppercase tracking-wider">MAGIC LINK SENT</p>
              <p className="font-bold text-sm uppercase">CHECK YOUR INBOX TO CONTINUE.</p>
            </div>
          </div>
        )}

        {/* Official Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-4 border-sharpie bg-white text-ink font-black uppercase hover:bg-neon-yellow transition-colors shadow-sharpie-sm hover-sharpie-lift"
        >
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          CONTINUE WITH GOOGLE
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t-sharpie w-full" />
          <span className="bg-paper px-4 font-black uppercase text-ink absolute border-sharpie">
            OR USE EMAIL
          </span>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block font-black uppercase text-ink">EMAIL ADDRESS</label>
            <input
              type="email"
              required
              placeholder="NAME@YOUR-INSTITUTE.EDU"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting || magicLinkSent}
              className="w-full bg-white px-4 py-3 font-bold border-sharpie focus:outline-none focus:bg-neon-yellow focus:text-ink transition-colors uppercase placeholder-ink/30 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || magicLinkSent}
            className="w-full py-4 mt-4 bg-ink text-neon-yellow font-black uppercase text-xl border-sharpie shadow-sharpie hover-sharpie-lift transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-sharpie"
          >
            {isSubmitting ? 'PROCESSING...' : magicLinkSent ? 'CHECK EMAIL' : (mode === 'signin' ? 'SEND MAGIC LINK' : 'JOIN THE ARCHIVE')} <ArrowRight className="w-6 h-6" />
          </button>
        </form>

        <p className="text-xs text-ink/70 text-center font-bold uppercase mt-4">
          BY PROCEEDING, YOU AGREE TO GATHERUM’S TERMS OF SERVICE.
        </p>

      </div>
    </div>
  );
};
