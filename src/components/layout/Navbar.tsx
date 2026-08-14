import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../../contexts/AuthContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Navbar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/auth';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'organizer') return '/organizer';
    if (user.role === 'student') return '/student';
    return '/events';
  };

  const handleAccountClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      logout();
    } else {
      navigate('/auth');
    }
  };

  return (
    <>
      {/* TopNavBar (Desktop) */}
      <nav className="hidden md:flex justify-between items-center w-full px-margin-desktop py-4 fixed top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-outline-variant/30 transition-transform duration-300">
        <div className="flex items-center gap-12">
          <Link to="/" className="font-headline-lg text-headline-lg tracking-tighter text-on-surface hover:opacity-70 transition-opacity">
            GATHERUM NOIR
          </Link>
          <div className="flex items-center gap-8">
            <NavLink to="/events" currentPath={path}>EXPLORE</NavLink>
            {user && (
              <NavLink to={getDashboardPath()} currentPath={path}>DASHBOARD</NavLink>
            )}
            <NavLink to="/" currentPath={path}>HOME</NavLink>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/events" className="material-symbols-outlined cursor-pointer hover:opacity-70 transition-opacity hover-target" style={{ fontSize: '24px' }}>
            search
          </Link>
          <button 
            onClick={handleAccountClick}
            className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-on-surface hover:opacity-70 transition-opacity hover-target"
          >
            {user ? 'LOGOUT' : 'ACCOUNT'}
          </button>
        </div>
      </nav>

      {/* BottomNavBar (Mobile) */}
      <nav className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex justify-around items-center p-2 bg-surface-container/60 backdrop-blur-2xl w-[90%] max-w-md rounded-full border border-outline-variant/20 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        <Link to="/events" className={cn("flex flex-col items-center justify-center px-4 py-2 hover-target transition-all", path === '/events' ? 'text-primary' : 'text-on-surface-variant')}>
          <span className="material-symbols-outlined mb-1 text-[20px]">explore</span>
          <span className="font-metadata text-[10px] uppercase tracking-widest hidden">EXPLORE</span>
        </Link>
        <Link to="/" className={cn("flex flex-col items-center justify-center px-4 py-2 hover-target transition-all", path === '/' ? 'text-primary' : 'text-on-surface-variant')}>
          <span className="material-symbols-outlined mb-1 text-[20px]">home</span>
          <span className="font-metadata text-[10px] uppercase tracking-widest hidden">HOME</span>
        </Link>
        <Link to={user ? getDashboardPath() : '/auth'} className={cn("flex flex-col items-center justify-center rounded-full px-6 py-2 scale-110 shadow-lg shadow-primary/20 transition-all duration-200 hover-target", path.includes('/student') || path.includes('/organizer') || path.includes('/admin') ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface')}>
          <span className="material-symbols-outlined mb-1 text-[20px]" style={path.includes('/student') || path.includes('/organizer') || path.includes('/admin') ? { fontVariationSettings: "'FILL' 1" } : {}}>dashboard</span>
          <span className="font-metadata text-[8px] uppercase tracking-widest mt-1 hidden">DASHBOARD</span>
        </Link>
        <button onClick={handleAccountClick} className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-2 hover:text-primary transition-all hover-target">
          <span className="material-symbols-outlined mb-1 text-[20px]">{user ? 'logout' : 'login'}</span>
          <span className="font-metadata text-[10px] uppercase tracking-widest hidden">{user ? 'LOGOUT' : 'LOGIN'}</span>
        </button>
      </nav>
    </>
  );
};

function NavLink({ to, currentPath, children }: { to: string; currentPath: string; children: React.ReactNode }) {
  const isActive = currentPath === to || currentPath.startsWith(to + '/');
  return (
    <Link
      to={to}
      className={cn(
        'font-label-sm text-label-sm uppercase tracking-[0.2em] transition-all hover-target',
        isActive
          ? 'text-primary border-b border-primary pb-1 scale-95'
          : 'text-on-surface-variant hover:text-on-surface hover:opacity-70'
      )}
    >
      {children}
    </Link>
  );
}
