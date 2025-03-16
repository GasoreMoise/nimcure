'use client';

import { useState } from 'react';
import { useRiders, type Rider } from '@/contexts/RiderContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AddRiderModal } from '@/components/riders/AddRiderModal';
import { RiderStatusBadge } from '@/components/riders/RiderStatusBadge';

export default function RidersPage() {
  const { riders, loading, error } = useRiders();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof Rider>('firstName');

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  const filteredRiders = riders.filter((rider) =>
    `${rider.firstName} ${rider.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRiders = [...filteredRiders].sort((a, b) => {
    if (sortBy === 'successRate' || sortBy === 'rating') {
      return (b[sortBy] || 0) - (a[sortBy] || 0);
    }
    return String(a[sortBy]).localeCompare(String(b[sortBy]));
  });

  return (
    <div className="p-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Dispatch Riders</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your dispatch riders and track their delivery performance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button onClick={() => setIsAddModalOpen(true)}>
            Add Rider
          </Button>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="search"
            placeholder="Search riders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as keyof Rider)}
            className="form-input max-w-xs"
          >
            <option value="firstName">Name</option>
            <option value="successRate">Success Rate</option>
            <option value="rating">Rating</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="overflow-hidden bg-white shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  Name
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Contact
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Performance
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Vehicle
                </th>
                <th className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedRiders.map((rider) => (
                <tr key={rider.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                    <div className="font-medium text-gray-900">
                      {rider.firstName} {rider.lastName}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div>{rider.email}</div>
                    <div>{rider.phone}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <RiderStatusBadge status={rider.status} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-1">★</span>
                      <span>{rider.rating.toFixed(1)}</span>
                      <span className="mx-2">•</span>
                      <span>{rider.successRate}% success</span>
                    </div>
                    <div className="text-gray-500">
                      {rider.totalDeliveries} deliveries
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {rider.vehicleType}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {/* Handle edit */}}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-900"
                      onClick={() => {/* Handle delete */}}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <AddRiderModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
        />
      )}
    </div>
  );
} 