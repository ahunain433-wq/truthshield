import React from 'react';
import { ArrowUpTrayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const UploadProgress = ({ progress, currentFile, totalFiles }) => {
  const percentage = Math.round(progress);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center">
          <ArrowUpTrayIcon className="h-5 w-5 mr-2 animate-pulse text-[var(--color-trust-400)]" />
          Uploading {totalFiles > 1 ? `Files (${totalFiles})` : 'File'}...
        </h3>
        <span className="text-sm font-medium text-[var(--color-trust-400)]">{percentage}%</span>
      </div>
      
      <div className="relative pt-1">
        <div className="overflow-hidden h-3 text-xs flex rounded-full bg-slate-700">
          <div
            style={{ width: `${percentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center gradient-trust transition-all duration-300"
          />
        </div>
      </div>
      
      {currentFile && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span className="truncate max-w-xs text-slate-300">{currentFile}</span>
          <span className="text-slate-500">
            {percentage === 100 ? 'Processing...' : 'Uploading...'}
          </span>
        </div>
      )}
      
      {percentage === 100 && (
        <div className="flex items-center space-x-2 text-[var(--color-verified-400)] bg-[var(--color-verified-900)] p-3 rounded-lg border border-[var(--color-verified-700)]">
          <CheckCircleIcon className="h-5 w-5" />
          <span className="font-medium">Upload complete! Starting analysis...</span>
        </div>
      )}
    </div>
  );
};

export default UploadProgress;