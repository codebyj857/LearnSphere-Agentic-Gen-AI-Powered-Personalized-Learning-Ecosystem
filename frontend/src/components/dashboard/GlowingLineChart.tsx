import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface GlowingLineChartProps {
  data: any[];
  dataKey: string;
  strokeColor?: string;
  glowColor?: string;
}

const GlowingLineChart: React.FC<GlowingLineChartProps> = ({ 
  data, 
  dataKey, 
  strokeColor = '#10b981', 
  glowColor = '#10b981' 
}) => {
  // Safely format the test attempt's completion date for the tooltip
  const formatDate = (value: any) => {
    if (!value) return 'No date';
    const date = new Date(value);
    return isNaN(date.getTime()) ? 'No date' : date.toLocaleDateString();
  };

  // Format test history data for chart.
  // The x-axis label stays short ("Test 1") while the real completion date is
  // kept for the tooltip via the date/created_at/date_full fields.
  const chartData = data.length > 0 
    ? data.map((test, index) => ({
        date: test.name || test.label || `Test ${index + 1}`,
        score: test.score || 0,
        date_full: formatDate(test.date || test.created_at || test.date_full)
      }))
    : [
        { date: 'Test 1', score: 0, date_full: 'No data' },
        { date: 'Test 2', score: 0, date_full: 'No data' },
        { date: 'Test 3', score: 0, date_full: 'No data' },
      ];

  return (
    <div className="w-full h-full">
      <style>{`
        .glowing-line {
          filter: drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 16px ${glowColor});
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            filter: drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 16px ${glowColor});
          }
          50% {
            filter: drop-shadow(0 0 12px ${glowColor}) drop-shadow(0 0 24px ${glowColor});
          }
        }
        
        .recharts-tooltip-wrapper {
          background: rgba(0, 0, 0, 0.9) !important;
          border: 1px solid rgba(16, 185, 129, 0.3) !important;
          border-radius: 8px !important;
          backdrop-filter: blur(10px) !important;
        }
        
        .recharts-tooltip-label {
          color: white !important;
          font-weight: bold !important;
        }
        
        .recharts-tooltip-item {
          color: #10b981 !important;
        }
      `}</style>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="rgba(255, 255, 255, 0.1)" 
            strokeOpacity={0.3}
          />
          <XAxis 
            dataKey="date" 
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
          />
          <YAxis 
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
            domain={[0, 10]}
          />
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-black/90 border border-green-400/30 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-white font-bold">{data.date}</p>
                    <p className="text-gray-300 text-sm">{data.date_full}</p>
                    <p className="text-green-400 font-semibold">Score: {data.score}/10</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={strokeColor}
            strokeWidth={3}
            className="glowing-line"
            dot={{ 
              fill: glowColor, 
              strokeWidth: 2, 
              r: 6,
              stroke: 'rgba(255, 255, 255, 0.8)'
            }}
            activeDot={{ 
              r: 8, 
              fill: glowColor,
              stroke: 'white',
              strokeWidth: 2
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GlowingLineChart;
