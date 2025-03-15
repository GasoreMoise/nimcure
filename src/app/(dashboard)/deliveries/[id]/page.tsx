'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDeliveries } from '@/contexts/DeliveryContext';

export default function DeliveryDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { deliveries, updateDelivery } = useDeliveries();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const delivery = deliveries.find(d => d.id === params.id);

  if (!delivery) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-lg font-medium text-gray-900">Delivery not found</h2>
            <Link href="/deliveries" className="mt-4 text-blue-600 hover:text-blue-800">
              Return to deliveries
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (newStatus: 'pending' | 'in_progress' | 'delivered' | 'failed') => {
    setIsUpdating(true);
    try {
      await updateDelivery(delivery.id, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      setShowStatusDropdown(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/deliveries" className="text-gray-500 hover:text-gray-700">
                  Deliveries
                </Link>
              </li>
              <li>
                <span className="text-gray-300">/</span>
              </li>
              <li>
                <span className="text-gray-900">Package {delivery.id}</span>
              </li>
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Delivery Information */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-medium text-gray-900">Delivery Information</h2>
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    disabled={isUpdating}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    {isUpdating ? 'Updating...' : 'Update Status'}
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      {['pending', 'in_progress', 'delivered', 'failed'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(status as any)}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {status.replace('_', ' ').toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-6 border-t border-gray-100">
                <dl className="divide-y divide-gray-100">
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium text-gray-500">Patient</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      <Link href={`/patients/${delivery.patientId}`} className="text-blue-600 hover:text-blue-900">
                        {delivery.patientName}
                      </Link>
                    </dd>
                  </div>
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 sm:col-span-2 sm:mt-0">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(delivery.status)}`}>
                        {delivery.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </dd>
                  </div>
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium text-gray-500">Delivery Date</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {new Date(delivery.date).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium text-gray-500">Items</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      <ul className="list-disc pl-5 space-y-1">
                        {delivery.items.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {delivery.location}
                    </dd>
                  </div>
                  {delivery.notes && (
                    <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-sm font-medium text-gray-500">Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        {delivery.notes}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>

          {/* Rider Information */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900">Rider Information</h2>
              <div className="mt-6">
                {delivery.riderId ? (
                  <div className="border-t border-gray-100">
                    <dl className="divide-y divide-gray-100">
                      <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                          {delivery.riderName}
                        </dd>
                      </div>
                      {delivery.rider && (
                        <>
                          <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium text-gray-500">Phone</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                              {delivery.rider.phone}
                            </dd>
                          </div>
                          <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium text-gray-500">Rating</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                              {delivery.rider.rating} ⭐
                            </dd>
                          </div>
                        </>
                      )}
                    </dl>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">No rider assigned yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
