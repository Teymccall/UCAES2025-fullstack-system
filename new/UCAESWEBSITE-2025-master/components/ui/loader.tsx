"use client";

import { cn } from '@/lib/utils';

interface LoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loader({ className, size = 'md' }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-11 h-11',
    lg: 'w-16 h-16'
  };

  return (
    <div className={cn("dot-spinner", sizeClasses[size], className)}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="dot-spinner__dot" />
      ))}
    </div>
  );
}