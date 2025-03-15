'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type PatientStatus = 'active' | 'pending' | 'critical' | 'completed' | 'defaulted' | 'expired';

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  refillsRemaining: number;
  lastRefillDate?: string;
  nextRefillDate?: string;
  status: 'active' | 'completed' | 'expired';
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  hospitalId: string;
  location: string;
  nextDeliveryDate: string;
  drugCycle: string;
  status: PatientStatus;
  createdAt: string;
  paymentStatus: 'paid' | 'unpaid';
  address: string;
  gender: 'Male' | 'Female' | 'NonBinary' | 'PreferNotToSay';
  lastDeliveryDate?: string;
  medicationEndDate?: string;
  missedDeliveries: number;
  prescriptions: Prescription[];
  medicationHistory: {
    date: string;
    action: 'prescribed' | 'refilled' | 'completed';
    medicationName: string;
    notes?: string;
  }[];
}

export interface PatientsContextType {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'prescriptions' | 'medicationHistory'>) => Promise<void>;
  renewPrescription: (patientId: string, prescriptionId: string) => Promise<void>;
}

const PatientsContext = createContext<PatientsContextType | undefined>(undefined);

export function PatientsProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage
  const [patients, setPatients] = useState<Patient[]>(() => {
    if (typeof window !== 'undefined') {
      const savedPatients = localStorage.getItem('patients');
      return savedPatients ? JSON.parse(savedPatients) : [];
    }
    return [];
  });

  // Update localStorage when patients change
  useEffect(() => {
    localStorage.setItem('patients', JSON.stringify(patients));
  }, [patients]);

  // Update statuses every hour
  useEffect(() => {
    const updateStatuses = () => {
      setPatients(prevPatients => 
        prevPatients.map(patient => ({
          ...patient,
          status: calculatePatientStatus(patient)
        }))
      );
    };

    const interval = setInterval(updateStatuses, 1000 * 60 * 60); // Every hour
    updateStatuses(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const addPatient = async (patient: Omit<Patient, 'prescriptions' | 'medicationHistory'>) => {
    try {
      const newPatient: Patient = {
        ...patient,
        prescriptions: [],
        medicationHistory: []
      };
      setPatients(prev => [...prev, newPatient]);
    } catch (error) {
      throw new Error('Failed to add patient');
    }
  };

  const renewPrescription = async (patientId: string, prescriptionId: string) => {
    // Implement prescription renewal logic here
    const updatedPatients = patients.map(patient => {
      if (patient.id === patientId) {
        const updatedPrescriptions = patient.prescriptions.map(prescription => {
          if (prescription.id === prescriptionId) {
            return {
              ...prescription,
              refillsRemaining: prescription.refillsRemaining + 3, // Example: add 3 refills
              lastRefillDate: new Date().toISOString()
            };
          }
          return prescription;
        });
        return { ...patient, prescriptions: updatedPrescriptions };
      }
      return patient;
    });
    setPatients(updatedPatients);
  };

  const value = {
    patients,
    addPatient,
    renewPrescription
  };

  return (
    <PatientsContext.Provider value={value}>
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

// Add status check function
export function calculatePatientStatus(patient: Patient): PatientStatus {
  const now = new Date();
  const nextDelivery = new Date(patient.nextDeliveryDate);
  const daysUntilDelivery = Math.floor((nextDelivery.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (patient.missedDeliveries > 2) {
    return 'defaulted';
  }
  
  if (daysUntilDelivery <= 2) {
    return 'critical';
  }
  
  if (daysUntilDelivery <= 7) {
    return 'pending';
  }

  return 'active';
}
