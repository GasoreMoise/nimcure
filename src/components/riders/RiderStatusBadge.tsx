interface RiderStatusBadgeProps {
  status: 'available' | 'on_delivery' | 'offline';
}

export function RiderStatusBadge({ status }: RiderStatusBadgeProps) {
  const statusStyles = {
    available: 'bg-green-100 text-green-800',
    on_delivery: 'bg-blue-100 text-blue-800',
    offline: 'bg-gray-100 text-gray-800',
  };

  const statusText = {
    available: 'Available',
    on_delivery: 'On Delivery',
    offline: 'Offline',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        statusStyles[status]
      }`}
    >
      <span className="mr-1">●</span>
      {statusText[status]}
    </span>
  );
} 