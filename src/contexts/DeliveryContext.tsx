'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export type DeliveryStatus = 'pending' | 'in_progress' | 'delivered' | 'failed';

interface Rider {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  totalDeliveries: number;
  isActive: boolean;
  phone: string;
  email: string;
  currentLocation?: {
    lat: number;
    lng: number;
    lastUpdated: string;
  };
}

export interface Delivery {
  id: string;
  packageCode: string;
  qrCode?: string;
  patientId?: string;
  patientName?: string;
  items: string;
  date: string;
  status: 'unassigned' | 'pending' | 'in_progress' | 'delivered' | 'failed';
  paymentStatus: 'unpaid' | 'paid';
  location: string;
  riderId: string;
  riderName: string;
  rider?: {
    phone: string;
    rating: number;
    vehicleType: string;
    successRate: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  tracking: {
    estimatedArrival: string;
    status: string;
    lastUpdated: string;
    responseTimeout?: string;
  };
}

interface DeliveryContextType {
  deliveries: Delivery[];
  addDelivery: (delivery: Delivery) => Promise<void>;
  updateDelivery: (id: string, delivery: Partial<Delivery>) => Promise<void>;
  deleteDelivery: (id: string) => Promise<void>;
  getDeliveriesByPatient: (patientId: string) => Delivery[];
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export function DeliveryProvider({ children }: { children: React.ReactNode }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>(() => {
    // Initialize from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('deliveries');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (err) {
          console.error('Failed to parse saved deliveries:', err);
        }
      }
    }
    return [];
  });

  // Save to localStorage whenever deliveries change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('deliveries', JSON.stringify(deliveries));
    }
  }, [deliveries]);

  const addDelivery = async (delivery: Delivery) => {
    try {
      setDeliveries(prevDeliveries => {
        // Remove old delivery if exists
        const filtered = prevDeliveries.filter(d => d.id !== delivery.id);
        // Add updated delivery
        return [...filtered, delivery];
      });
    } catch (error) {
      console.error('Failed to update delivery:', error);
      throw error;
    }
  };

  const updateDelivery = async (id: string, updates: Partial<Delivery>) => {
    setDeliveries(prev => {
      const updated = prev.map(delivery =>
        delivery.id === id
          ? { ...delivery, ...updates, updatedAt: new Date().toISOString() }
          : delivery
      );
      localStorage.setItem('deliveries', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteDelivery = async (id: string) => {
    setDeliveries(prev => {
      const updated = prev.filter(delivery => delivery.id !== id);
      localStorage.setItem('deliveries', JSON.stringify(updated));
      return updated;
    });
  };

  const getDeliveriesByPatient = (patientId: string) => {
    return deliveries.filter(delivery => delivery.patientId === patientId);
  };

  return (
    <DeliveryContext.Provider value={{
      deliveries,
      addDelivery,
      updateDelivery,
      deleteDelivery,
      getDeliveriesByPatient
    }}>
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDeliveries() {
  const context = useContext(DeliveryContext);
  if (context === undefined) {
    throw new Error('useDeliveries must be used within a DeliveryProvider');
  }
  return context;
}
