'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Delivery {
  id: string;
  patientId: string;
  date: string;
  items: string[];
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  riderId: string;
  riderName: string;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryContextType {
  deliveries: Delivery[];
  updateDelivery: (id: string, data: Partial<Delivery>) => void;
  addDelivery: (delivery: Delivery) => void;
  getDeliveriesByPatient: (patientId: string) => Delivery[];
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

// Mock initial data
const initialDeliveries: Delivery[] = [
  {
    id: '1',
    patientId: '1',
    date: '2025-03-14',
    items: ['Paracetamol', 'Vitamin C'],
    status: 'delivered',
    riderId: '1',
    riderName: 'John Doe',
    createdAt: '2025-03-14T08:00:00Z',
    updatedAt: '2025-03-14T10:30:00Z',
  },
  {
    id: '2',
    patientId: '1',
    date: '2025-03-01',
    items: ['Amoxicillin'],
    status: 'delivered',
    riderId: '2',
    riderName: 'Jane Smith',
    createdAt: '2025-03-01T09:00:00Z',
    updatedAt: '2025-03-01T11:45:00Z',
  },
  {
    id: '3',
    patientId: '1',
    date: '2025-03-15',
    items: ['Insulin', 'Syringes'],
    status: 'in_transit',
    riderId: '1',
    riderName: 'John Doe',
    createdAt: '2025-03-15T07:30:00Z',
    updatedAt: '2025-03-15T08:15:00Z',
  },
];

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);

  const updateDelivery = (id: string, data: Partial<Delivery>) => {
    setDeliveries(currentDeliveries =>
      currentDeliveries.map(delivery =>
        delivery.id === id ? { ...delivery, ...data, updatedAt: new Date().toISOString() } : delivery
      )
    );
  };

  const addDelivery = (delivery: Delivery) => {
    setDeliveries(currentDeliveries => [...currentDeliveries, delivery]);
  };

  const getDeliveriesByPatient = (patientId: string) => {
    return deliveries.filter(delivery => delivery.patientId === patientId);
  };

  return (
    <DeliveryContext.Provider value={{ deliveries, updateDelivery, addDelivery, getDeliveriesByPatient }}>
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
