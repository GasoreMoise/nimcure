'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePatients } from '@/contexts/PatientsContext';
import { useDeliveries } from '@/contexts/DeliveryContext';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { PrescriptionRenewalForm } from '@/components/PrescriptionRenewalForm';
import { PrescriptionHistory } from '@/components/PrescriptionHistory';
import { PatientStatusBadge } from '@/components/PatientStatusBadge';

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const Tab = ({ label, isActive, onClick }: TabProps) => (
  <button
    onClick={onClick}
    className={`whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium ${
      isActive 
        ? 'border-blue-500 text-blue-600' 
        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
    }`}
  >
    {label}
  </button>
);

const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'NonBinary', label: 'Non-binary' },
  { value: 'PreferNotToSay', label: 'Prefer not to say' },
];

interface Location {
  lat: number;
  lng: number;
  lastUpdated: string;
}

interface Tracking {
  currentLocation: Location;
  estimatedArrival: string;
  status: string;
  lastUpdated: string;
}

interface Rider {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  totalDeliveries: number;
  phone: string;
  email: string;
  isActive: boolean;
  currentLocation?: Location;
}

interface Delivery {
  id: string;
  date: string;
  items: string[];
  status: 'pending' | 'in_progress' | 'delivered' | 'failed';
  rider: Rider;
  tracking?: Tracking;
}

const navigationItems = [
  { id: 'patient', label: 'Patient', icon: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.3333 17.5V15.8333C13.3333 14.9493 12.9821 14.1014 12.357 13.4763C11.7319 12.8512 10.884 12.5 9.99999 12.5H4.99999C4.11593 12.5 3.26809 12.8512 2.64297 13.4763C2.01785 14.1014 1.66666 14.9493 1.66666 15.8333V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7.49999 9.16667C9.34094 9.16667 10.8333 7.67428 10.8333 5.83333C10.8333 3.99238 9.34094 2.5 7.49999 2.5C5.65904 2.5 4.16666 3.99238 4.16666 5.83333C4.16666 7.67428 5.65904 9.16667 7.49999 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { id: 'profile', label: "Rider's Profile", icon: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16.1667 12.5C16.0558 12.7513 16.0227 13.0302 16.0717 13.3005C16.1207 13.5708 16.2496 13.8203 16.4417 14.0167L16.4917 14.0667C16.6467 14.2215 16.7696 14.4053 16.8535 14.6075C16.9374 14.8096 16.9805 15.0263 16.9805 15.245C16.9805 15.4637 16.9374 15.6804 16.8535 15.8825C16.7696 16.0847 16.6467 16.2685 16.4917 16.4233C16.3369 16.5783 16.1531 16.7012 15.9509 16.7851C15.7488 16.869 15.5321 16.9121 15.3134 16.9121C15.0947 16.9121 14.878 16.869 14.6758 16.7851C14.4737 16.7012 14.2899 16.5783 14.135 16.4233L14.085 16.3733C13.8887 16.1812 13.6391 16.0523 13.3688 16.0033C13.0985 15.9543 12.8196 15.9874 12.5683 16.0983C12.3226 16.204 12.114 16.3812 11.9691 16.6074C11.8242 16.8335 11.7496 17.0977 11.7533 17.3667V17.5C11.7533 17.942 11.5778 18.366 11.2653 18.6785C10.9527 18.9911 10.5287 19.1667 10.0867 19.1667C9.64467 19.1667 9.22067 18.9911 8.90812 18.6785C8.59557 18.366 8.42001 17.942 8.42001 17.5V17.425C8.41616 17.1462 8.32757 16.8762 8.16751 16.6509C8.00745 16.4257 7.78251 16.2562 7.52167 16.1667C7.27037 16.0557 6.99144 16.0226 6.72115 16.0717C6.45087 16.1207 6.20132 16.2496 6.00501 16.4417L6.00501 16.4917C5.80018 16.6467 5.61635 16.7696 5.41421 16.8535C5.21206 16.9374 4.99538 16.9805 4.77667 16.9805C4.55797 16.9805 4.34128 16.9374 4.13914 16.8535C3.937 16.7696 3.75317 16.6467 3.59834 16.4917C3.44334 16.3369 3.32043 16.1531 3.23653 15.9509C3.15264 15.7488 3.10957 15.5321 3.10957 15.3134C3.10957 15.0947 3.15264 14.878 3.23653 14.6758C3.32043 14.4737 3.44334 14.2899 3.59834 14.135L3.64834 14.085C3.84043 13.8887 3.96931 13.6391 4.01833 13.3688C4.06735 13.0985 4.03425 12.8196 3.92334 12.5683C3.81767 12.3226 3.64044 12.114 3.41429 11.9691C3.18815 11.8242 2.92391 11.7496 2.65501 11.7533H2.50001C2.05797 11.7533 1.63398 11.5778 1.32143 11.2653C1.00888 10.9527 0.833344 10.5287 0.833344 10.0867C0.833344 9.64467 1.00888 9.22067 1.32143 8.90812C1.63398 8.59557 2.05797 8.42001 2.50001 8.42001H2.57501C2.85378 8.41616 3.12382 8.32757 3.34907 8.16751C3.57433 8.00745 3.74387 7.78251 3.83334 7.52167C3.94425 7.27037 3.97735 6.99144 3.92833 6.72115C3.87931 6.45087 3.75043 6.20132 3.55834 6.00501L3.50834 5.95501C3.35334 5.80018 3.23043 5.61635 3.14653 5.41421C3.06264 5.21206 3.01957 4.99538 3.01957 4.77667C3.01957 4.55797 3.06264 4.34128 3.14653 4.13914C3.23043 3.937 3.35334 3.75317 3.50834 3.59834C3.66317 3.44334 3.847 3.32043 4.04914 3.23653C4.25128 3.15264 4.46797 3.10957 4.68667 3.10957C4.90538 3.10957 5.12206 3.15264 5.32421 3.23653C5.52635 3.32043 5.71018 3.44334 5.86501 3.59834L5.91501 3.64834C6.11132 3.84043 6.36087 3.96931 6.63115 4.01833C6.90144 4.06735 7.18037 4.03425 7.43167 3.92334H7.50001C7.74568 3.81767 7.95429 3.64044 8.09919 3.41429C8.24409 3.18815 8.31868 2.92391 8.31501 2.65501V2.50001C8.31501 2.05797 8.49057 1.63398 8.80312 1.32143C9.11567 1.00888 9.53967 0.833344 9.98167 0.833344C10.4237 0.833344 10.8477 1.00888 11.1602 1.32143C11.4728 1.63398 11.6483 2.05797 11.6483 2.50001V2.57501C11.6447 2.84391 11.7193 3.10815 11.8642 3.33429C12.0091 3.56044 12.2177 3.73767 12.4633 3.84334C12.7146 3.95425 12.9936 3.98735 13.2639 3.93833C13.5341 3.88931 13.7837 3.76043 13.98 3.56834L14.03 3.51834C14.1848 3.36334 14.3687 3.24043 14.5708 3.15653C14.7729 3.07264 14.9896 3.02957 15.2083 3.02957C15.427 3.02957 15.6437 3.07264 15.8459 3.15653C16.048 3.24043 16.2318 3.36334 16.3867 3.51834C16.5417 3.67317 16.6646 3.857 16.7485 4.05914C16.8324 4.26128 16.8754 4.47797 16.8754 4.69667C16.8754 4.91538 16.8324 5.13206 16.7485 5.33421C16.6646 5.53635 16.5417 5.72018 16.3867 5.87501L16.3367 5.92501C16.1446 6.12132 16.0157 6.37087 15.9667 6.64115C15.9177 6.91144 15.9508 7.19037 16.0617 7.44167V7.50001C16.1673 7.74568 16.3446 7.95429 16.5707 8.09919C16.7969 8.24409 17.0611 8.31868 17.33 8.31501H17.5C17.942 8.31501 18.366 8.49057 18.6786 8.80312C18.9911 9.11567 19.1667 9.53967 19.1667 9.98167C19.1667 10.4237 18.9911 10.8477 18.6786 11.1602C18.366 11.4728 17.942 11.6483 17.5 11.6483H17.425C17.1561 11.6447 16.8919 11.7193 16.6657 11.8642C16.4396 12.0091 16.2624 12.2177 16.1567 12.4633V12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { id: 'history', label: 'Delivery History', icon: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.3333 5.83333H15.8333L18.3333 8.33333V13.3333H16.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 13.3333V5.83333H13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.33333 15.8333C4.71405 15.8333 5.83333 14.714 5.83333 13.3333C5.83333 11.9526 4.71405 10.8333 3.33333 10.8333C1.95262 10.8333 0.833336 11.9526 0.833336 13.3333C0.833336 14.714 1.95262 15.8333 3.33333 15.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16.6667 15.8333C18.0474 15.8333 19.1667 14.714 19.1667 13.3333C19.1667 11.9526 18.0474 10.8333 16.6667 10.8333C15.286 10.8333 14.1667 11.9526 14.1667 13.3333C14.1667 14.714 15.286 15.8333 16.6667 15.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
  { 
    id: 'prescriptions', 
    label: 'Prescriptions', 
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )
  },
  { id: 'deliveries', label: 'Deliveries', icon: (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.3333 5.83333H15.8333L18.3333 8.33333V13.3333H16.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 13.3333V5.83333H13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.33333 15.8333C4.71405 15.8333 5.83333 14.714 5.83333 13.3333C5.83333 11.9526 4.71405 10.8333 3.33333 10.8333C1.95262 10.8333 0.833336 11.9526 0.833336 13.3333C0.833336 14.714 1.95262 15.8333 3.33333 15.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16.6667 15.8333C18.0474 15.8333 19.1667 14.714 19.1667 13.3333C19.1667 11.9526 18.0474 10.8333 16.6667 10.8333C15.286 10.8333 14.1667 11.9526 14.1667 13.3333C14.1667 14.714 15.286 15.8333 16.6667 15.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )},
];

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Unknown';
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    return 'Invalid date';
  }
};

const getStatusColor = (status: Delivery['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'in_progress':
      return 'bg-blue-100 text-blue-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function PatientDetailsPage() {
  const params = useParams();
  const { patients } = usePatients();
  const { getDeliveriesByPatient } = useDeliveries();
  const [activeSection, setActiveSection] = useState('patient');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(patients[0]);
  
  const patient = patients.find(p => p.id === params.id);
  const patientDeliveries = getDeliveriesByPatient(params.id as string);

  // Show loading or error state if patient not found
  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 mb-8">
            <Link href="/patients" className="text-blue-600 hover:text-blue-500 text-sm">
              Patients
            </Link>
            <span className="text-gray-500 text-sm">/</span>
            <span className="text-gray-500 text-sm">View Patient</span>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500">Patient not found</p>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    // Implement the logic to update the patient data
    console.log('Saving changes');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with breadcrumb and action button */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/patients" className="text-blue-600 hover:text-blue-500 text-sm">
              Patients
            </Link>
            <span className="text-gray-500 text-sm">/</span>
            <span className="text-gray-500 text-sm">View Patient</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Patient's next delivery date is <span className="font-medium">{patient.nextDeliveryDate}</span>
            </div>
            <Link
              href={`/patients/assign-package?patientId=${patient.id}`}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Assign Package to Patient
            </Link>
          </div>
        </div>

        {/* Main content */}
        <div className="flex gap-6">
          {/* Left sidebar */}
          <div className="w-64 shrink-0">
            <div className="rounded-lg bg-white shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900">Patient</h2>
              </div>
              <div className="border-t border-gray-200">
                <nav className="flex flex-col">
                  {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-colors duration-200 ${
                        activeSection === item.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <span className={activeSection === item.id ? 'text-blue-600' : 'text-gray-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Right content area */}
          <div className="flex-1">
            {activeSection === 'patient' && (
              <div className="rounded-lg bg-white shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <h1 className="text-lg font-medium text-gray-900">Patient Information</h1>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Paid
                      </span>
                    </div>
                    <div>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <svg className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15.8333 8.33333L11.6667 4.16667M2.5 17.5H6.66667L17.5 6.66667C18.2831 5.88357 18.2831 4.61643 17.5 3.83333C16.7169 3.05024 15.4498 3.05024 14.6667 3.83333L3.83333 14.6667V18.8333L2.5 17.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Edit Patient's Information
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500 mb-8">Personal information about Patient.</p>

                  <div className="space-y-6">
                    {/* Form fields */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="hospitalId" className="block text-sm font-medium text-gray-700 mb-1">
                          Hospital ID
                        </label>
                        <input
                          type="text"
                          name="hospitalId"
                          id="hospitalId"
                          value={isEditing ? editedData.hospitalId : patient.hospitalId}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="block w-full rounded-md border-gray-200 bg-gray-50 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-75 sm:text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={isEditing ? editedData.firstName : patient.firstName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="block w-full rounded-md border-gray-200 bg-gray-50 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-75 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={isEditing ? editedData.lastName : patient.lastName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="block w-full rounded-md border-gray-200 bg-gray-50 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-75 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <select
                          name="gender"
                          id="gender"
                          value={isEditing ? editedData.gender : patient.gender}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="block w-full rounded-md border-gray-200 bg-gray-50 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-75 sm:text-sm"
                        >
                          {genderOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={isEditing ? editedData.phone : patient.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="block w-full rounded-md border-gray-200 bg-gray-50 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-75 sm:text-sm"
                        />
                      </div>

                      <div className="col-span-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={isEditing ? editedData.email : patient.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="block w-full rounded-md border-gray-200 bg-gray-50 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-75 sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Save Changes button */}
                    {isEditing && (
                      <div className="flex justify-end">
                        <button
                          onClick={handleSaveChanges}
                          className="inline-flex items-center justify-center rounded-md bg-blue-100 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'history' && (
              <div className="rounded-lg bg-white shadow">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900">Delivery History</h2>
                  <p className="text-sm text-gray-500 mb-8">Real-time tracking of medicine deliveries.</p>

                  <div className="space-y-6">
                    {patientDeliveries.map(delivery => (
                      <div key={delivery.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{delivery.items.join(', ')}</h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(delivery.date)}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                            {delivery.status.replace('_', ' ').charAt(0).toUpperCase() + delivery.status.slice(1)}
                          </span>
                        </div>

                        {delivery.tracking && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-sm font-medium">Current Status</h4>
                                <p className="text-sm text-gray-600">{delivery.tracking.status}</p>
                              </div>
                              <div className="text-right">
                                <h4 className="text-sm font-medium">Estimated Arrival</h4>
                                <p className="text-sm text-gray-600">
                                  {formatDate(delivery.tracking.estimatedArrival)}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Last updated: {formatDate(delivery.tracking.lastUpdated)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'profile' && (
              <div className="rounded-lg bg-white shadow">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900">Rider's Profile</h2>
                  <p className="text-sm text-gray-500 mb-8">Information about the assigned delivery rider.</p>

                  {patientDeliveries[0]?.rider && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-xl font-medium text-gray-600">
                          {patientDeliveries[0].rider.avatar ? (
                            <Image
                              src={patientDeliveries[0].rider.avatar}
                              alt={patientDeliveries[0].rider.name}
                              width={64}
                              height={64}
                              className="rounded-full"
                            />
                          ) : (
                            patientDeliveries[0].rider.name.split(' ').map(n => n[0]).join('')
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">{patientDeliveries[0].rider.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="flex items-center">
                              <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 15.934l6.18 3.246-.985-6.903L20 7.393l-6.902-1.004L10 0 6.902 6.389 0 7.393l4.805 4.884-.985 6.903L10 15.934z" clipRule="evenodd" />
                              </svg>
                              <span className="ml-1 text-sm text-gray-600">{patientDeliveries[0].rider.rating}</span>
                            </span>
                            <span className="text-sm text-gray-500">•</span>
                            <span className="text-sm text-gray-600">{patientDeliveries[0].rider.totalDeliveries} deliveries</span>
                          </div>
                        </div>
                        <div className="ml-auto">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            patientDeliveries[0].rider.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {patientDeliveries[0].rider.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Phone</h4>
                          <p className="text-sm text-gray-600">{patientDeliveries[0].rider.phone}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Email</h4>
                          <p className="text-sm text-gray-600">{patientDeliveries[0].rider.email}</p>
                        </div>
                      </div>

                      {patientDeliveries[0].rider.currentLocation && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Location</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">
                              Location: {patientDeliveries[0].rider.currentLocation.lat}, {patientDeliveries[0].rider.currentLocation.lng}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Last updated: {formatDate(patientDeliveries[0].rider.currentLocation.lastUpdated)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'prescriptions' && (
              <div className="space-y-6">
                {/* Active Prescriptions */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium mb-4">Active Prescriptions</h2>
                  <div className="space-y-4">
                    {patient.prescriptions
                      .filter(p => p.status === 'active')
                      .map(prescription => (
                        <div key={prescription.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium">{prescription.medicationName}</h3>
                              <p className="text-sm text-gray-500">
                                {prescription.dosage} - {prescription.frequency}
                              </p>
                            </div>
                            <PatientStatusBadge status={prescription.status} />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">Start Date</p>
                              <p className="font-medium">
                                {new Date(prescription.startDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">End Date</p>
                              <p className="font-medium">
                                {new Date(prescription.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <PrescriptionRenewalForm 
                            patientId={patient.id} 
                            prescription={prescription}
                          />
                        </div>
                      ))}
                  </div>
                </div>

                {/* Prescription History */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium mb-4">Medication History</h2>
                  <PrescriptionHistory history={patient.medicationHistory} />
                </div>
              </div>
            )}

            {activeSection === 'deliveries' && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium">Deliveries</h2>
                  <Link
                    href={`/deliveries/new?patientId=${patient?.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Schedule New Delivery
                  </Link>
                </div>

                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rider
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patientDeliveries.map((delivery) => (
                        <tr key={delivery.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(delivery.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {delivery.items.join(', ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                              {delivery.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {delivery.riderName}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
