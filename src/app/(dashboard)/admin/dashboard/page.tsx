'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

interface Stats {
  totalDeliveries: number;
  totalPatients: number;
  totalRiders: number;
  completedDeliveries: number;
}

interface AdminDashboardData {
  deliveries: any[];
  patients: any[];
  stats: Stats;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      window.alert('You need to be an admin to access this page');
      router.push('/dashboard');
      return;
    }

    async function fetchAdminData() {
      try {
        const response = await fetch('/api/admin/overview');
        if (!response.ok) throw new Error('Failed to fetch admin data');
        const data = await response.json();
        setData(data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminData();
  }, [user, router]);

  if (loading || !data) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-gray-500 text-sm">Total Deliveries</h3>
          <p className="text-2xl font-bold">{data.stats.totalDeliveries}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-gray-500 text-sm">Total Patients</h3>
          <p className="text-2xl font-bold">{data.stats.totalPatients}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-gray-500 text-sm">Total Riders</h3>
          <p className="text-2xl font-bold">{data.stats.totalRiders}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-gray-500 text-sm">Completed Deliveries</h3>
          <p className="text-2xl font-bold">{data.stats.completedDeliveries}</p>
        </Card>
      </div>

      {/* Recent Deliveries */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Deliveries</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Date</th>
                  <th className="text-left py-3">Patient</th>
                  <th className="text-left py-3">Rider</th>
                  <th className="text-left py-3">Status</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.deliveries.slice(0, 5).map((delivery) => (
                  <tr key={delivery.id} className="border-b">
                    <td className="py-3">{formatDate(delivery.createdAt)}</td>
                    <td className="py-3">{delivery.patient.name}</td>
                    <td className="py-3">{delivery.rider.name}</td>
                    <td className="py-3">{delivery.status}</td>
                    <td className="py-3">
                      <button
                        onClick={() => router.push(`/deliveries/${delivery.id}`)}
                        className="text-blue-600 hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => router.push('/admin/deliveries')}
            className="mt-4 text-blue-600 hover:underline"
          >
            View All Deliveries
          </button>
        </div>
      </Card>

      {/* Patients Overview */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Patients Overview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Name</th>
                  <th className="text-left py-3">Email</th>
                  <th className="text-left py-3">Deliveries</th>
                  <th className="text-left py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.patients.slice(0, 5).map((patient) => (
                  <tr key={patient.id} className="border-b">
                    <td className="py-3">{patient.name}</td>
                    <td className="py-3">{patient.user.email}</td>
                    <td className="py-3">{patient._count.deliveries}</td>
                    <td className="py-3">
                      <button
                        onClick={() => router.push(`/patients/${patient.id}`)}
                        className="text-blue-600 hover:underline"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={() => router.push('/admin/patients')}
            className="mt-4 text-blue-600 hover:underline"
          >
            View All Patients
          </button>
        </div>
      </Card>
    </div>
  );
} 