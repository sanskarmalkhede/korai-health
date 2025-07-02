"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  DocumentArrowUpIcon, 
  ChartBarIcon, 
  ClipboardDocumentListIcon,
  EyeIcon,
  HeartIcon,
  ShieldCheckIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { FileUpload } from './components/FileUpload';
import { LoadingSpinner } from '@/app/components/LoadingSpinner';
import { useReports } from './contexts/ReportsContext';
import { HoverEffect } from './components/ui/card-hover-effect';
import { BackgroundBeams } from './components/ui/background-beams';

export default function HomePage() {
  const [uploading, setUploading] = useState(false);
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
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-report', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process file');
      }

      const result = await response.json();
      
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
      }
      
      // Navigate to results page after successful upload
      router.push('/results');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to process the file. Please try again.');
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
              className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-text-dark via-sage-green to-brown-light bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Health Report
              <br />
              <span className="text-sage-green">Analytics</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-text-dark/80 mb-12 leading-relaxed"
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
              <h2 className="text-2xl font-bold text-text-dark mb-4 text-center">
                Upload Your Lab Report
              </h2>
              <p className="text-text-dark/70 text-center mb-6">
                Drag and drop your lab report or click to browse. Supports PDF and image formats.
              </p>
              
              {uploading ? (
                <div className="flex flex-col items-center space-y-4">
                  <LoadingSpinner />
                  <p className="text-sage-green font-medium">Processing your report...</p>
                </div>
              ) : (
                <FileUpload onFileUpload={handleFileUpload} />
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
                    <div className="text-2xl font-bold text-sage-green">{state.reports.length}</div>
                    <div className="text-sm text-text-dark/70">Reports Analyzed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-sage-green">
                      {state.reports.reduce((acc, report) => acc + report.parameters.length, 0)}
                    </div>
                    <div className="text-sm text-text-dark/70">Health Parameters</div>
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
            <h2 className="text-4xl font-bold text-text-dark mb-4">
              Powerful Health Analytics
            </h2>
            <p className="text-xl text-text-dark/70 max-w-2xl mx-auto">
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
            <h3 className="text-3xl font-bold text-text-dark mb-4">
              Ready to Analyze Your Health Data?
            </h3>
            <p className="text-xl text-text-dark/70 mb-8">
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
