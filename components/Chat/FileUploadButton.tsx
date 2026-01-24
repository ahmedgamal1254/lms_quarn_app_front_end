'use client';

import React, { useState, useRef } from 'react';
import { Paperclip, X, Image as ImageIcon, Video, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileUploadButtonProps {
  onUpload: (files: File[]) => Promise<void>;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // in MB
}

export default function FileUploadButton({
  onUpload,
  disabled,
  accept = 'image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt',
  multiple = true,
  maxSize = 50, // 50MB default
}: FileUploadButtonProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5" />;
    } else if (file.type.startsWith('video/')) {
      return <Video className="w-5 h-5" />;
    } else {
      return <FileText className="w-5 h-5" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > maxSize * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`Some files exceed the ${maxSize}MB limit`);
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      await onUpload(selectedFiles);
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (selectedFiles.length > 0) {
    return (
      <div className="flex flex-col gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
        {/* File List */}
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg"
            >
              <div className="text-blue-600 dark:text-blue-400">
                {getFileIcon(file)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            disabled={isUploading}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
        title="Attach file"
      >
        <Paperclip className="w-5 h-5" />
      </button>
    </>
  );
}
