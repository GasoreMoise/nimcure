'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { PatientsProvider } from '@/contexts/PatientsContext';
import { DeliveryProvider } from '@/contexts/DeliveryContext';
import { RiderProvider } from '@/contexts/RiderContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PatientsProvider>
        <DeliveryProvider>
          <RiderProvider>
            {children}
          </RiderProvider>
        </DeliveryProvider>
      </PatientsProvider>
    </AuthProvider>
  );
}
