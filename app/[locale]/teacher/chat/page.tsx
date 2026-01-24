'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageCircle,
  Send,
  Search,
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
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import VoiceRecorder from '@/components/Chat/VoiceRecorder';
import FileUploadButton from '@/components/Chat/FileUploadButton';
import VoiceMessageBubble from '@/components/Chat/VoiceMessageBubble';
import MediaMessageBubble from '@/components/Chat/MediaMessageBubble';
import FileMessageBubble from '@/components/Chat/FileMessageBubble';

// Types
interface User {
  id: number;
  name: string;
  image: string;
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
  updated_at: string;
  sender: User;
  attachment_path?: string;
  attachment_type?: 'voice' | 'image' | 'video' | 'document';
  attachment_size?: number;
  duration?: number;
  original_filename?: string;
}

interface Conversation {
  id: number;
  type: 'private' | 'group';
  created_at: string;
  updated_at: string;
  users: User[];
  last_message: Message | null;
  unread_messages_count?: number;
}

// Fetch conversations
const fetchConversations = async (params: any) => {
  const response = await axiosInstance.get('/conversations', { params });
  return response.data.data;
};

// Fetch messages for a conversation
const fetchMessages = async (conversationId: number, page: number) => {
  const response = await axiosInstance.get(`/messages/${conversationId}`, {
    params: { page },
  });
  return response.data.data;
};

// Send message
const sendMessage = async (data: FormData) => {
  const response = await axiosInstance.post(`/messages/send`, data, {
    headers: {
      'Content-Type': null,
    } as any,
  });
  return response.data.data;
};

export default function ChatPage() {
  const t = useTranslations('Chat');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationPage, setConversationPage] = useState(1);
  const [messagePage, setMessagePage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const user = getUser();

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', conversationPage, searchQuery],
    queryFn: () =>
      fetchConversations({
        page: conversationPage,
        search: searchQuery,
      }),
    staleTime: 1 * 60 * 1000,
  });

  // Fetch messages
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversation?.id, messagePage],
    queryFn: () => fetchMessages(selectedConversation!.id, messagePage),
    enabled: !!selectedConversation,
    staleTime: 30 * 1000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation?.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      scrollToBottom();
    },
    onError: (error: AxiosError<{ error: string }>) => {
      toast.error(error?.response?.data?.error || t('sendMessageError'));
    },
  });

  const conversations = conversationsData?.conversations || [];
  const messages = messagesData?.messages || [];
  const messagesPagination = {
    currentPage: messagesData?.current_page || 1,
    lastPage: messagesData?.last_page || 1,
    hasMore: messagesData?.has_more || false,
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle scroll for loading more messages
  const handleScroll = () => {
    if (!messagesContainerRef.current || loadingMore || !messagesPagination.hasMore) return;

    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop === 0) {
      setLoadingMore(true);
      setMessagePage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (messages.length > 0 && messagePage === 1) {
      scrollToBottom();
    }
  }, [messages, messagePage]);

  useEffect(() => {
    if (messagesData && loadingMore) {
      setLoadingMore(false);
    }
  }, [messagesData, loadingMore]);

  // Handle send message
  const handleSendMessage = (e?: React.FormEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    const formData = new FormData();
    formData.append('conversation_id', selectedConversation.id.toString());
    formData.append('message', messageText.trim());

    sendMessageMutation.mutate(formData);
  };

  console.log(messageText)


  const handleSendVoice = async (audioBlob: Blob, duration: number) => {
    if (!selectedConversation) return;
    const formData = new FormData();
    formData.append('conversation_id', selectedConversation.id.toString());
    formData.append('message', messageText.trim());
    formData.append('audio', audioBlob, 'voice-message.webm');
    formData.append('duration', duration.toString());
    
    await sendMessageMutation.mutateAsync(formData);
  };

  const handleSendFiles = async (files: File[]) => {
    if (!selectedConversation) return;
    for (const file of files) {
      const formData = new FormData();
      formData.append('conversation_id', selectedConversation.id.toString());
      formData.append('message', messageText.trim());
      formData.append('file', file);
      
      await sendMessageMutation.mutateAsync(formData);
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return tCommon('today');
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t('yesterday');
    } else {
      return date.toLocaleDateString(locale, {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  // Get other user in conversation
  const getOtherUser = (conversation: Conversation): User | null => {
    return conversation.users.find((u) => u.id !== user?.id) || conversation.users[0]; 
  };

  // Deduplicated Conversation List Component
  const ConversationList = ({ isMobile = false }) => (
    <div className="flex-1 overflow-y-auto">
      {conversationsLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-center">{t('noConversations')}</p>
        </div>
      ) : (
        conversations.map((conversation: Conversation) => {
          const otherUser = getOtherUser(conversation);
          const isSelected = selectedConversation?.id === conversation.id;

          const content = (
            <div className="flex items-start gap-3 px-2">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                {otherUser?.image ? (
                  <img
                    src={otherUser.image}
                    alt={otherUser.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                    {otherUser?.name}
                  </h3>
                  {conversation.last_message && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 mx-2">
                      {formatDate(conversation.last_message.created_at)}
                    </span>
                  )}
                </div>
                {conversation.last_message && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {conversation.last_message.attachment_type === 'voice' && (
                      <span className="flex items-center gap-1"><span className="text-red-500">🎤</span> {t('voiceMessage')}</span>
                    )}
                    {conversation.last_message.attachment_type === 'image' && (
                      <span className="flex items-center gap-1"><span className="text-blue-500">🖼️</span> {t('image')}</span>
                    )}
                    {conversation.last_message.attachment_type === 'video' && (
                      <span className="flex items-center gap-1"><span className="text-purple-500">🎥</span> {t('video')}</span>
                    )}
                    {conversation.last_message.attachment_type === 'document' && (
                      <span className="flex items-center gap-1"><span className="text-green-500">📄</span> {t('file')}</span>
                    )}
                    {(!conversation.last_message.attachment_type) && conversation.last_message.message}
                    {conversation.unread_messages_count && conversation.unread_messages_count > 0 && (
                      <span className="mx-2 inline-block bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {conversation.unread_messages_count}
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          );

          const className = `p-4 border-b border-gray-100 cursor-pointer transition-colors block ${
            isSelected
              ? 'bg-indigo-50 border-s-4 border-indigo-600'
              : 'hover:bg-gray-50'
          }`;

          if (isMobile) {
            return (
              <Link
                key={conversation.id}
                href={`/teacher/chat/${conversation.id}`}
                className={className}
              >
                {content}
              </Link>
            );
          }

          return (
            <div
              key={conversation.id}
              onClick={() => {
                setSelectedConversation(conversation);
                setMessagePage(1);
              }}
              className={className}
            >
              {content}
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800" dir={dir}>
      {/* Desktop Layout */}
      <div className="h-screen flex-col md:flex-row hidden md:flex">
        {/* Sidebar - Conversations List */}
        <div className="w-full md:w-96 bg-white dark:bg-slate-800 border-e border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('messages')}</h1>
            
            {/* Search */}
            <div className="relative">
              <Search className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${dir === 'rtl' ? 'pl-10 pr-4' : 'pr-10 pl-4'} py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
              />
            </div>
          </div>

          <ConversationList isMobile={false} />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex-col bg-gray-50 dark:bg-slate-900 shadow-sm flex">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-100"
                    >
                      <ArrowRight className={`w-6 h-6 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white font-bold">
                      {getOtherUser(selectedConversation)?.image ? (
                        <img
                          src={getOtherUser(selectedConversation)!.image}
                          alt={getOtherUser(selectedConversation)!.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <h2 className="font-bold text-gray-900 dark:text-gray-100">
                        {getOtherUser(selectedConversation)?.name}
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getOtherUser(selectedConversation)?.role === 'teacher'
                          ? t('teacher')
                          : t('student')}
                      </p>
                    </div>
                  </div>

                  
                </div>
              </div>

              {/* Messages Area */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {loadingMore && (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                  </div>
                )}

                {messagesLoading && messagePage === 1 ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">{t('startConversation')}</p>
                  </div>
                ) : (
                  <>
                    {messages.slice().reverse().map((message: Message, index: number) => {
                      const isOwn = message.sender_id === user?.id;
                      const showDate =
                        index === 0 ||
                        new Date(message.created_at).toDateString() !==
                          new Date(messages[index - 1].created_at).toDateString();

                      return (
                        <div key={message.id}>
                          {/* Date Separator */}
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <span className="bg-white dark:bg-slate-800 px-4 py-1 rounded-full text-xs text-gray-600 dark:text-gray-400 shadow-sm">
                                {formatDate(message.created_at)}
                              </span>
                            </div>
                          )}

                          {/* Message */}
                          <div
                            className={`flex items-end gap-2 ${
                              isOwn ? 'flex-row-reverse' : 'flex-row'
                            }`}
                          >
                            {/* Avatar for received messages */}
                            {!isOwn && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {message.sender.image ? (
                                  <img
                                    src={message.sender.image}
                                    alt={message.sender.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  <User className="w-4 h-4" />
                                )}
                              </div>
                            )}

                             {/* Message Bubble */}
                            <div
                              className={`max-w-[75%] rounded-2xl overflow-hidden ${
                                isOwn ? 'dark:text-white' : 'bg-white shadow-sm'
                              }`}
                            >
                              <div className="p-1">
                                {message.attachment_type === 'voice' && message.attachment_path && (
                                  <VoiceMessageBubble
                                    audioUrl={message.attachment_path}
                                    duration={message.duration || 0}
                                    isSent={isOwn}
                                    fileName={message.original_filename}
                                  />
                                )}

                                {(message.attachment_type === 'image' || message.attachment_type === 'video') && message.attachment_path && (
                                  <MediaMessageBubble
                                    mediaUrl={message.attachment_path}
                                    mediaType={message.attachment_type}
                                    isSent={isOwn}
                                    fileName={message.original_filename}
                                    caption={message.message}
                                  />
                                )}

                                {message.attachment_type === 'document' && message.attachment_path && (
                                  <FileMessageBubble
                                    fileUrl={message.attachment_path}
                                    fileName={message.original_filename || 'file'}
                                    fileSize={message.attachment_size || 0}
                                    isSent={isOwn}
                                    fileType={message.attachment_path.split('.').pop()}
                                  />
                                )}

                                {(!message.attachment_type) && message.message && (
                                  <div className="px-4 py-2 text-sm break-words">
                                    {message.message}
                                  </div>
                                )}
                              </div>
                              <span
                                className={`text-[10px] px-3 pb-1 block ${
                                  isOwn ? 'text-gray-400' : 'text-gray-400'
                                } ${isOwn ? (dir === 'rtl' ? 'text-left' : 'text-right') : (dir === 'rtl' ? 'text-right' : 'text-left')}`}
                              >
                                {formatTime(message.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

               {/* Message Input */}
              <div className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center gap-2">
                  <FileUploadButton 
                    onUpload={handleSendFiles}
                    disabled={sendMessageMutation.isPending}
                  />
                  
                  <div className="flex-1">
                    <textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder={t('typeMessage')}
                      rows={1}
                      className={`w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${dir === 'rtl' ? 'text-right' : 'text-left'} dark:text-gray-100`}
                    />
                  </div>

                  {!messageText.trim() ? (
                    <VoiceRecorder 
                      onSend={handleSendVoice}
                      disabled={sendMessageMutation.isPending}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200 dark:shadow-none"
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {t('selectConversation')}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('selectConversationDesc')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="w-full bg-white dark:bg-slate-800 border-e border-gray-200 dark:border-gray-700 flex h-screen flex-col md:hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('messages')}</h1>
          
          {/* Search */}
          <div className="relative">
            <Search className={`absolute ${dir === 'rtl' ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${dir === 'rtl' ? 'pl-10 pr-4' : 'pr-10 pl-4'} py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}
            />
          </div>
        </div>

        <ConversationList isMobile={true} />
      </div>
    </div>
  );
}