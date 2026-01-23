'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getParentDashboard } from '@/services/api/parent.service';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import {
    User,
    ClipboardList,
    FileQuestion,
    Calendar,
    Phone,
    Mail
} from 'lucide-react';

interface Child {
    id: number;
    name: string;
    email: string;
    plan: string;
    sessions_remaining: number;
    upcoming_sessions: number;
    pending_homework: number;
    upcoming_exams: number;
}

interface ParentDashboardData {
    parent: {
        name: string;
        email: string;
        phone: string;
        whatsapp_number?: string;
    };
    children: Child[];
    total_children: number;
}

export default function ParentDashboardPage() {
    const t = useTranslations('Dashboard');
    const tCommon = useTranslations('Common');

    // Fetch parent dashboard data
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['parent-dashboard'],
        queryFn: async () => {
            const response = await getParentDashboard();
            return response.data as any;
        },
        staleTime: 5 * 60 * 1000
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{tCommon('loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Welcome Section */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t('welcomeTo', { name: dashboardData?.parent.name })}
                </h1>
                <p className="text-gray-600">
                    {t('parentDashboard')}
                </p>
            </div>

            {/* Parent Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border border-blue-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {t('accountInfo')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <Mail size={20} className="text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-600">{tCommon('email')}</p>
                            <p className="font-medium text-gray-900 dir-ltr text-start">{dashboardData?.parent.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Phone size={20} className="text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-600">{tCommon('phone')}</p>
                            <p className="font-medium text-gray-900 dir-ltr text-start">{dashboardData?.parent.phone}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                {t('totalChildren')}
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {dashboardData?.total_children || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <User size={24} className="text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                {t('upcomingSessions')}
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {dashboardData?.children.reduce((sum: number, child: any) => sum + child.upcoming_sessions, 0) || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Calendar size={24} className="text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                {t('pendingHomework')}
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {dashboardData?.children.reduce((sum: number, child: any) => sum + child.pending_homework, 0) || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <ClipboardList size={24} className="text-yellow-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">
                                {t('upcomingExams')}
                            </p>
                            <p className="text-3xl font-bold text-gray-900">
                                {dashboardData?.children.reduce((sum: number, child: any) => sum + child.upcoming_exams, 0) || 0}
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileQuestion size={24} className="text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Children Cards */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {t('myChildren')}
                </h2>

                {dashboardData?.children && dashboardData.children.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dashboardData.children.map((child: any) => (
                            <div
                                key={child.id}
                                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                {/* Child Header */}
                                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
                                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <User size={24} className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900">{child.name}</h3>
                                        <p className="text-sm text-gray-500 dir-ltr text-start">{child.email}</p>
                                    </div>
                                </div>

                                {/* Plan Info */}
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">
                                            {tCommon('plan')}
                                        </span>
                                        <span className="font-medium text-blue-700">{child.plan}</span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-sm text-gray-600">
                                            {t('sessionsLeft')}
                                        </span>
                                        <span className="font-bold text-blue-900">{child.sessions_remaining}</span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <Calendar size={20} className="mx-auto mb-1 text-green-600" />
                                        <p className="text-xs text-gray-600 mb-1">
                                            {t('childSessions')}
                                        </p>
                                        <p className="font-bold text-gray-900">{child.upcoming_sessions}</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <ClipboardList size={20} className="mx-auto mb-1 text-yellow-600" />
                                        <p className="text-xs text-gray-600 mb-1">
                                            {t('childHomework')}
                                        </p>
                                        <p className="font-bold text-gray-900">{child.pending_homework}</p>
                                    </div>
                                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                                        <FileQuestion size={20} className="mx-auto mb-1 text-red-600" />
                                        <p className="text-xs text-gray-600 mb-1">
                                            {t('childExams')}
                                        </p>
                                        <p className="font-bold text-gray-900">{child.upcoming_exams}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
                        <User size={48} className="mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600">
                            {t('noChildrenLinked')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
