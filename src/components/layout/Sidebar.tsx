import React from 'react';

export const Sidebar: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <aside className="w-64 border-r-4 border-grid-line bg-surface min-h-screen hidden md:block pt-32 p-6 shrink-0">
      <div className="flex flex-col gap-6 font-label-caps uppercase text-on-surface">
        {children}
      </div>
    </aside>
  );
};
