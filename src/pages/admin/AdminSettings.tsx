import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';

const AdminSettings: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-on-primary">
      <Navbar />

      <main className="flex-grow pt-32 pb-32 px-6 md:px-16 relative">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#2A2A2A_1px,transparent_1px),linear-gradient(to_bottom,#2A2A2A_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <header className="mb-12 border-b-4 border-grid-line pb-8">
            <div className="inline-flex items-center gap-2 bg-error text-on-error font-label-caps px-4 py-2 border-2 border-grid-line shadow-[4px_4px_0_0_#2A2A2A] mb-4">
              <span className="w-2 h-2 bg-on-error animate-pulse border border-on-error"></span>
              ADMINISTRATION
            </div>
            <h1 className="font-display-hero text-5xl md:text-7xl text-on-surface uppercase tracking-tight">
              Platform Settings
            </h1>
          </header>

          <div className="space-y-8 bg-surface border-4 border-grid-line p-8 shadow-[8px_8px_0_0_#2A2A2A]">
            <div>
              <h2 className="font-subheadline-bold text-2xl uppercase border-l-4 border-error pl-4 mb-4">Danger Zone</h2>
              <p className="font-body-md text-on-surface-variant mb-6">
                Irreversible platform-wide actions. Proceed with caution.
              </p>
              <div className="flex gap-4">
                <Button className="bg-error text-on-error shadow-[4px_4px_0_0_#2A2A2A] hover:bg-error-container hover:text-on-error">Purge Cache</Button>
                <Button className="bg-error text-on-error shadow-[4px_4px_0_0_#2A2A2A] hover:bg-error-container hover:text-on-error">Enable Maintenance Mode</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
