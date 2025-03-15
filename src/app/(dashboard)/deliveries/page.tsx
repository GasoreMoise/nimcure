'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Delivery {
  id: string;
  patientName: string;
  patientId: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  items: string[];
  riderName: string;
}

const deliveries: Delivery[] = [
  {
    id: '1',
    patientName: 'John Smith',
    patientId: '1',
    date: '2024-03-15',
    status: 'completed',
    items: ['Paracetamol', 'Amoxicillin'],
    riderName: 'David Wilson',
  },
  {
    id: '2',
    patientName: 'Sarah Johnson',
    patientId: '2',
    date: '2024-03-15',
    status: 'in_progress',
    items: ['Ibuprofen'],
    riderName: 'Michael Brown',
  },
  {
    id: '3',
    patientName: 'Emma Wilson',
    patientId: '4',
    date: '2024-03-16',
    status: 'pending',
    items: ['Aspirin', 'Vitamin C'],
    riderName: 'Unassigned',
  },
  {
    id: '4',
    patientName: 'James Davis',
    patientId: '5',
    date: '2024-03-14',
    status: 'cancelled',
    items: ['Metformin'],
    riderName: 'Alex Thompson',
  },
];

export default function DeliveriesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeliveries = deliveries.filter((delivery) =>
    delivery.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.items.some(item => item.toLowerCase().includes(searchTerm.toLowerCase())) ||
    delivery.riderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Deliveries</h1>
          <p className="mt-2 text-sm text-gray-600">
            A list of all deliveries including their status, assigned rider, and delivery date.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/deliveries/new"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            New Delivery
          </Link>
        </div>
      </div>

      <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
        <div className="p-6">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search deliveries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-0 py-2 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm"
            />
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Items
                </th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Rider
                </th>
                <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Delivery Date
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/patients/${delivery.patientId}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      {delivery.patientName}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {delivery.items.join(', ')}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(delivery.status)}`}>
                      {delivery.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {delivery.riderName}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {new Date(delivery.date).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/deliveries/${delivery.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
