'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Avatar, Input, Spin, Badge, Empty } from 'antd';
import { SearchOutlined, UserOutlined } from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';
import { arSA, enUS } from 'date-fns/locale';
import { useParams } from 'next/navigation';

export default function AdminChatPage() {
    const params = useParams();
    const isRTL = params.locale === 'ar';
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

    // Fetch Conversations
    const { data: conversationsData, isLoading: loadingConversations } = useQuery({
        queryKey: ['admin-chats'],
        queryFn: async () => {
            const res = await axiosInstance.get('/admin/chats');
            return res.data.data;
        }
    });

    // Fetch Messages when chat selected
    const { data: chatDetails, isLoading: loadingMessages } = useQuery({
        queryKey: ['admin-chat-details', selectedChatId],
        queryFn: async () => {
            if (!selectedChatId) return null;
            const res = await axiosInstance.get(`/admin/chats/${selectedChatId}`);
            return res.data.data;
        },
        enabled: !!selectedChatId
    });

    const conversations = conversationsData?.data || [];
    const messages = chatDetails?.messages?.data || [];
    const currentConversation = chatDetails?.conversation;

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Sidebar List */}
            <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
                        {isRTL ? 'المحادثات' : 'Conversations'}
                    </h2>
                    <Input 
                        prefix={<SearchOutlined />} 
                        placeholder={isRTL ? 'بحث...' : 'Search...'} 
                        className="rounded-md"
                    />
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {loadingConversations ? (
                        <div className="flex justify-center p-8"><Spin /></div>
                    ) : (
                        conversations.map((chat: any) => {
                            const otherUser = chat.users?.find((u: any) => u.role !== 'admin') || chat.users?.[0]; // Basic logic
                            const lastMsg = chat.last_message;
                            
                            return (
                                <div 
                                    key={chat.id}
                                    onClick={() => setSelectedChatId(chat.id)}
                                    className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors
                                        ${selectedChatId === chat.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar size={40} icon={<UserOutlined />} src={otherUser?.image} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {otherUser?.name || 'Unknown User'}
                                                </h4>
                                                {lastMsg && (
                                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                        {formatDistanceToNow(new Date(lastMsg.created_at), { addSuffix: true, locale: isRTL ? arSA : enUS })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                                                {lastMsg?.message || (lastMsg?.attachment_path ? (isRTL ? 'مرفق' : 'Attachment') : '')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat View */}
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-slate-900">
                {selectedChatId ? (
                    <>
                        {/* Header */}
                        <div className="p-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                             <Avatar size={40} icon={<UserOutlined />} />
                             <div>
                                 <h3 className="font-medium text-gray-800 dark:text-white">
                                     {isRTL ? 'تفاصيل المحادثة' : 'Conversation Details'}
                                 </h3>
                                 <span className="text-xs text-gray-500">
                                     #{selectedChatId}
                                 </span>
                             </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {loadingMessages ? (
                                <div className="flex justify-center p-8"><Spin /></div>
                            ) : (
                                messages.slice().reverse().map((msg: any) => {
                                    const isMe = msg.sender_id === 0; // Check logic for admin or specific user? 
                                    // Actually admin is viewing teacher-student chat, so "me" is relative.
                                    // We should probably show simple left/right based on sender role or just list them.
                                    // Let's just list them with sender name.
                                    
                                    return (
                                        <div key={msg.id} className={`flex flex-col ${isRTL ? 'items-start' : 'items-start'}`}>
                                            <div className="flex gap-2 max-w-[80%]">
                                               <Avatar size={32} src={msg.sender?.image} icon={<UserOutlined />}>
                                                    {msg.sender?.name?.[0]}
                                               </Avatar>
                                               <div>
                                                   <div className="flex items-baseline gap-2 mb-1">
                                                       <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                            {msg.sender?.name}
                                                       </span>
                                                       <span className="text-xs text-gray-400">
                                                           {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                       </span>
                                                   </div>
                                                   <div className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                                                       {msg.message && <p className="text-gray-800 dark:text-gray-200">{msg.message}</p>}
                                                       {msg.attachment_path && (
                                                           <a href={msg.attachment_path} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline text-sm block mt-1">
                                                               {isRTL ? 'عرض المرفق' : 'View Attachment'}
                                                           </a>
                                                       )}
                                                   </div>
                                               </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 flex-col gap-2">
                        <MessageCircle size={48} className="opacity-20" />
                        <p>{isRTL ? 'اختر محادثة للعرض' : 'Select a conversation to view'}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

import { MessageCircle } from 'lucide-react';
