'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error();
      setStatus('success');
    } catch (error) {
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="flex justify-center">
          <Image
            src="/logo.svg"
            alt="Nimcure Logo"
            width={48}
            height={48}
            priority
            className="h-12 w-12"
          />
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900">Reset password</h1>
          <p className="text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {status === 'success' ? (
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600">
              If an account exists with this email, you'll receive password reset instructions shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {status === 'error' && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-lg">
                Failed to send reset instructions. Please try again.
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send reset instructions'}
            </button>

            <div className="text-center">
              <Link 
                href="/login" 
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Return to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
} 