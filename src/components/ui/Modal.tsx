import React from 'react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-surface border-4 border-grid-line shadow-[16px_16px_0_0_#2A2A2A] w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b-4 border-grid-line bg-surface-dim">
          <h2 className="font-subheadline-bold text-2xl uppercase tracking-tight">{title}</h2>
          <button onClick={onClose} className="text-on-surface hover:text-error transition-colors p-1 border-2 border-transparent hover:border-error">
            <span className="material-symbols-outlined font-bold">close</span>
          </button>
        </div>
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  );
};
