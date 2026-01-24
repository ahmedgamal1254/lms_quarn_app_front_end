'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Download } from 'lucide-react';

interface VoiceMessageBubbleProps {
  audioUrl: string;
  duration: number;
  isSent: boolean;
  fileName?: string;
}

export default function VoiceMessageBubble({
  audioUrl,
  duration,
  isSent,
  fileName,
}: VoiceMessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = () => {
    const speeds = [1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackRate);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = fileName || 'voice-message.webm';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-gray-100 min-w-[280px] max-w-[400px]`}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={`p-2 rounded-full transition bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-700 dark:text-gray-200`}
      >
        {isPlaying ? (
          <Pause className={`w-5 h-5`} />
        ) : (
          <Play className={`w-5 h-5`} />
        )}
      </button>

      {/* Waveform / Progress Bar */}
      <div className="flex-1">
        <div className="relative h-8 flex items-center">
          {/* Background bars */}
          <div className="flex items-center gap-0.5 w-full h-full">
            {[...Array(30)].map((_, i) => {
              const height = 20 + Math.random() * 60;
              const isActive = (i / 30) * 100 < progress;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-colors ${
                    isActive
                      ? 'bg-blue-600 dark:bg-blue-400'
                      : 'bg-gray-300 dark:bg-slate-600'
                  }`}
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </div>

        {/* Time Display */}
        <div className="flex items-center justify-between mt-1">
          <span className={`text-xs text-gray-500 dark:text-gray-400`}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <button
            onClick={handleSpeedChange}
            className={`text-xs font-medium px-2 py-0.5 rounded bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500`}
          >
            {playbackRate}x
          </button>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className={`p-2 rounded-lg transition hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-400`}
        title="Download"
      >
        <Download className="w-4 h-4" />
      </button>
    </div>
  );
}
