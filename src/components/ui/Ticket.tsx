import React from 'react';

interface TicketProps {
  eventName: string;
  date: string;
  location: string;
  ticketId: string;
  attendeeName: string;
  qrCodeUrl?: string;
}

export const Ticket: React.FC<TicketProps> = ({ eventName, date, location, ticketId, attendeeName, qrCodeUrl }) => {
  return (
    <div className="flex flex-col md:flex-row border-4 border-grid-line shadow-[8px_8px_0_0_#2A2A2A] bg-surface max-w-4xl mx-auto w-full">
      
      {/* Left / Top side: Event Info */}
      <div className="flex-grow p-8 flex flex-col justify-between border-b-4 md:border-b-0 md:border-r-4 border-grid-line border-dashed md:border-solid">
        <div>
          <div className="inline-flex items-center gap-2 bg-primary text-on-primary font-label-caps px-3 py-1 border-2 border-grid-line shadow-[2px_2px_0_0_#2A2A2A] mb-6 uppercase tracking-widest text-xs">
            ADMIT ONE
          </div>
          <h2 className="font-display-hero text-4xl uppercase tracking-tight text-on-surface mb-2">{eventName}</h2>
          <p className="font-body-lg text-on-surface-variant border-l-4 border-primary pl-4 my-6">
            {date} <br />
            {location}
          </p>
        </div>
        
        <div className="flex gap-12 border-t-2 border-grid-line pt-4">
          <div>
            <p className="font-label-caps text-on-surface-variant uppercase text-xs mb-1">Attendee</p>
            <p className="font-subheadline-bold text-lg uppercase">{attendeeName}</p>
          </div>
          <div>
            <p className="font-label-caps text-on-surface-variant uppercase text-xs mb-1">Ticket ID</p>
            <p className="font-subheadline-bold text-lg uppercase text-primary">{ticketId}</p>
          </div>
        </div>
      </div>

      {/* Right / Bottom side: QR Code */}
      <div className="md:w-64 p-8 flex flex-col items-center justify-center bg-surface-dim shrink-0">
        <div className="w-48 h-48 border-4 border-grid-line bg-background flex items-center justify-center mb-4">
          {qrCodeUrl ? (
             <img src={qrCodeUrl} alt="QR Code" className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-6xl text-grid-line">qr_code_2</span>
          )}
        </div>
        <p className="font-label-caps text-center uppercase tracking-widest text-xs text-on-surface-variant">Scan for entry</p>
      </div>

    </div>
  );
};
