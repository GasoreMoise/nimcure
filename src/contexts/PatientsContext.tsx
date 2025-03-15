'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Patient {
  id: string;
  hospitalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
  location: string;
  nextDeliveryDate: string;
  paymentStatus: 'paid' | 'pending';
}

interface PatientsContextType {
  patients: Patient[];
  updatePatient: (id: string, data: Partial<Patient>) => void;
  addPatient: (patient: Patient) => void;
  getPatient: (id: string) => Patient | undefined;
}

const PatientsContext = createContext<PatientsContextType | undefined>(undefined);

// Mock initial data
const initialPatients: Patient[] = [
  {
    id: '1',
    hospitalId: 'HOS-2020-167',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+234-7084-2920',
    status: 'Due & Past',
    location: 'Lagos, Nigeria',
    nextDeliveryDate: '2020-09-12',
    paymentStatus: 'paid'
  },
  {
    id: '2',
    hospitalId: 'HOS-2020-168',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '+234-7084-2920',
    status: 'Completed',
    location: 'Abuja, Nigeria',
    nextDeliveryDate: '2020-09-12',
    paymentStatus: 'paid'
  },
  {
    id: '3',
    hospitalId: 'HOS-2020-169',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.j@example.com',
    phone: '+234-7084-2920',
    status: 'Due & Elapsed',
    location: 'Port Harcourt, Nigeria',
    nextDeliveryDate: '2020-09-12',
    paymentStatus: 'pending'
  },
  {
    id: '4',
    hospitalId: 'HOS-2020-170',
    firstName: 'Sarah',
    lastName: 'Williams',
    email: 'sarah.w@example.com',
    phone: '+234-7084-2920',
    status: 'Assigned',
    location: 'Kano, Nigeria',
    nextDeliveryDate: '2020-09-12',
    paymentStatus: 'pending'
  },
  {
    id: '5',
    hospitalId: 'WH/H/929',
    firstName: 'Michael',
    lastName: 'Adebola',
    email: 'michael@example.com',
    phone: '+234-7084-2920',
    status: 'Assigned',
    location: 'VI Lagos',
    nextDeliveryDate: '2020-09-12',
    paymentStatus: 'pending'
  }
];

export function PatientsProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);

  const updatePatient = (id: string, data: Partial<Patient>) => {
    setPatients(currentPatients =>
      currentPatients.map(patient =>
        patient.id === id ? { ...patient, ...data } : patient
      )
    );
  };

  const addPatient = (patient: Patient) => {
    setPatients(currentPatients => [...currentPatients, patient]);
  };

  const getPatient = (id: string) => {
    return patients.find(patient => patient.id === id);
  };

  return (
    <PatientsContext.Provider value={{ patients, updatePatient, addPatient, getPatient }}>
      {children}
    </PatientsContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientsContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientsProvider');
  }
  return context;
}
