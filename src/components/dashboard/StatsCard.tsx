import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatProps {
  label: string;
  value: string | number;
  change?: number;
  timeframe: string;
}

export function StatsCard({ label, value, change, timeframe }: StatProps) {
  const isPositive = change && change > 0;
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <h3 className="text-3xl font-bold mt-2">{value}</h3>
        </div>
        {change && (
          <div className={`flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
            <span className="text-sm ml-1">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-2">{timeframe}</p>
    </div>
  );
} 