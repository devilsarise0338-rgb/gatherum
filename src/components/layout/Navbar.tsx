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

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl rounded-none border-2 border-grid-line z-50 shadow-[0px_10px_30px_rgba(0,0,0,0.5)] bg-surface/90 backdrop-blur-md">
      <div className="flex justify-between items-center px-8 py-4">
        <Link to="/" className="font-display-hero text-subheadline-bold tracking-tighter text-primary uppercase">
          Gatherum
        </Link>
        <div className="hidden md:flex gap-8 items-center">
          <NavLink to="/events" currentPath={path}>Explore</NavLink>
          {user && user.role !== 'admin' && user.role !== 'organizer' && (
             <NavLink to="/volunteer" currentPath={path}>Volunteer</NavLink>
          )}
          {user && (user.role === 'organizer' || user.role === 'admin') && (
            <NavLink to="/organizer" currentPath={path}>Host</NavLink>
          )}
          {user && (
            <NavLink to={getDashboardPath()} currentPath={path}>Dashboard</NavLink>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:inline-block [perspective:1000px] group">
            {user ? (
              <button 
                onClick={() => logout()}
                className="relative flex items-center justify-center text-on-surface-variant hover:text-error transition-all duration-300 group-hover:[transform:rotateX(10deg)_rotateY(10deg)] group-active:scale-95 transform-gpu [transform-style:preserve-3d] px-6 py-2 rounded-none overflow-hidden bg-surface-container-low/50 border-2 border-transparent hover:border-grid-line uppercase font-label-caps"
              >
                <div className="absolute inset-0 bg-surface-container-high opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <span className="relative z-10 text-body-md">Logout</span>
              </button>
            ) : (
              <button 
                onClick={() => navigate('/auth')}
                className="relative flex items-center justify-center text-primary hover:text-primary transition-all duration-300 group-hover:[transform:rotateX(10deg)_rotateY(10deg)] group-active:scale-95 transform-gpu [transform-style:preserve-3d] px-6 py-2 rounded-none overflow-hidden bg-surface-container-low/50 border-2 border-primary hover:border-grid-line uppercase font-label-caps"
              >
                <div className="absolute inset-0 bg-surface-container-high opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <span className="relative z-10 text-body-md">Login</span>
              </button>
            )}
          </div>
          <div className="md:hidden inline-block group">
            <button className="relative flex items-center justify-center text-on-surface-variant p-2 border-2 border-grid-line rounded-none bg-surface-container-low/50 uppercase">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

function NavLink({ to, currentPath, children }: { to: string; currentPath: string; children: React.ReactNode }) {
  const isActive = currentPath === to || currentPath.startsWith(to + '/');
  return (
    <Link
      to={to}
      className={cn(
        'transition-colors duration-300 uppercase font-label-caps tracking-widest',
        isActive
          ? 'text-primary border-b-2 border-primary pb-1'
          : 'text-on-surface-variant hover:text-primary'
      )}
    >
      {children}
    </Link>
  );
}
