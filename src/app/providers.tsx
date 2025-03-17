'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { PatientsProvider } from '@/contexts/PatientsContext';
import { DeliveryProvider } from '@/contexts/DeliveryContext';
import { RiderProvider } from '@/contexts/RiderContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PatientsProvider>
          <DeliveryProvider>
            <RiderProvider>
              {children}
            </RiderProvider>
          </DeliveryProvider>
        </PatientsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
