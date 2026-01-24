'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, X, Send, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => Promise<void>;
  disabled?: boolean;
}

export default function VoiceRecorder({ onSend, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isSending, setIsSending] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setIsRecording(false);
    setDuration(0);
    audioChunksRef.current = [];
  };

  const sendRecording = async () => {
    stopRecording();
    
    if (audioChunksRef.current.length === 0) {
      toast.error('No audio recorded');
      return;
    }

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const recordedDuration = duration;
    
    setIsSending(true);
    try {
      await onSend(audioBlob, recordedDuration);
      setIsRecording(false);
      setDuration(0);
      audioChunksRef.current = [];
    } catch (error) {
      console.error('Error sending voice message:', error);
      toast.error('Failed to send voice message');
    } finally {
      setIsSending(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isRecording) {
    return (
      <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-lg border-2 border-red-500 dark:border-red-600">
        {/* Recording Animation */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium text-red-600 dark:text-red-400">
            {formatDuration(duration)}
          </span>
        </div>

        {/* Waveform Animation */}
        <div className="flex-1 flex items-center justify-center gap-1 h-8">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-red-500 dark:bg-red-400 rounded-full animate-pulse"
              style={{
                height: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={cancelRecording}
            disabled={isSending}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={sendRecording}
            disabled={isSending || duration < 1}
            className="p-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition disabled:opacity-50 flex items-center gap-2"
            title="Send"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={startRecording}
      disabled={disabled}
      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
      title="Record voice message"
    >
      <Mic className="w-5 h-5" />
    </button>
  );
}
