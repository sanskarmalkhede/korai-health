'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useReports } from '../contexts/ReportsContext';

export function TrendsChart() {
  const { getTrendData } = useReports();
  const data = getTrendData();

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-sage-green/60 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-dark mb-2">No Trend Data Available</h3>
        <p className="text-text-dark/70 text-sm max-w-sm">
          Upload multiple reports to see health trends over time. Trends become visible with 2 or more reports.
        </p>
      </div>
    );
  }

  if (data.length === 1) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-sage-green/60 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-dark mb-2">Single Report Uploaded</h3>
        <p className="text-text-dark/70 text-sm max-w-sm">
          Upload another report to start seeing trends and comparisons between your health metrics.
        </p>
      </div>
    );
  }

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cream/95 backdrop-blur-sm border border-sage-green/20 rounded-xl p-4 shadow-lg">
          <h4 className="font-semibold text-text-dark mb-2">{`Report: ${label}`}</h4>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium text-text-dark">
                {entry.name}: <span className="font-bold">{entry.value}</span>
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const chartConfig = {
    cholesterol: { color: '#8db582', name: 'Total Cholesterol' },
    bloodSugar: { color: '#6fa066', name: 'Blood Glucose' },
    hemoglobin: { color: '#a5c49a', name: 'Hemoglobin' },
    wbc: { color: '#a08779', name: 'WBC Count' },
    ldl: { color: '#dc2626', name: 'LDL Cholesterol' },
    hdl: { color: '#059669', name: 'HDL Cholesterol' },
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-dark mb-2">
          Health Parameter Trends
        </h3>
        <p className="text-text-dark/70 text-sm">
          Tracking {data.length} reports over time
        </p>
      </div>

      <div className="bg-gradient-to-br from-cream/50 to-sage-light/20 rounded-xl p-4 mb-4">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#8db582" 
              strokeOpacity={0.2}
            />
            <XAxis 
              dataKey="fileName" 
              stroke="#2d2926"
              fontSize={12}
              fontWeight={500}
              tick={{ fill: '#2d2926' }}
            />
            <YAxis 
              stroke="#2d2926"
              fontSize={12}
              fontWeight={500}
              tick={{ fill: '#2d2926' }}
            />
            <Tooltip content={customTooltip} />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '12px',
                fontWeight: '500'
              }}
            />
            
            {Object.entries(chartConfig).map(([key, config]) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={config.color}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={{ 
                  fill: config.color, 
                  stroke: '#fff', 
                  strokeWidth: 2, 
                  r: 6 
                }}
                activeDot={{ 
                  r: 8, 
                  stroke: config.color, 
                  strokeWidth: 2,
                  fill: '#fff'
                }}
                name={config.name}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend with color indicators */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(chartConfig).map(([key, config]) => {
          const hasData = data.some(d => d[key] !== undefined);
          if (!hasData) return null;
          
          return (
            <div key={key} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: config.color }}
              />
              <span className="text-sm font-medium text-text-dark">
                {config.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
} 