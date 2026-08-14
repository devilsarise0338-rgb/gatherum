import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, highlight }) => {
  return (
    <div className={`p-6 flex flex-col border-4 border-grid-line shadow-[8px_8px_0_0_#2A2A2A] bg-surface ${highlight ? 'border-primary' : ''}`}>
      <span className="font-label-caps text-on-surface-variant uppercase border-b-2 border-grid-line pb-2 mb-4 tracking-widest">{label}</span>
      <span className={`font-display-hero text-5xl font-bold ${highlight ? 'text-primary' : 'text-on-surface'}`}>{value}</span>
    </div>
  );
};
