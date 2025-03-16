import { useState } from 'react';
import { useRiders } from '@/contexts/RiderContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AddRiderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddRiderModal({ isOpen, onClose }: AddRiderModalProps) {
  const { addRider } = useRiders();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    vehicleType: 'motorcycle' as 'motorcycle' | 'car' | 'bicycle',
  });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addRider({
        ...formData,
        status: 'available',
        rating: 0,
        totalDeliveries: 0,
        successRate: 0,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add rider');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-lg font-medium mb-4">Add New Rider</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="form-label">First Name</label>
            <Input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                firstName: e.target.value
              }))}
              required
            />
          </div>

          <div>
            <label className="form-label">Last Name</label>
            <Input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                lastName: e.target.value
              }))}
              required
            />
          </div>

          <div>
            <label className="form-label">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                email: e.target.value
              }))}
              required
            />
          </div>

          <div>
            <label className="form-label">Phone</label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                phone: e.target.value
              }))}
              required
            />
          </div>

          <div>
            <label className="form-label">Vehicle Type</label>
            <select
              className="form-input"
              value={formData.vehicleType}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                vehicleType: e.target.value as 'motorcycle' | 'car' | 'bicycle'
              }))}
              required
            >
              <option value="motorcycle">Motorcycle</option>
              <option value="car">Car</option>
              <option value="bicycle">Bicycle</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Rider
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 