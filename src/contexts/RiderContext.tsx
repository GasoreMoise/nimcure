'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalDeliveries: number;
  status: 'active' | 'inactive' | 'busy';
  avatar?: string;
}

interface RiderContextType {
  riders: Rider[];
  updateRider: (id: string, data: Partial<Rider>) => void;
  addRider: (rider: Rider) => void;
  getRider: (id: string) => Rider | undefined;
}

const RiderContext = createContext<RiderContextType | undefined>(undefined);

// Mock initial data
const initialRiders: Rider[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+2348123456789',
    rating: 4.8,
    totalDeliveries: 156,
    status: 'active',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+2348123456790',
    rating: 4.9,
    totalDeliveries: 203,
    status: 'busy',
  },
];

export function RiderProvider({ children }: { children: ReactNode }) {
  const [riders, setRiders] = useState<Rider[]>(initialRiders);

  const updateRider = (id: string, data: Partial<Rider>) => {
    setRiders(currentRiders =>
      currentRiders.map(rider =>
        rider.id === id ? { ...rider, ...data } : rider
      )
    );
  };

  const addRider = (rider: Rider) => {
    setRiders(currentRiders => [...currentRiders, rider]);
  };

  const getRider = (id: string) => {
    return riders.find(rider => rider.id === id);
  };

  return (
    <RiderContext.Provider value={{ riders, updateRider, addRider, getRider }}>
      {children}
    </RiderContext.Provider>
  );
}

export function useRiders() {
  const context = useContext(RiderContext);
  if (context === undefined) {
    throw new Error('useRiders must be used within a RiderProvider');
  }
  return context;
}
