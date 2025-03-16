'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface Rider {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  rating: number;
  totalDeliveries: number;
  successRate: number;
  vehicleType: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RiderContextType {
  riders: Rider[];
  loading: boolean;
  error: string | null;
  refreshRiders: () => Promise<void>;
  addRider: (rider: Omit<Rider, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRider: (id: string, rider: Partial<Rider>) => Promise<void>;
}

const RiderContext = createContext<RiderContextType | undefined>(undefined);

export function RiderProvider({ children }: { children: React.ReactNode }) {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshRiders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/riders');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to fetch riders');
      }
      
      const data = await response.json();
      setRiders(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch riders';
      setError(errorMessage);
      console.error('Error fetching riders:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addRider = async (rider: Omit<Rider, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/riders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rider),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to add rider');
      }

      await refreshRiders();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add rider';
      throw new Error(errorMessage);
    }
  };

  const updateRider = async (id: string, rider: Partial<Rider>) => {
    try {
      const response = await fetch(`/api/riders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rider),
      });
      if (!response.ok) throw new Error('Failed to update rider');
      await refreshRiders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rider');
      throw err;
    }
  };

  useEffect(() => {
    refreshRiders();
  }, []);

  const value = {
    riders,
    loading,
    error,
    refreshRiders,
    addRider,
    updateRider,
  };

  return <RiderContext.Provider value={value}>{children}</RiderContext.Provider>;
}

export function useRiders() {
  const context = useContext(RiderContext);
  if (context === undefined) {
    throw new Error('useRiders must be used within a RiderProvider');
  }
  return context;
}
