'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { 
    name: 'Overview', 
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.5 2.5H8.33333V8.33333H2.5V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.6667 2.5H17.5V8.33333H11.6667V2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M11.6667 11.6667H17.5V17.5H11.6667V11.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2.5 11.6667H8.33333V17.5H2.5V11.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    name: 'Deliveries', 
    href: '/deliveries',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.3333 5.83333H15.8333L18.3333 8.33333V13.3333H16.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 13.3333V5.83333H13.3333" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.33333 15.8333C4.71405 15.8333 5.83333 14.714 5.83333 13.3333C5.83333 11.9526 4.71405 10.8333 3.33333 10.8333C1.95262 10.8333 0.833336 11.9526 0.833336 13.3333C0.833336 14.714 1.95262 15.8333 3.33333 15.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.6667 15.8333C18.0474 15.8333 19.1667 14.714 19.1667 13.3333C19.1667 11.9526 18.0474 10.8333 16.6667 10.8333C15.286 10.8333 14.1667 11.9526 14.1667 13.3333C14.1667 14.714 15.286 15.8333 16.6667 15.8333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    name: 'Patients', 
    href: '/patients',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.3333 17.5V15.8333C13.3333 14.9493 12.9821 14.1014 12.357 13.4763C11.7319 12.8512 10.884 12.5 9.99999 12.5H4.99999C4.11593 12.5 3.26809 12.8512 2.64297 13.4763C2.01785 14.1014 1.66666 14.9493 1.66666 15.8333V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7.49999 9.16667C9.34094 9.16667 10.8333 7.67428 10.8333 5.83333C10.8333 3.99238 9.34094 2.5 7.49999 2.5C5.65904 2.5 4.16666 3.99238 4.16666 5.83333C4.16666 7.67428 5.65904 9.16667 7.49999 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18.3333 17.5001V15.8334C18.3328 15.0948 18.0866 14.3774 17.6345 13.7937C17.1824 13.2099 16.5483 12.7921 15.8333 12.6084" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.3333 2.60833C14.0503 2.79102 14.6865 3.20892 15.1399 3.79359C15.5933 4.37827 15.8398 5.09734 15.8398 5.8375C15.8398 6.57766 15.5933 7.29673 15.1399 7.88141C14.6865 8.46608 14.0503 8.88398 13.3333 9.06667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    name: 'Dispatch Riders', 
    href: '/dispatch-riders',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10.8333 13.3333L17.5 10L10.8333 6.66667V3.33333L1.66666 10L10.8333 16.6667V13.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  },
  { 
    name: 'Admin', 
    href: '/admin',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.1667 12.5C16.0558 12.7513 16.0227 13.0302 16.0717 13.3005C16.1207 13.5708 16.2496 13.8203 16.4417 14.0167L16.4917 14.0667C16.6467 14.2215 16.7696 14.4053 16.8535 14.6075C16.9374 14.8096 16.9805 15.0263 16.9805 15.245C16.9805 15.4637 16.9374 15.6804 16.8535 15.8825C16.7696 16.0847 16.6467 16.2685 16.4917 16.4233C16.3369 16.5783 16.1531 16.7012 15.9509 16.7851C15.7488 16.869 15.5321 16.9121 15.3134 16.9121C15.0947 16.9121 14.878 16.869 14.6758 16.7851C14.4737 16.7012 14.2899 16.5783 14.135 16.4233L14.085 16.3733C13.8887 16.1812 13.6391 16.0523 13.3688 16.0033C13.0985 15.9543 12.8196 15.9874 12.5683 16.0983C12.3226 16.204 12.114 16.3812 11.9691 16.6074C11.8242 16.8335 11.7496 17.0977 11.7533 17.3667V17.5C11.7533 17.942 11.5778 18.366 11.2653 18.6785C10.9527 18.9911 10.5287 19.1667 10.0867 19.1667C9.64467 19.1667 9.22067 18.9911 8.90812 18.6785C8.59557 18.366 8.42001 17.942 8.42001 17.5V17.425C8.41616 17.1462 8.32757 16.8762 8.16751 16.6509C8.00745 16.4257 7.78251 16.2562 7.52167 16.1667C7.27037 16.0557 6.99144 16.0226 6.72115 16.0717C6.45087 16.1207 6.20132 16.2496 6.00501 16.4417L6.00501 16.4917C5.80018 16.6467 5.61635 16.7696 5.41421 16.8535C5.21206 16.9374 4.99538 16.9805 4.77667 16.9805C4.55797 16.9805 4.34128 16.9374 4.13914 16.8535C3.937 16.7696 3.75317 16.6467 3.59834 16.4917C3.44334 16.3369 3.32043 16.1531 3.23653 15.9509C3.15264 15.7488 3.10957 15.5321 3.10957 15.3134C3.10957 15.0947 3.15264 14.878 3.23653 14.6758C3.32043 14.4737 3.44334 14.2899 3.59834 14.135L3.64834 14.085C3.84043 13.8887 3.96931 13.6391 4.01833 13.3688C4.06735 13.0985 4.03425 12.8196 3.92334 12.5683C3.81767 12.3226 3.64044 12.114 3.41429 11.9691C3.18815 11.8242 2.92391 11.7496 2.65501 11.7533H2.50001C2.05797 11.7533 1.63398 11.5778 1.32143 11.2653C1.00888 10.9527 0.833344 10.5287 0.833344 10.0867C0.833344 9.64467 1.00888 9.22067 1.32143 8.90812C1.63398 8.59557 2.05797 8.42001 2.50001 8.42001H2.57501C2.85378 8.41616 3.12382 8.32757 3.34907 8.16751C3.57433 8.00745 3.74387 7.78251 3.83334 7.52167C3.94425 7.27037 3.97735 6.99144 3.92833 6.72115C3.87931 6.45087 3.75043 6.20132 3.55834 6.00501L3.50834 5.95501C3.35334 5.80018 3.23043 5.61635 3.14653 5.41421C3.06264 5.21206 3.01957 4.99538 3.01957 4.77667C3.01957 4.55797 3.06264 4.34128 3.14653 4.13914C3.23043 3.937 3.35334 3.75317 3.50834 3.59834C3.66317 3.44334 3.847 3.32043 4.04914 3.23653C4.25128 3.15264 4.46797 3.10957 4.68667 3.10957C4.90538 3.10957 5.12206 3.15264 5.32421 3.23653C5.52635 3.32043 5.71018 3.44334 5.86501 3.59834L5.91501 3.64834C6.11132 3.84043 6.36087 3.96931 6.63115 4.01833C6.90144 4.06735 7.18037 4.03425 7.43167 3.92334H7.50001C7.74568 3.81767 7.95429 3.64044 8.09919 3.41429C8.24409 3.18815 8.31868 2.92391 8.31501 2.65501V2.50001C8.31501 2.05797 8.49057 1.63398 8.80312 1.32143C9.11567 1.00888 9.53967 0.833344 9.98167 0.833344C10.4237 0.833344 10.8477 1.00888 11.1602 1.32143C11.4728 1.63398 11.6483 2.05797 11.6483 2.50001V2.57501C11.6447 2.84391 11.7193 3.10815 11.8642 3.33429C12.0091 3.56044 12.2177 3.73767 12.4633 3.84334C12.7146 3.95425 12.9936 3.98735 13.2639 3.93833C13.5341 3.88931 13.7837 3.76043 13.98 3.56834L14.03 3.51834C14.1848 3.36334 14.3687 3.24043 14.5708 3.15653C14.7729 3.07264 14.9896 3.02957 15.2083 3.02957C15.427 3.02957 15.6437 3.07264 15.8459 3.15653C16.048 3.24043 16.2318 3.36334 16.3867 3.51834C16.5417 3.67317 16.6646 3.857 16.7485 4.05914C16.8324 4.26128 16.8754 4.47797 16.8754 4.69667C16.8754 4.91538 16.8324 5.13206 16.7485 5.33421C16.6646 5.53635 16.5417 5.72018 16.3867 5.87501L16.3367 5.92501C16.1446 6.12132 16.0157 6.37087 15.9667 6.64115C15.9177 6.91144 15.9508 7.19037 16.0617 7.44167V7.50001C16.1673 7.74568 16.3446 7.95429 16.5707 8.09919C16.7969 8.24409 17.0611 8.31868 17.33 8.31501H17.5C17.942 8.31501 18.366 8.49057 18.6786 8.80312C18.9911 9.11567 19.1667 9.53967 19.1667 9.98167C19.1667 10.4237 18.9911 10.8477 18.6786 11.1602C18.366 11.4728 17.942 11.6483 17.5 11.6483H17.425C17.1561 11.6447 16.8919 11.7193 16.6657 11.8642C16.4396 12.0091 16.2624 12.2177 16.1567 12.4633V12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
];

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (href: string) => {
    if (href === '/dashboard' && pathname === '/dashboard') {
      return true;
    }
    return pathname.startsWith(href) && href !== '/dashboard';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 justify-between"> 
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center">
                  <Image
                    src="/logo.svg"
                    alt="Nimcure Logo"
                    width={32}
                    height={32}
                    priority
                    className="h-8 w-8"
                  />
                  <span className="ml-2 text-xl font-semibold text-gray-900">Nimcure</span>
                </Link>
              </div>
              <div className="hidden sm:ml-36 sm:mr-auto sm:flex sm:space-x-8"> 
                {navigation.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center gap-2 border-b-2 px-1 pt-1 text-sm font-medium ${
                        active
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <span className={active ? 'text-blue-600' : 'text-gray-400'}>
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="relative ml-3">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">{user.firstName} {user.lastName}</span>
                  <button
                    type="button"
                    className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span>
                    </div>
                  </button>
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-10 ring-1 ring-black ring-opacity-5">
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-50"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <span className="sr-only">Open navigation menu</span>
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block py-2 pl-3 pr-4 text-base font-medium ${
                      active
                        ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className={active ? 'text-blue-600' : 'text-gray-400'}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
