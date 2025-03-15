'use client';

import { useState } from 'react';
import { usePatients, type Prescription } from '@/contexts/PatientsContext';

export function PrescriptionRenewalForm({ patientId, prescription }: { 
  patientId: string;
  prescription: Prescription;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { renewPrescription } = usePatients();

  const handleRenewal = async () => {
    setIsSubmitting(true);
    try {
      await renewPrescription(patientId, prescription.id);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium">Renew Prescription</h3>
      <div className="mt-4 space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-500">Medication</span>
          <span className="font-medium">{prescription.medicationName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Current Refills Remaining</span>
          <span className="font-medium">{prescription.refillsRemaining}</span>
        </div>
        <button
          onClick={handleRenewal}
          disabled={isSubmitting || prescription.refillsRemaining === 0}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300"
        >
          {isSubmitting ? 'Processing...' : 'Renew Prescription'}
        </button>
      </div>
    </div>
  );
} 