'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDeliveries, type Delivery, type DeliveryStatus } from '@/contexts/DeliveryContext';
import { useDelivery } from '@/hooks/useDelivery';
import { checkDeliveryStatus } from '@/utils/delivery';
import { Notification } from '@/components/ui/Notification';
import { useAdmin } from '@/contexts/AdminContext';

export default function DeliveryDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { deliveries, updateDelivery, updateDeliveryPayment, updateDeliveryStatus } = useDeliveries();
  const { delivery, isLoading, error } = useDelivery(params.id);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const { isAdmin } = useAdmin();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading delivery</div>;
  if (!delivery) return <div>Delivery not found</div>;

  const currentStatus = checkDeliveryStatus(delivery);

  const getStatusColor = (status: string, paymentStatus?: string) => {
    // For unassigned deliveries, show payment status
    if (!delivery.patientId) {
      switch (paymentStatus) {
        case 'paid':
          return 'bg-green-100 text-green-800';
        case 'unpaid':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    }

    // For assigned deliveries, show delivery status
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

  const getStatusOptions = () => {
    if (!delivery.patientId) {
      return ['paid', 'unpaid'];
    }
    return ['pending', 'in_progress', 'delivered', 'failed'];
  };

  const handleStatusUpdate = async (newStatus: Delivery['status'] | 'paid' | 'unpaid') => {
    setIsUpdating(true);
    try {
      if (newStatus === 'paid' || newStatus === 'unpaid') {
        await updateDeliveryPayment(delivery.id, newStatus as 'paid' | 'unpaid');
      } else {
        await updateDeliveryStatus(delivery.id, newStatus as DeliveryStatus);
      }
      setShowStatusDropdown(false);
      setNotificationMessage(`Status has been successfully updated to ${newStatus.toUpperCase()}`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentUpdate = async (newStatus: 'paid' | 'unpaid') => {
    try {
      await updateDeliveryPayment(delivery.id, newStatus);
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  };

  const renderActionButtons = () => (
    <div className="mt-4 space-x-2">
      {currentStatus === 'pending' && (
        <button onClick={() => handleStatusUpdate('in_progress')}>
          Start Delivery
        </button>
      )}
      {currentStatus === 'in_progress' && (
        <button onClick={() => handleStatusUpdate('delivered')}>
          Mark as Delivered
        </button>
      )}
      {delivery.paymentStatus === 'unpaid' && currentStatus === 'delivered' && (
        <button onClick={() => handlePaymentUpdate('paid')}>
          Mark as Paid
        </button>
      )}
    </div>
  );

  const items = delivery.items ? 
    (typeof delivery.items === 'string' ? 
      JSON.parse(delivery.items) : 
      delivery.items
    ) : [];

  // Add a type guard to ensure it's an array
  const itemsArray = Array.isArray(items) ? items : [items];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {showNotification && (
        <Notification
          message={notificationMessage}
          onClose={() => setShowNotification(false)}
        />
      )}
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
                      {getStatusOptions().map((status) => (
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
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        getStatusColor(delivery.status, delivery.paymentStatus)
                      }`}>
                        {!delivery.patientId 
                          ? (delivery.paymentStatus || 'unpaid').toUpperCase()
                          : delivery.status.replace('_', ' ').toUpperCase()
                        }
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
                      <div>
                        {itemsArray.map((item: string, index: number) => (
                          <span key={index}>{item}</span>
                        ))}
                      </div>
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
                          <Link href={`/dispatch-riders/${delivery.riderId}`} className="text-blue-600 hover:text-blue-900">
                            {delivery.riderName}
                          </Link>
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
                            <dt className="text-sm font-medium text-gray-500">Vehicle Type</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                              {delivery.rider.vehicleType}
                            </dd>
                          </div>
                          <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium text-gray-500">Rating</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                              {delivery.rider.rating.toFixed(1)} ⭐
                            </dd>
                          </div>
                          <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                            <dt className="text-sm font-medium text-gray-500">Success Rate</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                              {delivery.rider.successRate}%
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
        {renderActionButtons()}
        {isAdmin && (
          <div className="mt-6 space-y-4 bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium">Admin Controls</h3>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Payment Status
              </label>
              <select
                value={delivery.paymentStatus}
                onChange={(e) => handlePaymentUpdate(e.target.value as 'paid' | 'unpaid')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Delivery Status
              </label>
              <select
                value={delivery.status}
                onChange={(e) => handleStatusUpdate(e.target.value as DeliveryStatus)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
