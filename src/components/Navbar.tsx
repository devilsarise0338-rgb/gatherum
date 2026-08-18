import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const role = profile?.role;

  function isActive(path: string) {
    return location.pathname === path ? 'active' : '';
  }

  async function handleSignOut() {
    await signOut();
    navigate('/auth');
  }

  const links = [
    { label: 'Events', path: '/events' },
    ...(role === 'student' ? [{ label: 'Dashboard', path: '/student' }] : []),
    ...(role === 'organizer' ? [{ label: 'Dashboard', path: '/organizer' }] : []),
    ...(role === 'admin' ? [{ label: 'Admin', path: '/admin' }] : []),
  ];

  return (
    <header className="navbar" style={{ zIndex: 100 }}>
      <div className="navbar-inner">
        {/* Logo */}
        <div
          className="navbar-logo"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          Gather<span>um</span>
        </div>

        {/* Desktop nav */}
        <ul className="nav-links">
          {links.map(l => (
            <li key={l.path}>
              <span
                className={`nav-link ${isActive(l.path)}`}
                onClick={() => navigate(l.path)}
              >
                {l.label}
              </span>
            </li>
          ))}
          {profile ? (
            <>
              <li>
                <span className={`nav-link ${isActive('/profile')}`} onClick={() => navigate('/profile')}>
                  <User size={14} style={{ display: 'inline', marginRight: 4 }} />
                  Profile
                </span>
              </li>
              <li>
                <button className="btn btn-primary btn-sm" onClick={handleSignOut}>
                  <LogOut size={14} />
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <li>
              <button className="btn btn-primary btn-sm" onClick={() => navigate('/auth')}>
                Sign In
              </button>
            </li>
          )}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="btn btn-ghost btn-sm"
          style={{ display: 'none' }}
          id="mobile-menu-btn"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <style>{`
          @media (max-width: 768px) {
            #mobile-menu-btn { display: flex !important; }
          }
        `}</style>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--white)',
          borderTop: '2px solid var(--border)',
          boxShadow: '0 8px 0 var(--border)',
          zIndex: 99,
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          {links.map(l => (
            <button
              key={l.path}
              className="btn btn-ghost"
              onClick={() => { navigate(l.path); setMenuOpen(false); }}
              style={{ justifyContent: 'flex-start' }}
            >
              {l.label}
            </button>
          ))}
          {profile ? (
            <>
              <button className="btn btn-ghost" onClick={() => { navigate('/profile'); setMenuOpen(false); }} style={{ justifyContent: 'flex-start' }}>
                Profile
              </button>
              <button className="btn btn-primary" onClick={handleSignOut}>Sign Out</button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => { navigate('/auth'); setMenuOpen(false); }}>Sign In</button>
          )}
        </div>
      )}
    </header>
  );
}
