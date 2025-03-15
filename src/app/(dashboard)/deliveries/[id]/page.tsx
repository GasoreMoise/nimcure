'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface DeliveryStatus {
  timestamp: string;
  status: string;
  description: string;
}

const mockDelivery = {
  id: '1',
  patientName: 'John Smith',
  patientId: '1',
  date: '2024-03-15',
  status: 'in_progress',
  items: [
    { name: 'Paracetamol', quantity: 2, unit: 'boxes' },
    { name: 'Amoxicillin', quantity: 1, unit: 'bottle' },
  ],
  rider: {
    name: 'David Wilson',
    phone: '+1234567890',
  },
  notes: 'Please deliver before 6 PM',
  statusHistory: [
    {
      timestamp: '2024-03-15T08:00:00',
      status: 'created',
      description: 'Delivery order created',
    },
    {
      timestamp: '2024-03-15T08:30:00',
      status: 'assigned',
      description: 'Assigned to rider David Wilson',
    },
    {
      timestamp: '2024-03-15T09:00:00',
      status: 'picked_up',
      description: 'Medications picked up from pharmacy',
    },
  ] as DeliveryStatus[],
};

export default function DeliveryDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();

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
          <h1 className="text-2xl font-semibold text-gray-900">
            Delivery #{params.id}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            View delivery details and track status
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back
          </button>
          <button
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Update Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Delivery Information */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Delivery Information</h2>
            <div className="mt-6 border-t border-gray-100">
              <dl className="divide-y divide-gray-100">
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium text-gray-500">Patient</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    <Link href={`/patients/${mockDelivery.patientId}`} className="text-blue-600 hover:text-blue-900">
                      {mockDelivery.patientName}
                    </Link>
                  </dd>
                </div>
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 sm:col-span-2 sm:mt-0">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(mockDelivery.status)}`}>
                      {mockDelivery.status.replace('_', ' ')}
                    </span>
                  </dd>
                </div>
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium text-gray-500">Delivery Date</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {new Date(mockDelivery.date).toLocaleDateString()}
                  </dd>
                </div>
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium text-gray-500">Rider</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {mockDelivery.rider.name} ({mockDelivery.rider.phone})
                  </dd>
                </div>
                <div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                    {mockDelivery.notes}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-6">
              <h3 className="text-sm font-medium text-gray-900">Items</h3>
              <div className="mt-4 divide-y divide-gray-100">
                {mockDelivery.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-900">{item.name}</span>
                    <span className="text-sm text-gray-500">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900">Status Timeline</h2>
            <div className="mt-6 flow-root">
              <ul className="-mb-8">
                {mockDelivery.statusHistory.map((status, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== mockDelivery.statusHistory.length - 1 && (
                        <span
                          className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      )}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
                            <svg className="h-4 w-4 text-blue-600" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                              <path d="M16.6667 5L7.50001 14.1667L3.33334 10" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-900">{status.description}</p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            {new Date(status.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
