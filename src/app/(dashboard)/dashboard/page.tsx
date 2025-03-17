'use client';

import { useDashboard } from '@/hooks/useDashboard';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatDistance } from 'date-fns';

interface Delivery {
  id: string;
  status: string;
  createdAt: string;
  patient: {
    name: string;
  };
  rider?: {
    firstName: string;
    lastName: string;
  };
}

interface Rider {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  totalDeliveries: number;
  successRate: number;
}

export default function DashboardPage() {
  const { data, error, isLoading } = useDashboard();

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-500">Error loading dashboard data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      {data?.currentUser && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-semibold">
            Welcome, {data.currentUser.firstName} {data.currentUser.lastName}
          </h1>
          <p className="text-gray-500">Here's your system overview</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Pending Deliveries"
          value={data?.stats.pendingDeliveries}
          loading={isLoading}
          trend="warning"
        />
        <StatCard
          title="Active Deliveries"
          value={data?.stats.activeDeliveries}
          loading={isLoading}
          trend="info"
        />
        <StatCard
          title="Completed Deliveries"
          value={data?.stats.completedDeliveries}
          loading={isLoading}
          trend="success"
        />
        <StatCard
          title="Success Rate"
          value={`${data?.stats.successRate}%`}
          loading={isLoading}
          trend="info"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Deliveries */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Recent Deliveries</h2>
          </div>
          <div className="divide-y">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="p-4">
                  <Skeleton className="h-12" />
                </div>
              ))
            ) : (
              data?.recentDeliveries.map((delivery: Delivery) => (
                <div key={delivery.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{delivery.patient.name}</p>
                      <p className="text-sm text-gray-500">
                        Rider: {delivery.rider?.firstName || 'Unassigned'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {delivery.status.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDistance(new Date(delivery.createdAt), new Date(), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Top Riders */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">Top Performing Riders</h2>
          </div>
          <div className="divide-y">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="p-4">
                  <Skeleton className="h-12" />
                </div>
              ))
            ) : (
              data?.topRiders.map((rider: Rider) => (
                <div key={rider.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{rider.firstName} {rider.lastName}</p>
                      <p className="text-sm text-gray-500">
                        {rider.totalDeliveries} deliveries
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {rider.successRate}% success rate
                      </p>
                      <p className="text-sm text-gray-500">
                        {rider.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* System Status */}
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">System Status</h2>
            <p className="text-sm text-gray-500">
              Last updated: {data?.systemHealth.lastUpdated && 
                formatDistance(new Date(data.systemHealth.lastUpdated), new Date(), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              data?.systemHealth.status === 'operational' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span className="text-sm font-medium">
              {data?.systemHealth.status === 'operational' ? 'All Systems Operational' : 'System Issues Detected'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  loading, 
  trend = 'neutral' 
}: { 
  title: string; 
  value?: number | string; 
  loading: boolean; 
  trend?: 'success' | 'warning' | 'info' | 'neutral';
}) {
  const trendColors = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800'
  };

  return (
    <Card className="p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      {loading ? (
        <Skeleton className="h-8 w-16 mt-2" />
      ) : (
        <p className={`text-2xl font-semibold mt-2 ${trendColors[trend]}`}>
          {value || 0}
        </p>
      )}
    </Card>
  );
}