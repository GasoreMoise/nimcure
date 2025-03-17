'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export type RiderStatus = 'available' | 'on_delivery' | 'offline';

export interface Rider {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: RiderStatus;
  rating: number;
  totalRatings: number;
  ratingHistory?: {
    rating: number;
    date: string;
  }[];
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

  const updateRider = async (id: string, updatedRider: Partial<Rider>) => {
    try {
      const response = await fetch(`/api/riders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedRider),
      });

      if (!response.ok) {
        throw new Error('Failed to update rider');
      }

      // Update local state
      setRiders(prevRiders =>
        prevRiders.map(rider =>
          rider.id === id ? { ...rider, ...updatedRider } : rider
        )
      );

      return await response.json();
    } catch (error) {
      console.error('Error updating rider:', error);
      throw error;
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

export const useRiders = () => {
  const context = useContext(RiderContext);
  if (context === undefined) {
    throw new Error('useRiders must be used within a RiderProvider');
  }
  return { ...context, updateRider: context.updateRider };
};
