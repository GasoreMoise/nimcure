'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface AdminContextType {
  patients: any[];
  deliveries: any[];
  riders: any[];
  refreshData: () => Promise<void>;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType>({
  patients: [],
  deliveries: [],
  riders: [],
  refreshData: async () => {},
  loading: true
});

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchAllData = async () => {
    if (user?.role !== 'ADMIN') return;
    
    try {
      setLoading(true);
      const [patientsRes, deliveriesRes, ridersRes] = await Promise.all([
        fetch('/api/admin/patients'),
        fetch('/api/admin/deliveries'),
        fetch('/api/admin/riders')
      ]);

      const [patientsData, deliveriesData, ridersData] = await Promise.all([
        patientsRes.json(),
        deliveriesRes.json(),
        ridersRes.json()
      ]);

      setPatients(patientsData);
      setDeliveries(deliveriesData);
      setRiders(ridersData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAllData();
    }
  }, [user]);

  return (
    <AdminContext.Provider value={{ 
      patients, 
      deliveries, 
      riders, 
      refreshData: fetchAllData,
      loading 
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext); 