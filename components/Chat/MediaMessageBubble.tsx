'use client';

import React, { useState } from 'react';
import { Download, X, Play } from 'lucide-react';
import Image from 'next/image';

interface MediaMessageBubbleProps {
  mediaUrl: string;
  mediaType: 'image' | 'video';
  isSent: boolean;
  fileName?: string;
  caption?: string;
}

export default function MediaMessageBubble({
  mediaUrl,
  mediaType,
  isSent,
  fileName,
  caption,
}: MediaMessageBubbleProps) {
  const [showLightbox, setShowLightbox] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = fileName || `${mediaType}-${Date.now()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div
        className={`rounded-lg overflow-hidden ${
          isSent ? 'bg-blue-600' : 'bg-gray-100 dark:bg-slate-700'
        } max-w-[400px]`}
      >
        {/* Media Content */}
        <div className="relative group">
          {mediaType === 'image' ? (
            <div
              className="relative cursor-pointer"
              onClick={() => setShowLightbox(true)}
            >
              <img
                src={mediaUrl}
                alt={fileName || 'Image'}
                width={400}
                height={300}
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 dark:bg-slate-800/90 rounded-full p-3">
                  <Download className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                </div>
              </div>
            </div>
          ) : (
            <video
              src={mediaUrl}
              controls
              className="w-full h-auto max-h-[400px]"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Caption */}
        {caption && (
          <div
            className={`p-3 ${
              isSent ? 'text-white' : 'text-gray-900 dark:text-gray-100'
            }`}
          >
            <p className="text-sm">{caption}</p>
          </div>
        )}

        {/* Download Button */}
        <div className="p-2 border-t border-white/10 dark:border-gray-600">
          <button
            onClick={handleDownload}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition ${
              isSent
                ? 'bg-white/20 hover:bg-white/30 text-white'
                : 'bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-900 dark:text-gray-100'
            }`}
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Download</span>
          </button>
        </div>
      </div>

      {/* Lightbox for Images */}
      {showLightbox && mediaType === 'image' && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowLightbox(false)}
        >
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={mediaUrl}
            alt={fileName || 'Image'}
            width={1200}
            height={900}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
