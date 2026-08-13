import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'danger';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center border px-2 py-0.5 text-xs font-medium font-body transition-colors",
        {
          'border-transparent bg-gatherum-amber text-gatherum-base': variant === 'default',
          'border-transparent bg-gatherum-surface-secondary text-gatherum-text-light': variant === 'secondary',
          'border-gatherum-border text-gatherum-text-light': variant === 'outline',
          'border-transparent bg-gatherum-burgundy text-white': variant === 'danger',
        },
        className
      )}
      {...props}
    />
  );
}
