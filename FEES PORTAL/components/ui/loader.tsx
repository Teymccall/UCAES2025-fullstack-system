import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

export const DotSpinner: React.FC<LoaderProps> = ({ 
  size = 'md', 
  color = '#183153',
  className = '' 
}) => {
  const sizeMap = {
    sm: '1.5rem',
    md: '2.8rem', 
    lg: '4rem'
  };

  return (
    <div 
      className={`dot-spinner ${className}`}
      style={{
        '--uib-size': sizeMap[size],
        '--uib-color': color
      } as React.CSSProperties}
    >
      {[...Array(8)].map((_, i) => (
        <div key={i} className="dot-spinner__dot" />
      ))}
    </div>
  );
};

export const PageLoader: React.FC<LoaderProps> = ({ size = 'lg', color = '#183153' }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <DotSpinner size={size} color={color} />
        <p className="mt-4 text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
};

export const CardLoader: React.FC<LoaderProps> = ({ size = 'md', color = '#183153' }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <DotSpinner size={size} color={color} />
    </div>
  );
};

export const InlineLoader: React.FC<LoaderProps> = ({ size = 'sm', color = '#183153' }) => {
  return (
    <div className="flex items-center justify-center">
      <DotSpinner size={size} color={color} />
    </div>
  );
}; 