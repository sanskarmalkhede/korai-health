'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudArrowUpIcon, 
  DocumentArrowUpIcon, 
  PhotoIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    setError(null);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    setError(null);
    
    // Validate file type
    const validTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'
    ];
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or image file (JPEG, PNG, WebP)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    onFileUpload(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const getFileTypeIcon = () => {
    if (isDragOver) {
      return <CloudArrowUpIcon className="w-16 h-16 text-sage-green" />;
    }
    return (
      <div className="flex space-x-2">
        <DocumentArrowUpIcon className="w-12 h-12 text-sage-green/70" />
        <PhotoIcon className="w-12 h-12 text-sage-green/70" />
      </div>
    );
  };

  return (
    <div className="w-full">
      <motion.div
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
          ${isDragOver 
            ? 'border-sage-green bg-sage-green/10 scale-105' 
            : error
            ? 'border-red-400 bg-red-50/50'
            : 'border-sage-green/40 aceternity-card hover:border-sage-green hover:shadow-xl'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        <div className="space-y-6">
          <motion.div 
            className="flex justify-center"
            animate={{ 
              scale: isDragOver ? 1.1 : 1,
              rotate: isDragOver ? 5 : 0 
            }}
            transition={{ duration: 0.2 }}
          >
            {getFileTypeIcon()}
          </motion.div>
          
          <div>
            <motion.h3 
              className="text-2xl font-bold text-text-dark mb-3"
              animate={{ 
                color: isDragOver ? '#6fa066' : '#2d2926' 
              }}
            >
              {isDragOver ? 'Drop Your File Here' : 'Upload Lab Report'}
            </motion.h3>
            
            <p className="text-text-dark/70 mb-4 text-lg">
              {isDragOver 
                ? 'Release to upload your health report' 
                : 'Drag and drop your lab report here, or click to browse'
              }
            </p>
            
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {['PDF', 'JPEG', 'PNG', 'WebP'].map((format) => (
                <span 
                  key={format}
                  className="px-3 py-1 bg-sage-green/10 text-sage-dark text-sm font-medium rounded-lg border border-sage-green/20"
                >
                  {format}
                </span>
              ))}
            </div>
            
            <p className="text-sm text-text-dark/50">
              Maximum file size: 10MB
            </p>
          </div>
          
          <motion.button
            type="button"
            className="aceternity-button-primary px-8 py-4 rounded-xl font-semibold text-lg inline-flex items-center space-x-3 mx-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <DocumentArrowUpIcon className="w-6 h-6" />
            <span>Choose File</span>
          </motion.button>
        </div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <motion.div
            className="absolute -top-4 -right-4 w-8 h-8 bg-sage-green/20 rounded-full"
            animate={{
              scale: isDragOver ? 2 : 1,
              opacity: isDragOver ? 0.3 : 0.1,
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="absolute -bottom-4 -left-4 w-12 h-12 bg-sage-light/20 rounded-full"
            animate={{
              scale: isDragOver ? 1.5 : 1,
              opacity: isDragOver ? 0.4 : 0.1,
            }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3"
          >
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Upload Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 