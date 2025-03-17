'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDeliveries } from '@/contexts/DeliveryContext';
import { usePatients } from '@/contexts/PatientsContext';
import { useRiders } from '@/contexts/RiderContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { generateQRCode } from '@/utils/delivery';

export default function DeliveriesPage() {
  const router = useRouter();
  const { deliveries, addDelivery, updateDelivery } = useDeliveries();
  const { patients } = usePatients();
  const { riders } = useRiders();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Package Code');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStatus, setActiveStatus] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');

  const availableRiders = riders.filter(rider => rider.status === 'available');

  const [formData, setFormData] = useState({
    riderId: '',
    items: [''],
    location: '',
    deliveryDate: '',
    notes: ''
  });

  // Calculate real-time counts for the sidebar
  const statusCounts = {
    unassigned: {
      paid: deliveries.filter(d => !d.patientId && d.paymentStatus === 'paid').length,
      unpaid: deliveries.filter(d => !d.patientId && d.paymentStatus === 'unpaid').length,
    },
    assigned: {
      pending: deliveries.filter(d => d.patientId && d.status === 'pending').length,
      inProgress: deliveries.filter(d => d.status === 'in_progress').length,
      delivered: deliveries.filter(d => d.status === 'delivered').length,
      failed: deliveries.filter(d => d.status === 'failed').length,
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700';
      case 'pending':
        return 'bg-orange-50 text-orange-700';
      case 'failed':
        return 'bg-red-50 text-red-700';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? value : item))
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, '']
    }));
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleNewDelivery = () => {
    if (availableRiders.length === 0) {
      alert('No Available Dispatch Riders. Please try again later.');
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.riderId) {
      setError('Please select a dispatch rider');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const selectedRider = riders.find(r => r.id === formData.riderId);
      if (!selectedRider) throw new Error('Selected rider not found');

      const packageCode = `PKG-${Math.random().toString(36).substr(2, 9)}`;
      const qrCode = await generateQRCode(packageCode);

      const newDelivery = {
        id: Math.random().toString(36).substr(2, 9),
        packageCode,
        qrCode,
        date: formData.deliveryDate,
        items: JSON.stringify(formData.items.filter(item => item.trim() !== '')),
        status: 'unassigned' as const,
        paymentStatus: 'unpaid' as const,
        location: formData.location,
        riderId: selectedRider.id,
        riderName: `${selectedRider.firstName} ${selectedRider.lastName}`,
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tracking: {
          estimatedArrival: new Date(formData.deliveryDate).toISOString(),
          status: 'unassigned',
          lastUpdated: new Date().toISOString()
        }
      };

      await addDelivery(newDelivery);
      setIsAddModalOpen(false);
      // Reset form
      setFormData({
        riderId: '',
        items: [''],
        location: '',
        deliveryDate: '',
        notes: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter deliveries based on search and active status
  const filteredDeliveries = deliveries.filter(delivery => {
    // Search filter
    const matchesSearch = 
      delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (delivery.patientName?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    // Status filter
    switch (activeStatus) {
      case 'paid':
        return matchesSearch && !delivery.patientId && delivery.paymentStatus === 'paid';
      case 'unpaid':
        return matchesSearch && !delivery.patientId && delivery.paymentStatus === 'unpaid';
      case 'pending':
        return matchesSearch && delivery.patientId && delivery.status === 'pending';
      case 'in_progress':
        return matchesSearch && delivery.status === 'in_progress';
      case 'delivered':
        return matchesSearch && delivery.status === 'delivered';
      case 'failed':
        return matchesSearch && delivery.status === 'failed';
      case 'all':
      default:
        return matchesSearch;
    }
  });

  const sortedDeliveries = [...filteredDeliveries].sort((a, b) => {
    switch (sortBy) {
      case "Package Code":
        return (a.id || '').localeCompare(b.id || '');
      case "Delivery Date":
        return a.date.localeCompare(b.date);
      case "Patient Name":
        return (a.patientName || '').localeCompare(b.patientName || '');
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Deliveries</h1>
          <Button
            onClick={handleNewDelivery}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + New Delivery
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
              <option>Package Code</option>
              <option>Delivery Date</option>
              <option>Patient Name</option>
            </select>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Search by package code, patient name..."
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

        <div className="flex gap-8">
          <div className="w-64 flex-shrink-0">
            <div className="mb-8">
              <h2 className="text-base font-medium text-gray-900 mb-4">Unassigned Deliveries</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveStatus('paid')}
                  className={`flex w-full items-center justify-between py-2 px-3 rounded-md ${
                    activeStatus === 'paid' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>Paid</span>
                  {statusCounts.unassigned.paid > 0 && (
                    <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {statusCounts.unassigned.paid}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveStatus('unpaid')}
                  className={`flex w-full items-center justify-between py-2 px-3 rounded-md ${
                    activeStatus === 'unpaid' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>Unpaid</span>
                  {statusCounts.unassigned.unpaid > 0 && (
                    <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {statusCounts.unassigned.unpaid}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-base font-medium text-gray-900 mb-4">Assigned Deliveries</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setActiveStatus('pending')}
                  className={`flex w-full items-center justify-between py-2 px-3 rounded-md ${
                    activeStatus === 'pending' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>Pending</span>
                  <span className="text-gray-600">{statusCounts.assigned.pending}</span>
                </button>
                <button
                  onClick={() => setActiveStatus('in_progress')}
                  className={`flex w-full items-center justify-between py-2 px-3 rounded-md ${
                    activeStatus === 'in_progress' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>In Progress</span>
                  <span className="text-gray-600">{statusCounts.assigned.inProgress}</span>
                </button>
                <button
                  onClick={() => setActiveStatus('delivered')}
                  className={`flex w-full items-center justify-between py-2 px-3 rounded-md ${
                    activeStatus === 'delivered' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>Delivered</span>
                  <span className="text-gray-600">{statusCounts.assigned.delivered}</span>
                </button>
                <button
                  onClick={() => setActiveStatus('failed')}
                  className={`flex w-full items-center justify-between py-2 px-3 rounded-md ${
                    activeStatus === 'failed' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>Failed</span>
                  {statusCounts.assigned.failed > 0 && (
                    <span className="bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {statusCounts.assigned.failed}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="bg-white shadow rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 ">Package Code</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 ">Delivery Date</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 ">Patient Name</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 ">Status</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 ">Location</th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedDeliveries.map((delivery) => (
                      <tr key={delivery.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{delivery.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(delivery.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{delivery.patientName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                            {delivery.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{delivery.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href={`/deliveries/${delivery.id}`} className="text-blue-600 hover:text-blue-900">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Showing {filteredDeliveries.length} out of {deliveries.length} deliveries
              </p>
              <div className="flex items-center space-x-2">
                <button className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700">Prev</button>
                <button className="px-2 py-1 text-sm text-blue-600 hover:text-blue-700">1</button>
                <button className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700">2</button>
                <button className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700">3</button>
                <button className="px-2 py-1 text-sm text-gray-500 hover:text-gray-700">Next</button>
              </div>
            </div>
          </div>
        </div>

        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-lg font-medium mb-4">Create New Delivery</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Dispatch Rider*
                  </label>
                  <select
                    value={formData.riderId}
                    onChange={(e) => setFormData(prev => ({ ...prev, riderId: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  >
                    <option value="">Choose a rider...</option>
                    {availableRiders.map(rider => (
                      <option key={rider.id} value={rider.id}>
                        {rider.firstName} {rider.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Items*
                  </label>
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        type="text"
                        value={item}
                        onChange={(e) => handleItemChange(index, e.target.value)}
                        placeholder="Enter item description"
                        required
                      />
                      {index > 0 && (
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => handleRemoveItem(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddItem}
                  >
                    Add Item
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Location*
                  </label>
                  <Input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter delivery location"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Date*
                  </label>
                  <Input
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    rows={3}
                  />
                </div>
              </div>

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
                  {isSubmitting ? 'Creating Delivery...' : 'Create Delivery'}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </div>
  );
}
