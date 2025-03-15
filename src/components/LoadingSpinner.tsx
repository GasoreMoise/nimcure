import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function LoadingSpinner({ size = 'md', showText = true }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Outer rotating ring */}
        <div className="absolute inset-0 rounded-full border-4 border-blue-200 opacity-25" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        
        {/* Inner pulsing circle */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 animate-pulse" />
        
        {/* Center dot */}
        <div className="absolute inset-[45%] rounded-full bg-white animate-ping" />
      </div>

      {showText && (
        <div className="mt-4 text-center">
          <div className="text-xl font-semibold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent animate-pulse">
            NIMCURE
          </div>
          <div className="text-sm text-gray-500 mt-1 font-mono tracking-wider animate-pulse">
            Loading...
          </div>
        </div>
      )}
    </div>
  );
}
