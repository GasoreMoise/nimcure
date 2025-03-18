'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

export function GrowthChart({ data }: { data: any }) {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: '#f0f0f0',
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Users Growth</h3>
        <div className="flex gap-4">
          <button className="px-4 py-1 rounded-full bg-black text-white text-sm">Year</button>
          <button className="px-4 py-1 rounded-full text-sm">6 Months</button>
          <button className="px-4 py-1 rounded-full text-sm">Month</button>
          <button className="px-4 py-1 rounded-full text-sm">Week</button>
        </div>
      </div>
      <Line options={options} data={data} className="h-[300px]" />
    </div>
  );
} 