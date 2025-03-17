import { useState, useEffect } from 'react';
import { useDeliveries } from '@/contexts/DeliveryContext';
import type { Delivery } from '@/contexts/DeliveryContext';

export function useDelivery(id: string) {
  const { deliveries, updateDelivery } = useDeliveries();
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const found = deliveries.find(d => d.id === id);
    if (found) {
      setDelivery(found);
      setError(null);
    } else {
      setError(new Error('Delivery not found'));
    }
    setIsLoading(false);
  }, [id, deliveries]);

  return { delivery, updateDelivery, isLoading, error };
} 