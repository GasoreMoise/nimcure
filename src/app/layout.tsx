import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { PatientsProvider } from '@/contexts/PatientsContext';
import { DeliveryProvider } from '@/contexts/DeliveryContext';
import { RiderProvider } from '@/contexts/RiderContext';

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
          {children}
        </Providers>
      </body>
    </html>
  );
}
