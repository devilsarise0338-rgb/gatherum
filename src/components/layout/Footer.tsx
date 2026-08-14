import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t-4 border-grid-line bg-surface py-12 px-6 md:px-16 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div>
          <div className="font-display-hero text-3xl font-bold text-primary tracking-tighter uppercase mb-4">GATHERUM</div>
          <p className="font-body-md text-on-surface-variant max-w-sm">
            Curating exceptional experiences. Brutalist, uncompromising event management.
          </p>
        </div>
        
        <div className="flex gap-8 font-label-caps uppercase text-on-surface-variant">
          <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">About</a>
          <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">Terms</a>
          <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">Privacy</a>
          <a href="#" className="hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">Support</a>
        </div>
      </div>
    </footer>
  );
};
