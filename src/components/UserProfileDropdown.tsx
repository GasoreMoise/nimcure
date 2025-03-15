'use client';

import { useState } from 'react';
import Image from 'next/image';

export function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3"
      >
        <span className="text-sm text-gray-700">Emmanuel Adigwe</span>
        <Image
          src="/avatar-placeholder.png"
          alt="Profile"
          width={32}
          height={32}
          className="rounded-full"
        />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
          <button
            onClick={() => {/* Add logout logic */}}
            className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
} 