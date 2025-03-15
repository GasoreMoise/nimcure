'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import { useState } from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isIncrease: boolean;
  icon: string;
}

const StatCard = ({ title, value, change, isIncrease, icon }: StatCardProps) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-2xl font-semibold text-gray-900 mt-2">{value}</p>
    <div className={`flex items-center mt-2 ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>
      <span className="text-sm font-medium">{change}</span>
      <svg
        className={`w-4 h-4 ml-1 ${isIncrease ? 'rotate-0' : 'rotate-180'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
      </svg>
    </div>
  </div>
);

interface PrescriptionCardProps {
  patientName: string;
  medication: string;
  status: 'pending' | 'processing' | 'delivered';
  time: string;
}

const PrescriptionCard = ({ patientName, medication, status, time }: PrescriptionCardProps) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{patientName}</h4>
          <p className="text-sm text-gray-500 mt-1">{medication}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-2">{time}</p>
    </div>
  );
};

export default function DashboardPage() {
  const stats = [
    {
      title: 'Total Prescriptions',
      value: '2,345',
      change: '12% vs last month',
      isIncrease: true,
      icon: '💊',
    },
    {
      title: 'Active Deliveries',
      value: '42',
      change: '8% vs last month',
      isIncrease: true,
      icon: '🚚',
    },
    {
      title: 'Pending Renewals',
      value: '18',
      change: '5% vs last month',
      isIncrease: false,
      icon: '📋',
    },
    {
      title: 'Patient Satisfaction',
      value: '98%',
      change: '2% vs last month',
      isIncrease: true,
      icon: '⭐',
    },
  ];

  const recentPrescriptions = [
    {
      patientName: 'John Doe',
      medication: 'Amoxicillin 500mg',
      status: 'pending',
      time: '10 minutes ago',
    },
    {
      patientName: 'Jane Smith',
      medication: 'Lisinopril 10mg',
      status: 'processing',
      time: '25 minutes ago',
    },
    {
      patientName: 'Robert Johnson',
      medication: 'Metformin 850mg',
      status: 'delivered',
      time: '1 hour ago',
    },
  ] as const;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Prescriptions</h2>
            <button className="text-sm font-medium text-primary-600 hover:text-primary-700">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {recentPrescriptions.map((prescription) => (
              <PrescriptionCard key={prescription.patientName} {...prescription} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button className="p-6 bg-primary-50 rounded-xl border border-primary-100 hover:bg-primary-100 transition-colors">
            <div className="flex items-center gap-4">
              <span className="text-2xl">➕</span>
              <div className="text-left">
                <h3 className="font-medium text-primary-900">New Prescription</h3>
                <p className="text-sm text-primary-700">Create a new prescription order</p>
              </div>
            </div>
          </button>
          <button className="p-6 bg-primary-50 rounded-xl border border-primary-100 hover:bg-primary-100 transition-colors">
            <div className="flex items-center gap-4">
              <span className="text-2xl">🔄</span>
              <div className="text-left">
                <h3 className="font-medium text-primary-900">Renew Prescription</h3>
                <p className="text-sm text-primary-700">Process prescription renewal requests</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
