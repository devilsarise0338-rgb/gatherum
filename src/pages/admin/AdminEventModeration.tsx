import React from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { Table } from '../../components/ui/Table';
import { useData } from '../../contexts/DataContext';
import { Button } from '../../components/ui/Button';

const AdminEventModeration: React.FC = () => {
  const { events, deleteEvent, unpublishEvent } = useData();

  const handleToggleStatus = (id: string, isUnpublished: boolean) => {
    unpublishEvent(id, !isUnpublished);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this event permanently?")) {
      deleteEvent(id);
    }
  };

  const tableData = events.map(ev => ({
    id: ev.id,
    event: ev.title,
    organizer: ev.organizerId || 'Unknown',
    status: ev.isUnpublished ? 'Draft/Hidden' : 'Live',
    actions: (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => handleToggleStatus(ev.id, !!ev.isUnpublished)}>
          {ev.isUnpublished ? 'Publish' : 'Unpublish'}
        </Button>
        <Button size="sm" className="bg-error hover:bg-error-container text-on-error shadow-[4px_4px_0_0_#2A2A2A]" onClick={() => handleDelete(ev.id)}>
          Delete
        </Button>
      </div>
    )
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-on-primary">
      <Navbar />

      <main className="flex-grow pt-32 pb-32 px-6 md:px-16 relative">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_right,#2A2A2A_1px,transparent_1px),linear-gradient(to_bottom,#2A2A2A_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <header className="mb-12 flex flex-col md:flex-row justify-between items-end gap-4 border-b-4 border-grid-line pb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-error text-on-error font-label-caps px-4 py-2 border-2 border-grid-line shadow-[4px_4px_0_0_#2A2A2A] mb-4">
                <span className="w-2 h-2 bg-on-error animate-pulse border border-on-error"></span>
                ADMINISTRATION
              </div>
              <h1 className="font-display-hero text-5xl md:text-7xl text-on-surface uppercase tracking-tight">
                Event Moderation
              </h1>
            </div>
          </header>

          <div className="space-y-8">
            <h2 className="font-subheadline-bold text-3xl uppercase border-l-8 border-error pl-4">All Events</h2>
            <Table 
              columns={[
                { key: 'event', header: 'Event' },
                { key: 'organizer', header: 'Organizer' },
                { key: 'status', header: 'Status' },
                { key: 'actions', header: 'Actions' }
              ]}
              data={tableData}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminEventModeration;
