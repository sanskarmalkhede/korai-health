"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  DocumentArrowUpIcon, 
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { FileUpload } from './components/FileUpload';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { useReports } from './contexts/ReportsContext';
import { HoverEffect } from './components/ui/card-hover-effect';
import { BackgroundBeams } from './components/ui/background-beams';

interface UploadDetails {
  details: string;
  suggestion: string;
  extractedText?: string;
}

export default function HomePage() {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadDetails, setUploadDetails] = useState<UploadDetails | null>(null);
  const { state, addReport } = useReports();
  const router = useRouter();

  const features = [
    {
      title: "Smart OCR Extraction",
      description: "Advanced text recognition extracts health parameters from any lab report format with high accuracy.",
      icon: <EyeIcon className="w-6 h-6" />
    },
    {
      title: "Comprehensive Analysis",
      description: "Automatically detects cholesterol, glucose, blood counts, and other vital health markers.",
      icon: <HeartIcon className="w-6 h-6" />
    },
    {
      title: "Trend Visualization",
      description: "Beautiful charts show how your health metrics change over time for better insights.",
      icon: <ChartBarIcon className="w-6 h-6" />
    },
    {
      title: "Secure Processing",
      description: "Your health data is processed securely and never stored permanently on our servers.",
      icon: <ShieldCheckIcon className="w-6 h-6" />
    },
    {
      title: "Multiple Format Support",
      description: "Upload PDFs, images, or scanned documents - our system handles all common formats.",
      icon: <DocumentArrowUpIcon className="w-6 h-6" />
    },
    {
      title: "Instant Results",
      description: "Get immediate analysis and comparison of your health parameters across multiple reports.",
      icon: <SparklesIcon className="w-6 h-6" />
    }
  ];

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    setUploadDetails(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-report', {
        method: 'POST',
        body: formData,
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response. Please try again.');
      }

      const result = await response.json();

      if (!response.ok) {
        // Handle different types of errors with detailed feedback
        if (response.status === 422 && result.error === 'No health parameters detected') {
          setUploadError(result.error);
          setUploadDetails({
            details: result.details,
            suggestion: result.suggestion,
            extractedText: result.extractedText
          });
          return;
        } else {
          throw new Error(result.error || 'Failed to process file');
        }
      }
      
      // Add the report to context before navigation
      if (result.success && result.parameters) {
        // Add the report to the context
        addReport(
          file.name, 
          result.parameters, 
          result.extractedText || '', 
          result.note || ''
        );
        
        console.log('Report added to context:', file.name);
        
        // Navigate to results page after successful upload
        router.push('/results');
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to process the file. Please try again.');
      setUploadDetails(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundBeams className="z-0" />
      
      {/* Hero Section */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 pt-20 pb-12">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-green-600 to-teal-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Korai Health
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-700 mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Transform your lab reports into actionable health insights with our 
              advanced AI-powered analysis platform.
            </motion.p>
          </motion.div>

          {/* Upload Section */}
          <motion.div 
            className="max-w-2xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="aceternity-card rounded-3xl p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Upload Your Lab Report
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Drag and drop your lab report or click to browse. Supports PDF and image formats.
              </p>
              
              {uploading ? (
                <div className="flex flex-col items-center space-y-4">
                  <LoadingSpinner />
                  <p className="text-green-600 font-medium">Processing your report...</p>
                </div>
              ) : (
                <>
                  <FileUpload onFileUpload={handleFileUpload} />
                  
                  {/* Detailed Error Display */}
                  {uploadError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-6 bg-orange-50 border border-orange-200 rounded-xl"
                    >
                      <div className="flex items-start space-x-3">
                        <ExclamationTriangleIcon className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-orange-800 mb-2">
                            OCR Processing Results
                          </h4>
                          <p className="text-orange-700 mb-4">
                            {uploadError}
                          </p>
                          
                          {uploadDetails && (
                            <div className="space-y-4">
                              <div>
                                <h5 className="font-medium text-orange-800 mb-2">What we found:</h5>
                                <p className="text-sm text-orange-700 mb-2">
                                  {uploadDetails.details}
                                </p>
                              </div>
                              
                              {uploadDetails.extractedText && (
                                <div>
                                  <h5 className="font-medium text-orange-800 mb-2">
                                    Extracted Text Preview:
                                  </h5>
                                  <div className="bg-orange-100 p-3 rounded-lg border max-h-32 overflow-y-auto">
                                    <pre className="text-xs text-orange-800 whitespace-pre-wrap font-mono">
                                      {uploadDetails.extractedText}
                                    </pre>
                                  </div>
                                </div>
                              )}
                              
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h5 className="font-medium text-blue-800 mb-2">💡 Suggestions:</h5>
                                <p className="text-sm text-blue-700 mb-3">
                                  {uploadDetails.suggestion}
                                </p>
                                <ul className="text-sm text-blue-700 space-y-1">
                                  <li>• Ensure the image is clear and well-lit</li>
                                  <li>• Make sure text is not rotated or skewed</li>
                                  <li>• Try uploading a higher resolution image</li>
                                  <li>• Check that the report contains standard health parameters (cholesterol, glucose, hemoglobin, etc.)</li>
                                </ul>
                              </div>

                              
                              <div className="flex justify-center mt-4">
                                <button
                                  onClick={() => {
                                    setUploadError(null);
                                    setUploadDetails(null);
                                  }}
                                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                  Try Another File
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Quick Stats */}
            {state.reports.length > 0 && (
              <motion.div 
                className="aceternity-card rounded-2xl p-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{state.reports.length}</div>
                    <div className="text-sm text-gray-600">Reports Analyzed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {state.reports.reduce((acc, report) => acc + report.parameters.length, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Health Parameters</div>
                  </div>
                  <motion.button
                    onClick={() => router.push('/results')}
                    className="aceternity-button-primary px-6 py-3 rounded-xl font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Analysis
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Powerful Health Analytics
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover insights from your lab reports with our comprehensive analysis tools
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <HoverEffect items={features} />
          </motion.div>
        </div>

        {/* CTA Section */}
        <div className="container mx-auto px-4 py-16">
          <motion.div 
            className="aceternity-card rounded-3xl p-12 text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Ready to Analyze Your Health Data?
            </h3>
            <p className="text-xl text-gray-600 mb-8">
              Upload your first lab report and discover actionable health insights in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                className="aceternity-button-primary px-8 py-4 rounded-xl font-medium text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Now
              </motion.button>
              {state.reports.length > 0 && (
                <motion.button
                  onClick={() => router.push('/results')}
                  className="aceternity-button-secondary px-8 py-4 rounded-xl font-medium text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Existing Reports
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
