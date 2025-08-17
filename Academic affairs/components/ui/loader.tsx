import React from 'react';

interface LoaderProps {
  size?: 'tiny' | 'small' | 'default';
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({ size = 'default', className = '' }) => {
  const sizeClass = {
    tiny: 'loading-tiny',
    small: 'loading-small',
    default: 'loading'
  }[size];

  return (
    <div className={`${sizeClass} ${className}`}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export default Loader; 