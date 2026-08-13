import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-stone-900 text-[#FAF7F2] pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Brand Statement & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-stone-800">
          <div className="lg:col-span-6 space-y-4">
            <Link to="/" className="inline-block font-display text-3xl font-bold tracking-tight text-white">
              GATHERUM
            </Link>
            <p className="text-stone-400 text-sm leading-relaxed max-w-md font-light">
              A refined event-hosting environment crafted for design salons, supper clubs, spatial audio installations, and intimate founder gatherings. Reimagining communal hospitality.
            </p>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#C9762F]">
              <Sparkles className="w-3.5 h-3.5" /> The Curated Weekly
            </span>
            <h4 className="font-display text-xl text-white font-medium">
              Get invited to private gatherings in your city.
            </h4>
            
            {subscribed ? (
              <div className="flex items-center gap-2 p-3 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>You’re on the invite list. We send 1 email per week.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-stone-800/80 text-white placeholder-stone-500 px-4 py-2.5 text-xs rounded-full border border-stone-700/80 focus:border-[#C9762F] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#C9762F] hover:bg-[#b06424] text-white text-xs font-semibold uppercase tracking-wider rounded-full transition-all flex items-center gap-1"
                >
                  Join <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Nav Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 text-xs font-light text-stone-400 border-b border-stone-800">
          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider mb-3 text-[11px]">Platform</h5>
            <ul className="space-y-2">
              <li><Link to="/explore" className="hover:text-[#C9762F] transition-colors">Explore Feed</Link></li>
              <li><Link to="/create" className="hover:text-[#C9762F] transition-colors">Host an Event</Link></li>
              <li><Link to="/dashboard" className="hover:text-[#C9762F] transition-colors">Host Hub</Link></li>
              <li><Link to="/my-events" className="hover:text-[#C9762F] transition-colors">My RSVPs & Tickets</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider mb-3 text-[11px]">Curated Cities</h5>
            <ul className="space-y-2">
              <li><Link to="/explore?city=New York" className="hover:text-[#C9762F] transition-colors">New York</Link></li>
              <li><Link to="/explore?city=San Francisco" className="hover:text-[#C9762F] transition-colors">San Francisco</Link></li>
              <li><Link to="/explore?city=Berlin" className="hover:text-[#C9762F] transition-colors">Berlin & London</Link></li>
              <li><Link to="/explore?city=Austin" className="hover:text-[#C9762F] transition-colors">Austin & LA</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider mb-3 text-[11px]">Categories</h5>
            <ul className="space-y-2">
              <li><Link to="/explore?cat=Design %26 Tech" className="hover:text-[#C9762F] transition-colors">Design & Tech</Link></li>
              <li><Link to="/explore?cat=Culinary %26 Wine" className="hover:text-[#C9762F] transition-colors">Culinary & Wine</Link></li>
              <li><Link to="/explore?cat=Wellness %26 Rituals" className="hover:text-[#C9762F] transition-colors">Wellness & Rituals</Link></li>
              <li><Link to="/explore?cat=Music %26 Night" className="hover:text-[#C9762F] transition-colors">Music & Sound</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider mb-3 text-[11px]">Connect</h5>
            <ul className="space-y-2">
              <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[#C9762F] transition-colors">Twitter / X</a></li>
              <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#C9762F] transition-colors">Instagram</a></li>
              <li><a href="https://substack.com" target="_blank" rel="noreferrer" className="hover:text-[#C9762F] transition-colors">Gatherum Journal</a></li>
              <li><Link to="/auth" className="hover:text-[#C9762F] transition-colors">Sign In</Link></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-stone-500 font-light">
          <p>© {new Date().getFullYear()} GATHERUM Inc. All rights reserved. Made for intentional hosts.</p>
          <div className="flex gap-6">
            <span className="hover:underline cursor-pointer">Privacy Protocol</span>
            <span className="hover:underline cursor-pointer">Terms of Service</span>
            <span className="hover:underline cursor-pointer">Host Guidelines</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
