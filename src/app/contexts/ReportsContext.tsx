'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

export interface HealthParameter {
  parameter: string;
  value: string;
  unit: string;
  normalRange: string;
  status: 'normal' | 'high' | 'low';
}

export interface HealthReport {
  id: string;
  fileName: string;
  uploadDate: Date;
  parameters: HealthParameter[];
  extractedText?: string;
  note?: string;
}

interface ReportsState {
  reports: HealthReport[];
  isProcessing: boolean;
  currentReportId: string | null;
}

type ReportsAction = 
  | { type: 'START_PROCESSING' }
  | { type: 'ADD_REPORT'; payload: HealthReport }
  | { type: 'SET_CURRENT_REPORT'; payload: string }
  | { type: 'CLEAR_REPORTS' }
  | { type: 'STOP_PROCESSING' };

const initialState: ReportsState = {
  reports: [],
  isProcessing: false,
  currentReportId: null,
};

function reportsReducer(state: ReportsState, action: ReportsAction): ReportsState {
  switch (action.type) {
    case 'START_PROCESSING':
      return { ...state, isProcessing: true };
    
    case 'ADD_REPORT':
      return {
        ...state,
        reports: [action.payload, ...state.reports], // Add new report at the beginning
        currentReportId: action.payload.id,
        isProcessing: false,
      };
    
    case 'SET_CURRENT_REPORT':
      return { ...state, currentReportId: action.payload };
    
    case 'CLEAR_REPORTS':
      return { ...state, reports: [], currentReportId: null };
    
    case 'STOP_PROCESSING':
      return { ...state, isProcessing: false };
    
    default:
      return state;
  }
}

const ReportsContext = createContext<{
  state: ReportsState;
  dispatch: React.Dispatch<ReportsAction>;
  addReport: (fileName: string, parameters: HealthParameter[], extractedText?: string, note?: string) => void;
  getTrendData: () => any[];
  getCurrentReport: () => HealthReport | null;
} | null>(null);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reportsReducer, initialState);

  const addReport = (fileName: string, parameters: HealthParameter[], extractedText?: string, note?: string) => {
    const newReport: HealthReport = {
      id: Date.now().toString(),
      fileName,
      uploadDate: new Date(),
      parameters,
      extractedText,
      note,
    };
    dispatch({ type: 'ADD_REPORT', payload: newReport });
  };

  const getCurrentReport = () => {
    if (!state.currentReportId) return null;
    return state.reports.find(r => r.id === state.currentReportId) || null;
  };

  const getTrendData = () => {
    if (state.reports.length === 0) return [];

    // Create trend data from actual reports
    const sortedReports = [...state.reports].sort((a, b) => 
      new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime()
    );

    const trendData = sortedReports.map((report, index) => {
      const dataPoint: any = {
        reportIndex: index + 1,
        date: new Date(report.uploadDate).toLocaleDateString(),
        fileName: report.fileName.length > 15 ? report.fileName.substring(0, 15) + '...' : report.fileName,
      };

      // Extract numeric values for trending
      report.parameters.forEach(param => {
        const numericValue = parseFloat(param.value);
        if (!isNaN(numericValue)) {
          switch (param.parameter.toLowerCase()) {
            case 'total cholesterol':
              dataPoint.cholesterol = numericValue;
              break;
            case 'blood glucose':
              dataPoint.bloodSugar = numericValue;
              break;
            case 'hemoglobin':
              dataPoint.hemoglobin = numericValue;
              break;
            case 'white blood cell count':
              dataPoint.wbc = numericValue;
              break;
            case 'ldl cholesterol':
              dataPoint.ldl = numericValue;
              break;
            case 'hdl cholesterol':
              dataPoint.hdl = numericValue;
              break;
          }
        }
      });

      return dataPoint;
    });

    return trendData;
  };

  return (
    <ReportsContext.Provider value={{
      state,
      dispatch,
      addReport,
      getTrendData,
      getCurrentReport,
    }}>
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportsProvider');
  }
  return context;
} 