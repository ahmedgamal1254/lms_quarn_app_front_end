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
  AlertCircle,
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
import { Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';

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
}

interface Conversation {
  id: number;
  type: 'private' | 'group';
  created_at: string;
  updated_at: string;
  users: User[];
  last_message: Message | null;
  unread_count?: number;
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
const sendMessage = async (data: { conversation_id: number; message: string }) => {
  const response = await axiosInstance.post(
    `/messages/send?conversation_id=${data.conversation_id}&message=${encodeURIComponent(data.message)}`
  );
  return response.data.data;
};

export default function ChatPage() {
  const tChat = useTranslations('Chat');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [conversationPage, setConversationPage] = useState(1);
  const [messagePage, setMessagePage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const user=getUser();

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
      toast.error(error?.response?.data?.error || tChat('sendMessageError'));
    },
  });

  const conversations = conversationsData?.conversations || [];
  const messages = messagesData?.messages || [];
  const messagesPagination = {
    currentPage: messagesData?.current_page || 1,
    lastPage: messagesData?.last_page || 1,
    hasMore: messagesData?.has_more || false,
  };

  const orderedMessages = [...messages].reverse();


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

    sendMessageMutation.mutate({
      conversation_id: selectedConversation.id,
      message: messageText.trim(),
    });
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
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
      return tChat('yesterday');
    } else {
      return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
        day: 'numeric',
        month: 'short',
      });
    }
  };

  // Get other user in conversation
  const getOtherUser = (conversation: Conversation): User | null => {
    return conversation.users.find((u) => u.id !== user?.id) || conversation.users[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="h-screen hidden sm:flex">
        {/* Sidebar - Conversations List */}
        <div className={`w-full md:w-96 bg-white ${locale === 'ar' ? 'border-l' : 'border-r'} border-gray-200 flex flex-col`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{tChat('messages')}</h1>
            
            {/* Search */}
            <div className="relative">
              <Search className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <input
                type="text"
                placeholder={tChat('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full ${locale === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-600 text-center">{tChat('noConversations')}</p>
              </div>
            ) : (
              conversations.map((conversation: Conversation) => {
                const otherUser = getOtherUser(conversation);
                const isSelected = selectedConversation?.id === conversation.id;

                return (
                  <div
                    key={conversation.id}
                    onClick={() => {
                      setSelectedConversation(conversation);
                      setMessagePage(1);
                    }}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                      isSelected
                        ? `bg-indigo-50 ${locale === 'ar' ? 'border-r-4 border-r-indigo-600' : 'border-l-4 border-l-indigo-600'}`
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
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
                          <h3 className="font-semibold text-gray-900 truncate">
                            {otherUser?.name}
                          </h3>
                          {conversation.last_message && (
                            <span className={`text-xs text-gray-500 flex-shrink-0 ${locale === 'ar' ? 'mr-2' : 'ml-2'}`}>
                              {formatDate(conversation.last_message.created_at)}
                            </span>
                          )}
                        </div>
                        {conversation.last_message && (
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.last_message.message}
                          </p>
                        )}
                        {conversation.unread_count && conversation.unread_count > 0 && (
                          <div className="mt-1">
                            <span className="inline-block bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                              {conversation.unread_count}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex-col bg-gray-50 hidden sm:flex">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConversation(null)}
                      className="md:hidden text-gray-600 hover:text-gray-900"
                    >
                      <ArrowRight className="w-6 h-6" />
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
                      <h2 className="font-bold text-gray-900">
                        {getOtherUser(selectedConversation)?.name}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {getOtherUser(selectedConversation)?.role === 'teacher'
                          ? tChat('teacher')
                          : tChat('student')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
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
                    <p className="text-gray-600">{tChat('startConversation')}</p>
                  </div>
                ) : (
                  <>
                    {orderedMessages.map((message: Message, index: number) => {
                      const isOwn = message.sender_id === user?.id; // Current user
                      const showDate =
                        index === 0 ||
                        new Date(message.created_at).toDateString() !==
                          new Date(messages[index - 1].created_at).toDateString();

                      return (
                        <div key={message.id}>
                          {/* Date Separator */}
                          {showDate && (
                            <div className="flex justify-center my-4">
                              <span className="bg-white px-4 py-1 rounded-full text-xs text-gray-600 shadow-sm">
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
                              className={`max-w-[70%] ${
                                isOwn ? 'items-end' : 'items-start'
                              }`}
                            >
                              <div
                                className={`px-4 py-2 rounded-2xl ${
                                  isOwn
                                    ? 'bg-indigo-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-900 rounded-bl-none shadow-sm'
                                }`}
                              >
                                <p className="text-sm break-words">{message.message}</p>
                              </div>
                              <span
                                className={`text-xs text-gray-500 mt-1 block ${
                                  isOwn 
                                    ? (locale === 'ar' ? 'text-right' : 'text-left') 
                                    : (locale === 'ar' ? 'text-left' : 'text-right')
                                }`}
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
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ImagePlus className="w-5 h-5" />
                  </button>
                  
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
                      placeholder={tChat('typeMessage')}
                      rows={1}
                      className={`w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${locale === 'ar' ? 'text-right' : 'text-left'}`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendMessageMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {tChat('selectConversation')}
                </h2>
                <p className="text-gray-600">
                  {tChat('selectConversationDesc')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-96 h-screen bg-white border-l border-gray-200 flex flex-col sm:hidden" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{tChat('messages')}</h1>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={tChat('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
                <p className="text-gray-600 text-center">{tChat('noConversations')}</p>
              </div>
            ) : (
              conversations.map((conversation: Conversation) => {
                const otherUser = getOtherUser(conversation);
                const isSelected = selectedConversation?.id === conversation.id;

                return (
                  <Link
                    key={conversation.id}
                    href={`/student/chat/${conversation.id}`}
                    
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 border-r-4 border-r-indigo-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
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
                          <h3 className="font-semibold text-gray-900 truncate">
                            {otherUser?.name}
                          </h3>
                          {conversation.last_message && (
                            <span className="text-xs text-gray-500 flex-shrink-0 mr-2">
                              {formatDate(conversation.last_message.created_at)}
                            </span>
                          )}
                        </div>
                        {conversation.last_message && (
                          <p className="text-sm text-gray-600 truncate">
                            {conversation.last_message.message}
                          </p>
                        )}
                        {conversation.unread_count && conversation.unread_count > 0 && (
                          <div className="mt-1">
                            <span className="inline-block bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                              {conversation.unread_count}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
      </div>
    </div>
  );
}