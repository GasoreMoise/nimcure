'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface Patient {
  hospitalId: string;
  name: string;
  phoneNumber: string;
  nextDeliveryDate: string;
  location: string;
  status: 'Completed' | 'Due & Paid' | 'Due & Unpaid' | 'Assigned' | 'Paid';
}

const mockPatients: Patient[] = [
  {
    hospitalId: '1AFHH-093',
    name: 'Oluwaseun Areqbesola',
    phoneNumber: '+2347068642920',
    nextDeliveryDate: '12th September 2020',
    location: 'VI, Lagos',
    status: 'Completed'
  },
  {
    hospitalId: '1AFHH-093',
    name: 'Stella Omotayo',
    phoneNumber: '+2347068642920',
    nextDeliveryDate: '12th September 2020',
    location: 'VI, Lagos',
    status: 'Completed'
  },
  {
    hospitalId: '1AFHH-093',
    name: 'Chinyere Okafar',
    phoneNumber: '+2347068642920',
    nextDeliveryDate: '12th September 2020',
    location: 'VI, Lagos',
    status: 'Due & Paid'
  }
];

export default function PatientsPage() {
  const [sortBy, setSortBy] = useState('Hospital ID');
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#DCFCE7] text-[#166534]';
      case 'Due & Paid':
        return 'bg-[#FEF3C7] text-[#92400E]';
      case 'Due & Unpaid':
        return 'bg-[#FEE2E2] text-[#991B1B]';
      case 'Assigned':
        return 'bg-[#DBEAFE] text-[#1E40AF]';
      case 'Paid':
        return 'bg-[#DCFCE7] text-[#166534]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-medium text-gray-900">Patients</h1>
        <Button>
          <svg className="w-4 h-4 mr-2" viewBox="0 0 14 14" fill="none">
            <path d="M7 1V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M1 7H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Add Patient
        </Button>
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by</span>
          <select
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Hospital ID</option>
            <option>Patient's Name</option>
            <option>Next Delivery Date</option>
            <option>Status</option>
          </select>
        </div>

        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Search by patient name, id"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hospital ID</TableHead>
              <TableHead>Patient's Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Next Delivery Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPatients.map((patient, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{patient.hospitalId}</TableCell>
                <TableCell>{patient.name}</TableCell>
                <TableCell>{patient.phoneNumber}</TableCell>
                <TableCell>{patient.nextDeliveryDate}</TableCell>
                <TableCell>{patient.location}</TableCell>
                <TableCell>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                    {patient.status}
                  </span>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" className="text-blue-600">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
