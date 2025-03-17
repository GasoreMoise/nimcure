'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRiders } from '@/contexts/RiderContext';
import { useDeliveries } from '@/contexts/DeliveryContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function NewDeliveryPage() {
  const router = useRouter();
  const { riders } = useRiders();
  const { addDelivery } = useDeliveries();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableRiders = riders.filter(rider => rider.status === 'available');

  // Block access if no riders available
  if (availableRiders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-semibold text-red-600">No Available Dispatch Riders</h2>
        <p className="text-gray-600 mt-2">Please try again when riders are available.</p>
        <Button 
          onClick={() => router.push('/deliveries')}
          className="mt-4"
        >
          Back to Deliveries
        </Button>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    riderId: '',
    items: [''],
    location: '',
    deliveryDate: '',
    notes: ''
  });

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

      const newDelivery = {
        id: Math.random().toString(36).substr(2, 9),
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
      router.push('/deliveries');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create delivery');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Create New Delivery</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
                onChange={(e) => {
                  const newItems = [...formData.items];
                  newItems[index] = e.target.value;
                  setFormData(prev => ({ ...prev, items: newItems }));
                }}
                placeholder="Enter item description"
                required
              />
              {index > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      items: prev.items.filter((_, i) => i !== index)
                    }));
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                items: [...prev.items, '']
              }));
            }}
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
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/deliveries')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Delivery'}
          </Button>
        </div>
      </form>
    </div>
  );
}
