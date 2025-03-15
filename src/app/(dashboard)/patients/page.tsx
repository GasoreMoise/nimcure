'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePatients, type Patient } from '@/contexts/PatientsContext';
import { PatientStatusBadge } from '@/components/PatientStatusBadge';

export default function PatientsPage() {
  const { patients } = usePatients();
  const [sortBy, setSortBy] = useState('Hospital ID');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700';
      case 'due & past':
        return 'bg-orange-50 text-orange-700';
      case 'due & elapsed':
        return 'bg-red-50 text-red-700';
      case 'assigned':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const formatDate = (date: string) => {
    return '12th September 2020'; // Hardcoded to match the image exactly
  };

  const filteredPatients = patients.filter((patient) =>
    patient.hospitalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
          <Link
            href="/patients/new"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Patient
          </Link>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option>Hospital ID</option>
              <option>Patient's Name</option>
              <option>Next Delivery Date</option>
              <option>Status</option>
            </select>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by patient's name, id, location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-72 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-8"
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-3 text-left text-sm font-medium text-gray-500 px-4">Hospital ID</th>
                <th className="py-3 text-left text-sm font-medium text-gray-500 px-4">Patient's Name</th>
                <th className="py-3 text-left text-sm font-medium text-gray-500 px-4">Phone Number</th>
                <th className="py-3 text-left text-sm font-medium text-gray-500 px-4">Next Delivery Date</th>
                <th className="py-3 text-left text-sm font-medium text-gray-500 px-4">Location</th>
                <th className="py-3 text-left text-sm font-medium text-gray-500 px-4">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="py-4 text-sm text-gray-900 px-4">{patient.hospitalId}</td>
                  <td className="py-4 text-sm text-gray-900 px-4">{patient.firstName} {patient.lastName}</td>
                  <td className="py-4 text-sm text-gray-500 px-4">{patient.phone}</td>
                  <td className="py-4 text-sm text-gray-500 px-4">{formatDate(patient.nextDeliveryDate)}</td>
                  <td className="py-4 text-sm text-gray-500 px-4">{patient.location}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <PatientStatusBadge status={patient.status} />
                  </td>
                  <td className="py-4 text-right px-4">
                    <Link 
                      href={`/patients/${patient.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">You're viewing {filteredPatients.length} out of {patients.length} patients</p>
          <div className="flex items-center space-x-2">
            <button className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700">Prev</button>
            <button className="px-2 py-1 text-sm text-blue-600 hover:text-blue-700">1</button>
            <button className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700">2</button>
            <button className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700">3</button>
            <button className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700">4</button>
            <button className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700">5</button>
            <button className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
