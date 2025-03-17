import { useEffect, useState } from 'react';
import { useRiders, type Rider } from '@/contexts/RiderContext';

export function useRider(id: string) {
  const { riders } = useRiders();
  const [rider, setRider] = useState<Rider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const foundRider = riders.find(r => r.id === id);
      if (!foundRider) {
        throw new Error('Rider not found');
      }
      setRider(foundRider);
      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load rider'));
      setIsLoading(false);
    }
  }, [id, riders]);

  return { rider, isLoading, error };
} 