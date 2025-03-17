'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRiders } from '@/contexts/RiderContext';
import { useDeliveries } from '@/contexts/DeliveryContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { RiderStatusBadge } from '@/components/riders/RiderStatusBadge';

export default function DispatchRidersPage() {
  const router = useRouter();
  const { riders, addRider } = useRiders();
  const { deliveries } = useDeliveries();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('Name');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    vehicleType: 'motorcycle' as const,
    status: 'available' as const,
    rating: 0,
    totalDeliveries: 0,
    successRate: 0,
    totalRatings: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await addRider(formData);
      setIsAddModalOpen(false);
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        vehicleType: 'motorcycle',
        status: 'available',
        rating: 0,
        totalDeliveries: 0,
        successRate: 0,
        totalRatings: 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add rider');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRiders = riders.filter((rider) =>
    `${rider.firstName} ${rider.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rider.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedRiders = [...filteredRiders].sort((a, b) => {
    switch (sortBy) {
      case 'Name':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case 'Status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const getRiderStatus = (riderId: string) => {
    const riderDeliveries = deliveries.filter(d => d.riderId === riderId);
    const hasUnpaidDeliveries = riderDeliveries.some(d => d.paymentStatus === 'unpaid');
    return hasUnpaidDeliveries ? 'assigned' : 'unassigned';
  };

  const StatusBadge = ({ status }: { status: 'assigned' | 'unassigned' }) => (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
      status === 'assigned' 
        ? 'bg-yellow-100 text-yellow-800' 
        : 'bg-green-100 text-green-800'
    }`}>
      {status.toUpperCase()}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Dispatch Riders</h1>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + Add Rider
          </Button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border-gray-300 py-1.5 pl-3 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option>Name</option>
              <option>Status</option>
            </select>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, or phone"
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

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedRiders.map((rider) => (
                <tr key={rider.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {rider.firstName} {rider.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{rider.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{rider.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={getRiderStatus(rider.id)} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      onClick={() => router.push(`/dispatch-riders/${rider.id}`)}
                      variant="outline"
                      size="sm"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Dispatch Rider</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name*
                  </label>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name*
                  </label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email*
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number*
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type*
                </label>
                <select
                  value={formData.vehicleType}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value as 'motorcycle' }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex justify-end space-x-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Rider'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
} 