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

  const customTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      color: string;
      name: string;
      value: number;
    }>;
    label?: string | number;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-cream/95 backdrop-blur-sm border border-sage-green/20 rounded-xl p-4 shadow-lg max-w-sm">
          <h4 className="font-semibold text-text-dark mb-2">{`Report: ${label}`}</h4>
          {payload.map((entry, index: number) => (
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

  // Enhanced chart configuration with all parameters
  const chartConfig = {
    // Primary Blood Parameters
    hemoglobin: { color: '#dc2626', name: 'Hemoglobin (g/dL)' },
    rbcCount: { color: '#ea580c', name: 'RBC Count (mill/cumm)' },
    wbcCount: { color: '#d97706', name: 'WBC Count (thou/mm3)' },
    pcv: { color: '#ca8a04', name: 'PCV (%)' },
    plateletCount: { color: '#65a30d', name: 'Platelet Count (thou/mm3)' },
    
    // Blood Indices
    mcv: { color: '#059669', name: 'MCV (fL)' },
    mch: { color: '#0891b2', name: 'MCH (pg)' },
    mchc: { color: '#0284c7', name: 'MCHC (g/dL)' },
    rdw: { color: '#3b82f6', name: 'RDW (%)' },
    
    // Differential Count
    neutrophils: { color: '#6366f1', name: 'Neutrophils (%)' },
    lymphocytes: { color: '#8b5cf6', name: 'Lymphocytes (%)' },
    monocytes: { color: '#a855f7', name: 'Monocytes (%)' },
    eosinophils: { color: '#c084fc', name: 'Eosinophils (%)' },
    basophils: { color: '#d946ef', name: 'Basophils (%)' },
    
    // Lipid Profile
    totalCholesterol: { color: '#ec4899', name: 'Total Cholesterol (mg/dL)' },
    ldlCholesterol: { color: '#f43f5e', name: 'LDL Cholesterol (mg/dL)' },
    hdlCholesterol: { color: '#10b981', name: 'HDL Cholesterol (mg/dL)' },
    triglycerides: { color: '#f59e0b', name: 'Triglycerides (mg/dL)' },
    
    // Other Tests
    bloodGlucose: { color: '#ef4444', name: 'Blood Glucose (mg/dL)' },
    cReactiveProtein: { color: '#f97316', name: 'C-Reactive Protein (mg/dL)' },
    esr: { color: '#84cc16', name: 'ESR (mm/hr)' },
  };

  // Get available parameters from the data
  const availableParams = Object.keys(chartConfig).filter(key => 
    data.some(d => d[key as keyof typeof d] !== undefined && d[key as keyof typeof d] !== null)
  );

  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-dark mb-2">
          Health Parameter Trends
        </h3>
        <p className="text-text-dark/70 text-sm">
          Tracking {data.length} reports with {availableParams.length} different parameters
        </p>
      </div>

      <div className="bg-gradient-to-br from-cream/50 to-sage-light/20 rounded-xl p-4 mb-4">
        <ResponsiveContainer width="100%" height={500}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
              angle={-45}
              textAnchor="end"
              height={100}
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
                fontSize: '11px',
                fontWeight: '500'
              }}
            />
            
            {availableParams.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig];
              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={config.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={{ 
                    fill: config.color, 
                    stroke: '#fff', 
                    strokeWidth: 1, 
                    r: 4 
                  }}
                  activeDot={{ 
                    r: 6, 
                    stroke: config.color, 
                    strokeWidth: 2,
                    fill: '#fff'
                  }}
                  name={config.name}
                  connectNulls={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Enhanced legend with categories */}
      <div className="space-y-4">
        {availableParams.length > 0 && (
          <>
            {/* Blood Parameters */}
            {['hemoglobin', 'rbcCount', 'wbcCount', 'pcv', 'plateletCount'].some(param => availableParams.includes(param)) && (
              <div>
                <h4 className="text-sm font-semibold text-text-dark mb-2">Complete Blood Count (CBC)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {['hemoglobin', 'rbcCount', 'wbcCount', 'pcv', 'plateletCount'].map((key) => {
                    if (!availableParams.includes(key)) return null;
                    const config = chartConfig[key as keyof typeof chartConfig];
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-xs font-medium text-text-dark">
                          {config.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Blood Indices */}
            {['mcv', 'mch', 'mchc', 'rdw'].some(param => availableParams.includes(param)) && (
              <div>
                <h4 className="text-sm font-semibold text-text-dark mb-2">Blood Indices</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['mcv', 'mch', 'mchc', 'rdw'].map((key) => {
                    if (!availableParams.includes(key)) return null;
                    const config = chartConfig[key as keyof typeof chartConfig];
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-xs font-medium text-text-dark">
                          {config.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Differential Count */}
            {['neutrophils', 'lymphocytes', 'monocytes', 'eosinophils', 'basophils'].some(param => availableParams.includes(param)) && (
              <div>
                <h4 className="text-sm font-semibold text-text-dark mb-2">Differential Count</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {['neutrophils', 'lymphocytes', 'monocytes', 'eosinophils', 'basophils'].map((key) => {
                    if (!availableParams.includes(key)) return null;
                    const config = chartConfig[key as keyof typeof chartConfig];
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-xs font-medium text-text-dark">
                          {config.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lipid Profile */}
            {['totalCholesterol', 'ldlCholesterol', 'hdlCholesterol', 'triglycerides'].some(param => availableParams.includes(param)) && (
              <div>
                <h4 className="text-sm font-semibold text-text-dark mb-2">Lipid Profile</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {['totalCholesterol', 'ldlCholesterol', 'hdlCholesterol', 'triglycerides'].map((key) => {
                    if (!availableParams.includes(key)) return null;
                    const config = chartConfig[key as keyof typeof chartConfig];
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-xs font-medium text-text-dark">
                          {config.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other Tests */}
            {['bloodGlucose', 'cReactiveProtein', 'esr'].some(param => availableParams.includes(param)) && (
              <div>
                <h4 className="text-sm font-semibold text-text-dark mb-2">Other Tests</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['bloodGlucose', 'cReactiveProtein', 'esr'].map((key) => {
                    if (!availableParams.includes(key)) return null;
                    const config = chartConfig[key as keyof typeof chartConfig];
                    return (
                      <div key={key} className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-xs font-medium text-text-dark">
                          {config.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 