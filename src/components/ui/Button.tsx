import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-subheadline-bold transition-all duration-200 uppercase tracking-wider',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:opacity-50 disabled:pointer-events-none transform-gpu active:scale-[0.98]',
          
          // Brutalist styles: No soft rounding, sharp edges, solid borders
          {
            'bg-primary text-on-primary border-2 border-transparent hover:bg-primary-fixed-dim': variant === 'primary',
            'bg-surface-container-highest text-on-surface border-2 border-grid-line hover:border-outline-variant hover:bg-surface-bright': variant === 'secondary',
            'bg-transparent text-on-surface border-2 border-grid-line hover:bg-surface-container hover:text-primary': variant === 'outline',
            'bg-transparent text-on-surface hover:bg-surface-container': variant === 'ghost',
            
            'h-9 px-4 text-xs': size === 'sm',
            'h-12 px-8 text-sm': size === 'md',
            'h-16 px-12 text-base': size === 'lg',
            'h-12 w-12': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
