import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'gold';
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center border px-2.5 py-0.5 font-label-caps transition-colors uppercase',
          // Brutalist styling
          'rounded-none',
          {
            'border-transparent bg-primary text-on-primary': variant === 'default',
            'border-transparent bg-secondary text-on-secondary': variant === 'secondary',
            'border-grid-line bg-surface-container-highest text-on-surface': variant === 'outline',
            'border-transparent bg-error text-on-error': variant === 'destructive',
            'border-transparent bg-gold-accent text-charcoal-base': variant === 'gold',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';
