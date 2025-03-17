'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRiders } from '@/contexts/RiderContext';
import { useDeliveries } from '@/contexts/DeliveryContext';
import { Button } from '@/components/ui/Button';
import { RiderStatusBadge } from '@/components/riders/RiderStatusBadge';
import Link from 'next/link';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';
import { useRider } from '@/hooks/useRider';

interface PageProps {
  params: {
    id: string;
  };
}

const RatingStars = ({ currentRating, onRate }: { currentRating: number; onRate: (rating: number) => void }) => {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
          className="focus:outline-none"
        >
          {star <= (hover ?? currentRating) ? (
            <StarIcon className="h-5 w-5 text-yellow-400" />
          ) : (
            <StarOutline className="h-5 w-5 text-yellow-400" />
          )}
        </button>
      ))}
    </div>
  );
};

export default function RiderDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { riders, updateRider } = useRiders();
  const { deliveries } = useDeliveries();
  const [rider, setRider] = useState<any>(null);
  const [isRating, setIsRating] = useState(false);
  
  // Get rider's deliveries
  const riderDeliveries = deliveries.filter(d => d.riderId === params.id);
  const activeDeliveries = riderDeliveries.filter(d => d.paymentStatus === 'unpaid');
  const completedDeliveries = riderDeliveries.filter(d => d.paymentStatus === 'paid');
  const isAssigned = activeDeliveries.length > 0;

  const { isLoading, error } = useRider(params.id);

  useEffect(() => {
    const foundRider = riders.find(r => r.id === params.id);
    if (!foundRider) {
      router.push('/dispatch-riders');
      return;
    }
    setRider(foundRider);
  }, [params.id, riders, router]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading rider</div>;
  if (!rider) return <div>Rider not found</div>;

  const StatusBadge = ({ status }: { status: 'assigned' | 'unassigned' }) => (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
      status === 'assigned' 
        ? 'bg-yellow-100 text-yellow-800' 
        : 'bg-green-100 text-green-800'
    }`}>
      {status.toUpperCase()}
    </span>
  );

  const DeliveryCard = ({ delivery }: { delivery: any }) => (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <Link 
            href={`/deliveries/${delivery.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Delivery #{delivery.id}
          </Link>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(delivery.date).toLocaleDateString()}
          </p>
        </div>
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
          delivery.paymentStatus === 'paid' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {delivery.paymentStatus.toUpperCase()}
        </span>
      </div>
      <div className="mt-2">
        <p className="text-sm text-gray-600">Location: {delivery.location}</p>
        <p className="text-sm text-gray-600">
          Items: {
            typeof delivery.items === 'string' && delivery.items.startsWith('[') 
              ? JSON.parse(delivery.items).join(', ')
              : delivery.items
          }
        </p>
      </div>
    </div>
  );

  const calculateSuccessRate = () => {
    const totalDeliveries = riderDeliveries.length;
    const completedCount = completedDeliveries.length;
    return totalDeliveries > 0 
      ? ((completedCount / totalDeliveries) * 100).toFixed(1)
      : '0';
  };

  const handleRating = async (newRating: number) => {
    setIsRating(true);
    try {
      // If rider doesn't have initial rating values, set them to 0
      const currentRating = rider.rating || 0;
      const currentTotalRatings = rider.totalRatings || 0;

      // Calculate new average rating
      const newAverageRating = (
        (currentRating * currentTotalRatings + newRating) / 
        (currentTotalRatings + 1)
      );

      const updatedRider = {
        ...rider,
        rating: parseFloat(newAverageRating.toFixed(1)),
        totalRatings: currentTotalRatings + 1,
        ratingHistory: [
          ...(rider.ratingHistory || []),
          { rating: newRating, date: new Date().toISOString() }
        ]
      };

      // Update rider in database
      await updateRider(rider.id, updatedRider);
      
      // Update local state
      setRider(updatedRider);

      // Optional: Add a success notification
      alert('Rating updated successfully!');
    } catch (error) {
      console.error('Failed to update rating:', error);
      alert('Failed to update rating. Please try again.');
    } finally {
      setIsRating(false);
    }
  };

  return (
    <div className="p-6">
      {/* Breadcrumb Navigation */}
      <div className="mb-8 flex items-center gap-2 text-sm">
        <Link 
          href="/dispatch-riders" 
          className="text-blue-600 hover:text-blue-800"
        >
          Dispatch Riders
        </Link>
        <span className="text-gray-500">/</span>
        <span className="text-gray-600">View Dispatch Rider</span>
      </div>

      <div className="min-h-screen bg-gray-50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Rider Details</h1>
              <div className="mt-1 flex items-center gap-3">
                <p className="text-sm text-gray-600">
                  {rider.firstName} {rider.lastName}
                </p>
                <StatusBadge status={isAssigned ? 'assigned' : 'unassigned'} />
              </div>
            </div>
            <Button
              onClick={() => router.push('/dispatch-riders')}
              variant="outline"
            >
              Back to Riders
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Full Name</label>
                  <p className="mt-1 text-sm text-gray-900">{rider.firstName} {rider.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{rider.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{rider.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Vehicle Type</label>
                  <p className="mt-1 text-sm text-gray-900">{rider.vehicleType}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Current Status</label>
                  <div className="mt-1">
                    <RiderStatusBadge status={rider.status} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Rating</label>
                  <div className="mt-1 flex items-center gap-4">
                    <p className="text-sm text-gray-900">
                      {rider.rating.toFixed(1)} / 5.0 
                      <span className="text-gray-500 text-xs ml-1">
                        ({rider.totalRatings} ratings)
                      </span>
                    </p>
                    <RatingStars 
                      currentRating={rider.rating} 
                      onRate={handleRating}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Total Deliveries</label>
                  <p className="mt-1 text-sm text-gray-900">{rider.totalDeliveries}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Success Rate</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {calculateSuccessRate()}%
                    <span className="text-gray-500 text-xs ml-2">
                      ({completedDeliveries.length} of {riderDeliveries.length} deliveries)
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Active Deliveries
                <span className="ml-2 text-sm text-gray-500">({activeDeliveries.length})</span>
              </h2>
              {activeDeliveries.length > 0 ? (
                <div className="space-y-4">
                  {activeDeliveries.map(delivery => (
                    <DeliveryCard key={delivery.id} delivery={delivery} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No active deliveries</p>
              )}
            </div>

            <div className="bg-white shadow rounded-lg p-6 md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Completed Deliveries
                <span className="ml-2 text-sm text-gray-500">({completedDeliveries.length})</span>
              </h2>
              {completedDeliveries.length > 0 ? (
                <div className="space-y-4">
                  {completedDeliveries.map(delivery => (
                    <DeliveryCard key={delivery.id} delivery={delivery} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No completed deliveries</p>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Created At</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(rider.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Updated</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(rider.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => router.push('/dispatch-riders')}
            >
              Back to List
            </Button>
            <Button
              onClick={() => {
                // Implement edit functionality
                console.log('Edit rider:', rider.id);
              }}
            >
              Edit Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
