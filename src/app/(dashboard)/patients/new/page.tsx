'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePatients, Patient } from '@/contexts/PatientsContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function NewPatientPage() {
  const router = useRouter();
  const { addPatient } = usePatients();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    hospitalId: '',
    nextDeliveryDate: '',
    drugCycle: '',
    location: '',
    gender: '' as Patient['gender'],
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await addPatient({
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        status: 'active',
        createdAt: new Date().toISOString(),
        paymentStatus: 'unpaid',
        address: formData.location,
        missedDeliveries: 0,
        location: formData.location
      });
      
      router.push('/patients');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Patient</h1>
          <p className="mt-2 text-sm text-gray-600">
            Enter the patient's information to create a new record.
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <Input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <Input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Hospital ID
                </label>
                <Input
                  type="text"
                  name="hospitalId"
                  value={formData.hospitalId}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <Input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Next Delivery Date
                </label>
                <Input
                  type="date"
                  name="nextDeliveryDate"
                  value={formData.nextDeliveryDate}
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Drug Cycle (weeks)
                </label>
                <Input
                  type="number"
                  name="drugCycle"
                  value={formData.drugCycle}
                  onChange={handleChange}
                  min="1"
                  className="mt-1"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/patients')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding Patient...' : 'Add Patient'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
