'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAdmin } from './AdminContext';
import { useAuth } from './AuthContext';

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
  loading?: boolean;
  addDelivery: (delivery: Omit<Delivery, 'id'>) => Promise<void>;
  updateDelivery: (id: string, delivery: Partial<Delivery>) => Promise<void>;
  deleteDelivery: (id: string) => Promise<void>;
  getDeliveriesByPatient: (patientId: string) => Delivery[];
  updateDeliveryPayment: (id: string, status: 'paid' | 'unpaid') => Promise<void>;
  updateDeliveryStatus: (id: string, status: DeliveryStatus) => Promise<void>;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export function DeliveryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { isAdmin: adminFromAdminContext } = useAdmin();
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

  const addDelivery = async (delivery: Omit<Delivery, 'id'>) => {
    try {
      const newId = Math.random().toString(36).substr(2, 9);
      setDeliveries(prevDeliveries => [
        ...prevDeliveries,
        { ...delivery, id: newId } as Delivery
      ]);
    } catch (error) {
      console.error('Failed to add delivery:', error);
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

  const updateDeliveryPayment = async (id: string, status: 'paid' | 'unpaid') => {
    if (!isAdmin) {
      throw new Error('Only administrators can update payment status');
    }
    // Existing payment update logic
  };

  const updateDeliveryStatus = async (id: string, status: DeliveryStatus) => {
    if (!isAdmin) {
      throw new Error('Only administrators can update delivery status');
    }
    // Existing status update logic
  };

  return (
    <DeliveryContext.Provider value={{
      deliveries,
      addDelivery,
      updateDelivery,
      deleteDelivery,
      getDeliveriesByPatient,
      updateDeliveryPayment,
      updateDeliveryStatus
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
