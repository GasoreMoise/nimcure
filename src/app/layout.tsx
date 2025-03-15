import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { PatientsProvider } from '@/contexts/PatientsContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nimcure',
  description: 'Healthcare delivery management system',
  icons: {
    icon: '/logo.svg',
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
        <PatientsProvider>
          <Providers>{children}</Providers>
        </PatientsProvider>
      </body>
    </html>
  );
}
