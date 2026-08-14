import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 w-full">
        {label && (
          <label className="font-label-caps text-on-surface-variant uppercase tracking-widest text-xs">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full border-2 border-grid-line bg-surface-container-lowest px-3 py-2 font-body-md text-on-surface ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50',
            'rounded-none transition-colors duration-200',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';
