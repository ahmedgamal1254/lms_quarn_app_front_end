'use client';

import React from 'react';
import { Download, FileText, File as FileIcon } from 'lucide-react';

interface FileMessageBubbleProps {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType?: string;
  isSent: boolean;
}

export default function FileMessageBubble({
  fileUrl,
  fileName,
  fileSize,
  fileType,
  isSent,
}: FileMessageBubbleProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = () => {
    if (!fileType) return <FileIcon className="w-8 h-8" />;
    
    if (fileType.includes('pdf')) {
      return <FileText className="w-8 h-8 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    } else if (fileType.includes('excel') || fileType.includes('sheet')) {
      return <FileText className="w-8 h-8 text-green-500" />;
    } else if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
      return <FileText className="w-8 h-8 text-orange-500" />;
    } else {
      return <FileIcon className="w-8 h-8" />;
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 min-w-[280px] max-w-[400px]`}
    >
      {/* File Icon */}
      <div
        className={`p-3 rounded-lg bg-gray-200 dark:bg-slate-600`}
      >
        {getFileIcon()}
      </div>

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`font-medium text-sm truncate text-gray-900 dark:text-gray-100`}
        >
          {fileName}
        </p>
        <p
          className={`text-xs text-gray-500 dark:text-gray-400`}
        >
          {formatFileSize(fileSize)}
        </p>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className={`p-2 rounded-lg transition bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-600 dark:text-gray-200`}
        title="Download"
      >
        <Download className="w-5 h-5" />
      </button>
    </div>
  );
}
