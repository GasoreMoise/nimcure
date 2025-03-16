'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [loading, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="text-center space-y-8">
        {/* Animated Logo Container */}
        <div className="relative">
          {/* Pulse Effect */}
          <div className="absolute inset-0 rounded-full animate-ping-slow bg-blue-500/20" />
          <div className="absolute inset-0 rounded-full animate-pulse bg-blue-400/20" />
          
          {/* Rotating Border */}
          <div className="relative w-32 h-32 mx-auto rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 animate-spin-slow" />
          
          {/* Inner Content */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 shadow-lg flex items-center justify-center">
              <svg 
                className="w-12 h-12 text-white animate-pulse" 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <path 
                  d="M12 4L3 8L12 12L21 8L12 4Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M3 16L12 20L21 16" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="opacity-60"
                />
                <path 
                  d="M3 12L12 16L21 12" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="opacity-30"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Animated Text */}
        <div className="relative">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 animate-gradient">
            NIMCURE
          </h1>
          <div className="mt-2 flex justify-center gap-1">
            {['I', 'N', 'I', 'T', 'I', 'A', 'L', 'I', 'Z', 'I', 'N', 'G'].map((letter, index) => (
              <span
                key={index}
                className="text-blue-400 text-sm font-mono animate-bounce"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>

        {/* Loading Bars */}
        <div className="space-y-2 w-48 mx-auto">
          <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-progress-slow rounded-full" />
          </div>
          <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 animate-progress-medium rounded-full" />
          </div>
          <div className="h-1 w-full bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-blue-300 animate-progress-fast rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
