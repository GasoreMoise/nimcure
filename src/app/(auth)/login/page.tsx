'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthLayout from '@/components/auth/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [needsVerification, setNeedsVerification] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    setLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (error: any) {
      if (error.needsVerification) {
        setNeedsVerification(true);
        setError('Please verify your email before logging in');
      } else {
        setError(error.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      if (response.ok) {
        setError('Verification email sent. Please check your inbox.');
      } else {
        setError('Failed to send verification email. Please try again.');
      }
    } catch (error) {
      setError('Failed to send verification email. Please try again.');
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Logo */}
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
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-600">
            Sign in to continue to Nimcure
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm bg-red-50 rounded-lg" role="alert">
            <p className="text-red-500">{error}</p>
            {needsVerification && (
              <button
                onClick={handleResendVerification}
                className="mt-2 text-blue-600 hover:text-blue-500"
              >
                Resend verification email
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="h-12"
              aria-label="Email Address"
              autoComplete="email"
              disabled={loading}
            />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-12"
                aria-label="Password"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-700"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-12"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-700">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}