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

const sendMessage = async (data: {
  conversation_id: number;
  message: string;
}) => {
  const res = await axiosInstance.post(
    `/messages/send`,
    data
  );
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

    sendMessageMutation.mutate({
      conversation_id: conversationId,
      message: messageText.trim(),
    });
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
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ===== HEADER ===== */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
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
            <span className="text-xs text-gray-500">
              {otherUser?.role === 'teacher' ? 'معلم' : 'طالب'}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Phone />
          <Video />
          <MoreVertical />
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
                    <div className="text-center text-xs text-gray-500 my-2">
                      {formatDate(msg.created_at)}
                    </div>
                  )}

                  <div
                    className={`flex ${
                      isOwn ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                        isOwn
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white shadow'
                      }`}
                    >
                      {msg.message}
                      <div className="text-[10px] mt-1 text-gray-400">
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
      <div className="bg-white border-t p-4 flex gap-2">
        <Paperclip className='hidden sm:block' />
        <ImagePlus className='hidden sm:block' />
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className="flex-1 border rounded-lg p-2 resize-none"
          placeholder="اكتب رسالتك..."
        />
        <button
          onClick={handleSendMessage}
          disabled={sendMessageMutation.isPending}
          className="bg-indigo-600 text-white px-4 rounded-lg"
        >
          {sendMessageMutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Send />
          )}
        </button>
      </div>
    </div>
  );
}
