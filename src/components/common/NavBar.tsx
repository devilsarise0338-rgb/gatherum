import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Plus, User as UserIcon, LogOut, Compass, Bookmark, ChevronDown, Settings, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

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
    <header className="sticky top-0 z-40 glass-panel border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Wordmark */}
        <div className="flex items-center gap-6">
          <Link to="/" className="group flex items-center gap-2">
            <span className="font-display text-xl md:text-2xl font-bold tracking-tight text-ink">
              GATHER<span className="text-ink-muted">UM</span>
            </span>
          </Link>
        </div>

        {/* Global Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-sm relative">
          <Search className="w-4 h-4 absolute left-3 text-ink-muted" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => { if (location.pathname !== '/explore') navigate('/explore'); }}
            className="w-full bg-surface-2 text-ink pl-10 pr-4 py-1.5 text-sm font-medium border border-border-strong rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-ink-muted"
          />
        </form>

        {/* Navigation Links & Action Buttons */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/explore"
            className={`inline-flex items-center gap-1.5 text-sm font-medium tracking-wide transition-colors hover:text-accent ${
              isCurrentPath('/explore') ? 'text-accent' : 'text-ink-muted'
            }`}
          >
            <Compass className="w-4 h-4" /> Explore
          </Link>

          <Link
            to="/my-events"
            className={`inline-flex items-center gap-1.5 text-sm font-medium tracking-wide transition-colors hover:text-accent ${
              isCurrentPath('/my-events') ? 'text-accent' : 'text-ink-muted'
            }`}
          >
            <Bookmark className="w-4 h-4" /> My Tickets
            {savedEventIds.length > 0 && (
              <span className="inline-flex items-center justify-center bg-accent text-white text-[10px] w-4 h-4 rounded-full font-bold">
                {savedEventIds.length}
              </span>
            )}
          </Link>

          {/* Primary CTA: Host Event */}
          <Button 
            variant="primary" 
            size="sm" 
            onClick={() => navigate('/create')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Host Event
          </Button>

          {/* User Account / Sign In */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 bg-surface-2 rounded-full border border-border-strong hover:border-accent transition-colors"
              >
                <div className="w-7 h-7 flex items-center justify-center bg-surface-3 rounded-full text-ink font-bold text-xs uppercase">
                  {user.email.substring(0, 1)}
                </div>
                <ChevronDown className="w-4 h-4 text-ink-muted mr-1" />
              </button>

              {dropdownOpen && (
                <Card 
                  glass
                  className="absolute right-0 mt-2 w-56 flex flex-col p-1 z-50 border border-border-strong"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-border-subtle mb-1">
                    <p className="text-sm font-medium text-ink text-truncate-strict">{user.email}</p>
                    <p className="text-xs text-ink-muted uppercase tracking-wider mt-0.5">{user.role}</p>
                  </div>
                  
                  <Link
                    to="/my-events"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface-2 rounded-md transition-colors"
                  >
                    <Bookmark className="w-4 h-4 text-ink-muted" /> Wallet
                  </Link>

                  {(user.role === 'admin' || user.role === 'organizer') && (
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface-2 rounded-md transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-ink-muted" /> Dashboard
                    </Link>
                  )}

                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface-2 rounded-md transition-colors"
                  >
                    <Settings className="w-4 h-4 text-ink-muted" /> Settings
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surface-2 rounded-md transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4 text-ink-muted" /> Admin Panel
                    </Link>
                  )}

                  <div className="h-px bg-border-subtle my-1" />
                  
                  <button
                    onClick={async () => {
                      await logout();
                      setDropdownOpen(false);
                      navigate('/');
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-surface-2 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </Card>
              )}
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          )}
        </nav>

        {/* Mobile Navigation Toggle Button */}
        <div className="flex md:hidden items-center gap-3">
          <Button variant="primary" size="sm" onClick={() => navigate('/create')}>
            <Plus className="w-4 h-4" />
          </Button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-ink"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`h-0.5 w-full bg-current rounded-full transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
              <span className={`h-0.5 w-full bg-current rounded-full transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`h-0.5 w-full bg-current rounded-full transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-1 border-t border-border-subtle p-4 space-y-4 shadow-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink-muted" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-surface-2 text-ink pl-10 pr-3 py-2 text-sm border border-border-strong rounded-lg focus:outline-none focus:border-accent"
            />
          </form>

          <div className="flex flex-col space-y-1">
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-sm font-medium text-ink hover:bg-surface-2 rounded-lg"
            >
              Explore Events
            </Link>
            <Link
              to="/my-events"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-sm font-medium text-ink hover:bg-surface-2 rounded-lg"
            >
              My Tickets
            </Link>
            {(user?.role === 'admin' || user?.role === 'organizer') && (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 text-sm font-medium text-ink hover:bg-surface-2 rounded-lg"
              >
                Host Dashboard
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 text-sm font-medium text-ink hover:bg-surface-2 rounded-lg"
                >
                  Settings
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 text-sm font-medium text-ink hover:bg-surface-2 rounded-lg"
                  >
                    Admin Panel
                  </Link>
                )}

                <button
                  onClick={async () => {
                    await logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="p-3 text-sm font-medium text-red-400 hover:bg-surface-2 rounded-lg text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 text-sm font-medium text-accent hover:bg-surface-2 rounded-lg"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
