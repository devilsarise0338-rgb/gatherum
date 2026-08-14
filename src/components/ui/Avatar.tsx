import React from 'react';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ src, alt, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} overflow-hidden border-2 border-grid-line shrink-0 shadow-[2px_2px_0_0_#2A2A2A] bg-surface`}>
      <img src={src} alt={alt} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
    </div>
  );
};
