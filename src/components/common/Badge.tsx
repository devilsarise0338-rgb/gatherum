import React from 'react';
import { EventColorTheme } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  theme?: EventColorTheme;
  variant?: 'solid' | 'outline' | 'subtle';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  theme = 'amber', 
  variant = 'subtle',
  className = '' 
}) => {
  const themeStyles = {
    amber: {
      solid: 'bg-[#C9762F] text-white',
      outline: 'border border-[#C9762F] text-[#C9762F]',
      subtle: 'bg-[#F9EFE6] text-[#A3591B] border border-[#EED7C5]',
    },
    emerald: {
      solid: 'bg-[#2D5A27] text-white',
      outline: 'border border-[#2D5A27] text-[#2D5A27]',
      subtle: 'bg-[#EBF2EA] text-[#22451E] border border-[#D0E2CE]',
    },
    terracotta: {
      solid: 'bg-[#A64B2A] text-white',
      outline: 'border border-[#A64B2A] text-[#A64B2A]',
      subtle: 'bg-[#F9ECE7] text-[#843519] border border-[#EFCEC1]',
    },
    cobalt: {
      solid: 'bg-[#1E3A8A] text-white',
      outline: 'border border-[#1E3A8A] text-[#1E3A8A]',
      subtle: 'bg-[#EFF3FF] text-[#1E3A8A] border border-[#C7D2FE]',
    },
    burgundy: {
      solid: 'bg-[#4A0E0E] text-white',
      outline: 'border border-[#4A0E0E] text-[#4A0E0E]',
      subtle: 'bg-[#F8EAEA] text-[#4A0E0E] border border-[#E8C4C4]',
    }
  };

  const style = themeStyles[theme][variant];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${style} ${className}`}>
      {children}
    </span>
  );
};
