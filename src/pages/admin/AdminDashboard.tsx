import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useData } from '../../contexts/DataContext';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useData();

  const liveEventsCount = useMemo(() => {
    return events.filter(e => !e.isUnpublished).length;
  }, [events]);

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-on-primary">
      <Navbar />

      <main className="flex-grow pt-32 pb-32 px-6 md:px-16 relative">
        {/* Decorative Grid */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#2A2A2A_1px,transparent_1px),linear-gradient(to_bottom,#2A2A2A_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-4 border-b-4 border-grid-line pb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-error text-on-error font-label-caps px-4 py-2 border-2 border-grid-line shadow-[4px_4px_0_0_#2A2A2A] mb-4">
                <span className="w-2 h-2 bg-on-error animate-pulse border border-on-error"></span>
                PLATFORM ADMINISTRATION
              </div>
              <h1 className="font-display-hero text-5xl md:text-7xl text-on-surface uppercase tracking-tight">
                System Overview
              </h1>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" className="shadow-[4px_4px_0_0_#2A2A2A]">System Logs</Button>
              <Button className="bg-error text-on-error hover:bg-error-container hover:text-on-error shadow-[4px_4px_0_0_#2A2A2A]">Emergency Stop</Button>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Quick Stats */}
            <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              {[
                { label: 'Active Users', value: '1,245' }, // Mock stat
                { label: 'Live Events', value: liveEventsCount.toString() },
                { label: 'Total Events', value: events.length.toString() },
                { label: 'System Health', value: '99.9%' }
              ].map((stat, i) => (
                <Card key={i} className={`p-6 flex flex-col border-4 border-grid-line shadow-[8px_8px_0_0_#2A2A2A] bg-surface ${stat.label === 'Pending Approvals' ? 'border-primary' : ''}`}>
                  <span className="font-label-caps text-on-surface-variant uppercase border-b-2 border-grid-line pb-2 mb-4 tracking-widest">{stat.label}</span>
                  <span className={`font-display-hero text-5xl font-bold ${stat.label === 'Pending Approvals' ? 'text-primary' : 'text-on-surface'}`}>{stat.value}</span>
                </Card>
              ))}
            </div>

            {/* Moderation Queue */}
            <div className="col-span-1 md:col-span-8 space-y-6">
              <h2 className="font-subheadline-bold text-3xl uppercase border-l-8 border-error pl-4">Moderation Queue</h2>
              
              <div className="bg-surface border-4 border-grid-line shadow-[8px_8px_0_0_#2A2A2A] overflow-hidden">
                <table className="w-full text-left font-body-md border-collapse">
                  <thead className="bg-surface-dim">
                    <tr className="border-b-4 border-grid-line font-label-caps text-on-surface-variant uppercase tracking-widest">
                      <th className="p-4 border-r-2 border-grid-line">Entity</th>
                      <th className="p-4 border-r-2 border-grid-line">Type</th>
                      <th className="p-4 border-r-2 border-grid-line">Flag</th>
                      <th className="p-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 2).map((ev, i) => (
                      <tr key={ev.id} className="border-b-2 border-grid-line hover:bg-surface-bright transition-colors group">
                        <td className="p-4 border-r-2 border-grid-line font-subheadline-bold text-lg uppercase group-hover:text-primary transition-colors">{ev.title}</td>
                        <td className="p-4 border-r-2 border-grid-line text-on-surface-variant">Event</td>
                        <td className="p-4 border-r-2 border-grid-line"><span className="text-error font-label-caps uppercase border border-error px-2 py-1">Auto-Flag</span></td>
                        <td className="p-4 flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigate('/admin/moderation')}>Review</Button>
                        </td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-on-surface-variant uppercase font-label-caps tracking-widest">No pending items</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="col-span-1 md:col-span-4 space-y-6">
              <h2 className="font-subheadline-bold text-3xl uppercase border-l-8 border-primary pl-4">Quick Links</h2>
              
              <div className="flex flex-col gap-4">
                <Card interactive className="p-6 border-4 border-grid-line bg-surface flex items-center justify-between cursor-pointer" onClick={() => navigate('/admin/users')}>
                  <span className="font-subheadline-bold text-xl uppercase">User Management</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Card>
                <Card interactive className="p-6 border-4 border-grid-line bg-surface flex items-center justify-between cursor-pointer" onClick={() => navigate('/admin/moderation')}>
                  <span className="font-subheadline-bold text-xl uppercase">Event Moderation</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Card>
                <Card interactive className="p-6 border-4 border-grid-line bg-surface flex items-center justify-between cursor-pointer" onClick={() => navigate('/admin/settings')}>
                  <span className="font-subheadline-bold text-xl uppercase">Global Settings</span>
                  <span className="material-symbols-outlined">settings</span>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
