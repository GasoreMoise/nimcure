'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { usePatients } from '@/contexts/PatientsContext';
import { useRiders } from '@/contexts/RiderContext';
import { drugCycleSchema, riderAssignmentSchema } from '@/lib/validations/package.schema';
import type { DrugCycleData, RiderAssignmentData } from '@/lib/validations/package.schema';
import { QRCodeScanner } from '@/components/QRCodeScanner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export default function AssignPackagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  const { patients } = usePatients();
  const { riders } = useRiders();
  const [currentStep, setCurrentStep] = useState(0);
  const [scannedPackageId, setScannedPackageId] = useState<string | null>(null);
  const [assignmentStatus, setAssignmentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  // Get patient information from context
  const patient = patients.find(p => p.id === patientId);

  // Redirect if no patient found
  useEffect(() => {
    if (!patientId || !patient) {
      router.push('/patients');
    }
  }, [patientId, patient, router]);

  if (!patient) return null;

  // Form handling for Drug Cycle
  const drugCycleForm = useForm<DrugCycleData>({
    resolver: zodResolver(drugCycleSchema),
    defaultValues: {
      cycleLength: '',
      startDate: '',
      endDate: '',
      notes: ''
    }
  });

  // Form handling for Rider Assignment
  const riderForm = useForm<RiderAssignmentData>({
    resolver: zodResolver(riderAssignmentSchema),
    defaultValues: {
      riderId: '',
      deliveryDate: '',
      deliveryTime: '',
      specialInstructions: ''
    }
  });

  const steps = [
    { 
      label: 'Set Drug Cycle/Length', 
      isCompleted: currentStep > 0, 
      isActive: currentStep === 0 
    },
    { 
      label: 'Assign Dispatch Rider', 
      isCompleted: currentStep > 1, 
      isActive: currentStep === 1 
    },
    { 
      label: 'Scan Package', 
      isCompleted: !!scannedPackageId, 
      isActive: currentStep === 2 
    }
  ];

  const handleDrugCycleSubmit = async (data: DrugCycleData) => {
    try {
      setError(null);
      // Here you would typically make an API call to save the drug cycle data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setCurrentStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save drug cycle');
    }
  };

  const handleRiderAssignment = async (data: RiderAssignmentData) => {
    try {
      setError(null);
      // Here you would typically make an API call to assign the rider
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setCurrentStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign rider');
    }
  };

  const handleScanSuccess = (packageId: string) => {
    setPackageToAssign(packageId);
    setShowConfirmModal(true);
  };

  const handleConfirmAssignment = async () => {
    try {
      setError(null);
      setAssignmentStatus('loading');
      
      // Here you would make your API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAssignmentStatus('success');
      setShowConfirmModal(false);
      
      setTimeout(() => {
        router.push(`/patients/${patient.id}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign package');
      setAssignmentStatus('error');
    }
  };

  const renderRiderAssignmentForm = () => (
    <div className="lg:col-span-2">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Assign Dispatch Rider</h2>
        <form onSubmit={riderForm.handleSubmit(handleRiderAssignment)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Rider
            </label>
            <select
              {...riderForm.register('riderId')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select a rider...</option>
              {riders?.map(rider => (
                <option key={rider.id} value={rider.id}>
                  {rider.name}
                </option>
              ))}
            </select>
            {riderForm.formState.errors.riderId && (
              <p className="mt-1 text-sm text-red-600">
                {riderForm.formState.errors.riderId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Delivery Date
            </label>
            <Input
              type="date"
              {...riderForm.register('deliveryDate')}
              className="mt-1"
            />
            {riderForm.formState.errors.deliveryDate && (
              <p className="mt-1 text-sm text-red-600">
                {riderForm.formState.errors.deliveryDate.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Delivery Time
            </label>
            <Input
              type="time"
              {...riderForm.register('deliveryTime')}
              className="mt-1"
            />
            {riderForm.formState.errors.deliveryTime && (
              <p className="mt-1 text-sm text-red-600">
                {riderForm.formState.errors.deliveryTime.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Special Instructions
            </label>
            <textarea
              {...riderForm.register('specialInstructions')}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(0)}
            >
              Back
            </Button>
            <Button type="submit">
              Continue to Package Scanning
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderPackageScanning = () => (
    <div className="lg:col-span-2">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">
          Scan a package to assign it to {patient.firstName} {patient.lastName}
        </h2>
        
        <div className="space-y-6">
          <div className="flex justify-center">
            <QRCodeScanner
              onScan={handleScanSuccess}
              onError={(error) => setError(error.message)}
              isScanning={!scannedPackageId}
              patientName={`${patient.firstName} ${patient.lastName}`}
            />
          </div>

          {/* Manual Entry Option */}
          <div className="mt-8">
            <p className="text-sm text-gray-500 mb-2">
              Trouble scanning QR Code?
              <br />
              Enter manually
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter Code"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="w-full"
                />
              </div>
              <span className="text-sm text-gray-500">OR</span>
              <Button
                type="button"
                variant="outline"
                className="border-blue-600 text-blue-600"
                onClick={() => handleScanSuccess(manualCode)}
              >
                Submit Code
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(1)}
              className="px-8"
            >
              Back
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={() => handleScanSuccess(scannedPackageId || manualCode)}
              disabled={!scannedPackageId && !manualCode}
              className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-8"
            >
              Assign Package
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Add state for manual code entry
  const [manualCode, setManualCode] = useState('');

  // Add state for modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [packageToAssign, setPackageToAssign] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb navigation */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/patients" className="text-blue-600 hover:text-blue-500 text-sm">
              Patients
            </Link>
            <span className="text-gray-500 text-sm">/</span>
            <Link 
              href={`/patients/${patient.id}`} 
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              View Patient
            </Link>
            <span className="text-gray-500 text-sm">/</span>
            <span className="text-gray-500 text-sm">Assign Package</span>
          </div>
        </div>

        

        {/* Steps Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.label} className="flex items-center">
                <div className={`
                  flex h-8 w-8 items-center justify-center rounded-full
                  ${step.isCompleted ? 'bg-green-500' : step.isActive ? 'bg-blue-600' : 'bg-gray-200'}
                `}>
                  <span className="text-white text-sm">{index + 1}</span>
                </div>
                <span className={`ml-3 text-sm ${step.isActive ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className="ml-4 w-20 h-0.5 bg-gray-200" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Patient Info */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h2>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Hospital ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{patient.hospitalId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{`${patient.firstName} ${patient.lastName}`}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{patient.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">{patient.location}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Right Column - Current Step */}
          {currentStep === 0 && (
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Set Drug Cycle</h2>
                <form onSubmit={drugCycleForm.handleSubmit(handleDrugCycleSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cycle Length (in weeks)
                    </label>
                    <Input
                      type="number"
                      {...drugCycleForm.register('cycleLength')}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      {...drugCycleForm.register('startDate')}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      End Date
                    </label>
                    <Input
                      type="date"
                      {...drugCycleForm.register('endDate')}
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Additional Notes
                    </label>
                    <textarea
                      {...drugCycleForm.register('notes')}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">
                      Continue to Rider Assignment
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {currentStep === 1 && renderRiderAssignmentForm()}

          {currentStep === 2 && renderPackageScanning()}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
      >
        <div className="text-center">
          <h3 className="text-lg font-medium mb-4">
            Assign Package {packageToAssign}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Are you sure you want to assign package {packageToAssign} to {patient.firstName} {patient.lastName}?
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              No, Go Back
            </Button>
            <Button
              onClick={handleConfirmAssignment}
              disabled={assignmentStatus === 'loading'}
            >
              Yes, Assign Package
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
