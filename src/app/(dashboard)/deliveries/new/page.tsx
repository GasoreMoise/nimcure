'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useDeliveries } from '@/contexts/DeliveryContext';
import { usePatients } from '@/contexts/PatientsContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function NewDeliveryPage() {
  const router = useRouter();
  const { addDelivery } = useDeliveries();
  const { patients } = usePatients();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    packageCode: '',
    deliveryDate: '',
    items: [''],
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedPatient = patients.find(p => p.id === formData.patientId);
      if (!selectedPatient) throw new Error('Patient not found');

      const newDelivery = {
        id: formData.packageCode || Math.random().toString(36).substr(2, 9),
        patientId: selectedPatient.id,
        patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`,
        patientPhone: selectedPatient.phone,
        date: formData.deliveryDate,
        items: formData.items.filter(item => item.trim() !== ''),
        status: 'pending' as const,
        paymentStatus: 'unpaid' as const,
        location: selectedPatient.location,
        riderId: '',
        riderName: '',
        notes: formData.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tracking: {
          estimatedArrival: new Date(formData.deliveryDate).toISOString(),
          status: 'pending',
          lastUpdated: new Date().toISOString()
        }
      };

      await addDelivery(newDelivery);
      router.push('/deliveries');
    } catch (error) {
      console.error('Failed to create delivery:', error);
      // You might want to add error handling UI here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">New Delivery</h1>
          <Link
            href="/deliveries"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            ← Back to Deliveries
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Patient
              </label>
              <select
                value={formData.patientId}
                onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select a patient...</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} - {patient.hospitalId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Package Code
              </label>
              <Input
                type="text"
                value={formData.packageCode}
                onChange={(e) => setFormData(prev => ({ ...prev, packageCode: e.target.value }))}
                placeholder="Enter package code"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date
              </label>
              <Input
                type="datetime-local"
                value={formData.deliveryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Items
              </label>
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newItems = [...formData.items];
                        newItems[index] = e.target.value;
                        setFormData(prev => ({ ...prev, items: newItems }));
                      }}
                      placeholder="Enter item description"
                      className="flex-1"
                      required
                    />
                    {formData.items.length > 1 && (
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
                  + Add Item
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
                placeholder="Add any delivery notes or special instructions..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
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
      </div>
    </div>
  );
}
