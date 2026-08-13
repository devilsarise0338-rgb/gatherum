import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'glass' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-sans font-medium rounded-lg transition-all duration-200 outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 focus:ring-offset-surface-1';
  
  const variants = {
    primary: 'bg-accent text-white shadow-glow hover:brightness-110 active:scale-95 border border-white/10',
    secondary: 'bg-surface-2 text-ink hover:bg-surface-3 border border-border-strong active:scale-95',
    glass: 'glass-panel text-ink hover:bg-white/10 active:scale-95',
    ghost: 'bg-transparent text-ink hover:bg-surface-2 active:scale-95',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  const activeClasses = `${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed active:scale-100' : ''} ${className}`;

  return (
    <button ref={ref} className={activeClasses} disabled={disabled || isLoading} {...props}>
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon}
      <span className="truncate">{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
});
Button.displayName = 'Button';
