'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { QRCodeScanner } from '@/components/QRCodeScanner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface StepProps {
  label: string;
  isCompleted: boolean;
  isActive: boolean;
}

function StepIndicator({ label, isCompleted, isActive }: StepProps) {
  return (
    <div className="flex items-center">
      <div className={`
        flex h-8 w-8 items-center justify-center rounded-full
        ${isCompleted ? 'bg-green-500' : isActive ? 'bg-blue-600' : 'bg-gray-200'}
      `}>
        {isCompleted ? (
          <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        ) : (
          <span className={`h-2.5 w-2.5 rounded-full ${isActive ? 'bg-white' : 'bg-gray-400'}`} />
        )}
      </div>
      <span className={`ml-3 text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
}

export default function AssignPackagePage() {
  const router = useRouter();
  const [scannedPackageId, setScannedPackageId] = useState<string | null>(null);
  const [assignmentStatus, setAssignmentStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const [patientInfo] = useState({
    hospitalId: '1AFHHD93',
    name: 'Oluwaseun Aregbesola',
    phoneNumber: '+2347068642920',
    nextDeliveryDate: '12th September 2020',
    location: 'Yaba, Lagos',
    drugCycle: 2,
    paymentStatus: 'paid',
  });

  const handleScanSuccess = (packageId: string) => {
    setScannedPackageId(packageId);
  };

  const handleScanError = (error: Error) => {
    console.error('Scanning error:', error);
    // You could show an error toast here
  };

  const handleAssignPackage = async () => {
    try {
      setAssignmentStatus('loading');
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Here you would make an API call to assign the package
      // await assignPackage(scannedPackageId, patientInfo.hospitalId);
      
      setAssignmentStatus('success');
      
      // Show success message for 2 seconds before redirecting
      setTimeout(() => {
        router.push(`/patients/${patientInfo.hospitalId}`);
      }, 2000);
    } catch (error) {
      setAssignmentStatus('error');
      console.error('Failed to assign package:', error);
    }
  };

  const steps = [
    { label: 'Set Drug Cycle/Length', isCompleted: true, isActive: false },
    { label: 'Assign Dispatch Rider', isCompleted: true, isActive: false },
    { label: 'Scan Package', isCompleted: !!scannedPackageId, isActive: true }
  ];

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Loading State */}
          {assignmentStatus === 'loading' && (
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 shadow-xl max-w-md w-full mx-4">
                <LoadingSpinner size="lg" />
                <p className="text-center text-gray-500 mt-4">
                  Assigning package to patient...
                </p>
              </div>
            </div>
          )}

          {/* Success message */}
          {assignmentStatus === 'success' && (
            <div className="mb-8 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Package has been successfully assigned to {patientInfo.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm">
                  <Link href="/patients" className="text-blue-600 hover:text-blue-500">
                    Patients
                  </Link>
                  <span className="text-gray-500">/</span>
                  <Link href={`/patients/${patientInfo.hospitalId}`} className="text-blue-600 hover:text-blue-500">
                    View Patient
                  </Link>
                  <span className="text-gray-500">/</span>
                  <span className="text-gray-500">Assign Package</span>
                </nav>

                {/* Title */}
                <h1 className="mt-4 text-2xl font-semibold text-gray-900">Assign Package to Patient</h1>
              </div>

              {/* Payment Status */}
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <svg className="mr-1.5 h-2 w-2 text-green-400" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  Payment Verified
                </span>
              </div>
            </div>

            {/* Steps */}
            <div className="mt-8">
              <div className="flex justify-between">
                {steps.map((step) => (
                  <StepIndicator
                    key={step.label}
                    label={step.label}
                    isCompleted={step.isCompleted}
                    isActive={step.isActive}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Patient Information */}
            <div className="lg:col-span-1">
              <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Patient Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Hospital ID</label>
                    <div className="mt-1 text-sm text-gray-900">{patientInfo.hospitalId}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Name</label>
                    <div className="mt-1 text-sm text-gray-900">{patientInfo.name}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                    <div className="mt-1 text-sm text-gray-900">{patientInfo.phoneNumber}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Next Delivery Date</label>
                    <div className="mt-1 text-sm text-gray-900">{patientInfo.nextDeliveryDate}</div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Location</label>
                    <div className="mt-1 text-sm text-gray-900">{patientInfo.location}</div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500">Drug Cycle</label>
                    <div className="mt-1 text-sm text-gray-900">Cycle {patientInfo.drugCycle}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - QR Scanner */}
            <div className="lg:col-span-2">
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Scan Package</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Scan a package QR code to assign it to {patientInfo.name}
                  </p>
                </div>

                <div className="flex flex-col items-center justify-center">
                  <QRCodeScanner
                    onScan={handleScanSuccess}
                    onError={handleScanError}
                    isScanning={!scannedPackageId}
                  />

                  {scannedPackageId && (
                    <div className="mt-8 w-full max-w-sm">
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-500">Package Code</p>
                          <p className="mt-1 text-lg font-medium text-gray-900">{scannedPackageId}</p>
                        </div>
                        
                        <div className="mt-6 flex justify-between">
                          <button
                            onClick={() => setScannedPackageId(null)}
                            className="text-sm font-medium text-gray-600 hover:text-gray-500"
                          >
                            Scan Again
                          </button>
                          <button
                            onClick={handleAssignPackage}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Assign Package
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
