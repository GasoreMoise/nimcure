import { PatientStatus } from '@/contexts/PatientsContext';

const statusConfig = {
  active: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    label: 'Active'
  },
  pending: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    label: 'Pending Delivery'
  },
  critical: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    label: 'Critical'
  },
  defaulted: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    label: 'Defaulted'
  },
  completed: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'Completed'
  },
  expired: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    border: 'border-gray-200',
    label: 'Expired'
  }
};

export function PatientStatusBadge({ status }: { status: PatientStatus }) {
  const config = statusConfig[status];
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
} 