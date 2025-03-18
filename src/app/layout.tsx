import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';
import { AuthProvider } from '@/contexts/AuthContext';
import { DeliveryProvider } from '@/contexts/DeliveryContext';
import { AdminProvider } from '@/contexts/AdminContext';
import { PatientsProvider } from '@/contexts/PatientsContext';
import { RiderProvider } from '@/contexts/RiderContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Nimcure',
    default: 'Nimcure',
  },
  description: 'Nimcure - Healthcare Platform',
  icons: {
    icon: [
      {
        url: '/logo.svg',
        href: '/logo.svg',
        type: 'image/svg+xml',
      }
    ],
    shortcut: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            <AdminProvider>
              <PatientsProvider>
                <RiderProvider>
                  <DeliveryProvider>
                    {children}
                  </DeliveryProvider>
                </RiderProvider>
              </PatientsProvider>
            </AdminProvider>
          </AuthProvider>
        </Providers>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
