'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { signIn, signOut, useSession, getSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string>;
  logout: () => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user) {
      const savedUserData = localStorage.getItem('userData');
      const savedAvatar = localStorage.getItem('userAvatar');
      
      const userData = savedUserData ? JSON.parse(savedUserData) : null;
      
      setUser({
        id: session.user.id,
        email: session.user.email!,
        role: session.user.role,
        firstName: session.user.name?.split(' ')[0],
        lastName: session.user.name?.split(' ')[1],
        avatar: savedAvatar || userData?.avatar || null,
        ...userData
      });
      setIsLoading(false);
    } else {
      setUser(null);
      setIsLoading(status === 'loading');
    }
  }, [session, status]);

  // Add this console.log to debug
  console.log('Current user:', user);
  console.log('Current session:', session);

  const login = async (email: string, password: string): Promise<string> => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      // Wait for session to be updated
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user is admin
      const session = await getSession();
      if (session?.user?.role === 'ADMIN') {
        return '/admin/dashboard';
      }
      return '/dashboard';
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/admin/dashboard'
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      // Update user state with new data
      const updatedUser = user ? { ...user, ...data } : null;
      setUser(updatedUser);

      // Store in localStorage
      if (updatedUser) {
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }

      // If there's an avatar, store it separately to handle large strings
      if (data.avatar) {
        localStorage.setItem('userAvatar', data.avatar);
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      adminLogin,
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
