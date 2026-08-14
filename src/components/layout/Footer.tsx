import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full relative overflow-hidden pt-section-gap pb-12 bg-background border-t border-outline-variant/10 flex flex-col items-center gap-12 px-margin-desktop mt-auto z-10">
      <div className="flex gap-8 z-10 font-metadata text-metadata uppercase tracking-[0.3em]">
        <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors hover-target">PRIVACY</Link>
        <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors hover-target">TERMS</Link>
        <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors hover-target">SHIPPING</Link>
        <Link to="#" className="text-on-surface-variant hover:text-primary transition-colors hover-target">CONTACT</Link>
      </div>
      <p className="font-metadata text-metadata uppercase tracking-[0.3em] text-on-surface-variant z-10 text-center">
        © 2024 GATHERUM NOIR. ALL RIGHTS RESERVED.
      </p>
      <div className="font-display-xl text-display-xl opacity-5 pointer-events-none absolute bottom-0 left-0 w-full text-center leading-none text-on-surface select-none whitespace-nowrap overflow-hidden">
        GATHERUM NOIR
      </div>
    </footer>
  );
};
