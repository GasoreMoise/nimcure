import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  rating: number;
  totalDeliveries: number;
  status: 'active' | 'inactive';
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

const mockRider: Rider = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+234 812 345 6789',
  avatar: '',
  rating: 4.8,
  totalDeliveries: 156,
  status: 'active',
};

export default function RiderProfilePage() {
  const params = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header with breadcrumb */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/dispatch-riders" className="text-blue-600 hover:text-blue-500 text-sm">
              Dispatch Riders
            </Link>
            <span className="text-gray-500 text-sm">/</span>
            <span className="text-gray-500 text-sm">View Rider</span>
          </div>
        </div>

        {/* Main content */}
        <div className="rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-lg font-medium text-gray-900">Rider Profile</h1>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                mockRider.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {mockRider.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <div className="lg:col-span-1">
                <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg">
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-medium mb-4">
                    {mockRider.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h2 className="text-lg font-medium text-gray-900 mb-1">{mockRider.name}</h2>
                  <p className="text-sm text-gray-500 mb-4">{mockRider.email}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2.5 6.66667L10 1.66667L17.5 6.66667V15C17.5 15.442 17.3244 15.866 17.0118 16.1785C16.6993 16.4911 16.2754 16.6667 15.8333 16.6667H4.16667C3.72464 16.6667 3.30072 16.4911 2.98816 16.1785C2.67559 15.866 2.5 15.442 2.5 15V6.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7.5 16.6667V9.16667H12.5V16.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>{mockRider.phone}</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Rating</div>
                    <div className="flex items-center">
                      <span className="text-lg font-medium text-gray-900 mr-1">{mockRider.rating}</span>
                      <svg className="w-5 h-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Deliveries</div>
                    <div className="text-lg font-medium text-gray-900">{mockRider.totalDeliveries}</div>
                  </div>
                </div>
              </div>

              {/* Delivery History */}
              <div className="lg:col-span-2">
                <div className="border rounded-lg">
                  <div className="px-4 py-3 border-b">
                    <h3 className="text-sm font-medium text-gray-900">Recent Deliveries</h3>
                  </div>
                  <div className="divide-y">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-900">Order #{1234 + index}</span>
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              Delivered
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">2h ago</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Delivered to: 123 Main St, Lagos, Nigeria
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
