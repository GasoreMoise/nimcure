'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDeliveries } from '@/contexts/DeliveryContext';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { GrowthChart } from '@/components/dashboard/GrowthChart';
import { Card } from '@/components/ui/Card';
import { 
  TruckIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';

interface DeliveryStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  recentGrowth: number[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { deliveries, loading: deliveriesLoading } = useDeliveries();
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats>({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    recentGrowth: []
  });

  const searchParams = useSearchParams();
  
  useEffect(() => {
    if (searchParams.get('unauthorized') === 'admin') {
      window.alert('You need to be an admin to access that page');
    }
  }, [searchParams]);

  // Calculate delivery statistics whenever deliveries change
  useEffect(() => {
    if (!deliveries) return;

    const stats = {
      total: deliveries.length,
      completed: deliveries.filter(d => d.status === 'delivered').length,
      pending: deliveries.filter(d => ['pending', 'in_progress'].includes(d.status)).length,
      failed: deliveries.filter(d => d.status === 'failed').length,
      recentGrowth: []
    };

    // Calculate monthly growth
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date.getMonth();
    }).reverse();

    const monthlyDeliveries = last12Months.map(month => 
      deliveries.filter(d => new Date(d.createdAt).getMonth() === month).length
    );

    setDeliveryStats({
      ...stats,
      recentGrowth: monthlyDeliveries
    });

    setChartData(prev => ({
      ...prev,
      datasets: [{
        ...prev.datasets[0],
        data: monthlyDeliveries
      }]
    }));
  }, [deliveries]);

  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: {
      fill: boolean;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  }>({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      fill: true,
      data: [],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
    }]
  });

  // Get recent deliveries sorted by date
  const recentDeliveries = deliveries
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  if (deliveriesLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">Welcome back, {user?.firstName}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label="Total Deliveries"
          value={deliveryStats.total}
          change={((deliveryStats.total - deliveryStats.recentGrowth[10]) / deliveryStats.recentGrowth[10] * 100) || 0}
          timeframe="Than last month"
        />
        <StatsCard
          label="Completed"
          value={deliveryStats.completed}
          change={((deliveryStats.completed / deliveryStats.total) * 100) || 0}
          timeframe="Success rate"
        />
        <StatsCard
          label="Pending"
          value={deliveryStats.pending}
          timeframe="Current"
        />
        <StatsCard
          label="Failed"
          value={deliveryStats.failed}
          change={((deliveryStats.failed / deliveryStats.total) * 100) || 0}
          timeframe="Failure rate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GrowthChart data={chartData} />
        </div>
        
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Deliveries</h3>
            <div className="space-y-4">
              {recentDeliveries?.map((delivery) => (
                <div key={delivery.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <TruckIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Delivery #{delivery.id}</p>
                      <p className="text-sm text-gray-500">{getTimeAgo(delivery.createdAt)}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(delivery.status)}`}>
                    {delivery.status}
                  </span>
                </div>
              ))}
            </div>
            <button 
              onClick={() => router.push('/deliveries')}
              className="w-full mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All Deliveries →
            </button>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => router.push('/deliveries')}
                className="p-4 bg-blue-50 rounded-lg text-left hover:bg-blue-100"
              >
                <TruckIcon className="w-6 h-6 text-blue-600 mb-2" />
                <span className="text-sm font-medium">Track Delivery</span>
              </button>
              <button 
                onClick={() => router.push('/deliveries?status=pending')}
                className="p-4 bg-green-50 rounded-lg text-left hover:bg-green-100"
              >
                <CheckCircleIcon className="w-6 h-6 text-green-600 mb-2" />
                <span className="text-sm font-medium">Confirm Delivery</span>
              </button>
              <button 
                onClick={() => router.push('/schedule')}
                className="p-4 bg-purple-50 rounded-lg text-left hover:bg-purple-100"
              >
                <ClockIcon className="w-6 h-6 text-purple-600 mb-2" />
                <span className="text-sm font-medium">Schedule</span>
              </button>
              <button 
                onClick={() => router.push('/support')}
                className="p-4 bg-orange-50 rounded-lg text-left hover:bg-orange-100"
              >
                <XCircleIcon className="w-6 h-6 text-orange-600 mb-2" />
                <span className="text-sm font-medium">Report Issue</span>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}