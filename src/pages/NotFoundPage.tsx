import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Search, ArrowRight, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-16 space-y-8 max-w-2xl mx-auto">
      <span className="inline-flex items-center gap-2 px-3 py-1 border-sharpie bg-neon-yellow text-ink text-xs font-black uppercase tracking-widest shadow-sharpie-sm transform -rotate-2">
        <Sparkles className="w-4 h-4" /> 404 — PAGE NOT FOUND
      </span>

      <h1 className="font-display text-5xl sm:text-7xl font-black text-ink leading-none uppercase">
        LOST SIGNAL.
      </h1>

      <p className="text-ink font-bold text-base max-w-md bg-white border-sharpie px-6 py-4 shadow-sharpie-sm">
        The link you requested might be expired, private, or mistyped. Return to base or explore upcoming events.
      </p>

      {/* Quick Search Redirect */}
      <div className="pt-6 flex flex-wrap justify-center gap-4">
        <Link
          to="/explore"
          className="px-8 py-4 bg-neon-pink hover:bg-ink text-white text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-all flex items-center gap-2 hover-sharpie-lift"
        >
          EXPLORE GATHERINGS <Compass className="w-5 h-5" />
        </Link>
        <Link
          to="/"
          className="px-8 py-4 bg-white hover:bg-neon-yellow text-ink text-sm font-black uppercase tracking-wider border-sharpie shadow-sharpie transition-all hover-sharpie-lift"
        >
          RETURN HOME
        </Link>
      </div>

      {/* Category Pills */}
      <div className="pt-10 border-t-sharpie w-full space-y-4">
        <p className="text-xs font-black uppercase tracking-wider text-ink">POPULAR CATEGORIES</p>
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.filter(c => c !== 'All').slice(0, 4).map(cat => (
            <Link
              key={cat}
              to={`/explore?cat=${encodeURIComponent(cat)}`}
              className="px-4 py-2 border-sharpie bg-white hover:bg-neon-blue hover:text-white text-ink text-xs font-black uppercase tracking-wider transition-colors shadow-sharpie-sm hover-sharpie-lift"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

