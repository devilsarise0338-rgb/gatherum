import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Plus, User as UserIcon, LogOut, Compass, Bookmark, ChevronDown, Settings, ShieldAlert } from 'lucide-react';

export const NavBar: React.FC = () => {
  const { savedEventIds, searchTerm, setSearchTerm } = useApp();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate('/explore');
    }
  };

  const isCurrentPath = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-paper border-b-sharpie">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Wordmark */}
        <div className="flex items-center gap-6">
          <Link to="/" className="group flex items-center gap-2">
            <span className="font-display text-2xl md:text-3xl tracking-tight text-ink">
              HYPE<span className="text-neon-pink">STUB</span>
            </span>
          </Link>
        </div>

        {/* Global Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-sm relative">
          <Search className="w-5 h-5 absolute left-3 text-ink font-bold" />
          <input
            type="text"
            placeholder="SEARCH EVENTS..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => { if (location.pathname !== '/explore') navigate('/explore'); }}
            className="w-full bg-white text-ink pl-10 pr-4 py-2 text-sm font-bold border-sharpie shadow-sharpie focus:outline-none focus:bg-neon-yellow transition-colors placeholder:text-ink/50"
          />
        </form>

        {/* Navigation Links & Action Buttons */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/explore"
            className={`inline-flex items-center gap-1.5 text-sm font-bold tracking-wider uppercase transition-colors hover:text-neon-blue ${
              isCurrentPath('/explore') ? 'text-neon-blue' : 'text-ink'
            }`}
          >
            <Compass className="w-5 h-5" /> Explore
          </Link>

          <Link
            to="/my-events"
            className={`inline-flex items-center gap-1.5 text-sm font-bold tracking-wider uppercase transition-colors hover:text-neon-pink ${
              isCurrentPath('/my-events') ? 'text-neon-pink' : 'text-ink'
            }`}
          >
            <Bookmark className="w-5 h-5" /> My Tickets
            {savedEventIds.length > 0 && (
              <span className="inline-flex items-center justify-center bg-neon-pink text-white text-[10px] w-5 h-5 border-2 border-ink rounded-full font-bold">
                {savedEventIds.length}
              </span>
            )}
          </Link>

          {/* Primary CTA: Host Event */}
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-neon-yellow text-ink text-sm font-bold uppercase border-sharpie shadow-sharpie hover-sharpie-lift"
          >
            <Plus className="w-5 h-5" /> Host Event
          </Link>

          {/* User Account / Sign In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-2 py-1 bg-white border-sharpie shadow-sharpie hover-sharpie-lift"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-neon-yellow border-2 border-ink text-ink font-black uppercase">
                  {user.email.substring(0, 1)}
                </div>
                <ChevronDown className="w-4 h-4 text-ink mr-1 font-bold" />
              </button>

              {dropdownOpen && (
                <div 
                  className="absolute right-0 mt-4 w-56 bg-white border-sharpie shadow-sharpie py-2 z-50"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b-sharpie">
                    <p className="text-sm font-bold text-ink truncate">{user.email}</p>
                    <p className="text-xs font-black text-neon-blue uppercase mt-1">{user.role} LEVEL</p>
                  </div>
                  
                  <Link
                    to="/my-events"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-ink hover:bg-neon-yellow transition-colors"
                  >
                    <Bookmark className="w-4 h-4" /> WALLET
                  </Link>

                  {(user.role === 'admin' || user.role === 'organizer') && (
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-ink hover:bg-neon-yellow transition-colors"
                    >
                      <UserIcon className="w-4 h-4" /> DASHBOARD
                    </Link>
                  )}

                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-ink hover:bg-neon-yellow transition-colors"
                  >
                    <Settings className="w-4 h-4" /> SETTINGS
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-ink hover:bg-neon-yellow transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4" /> ADMIN PANEL
                    </Link>
                  )}

                  <button
                    onClick={async () => {
                      await logout();
                      setDropdownOpen(false);
                      navigate('/');
                    }}
                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-ink hover:bg-neon-pink transition-colors border-t-sharpie mt-1"
                  >
                    <LogOut className="w-4 h-4" /> SIGN OUT
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="px-5 py-2 text-sm font-bold uppercase text-white bg-ink border-sharpie shadow-sharpie hover-sharpie-lift"
            >
              SIGN IN
            </Link>
          )}
        </nav>

        {/* Mobile Navigation Toggle Button */}
        <div className="flex md:hidden items-center gap-3">
          <Link
            to="/create"
            className="p-2 bg-neon-yellow text-ink border-sharpie shadow-sharpie-sm font-bold"
          >
            <Plus className="w-5 h-5" />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-white border-sharpie shadow-sharpie-sm"
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`h-1 w-full bg-ink transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`h-1 w-full bg-ink transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`h-1 w-full bg-ink transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-paper border-b-sharpie p-4 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-ink font-bold" />
            <input
              type="text"
              placeholder="SEARCH EVENTS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-ink pl-10 pr-3 py-2 text-sm font-bold border-sharpie shadow-sharpie-sm focus:outline-none"
            />
          </form>

          <div className="flex flex-col space-y-3">
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-white border-sharpie text-sm font-bold uppercase text-ink hover:bg-neon-yellow"
            >
              EXPLORE EVENTS
            </Link>
            <Link
              to="/my-events"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 bg-white border-sharpie text-sm font-bold uppercase text-ink hover:bg-neon-pink"
            >
              MY TICKETS
            </Link>
            {(user?.role === 'admin' || user?.role === 'organizer') && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-white border-sharpie text-sm font-bold uppercase text-ink hover:bg-neon-blue hover:text-white"
              >
                HOST DASHBOARD
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 bg-white border-sharpie text-sm font-bold uppercase text-ink hover:bg-neon-yellow"
                >
                  SETTINGS
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 bg-white border-sharpie text-sm font-bold uppercase text-ink hover:bg-neon-yellow"
                  >
                    ADMIN PANEL
                  </Link>
                )}

                <button
                  onClick={async () => {
                    await logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="text-left p-3 bg-ink text-white border-sharpie text-sm font-bold uppercase hover:bg-neon-pink"
                >
                  SIGN OUT ({user.email})
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-ink text-white border-sharpie text-sm font-bold uppercase"
              >
                SIGN IN / REGISTER
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

