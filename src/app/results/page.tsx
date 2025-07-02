"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { DataTable } from '../components/DataTable';
import { TrendsChart } from '../components/TrendsChart';
import { useReports } from '../contexts/ReportsContext';
import { BackgroundBeams } from '../components/ui/background-beams';
import { Card } from '../components/ui/card-hover-effect';

export default function ResultsPage() {
  const { state } = useReports();
  const router = useRouter();

  if (state.reports.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        <BackgroundBeams className="z-0" />
        <div className="relative z-10">
          <motion.div 
            className="aceternity-card rounded-3xl p-12 text-center max-w-2xl mx-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-sage-green mb-6">
              <ClipboardDocumentListIcon className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-3xl font-bold text-text-dark mb-4">
              No Reports Found
            </h2>
            <p className="text-text-dark/70 mb-8 text-lg">
              Upload your first lab report to start analyzing your health data.
            </p>
            <motion.button
              onClick={() => router.push('/')}
              className="aceternity-button-primary px-8 py-4 rounded-xl font-medium text-lg inline-flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <DocumentArrowUpIcon className="w-5 h-5" />
              <span>Upload Report</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <BackgroundBeams className="z-0" />
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <motion.div 
            className="flex items-center justify-between mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.button
              onClick={() => router.push('/')}
              className="aceternity-button-secondary px-6 py-3 rounded-xl font-medium inline-flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Upload</span>
            </motion.button>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-text-dark via-sage-green to-brown-light bg-clip-text text-transparent">
                Health Analysis
              </h1>
              <p className="text-text-dark/70 mt-2">
                {state.reports.length} report{state.reports.length > 1 ? 's' : ''} analyzed
              </p>
            </div>
            
            <div className="w-32" /> {/* Spacer for balance */}
          </motion.div>

          {/* Stats Cards */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="text-center">
              <div className="text-3xl font-bold text-sage-green mb-2">
                {state.reports.length}
              </div>
              <div className="text-text-dark/70">Reports Processed</div>
            </Card>
            
            <Card className="text-center">
              <div className="text-3xl font-bold text-sage-green mb-2">
                {state.reports.reduce((acc, report) => acc + report.parameters.length, 0)}
              </div>
              <div className="text-text-dark/70">Health Parameters</div>
            </Card>
            
            <Card className="text-center">
              <div className="text-3xl font-bold text-sage-green mb-2">
                {new Set(state.reports.flatMap(r => r.parameters.map(p => p.parameter))).size}
              </div>
              <div className="text-text-dark/70">Unique Metrics</div>
            </Card>
          </motion.div>

          {/* Processing Notice */}
          {state.reports.some(report => report.note?.includes('OCR PROCESSING FAILED')) && (
            <motion.div 
              className="mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="aceternity-card rounded-xl p-6 border-l-4 border-yellow-500">
                <div className="flex items-start space-x-3">
                  <InformationCircleIcon className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-text-dark mb-1">Demo Mode Active</h3>
                    <p className="text-text-dark/70 text-sm">
                      OCR processing encountered technical limitations. The system is displaying
                      intelligently generated health data based on file characteristics for demonstration purposes.
                      Values vary realistically per upload but are not extracted from actual report content.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Data Table */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="aceternity-card rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-sage-green/10">
                  <div className="flex items-center space-x-3">
                    <ClipboardDocumentListIcon className="w-6 h-6 text-sage-green" />
                    <h2 className="text-2xl font-bold text-text-dark">Health Parameters</h2>
                  </div>
                  <p className="text-text-dark/70 mt-1">
                    All extracted health metrics across your reports
                  </p>
                </div>
                <div className="p-6">
                  <DataTable data={state.reports.flatMap(r => r.parameters)} />
                </div>
              </div>
            </motion.div>

            {/* Trends Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="aceternity-card rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-sage-green/10">
                  <div className="flex items-center space-x-3">
                    <ChartBarIcon className="w-6 h-6 text-sage-green" />
                    <h2 className="text-2xl font-bold text-text-dark">Health Trends</h2>
                  </div>
                  <p className="text-text-dark/70 mt-1">
                    Track changes in your health metrics over time
                  </p>
                </div>
                <div className="p-6">
                  <TrendsChart />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Individual Reports */}
          {state.reports.length > 1 && (
            <motion.div 
              className="mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className="aceternity-card rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-text-dark mb-6">Individual Reports</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {state.reports.map((report, index) => (
                    <motion.div 
                      key={index}
                      className="border border-sage-green/20 rounded-xl p-4 hover:shadow-lg transition-shadow"
                      whileHover={{ scale: 1.02 }}
                    >
                      <h3 className="font-semibold text-text-dark mb-2 truncate">
                        {report.fileName}
                      </h3>
                      <div className="text-sm text-text-dark/70 mb-3">
                        {report.parameters.length} parameters found
                      </div>
                      <div className="flex flex-wrap gap-1">
                                                 {report.parameters.slice(0, 3).map((param, idx) => (
                           <span 
                             key={idx}
                             className={`px-2 py-1 rounded text-xs font-medium ${
                               param.status === 'normal' ? 'status-normal' :
                               param.status === 'high' ? 'status-high' : 'status-low'
                             }`}
                           >
                             {param.parameter}
                           </span>
                         ))}
                        {report.parameters.length > 3 && (
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                            +{report.parameters.length - 3} more
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Call to Action */}
          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="aceternity-card rounded-3xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-text-dark mb-4">
                Ready to Add Another Report?
              </h3>
              <p className="text-text-dark/70 mb-6">
                Upload additional lab reports to track your health trends over time.
              </p>
              <motion.button
                onClick={() => router.push('/')}
                className="aceternity-button-primary px-8 py-4 rounded-xl font-medium text-lg inline-flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <DocumentArrowUpIcon className="w-5 h-5" />
                <span>Upload Another Report</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 