import React from 'react';

interface ChartData {
  label: string;
  value: number;
  icon?: string;
}

interface BarChartProps {
  data: ChartData[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  if (data.length === 0) {
    return <div className="text-center text-gray-500 py-10">No expenses for this month to display in chart.</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="mt-6">
      <div className="flex justify-around items-end h-48 space-x-2 border-b border-gray-200 pb-2" role="figure" aria-label="Bar chart of expenses by category">
        {data.map(item => (
          <div key={item.label} className="flex flex-col items-center flex-grow group relative" style={{ minWidth: '20px' }}>
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {item.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </div>
            <div
              className="w-full bg-secondary hover:bg-blue-500 rounded-t-md transition-all duration-300 cursor-pointer"
              style={{ height: `${(item.value / maxValue) * 100}%` }}
              aria-label={`${item.label}: ${item.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
              role="presentation"
            >
            </div>
            <span className="mt-2 text-2xl" title={item.label} aria-hidden="true">{item.icon}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
