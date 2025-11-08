import React, { useState } from 'react';

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return <div className="text-center text-gray-500 py-10">No expenses to display in chart.</div>;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return <div className="text-center text-gray-500 py-10">No expenses to display in chart.</div>;
  }

  const radius = 80;
  const cx = 100;
  const cy = 100;
  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center p-4">
      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <g transform="rotate(-90, 100, 100)">
            {data.map((item, index) => {
              const percent = item.value / total;
              const startAngle = accumulatedPercent * 2 * Math.PI;
              const endAngle = (accumulatedPercent + percent) * 2 * Math.PI;
              
              accumulatedPercent += percent;

              const startX = cx + radius * Math.cos(startAngle);
              const startY = cy + radius * Math.sin(startAngle);
              const endX = cx + radius * Math.cos(endAngle);
              const endY = cy + radius * Math.sin(endAngle);

              const largeArcFlag = percent > 0.5 ? 1 : 0;

              const pathData = [
                `M ${cx},${cy}`,
                `L ${startX},${startY}`,
                `A ${radius},${radius} 0 ${largeArcFlag} 1 ${endX},${endY}`,
                'Z',
              ].join(' ');

              return (
                <path
                  key={item.label}
                  d={pathData}
                  fill={item.color}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className="cursor-pointer transition-opacity duration-200"
                  style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.6 }}
                />
              );
            })}
          </g>
        </svg>
        {activeIndex !== null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
             <span className="text-sm text-gray-600 truncate max-w-[150px]">{data[activeIndex].label}</span>
             <span className="text-xl font-bold text-gray-800">
                {data[activeIndex].value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
             </span>
             <span className="text-xs text-gray-500">
                {((data[activeIndex].value / total) * 100).toFixed(1)}%
             </span>
          </div>
        )}
      </div>
      <div className="mt-4 md:mt-0 md:ml-8 max-w-xs w-full max-h-48 overflow-y-auto">
        <ul className="space-y-1">
          {data.map((item, index) => (
            <li 
                key={item.label} 
                className={`flex items-center justify-between p-1 rounded transition-colors duration-200 ${activeIndex === index ? 'bg-gray-100' : ''}`}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-800 ml-2">
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PieChart;
