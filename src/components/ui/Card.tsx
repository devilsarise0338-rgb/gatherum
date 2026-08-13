import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  className = '',
  interactive = false,
  glass = false,
  children,
  ...props
}, ref) => {
  const baseStyles = 'rounded-xl overflow-hidden';
  const bgStyles = glass 
    ? 'glass-panel' 
    : 'bg-surface-2 border border-border-subtle shadow-card';
  const interactionStyles = interactive 
    ? 'interactive-card cursor-pointer hover:border-border-strong' 
    : '';
  
  return (
    <div 
      ref={ref}
      className={`${baseStyles} ${bgStyles} ${interactionStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});
Card.displayName = 'Card';
