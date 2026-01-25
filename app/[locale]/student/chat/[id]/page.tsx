'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageCircle,
  Send,
  ArrowRight,
  User,
  Loader2,
  ImagePlus,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { getUser } from '@/lib/auth';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import VoiceRecorder from '@/components/Chat/VoiceRecorder';
import FileUploadButton from '@/components/Chat/FileUploadButton';
import VoiceMessageBubble from '@/components/Chat/VoiceMessageBubble';
import MediaMessageBubble from '@/components/Chat/MediaMessageBubble';
import FileMessageBubble from '@/components/Chat/FileMessageBubble';

/* ================= TYPES ================= */

interface UserType {
  id: number;
  name: string;
  image: string | null;
  role?: string;
}

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  type: 'text' | 'image' | 'file';
  is_read: boolean;
  created_at: string;
  sender: UserType;
  attachment_path?: string;
  attachment_type?: 'voice' | 'image' | 'video' | 'document';
  attachment_size?: number;
  duration?: number;
  original_filename?: string;
}

interface MessagesResponse {
  messages: Message[];
  current_page: number;
  last_page: number;
  has_more: boolean;
  conversation: {
    id: number;
    users: UserType[];
  };
}

/* ================= API ================= */

const fetchMessages = async (
  conversationId: number,
  page: number
): Promise<MessagesResponse> => {
  const res = await axiosInstance.get(`/messages/${conversationId}`, {
    params: { page },
  });
  return res.data.data;
};

const sendMessage = async (data: FormData) => {
  const res = await axiosInstance.post(`/messages/send`, data, {
    headers: {
      'Content-Type': null,
    } as any,
  });
  return res.data.data;
};

/* ================= PAGE ================= */

export default function ChatPage() {
  const params = useParams();
  const conversationId = Number(params.id);

  const user = getUser();
  const queryClient = useQueryClient();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [messageText, setMessageText] = useState('');
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  /* ========== FETCH MESSAGES ========== */

  const { data, isLoading } = useQuery({
    queryKey: ['messages', conversationId, page],
    queryFn: () => fetchMessages(conversationId, page),
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  });

  const {data:conversationData, isLoading:conversationLoading} = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => {
      return axiosInstance.get(`/conversations/${conversationId}`).then((res) => res.data.data);
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000,
  });

  const messages = data?.messages ?? [];
  const conversation = conversationData;
  const otherUser =
    conversation?.users?.find((u: UserType) => u.id !== user?.id) ??
    conversation?.users?.[0];

  /* ========== SEND MESSAGE ========== */

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({
        queryKey: ['messages', conversationId],
      });
      scrollToBottom();
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error.response?.data?.error || 'فشل إرسال الرسالة');
    },
  });

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const formData = new FormData();
    formData.append('conversation_id', conversationId.toString());
    formData.append('message', messageText.trim());

    sendMessageMutation.mutate(formData);
  };

  const handleSendVoice = async (audioBlob: Blob, duration: number) => {
    const formData = new FormData();
    formData.append('conversation_id', conversationId.toString());
    formData.append('message', '');
    formData.append('audio', audioBlob, 'voice-message.webm');
    formData.append('duration', duration.toString());
    
    await sendMessageMutation.mutateAsync(formData);
  };

  const handleSendFiles = async (files: File[]) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append('conversation_id', conversationId.toString());
      formData.append('message', '');
      formData.append('file', file);
      
      await sendMessageMutation.mutateAsync(formData);
    }
  };

  /* ========== SCROLL ========== */

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!messagesContainerRef.current || loadingMore || !data?.has_more) return;

    if (messagesContainerRef.current.scrollTop === 0) {
      setLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (page === 1) scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (loadingMore) setLoadingMore(false);
  }, [data]);

  /* ========== FORMATTERS ========== */

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'اليوم';
    if (d.toDateString() === yesterday.toDateString()) return 'أمس';

    return d.toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'short',
    });
  };

  console.log(conversationData)
  console.log('conversation', conversation);
  console.log('otherUser', otherUser);

  /* ================= UI ================= */

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* ===== HEADER ===== */}
      <div className="bg-white dark:bg-slate-800 border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href={"/student/chat"}><ArrowRight className="w-5 h-5 md:hidden" /></Link>
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
            {otherUser?.image ? (
              <img
                src={otherUser.image}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User />
            )}
          </div>
          <div>
            <p className="font-bold">{otherUser?.name}</p>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {otherUser?.role === 'teacher' ? 'معلم' : 'طالب'}
            </span>
          </div>
        </div>


      </div>

      {/* ===== MESSAGES ===== */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loadingMore && (
          <div className="flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : (
          messages
            .slice()
            .reverse()
            .map((msg, index) => {
              const isOwn = msg.sender_id === user?.id;
              const showDate =
                index === 0 ||
                new Date(msg.created_at).toDateString() !==
                  new Date(messages[index - 1].created_at).toDateString();

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 my-2">
                      {formatDate(msg.created_at)}
                    </div>
                  )}

                  <div
                    className={`flex ${
                      isOwn ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl overflow-hidden ${
                        isOwn ? 'bg-indigo-600' : 'bg-white shadow'
                      }`}
                    >
                      {/* Message Content */}
                      <div className="p-1">
                        {msg.attachment_type === 'voice' && msg.attachment_path && (
                          <VoiceMessageBubble
                            audioUrl={msg.attachment_path}
                            duration={msg.duration || 0}
                            isSent={isOwn}
                            fileName={msg.original_filename}
                          />
                        )}

                        {(msg.attachment_type === 'image' || msg.attachment_type === 'video') && msg.attachment_path && (
                          <MediaMessageBubble
                            mediaUrl={msg.attachment_path}
                            mediaType={msg.attachment_type}
                            isSent={isOwn}
                            fileName={msg.original_filename}
                            caption={msg.message}
                          />
                        )}

                        {msg.attachment_type === 'document' && msg.attachment_path && (
                          <FileMessageBubble
                            fileUrl={msg.attachment_path}
                            fileName={msg.original_filename || 'file'}
                            fileSize={msg.attachment_size || 0}
                            isSent={isOwn}
                            fileType={msg.attachment_path.split('.').pop()}
                          />
                        )}

                        {(!msg.attachment_type || msg.attachment_type === null) && msg.message && (
                          <div className="px-3 py-2 text-sm">
                            {msg.message}
                          </div>
                        )}
                      </div>

                      <div className={`text-[10px] px-3 pb-1 ${isOwn ? 'text-gray-300' : 'text-gray-400'} text-left`}>
                        {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ===== INPUT ===== */}
      <div className="bg-white dark:bg-slate-800 border-t p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
            {/* Attachment Button */}
            {!isRecording && (
              <div className="flex items-center">
                <FileUploadButton 
                  onUpload={handleSendFiles}
                  disabled={sendMessageMutation.isPending}
                />
              </div>
            )}

            {/* Message Input / Voice Recorder */}
            <div className={isRecording ? "flex-1" : "flex-1 min-w-0"}>
              {!isRecording && (
                <div className="relative">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="w-full border dark:border-gray-600 rounded-xl p-3 resize-none bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px] max-h-32"
                    placeholder="اكتب رسالتك..."
                    rows={1}
                  />
                </div>
              )}
              {isRecording && !messageText.trim() && (
                 <VoiceRecorder 
                  onSend={handleSendVoice}
                  disabled={sendMessageMutation.isPending}
                  onRecordingStateChange={setIsRecording}
                />
              )}
            </div>

            {/* Action Buttons: Voice or Send */}
            <div className="flex items-center gap-2">
              {!isRecording && !messageText.trim() && (
                <VoiceRecorder 
                  onSend={handleSendVoice}
                  disabled={sendMessageMutation.isPending}
                  onRecordingStateChange={setIsRecording}
                />
              )}
              
              {messageText.trim() && (
                <button
                  onClick={handleSendMessage}
                  disabled={sendMessageMutation.isPending || !messageText.trim()}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-200 dark:shadow-none flex-shrink-0"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Send className="w-6 h-6" />
                  )}
                </button>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
