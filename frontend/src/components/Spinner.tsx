import React from 'react';

interface SpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Spinner: React.FC<SpinnerProps> = ({ message, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className={`${sizeClasses[size]} relative`}>
        <div className="absolute inset-0 rounded-full border-4 border-purple-200 dark:border-purple-900"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-purple-600 dark:border-t-purple-400 animate-spin"></div>
      </div>
      {message && (
        <p className="text-gray-600 dark:text-gray-400 font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default Spinner;