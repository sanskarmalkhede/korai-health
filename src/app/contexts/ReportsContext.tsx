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

interface TrendDataPoint {
  reportIndex: number;
  date: string;
  fileName: string;
  
  // Primary Blood Parameters
  hemoglobin?: number;
  rbcCount?: number;
  wbcCount?: number;
  pcv?: number;
  plateletCount?: number;
  
  // Blood Indices
  mcv?: number;
  mch?: number;
  mchc?: number;
  rdw?: number;
  
  // Differential Count
  neutrophils?: number;
  lymphocytes?: number;
  monocytes?: number;
  eosinophils?: number;
  basophils?: number;
  
  // Lipid Profile
  totalCholesterol?: number;
  ldlCholesterol?: number;
  hdlCholesterol?: number;
  triglycerides?: number;
  
  // Other Tests
  bloodGlucose?: number;
  cReactiveProtein?: number;
  esr?: number;
}

const ReportsContext = createContext<{
  state: ReportsState;
  dispatch: React.Dispatch<ReportsAction>;
  addReport: (fileName: string, parameters: HealthParameter[], extractedText?: string, note?: string) => void;
  getTrendData: () => TrendDataPoint[];
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
      const dataPoint: TrendDataPoint = {
        reportIndex: index + 1,
        date: new Date(report.uploadDate).toLocaleDateString(),
        fileName: report.fileName.length > 15 ? report.fileName.substring(0, 15) + '...' : report.fileName,
      };

      // Extract numeric values for trending - Enhanced parameter mapping
      report.parameters.forEach(param => {
        const numericValue = parseFloat(param.value);
        if (!isNaN(numericValue)) {
          const paramName = param.parameter.toLowerCase();
          
          // Primary Blood Parameters
          if (paramName.includes('hemoglobin') || paramName === 'hb') {
            dataPoint.hemoglobin = numericValue;
          } else if (paramName.includes('rbc') || paramName.includes('red blood cell')) {
            dataPoint.rbcCount = numericValue;
          } else if (paramName.includes('wbc') || paramName.includes('white blood cell') || 
                     paramName.includes('tlc') || paramName.includes('leukocyte')) {
            dataPoint.wbcCount = numericValue;
          } else if (paramName.includes('pcv') || paramName.includes('packed cell volume')) {
            dataPoint.pcv = numericValue;
          } else if (paramName.includes('platelet')) {
            dataPoint.plateletCount = numericValue;
          }
          
          // Blood Indices
          else if (paramName === 'mcv' || paramName.includes('mean corpuscular volume')) {
            dataPoint.mcv = numericValue;
          } else if (paramName === 'mch' && !paramName.includes('mchc')) {
            dataPoint.mch = numericValue;
          } else if (paramName === 'mchc' || paramName.includes('mean corpuscular hemoglobin concentration')) {
            dataPoint.mchc = numericValue;
          } else if (paramName === 'rdw' || paramName.includes('red cell distribution width')) {
            dataPoint.rdw = numericValue;
          }
          
          // Differential Count
          else if (paramName.includes('neutrophil')) {
            dataPoint.neutrophils = numericValue;
          } else if (paramName.includes('lymphocyte')) {
            dataPoint.lymphocytes = numericValue;
          } else if (paramName.includes('monocyte')) {
            dataPoint.monocytes = numericValue;
          } else if (paramName.includes('eosinophil')) {
            dataPoint.eosinophils = numericValue;
          } else if (paramName.includes('basophil')) {
            dataPoint.basophils = numericValue;
          }
          
          // Lipid Profile
          else if (paramName.includes('total cholesterol') || 
                   (paramName.includes('cholesterol') && !paramName.includes('ldl') && !paramName.includes('hdl'))) {
            dataPoint.totalCholesterol = numericValue;
          } else if (paramName.includes('ldl')) {
            dataPoint.ldlCholesterol = numericValue;
          } else if (paramName.includes('hdl')) {
            dataPoint.hdlCholesterol = numericValue;
          } else if (paramName.includes('triglyceride')) {
            dataPoint.triglycerides = numericValue;
          }
          
          // Other Tests
          else if (paramName.includes('glucose') || paramName.includes('sugar')) {
            dataPoint.bloodGlucose = numericValue;
          } else if (paramName.includes('c-reactive protein') || paramName.includes('crp')) {
            dataPoint.cReactiveProtein = numericValue;
          } else if (paramName.includes('esr') || paramName.includes('erythrocyte sedimentation')) {
            dataPoint.esr = numericValue;
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