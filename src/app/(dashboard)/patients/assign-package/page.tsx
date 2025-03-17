'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { usePatients } from '@/contexts/PatientsContext';
import { useRiders } from '@/contexts/RiderContext';
import { useDeliveries } from '@/contexts/DeliveryContext';
import { drugCycleSchema, riderAssignmentSchema } from '@/lib/validations/package.schema';
import type { DrugCycleData, RiderAssignmentData } from '@/lib/validations/package.schema';
import { QRCodeScanner } from '@/components/QRCodeScanner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from 'react-hot-toast';
import { generateQRCode } from '@/utils/delivery';

type Tab = 'all' | 'unassigned' | 'assigned';

export default function AssignPackagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patientId');
  const { patients } = usePatients();
  const { riders } = useRiders();
  const { addDelivery, deliveries } = useDeliveries();
  const [currentStep, setCurrentStep] = useState(0);
  const [scannedPackageId, setScannedPackageId] = useState<string | null>(null);
  const [assignmentStatus, setAssignmentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTab, setSelectedTab] = useState<Tab>('all');
  const [selectedRider, setSelectedRider] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Get patient information from context
  const patient = patients.find(p => p.id === patientId);

  // Redirect if no patient found
  useEffect(() => {
    if (!patientId || !patient) {
      router.push('/patients');
    }
  }, [patientId, patient, router]);

  useEffect(() => {
    if (currentStep === 2) {
      setIsScanning(true);
    } else {
      setIsScanning(false);
    }

    return () => {
      setIsScanning(false);
    };
  }, [currentStep]);

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
    setIsScanning(false);
    setError(null);
    setPackageToAssign(packageId);
    setShowConfirmModal(true);
  };

  const handleConfirmAssignment = async () => {
    try {
      setError(null);
      setAssignmentStatus('loading');
      
      // Find the delivery to update
      const deliveryToUpdate = deliveries.find(d => d.id === packageToAssign);
      
      if (!deliveryToUpdate) {
        throw new Error('Package not found');
      }

      // Create updated delivery object
      const updatedDelivery = {
        ...deliveryToUpdate,
        packageCode: deliveryToUpdate.packageCode,
        qrCode: deliveryToUpdate.qrCode,
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        status: 'pending' as const,
        riderId: selectedRider || deliveryToUpdate.riderId,
        assignedAt: new Date().toISOString(),
        tracking: {
          status: 'pending',
          lastUpdated: new Date().toISOString(),
          location: patient.location,
          estimatedArrival: new Date().toISOString(),
          history: [{
            status: 'pending',
            timestamp: new Date().toISOString(),
            note: 'Package assigned to patient'
          }]
        }
      };

      // Update the delivery in context/storage
      await addDelivery(updatedDelivery);
      
      setAssignmentStatus('success');
      setShowConfirmModal(false);
      
      // Show success message and redirect
      toast.success('Package successfully assigned to patient');
      router.push('/deliveries');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign package');
      setAssignmentStatus('error');
    }
  };

  const renderRiderAssignmentForm = () => (
    <div className="lg:col-span-2">
      <div className="bg-white shadow rounded-lg p-6">
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('all')}
              className={`${
                selectedTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              All ({riders.length})
            </button>
            <button
              onClick={() => setSelectedTab('unassigned')}
              className={`${
                selectedTab === 'unassigned'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Unassigned Riders ({riders.filter(r => getRiderDeliveries(r.id).pending === 0).length})
            </button>
            <button
              onClick={() => setSelectedTab('assigned')}
              className={`${
                selectedTab === 'assigned'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Assigned Riders ({riders.filter(r => getRiderDeliveries(r.id).pending > 0).length})
            </button>
          </nav>
        </div>

        {/* Riders List */}
        <div className="space-y-4">
          {filteredRiders.map(rider => (
            <div 
              key={rider.id}
              className="flex items-center p-4 border rounded-lg hover:bg-gray-50"
            >
              <input
                type="radio"
                name="rider"
                value={rider.id}
                checked={selectedRider === rider.id}
                onChange={() => setSelectedRider(rider.id)}
                className="h-4 w-4 text-blue-600 border-gray-300"
              />
              <div className="ml-4 flex-1 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">Dispatch Rider's Name</p>
                  <p className="text-sm text-gray-500">{rider.firstName} {rider.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Phone Number</p>
                  <p className="text-sm text-gray-500">{rider.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Number of Deliveries</p>
                  <p className="text-sm text-gray-500">
                    {selectedTab === 'assigned' 
                      ? `${getRiderDeliveries(rider.id).pending} Pending Deliveries`
                      : `${rider.totalDeliveries} Deliveries`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Next Button */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={() => setCurrentStep(2)}
            disabled={!selectedRider}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );

  // Add state for manual code entry
  const [manualCode, setManualCode] = useState('');

  // Add state for modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [packageToAssign, setPackageToAssign] = useState<string | null>(null);

  const availableRiders = riders.filter(rider => rider.status === 'available');

  const [formData, setFormData] = useState({
    patientId: '',
    riderId: '',
    items: [''],
    notes: '',
    deliveryDate: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      if (!selectedPatient) throw new Error('Patient not found');

      const selectedRider = riders.find(r => r.id === formData.riderId);
      if (!selectedRider) throw new Error('Rider not found');

      const packageCode = `PKG-${Math.random().toString(36).substr(2, 9)}`;
      const qrCode = await generateQRCode(packageCode);

      const newDelivery = {
        id: Math.random().toString(36).substr(2, 9),
        packageCode,
        qrCode,
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        patientPhone: selectedPatient.phone,
        date: formData.deliveryDate,
        items: JSON.stringify(formData.items.filter(item => item.trim() !== '')),
        status: 'pending' as const,
        paymentStatus: 'unpaid' as const,
        location: selectedPatient.location,
        riderId: selectedRider.id,
        riderName: `${selectedRider.firstName} ${selectedRider.lastName}`,
        deliveryType: 'patient-assigned' as const,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tracking: {
          estimatedArrival: new Date(formData.deliveryDate).toISOString(),
          status: 'pending',
          lastUpdated: new Date().toISOString()
        }
      };

      await addDelivery(newDelivery);
      router.push('/deliveries');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign package');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get rider delivery counts
  const getRiderDeliveries = (riderId: string) => {
    const riderDeliveries = deliveries.filter(d => d.riderId === riderId);
    return {
      total: riderDeliveries.length,
      pending: riderDeliveries.filter(d => d.status !== 'delivered').length,
      completed: riderDeliveries.filter(d => d.status === 'delivered').length
    };
  };

  // Filter riders based on tab
  const getFilteredRiders = () => {
    return riders.filter(rider => {
      const deliveryCounts = getRiderDeliveries(rider.id);
      
      switch (selectedTab) {
        case 'unassigned':
          return deliveryCounts.pending === 0;
        case 'assigned':
          return deliveryCounts.pending > 0;
        default:
          return true;
      }
    });
  };

  const filteredRiders = getFilteredRiders();

  const renderPackageScanning = () => (
    <div className="lg:col-span-2">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Scan Package</h2>
        
        {/* Package Assignment Message */}
        <p className="text-gray-600 mb-8">
          Scan a package to assign it to {patient.firstName} {patient.lastName}
        </p>

        {/* QR Scanner */}
        <div className="mb-8">
          <QRCodeScanner 
            onScan={(result) => {
              if (validatePackage(result)) {
                handleScanSuccess(result);
              }
            }}
            onError={(error) => {
              setError(error.message);
            }}
            isScanning={isScanning}
            patientName={`${patient.firstName} ${patient.lastName}`}
          />
        </div>

        {/* Manual Entry Section */}
        <div className="mt-8">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Trouble scanning QR Code?
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Enter manually
          </p>
          <div className="flex gap-4">
            <Input
              value={manualPackageCode}
              onChange={(e) => setManualPackageCode(e.target.value)}
              placeholder="Enter Code"
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={() => {
                if (!manualPackageCode.trim()) {
                  setError('Please enter a package code');
                  return;
                }
                
                if (validatePackage(manualPackageCode)) {
                  handleScanSuccess(manualPackageCode);
                }
              }}
              className="whitespace-nowrap"
            >
              Submit Code
            </Button>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(1)}
          >
            Back
          </Button>
          <Button
            onClick={() => {
              if (validatePackage(manualPackageCode)) {
                handleScanSuccess(manualPackageCode);
              }
            }}
            className="bg-blue-600 text-white"
          >
            Assign Package
          </Button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );

  // Add state for manual package code entry
  const [manualPackageCode, setManualPackageCode] = useState('');

  const validatePackage = (packageId: string) => {
    const delivery = deliveries.find(d => 
      d.packageCode === packageId || 
      d.id === packageId
    );
    
    if (!delivery) {
      setError('Package not found');
      return false;
    }

    if (delivery.paymentStatus !== 'paid') {
      setError('Package must be paid before assignment');
      return false;
    }

    if (delivery.patientId || delivery.status !== 'unassigned') {
      setError('Package is already assigned');
      return false;
    }

    return true;
  };

  // Add this effect for component unmount
  useEffect(() => {
    return () => {
      setIsScanning(false);
    };
  }, []);

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
