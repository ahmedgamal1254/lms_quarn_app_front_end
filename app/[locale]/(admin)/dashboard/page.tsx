'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import {
    GraduationCap,
    UserCog,
    Users,
    BookOpen,
    Calendar,
    FileText,
    ClipboardList,
    DollarSign,
    TrendingUp,
    Clock
} from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface DashboardStats {
    students: { total: number; active: number; new: number };
    teachers: { total: number; active: number; new: number };
    sessions: { today: number; thisWeek: number; thisMonth: number };
    homework: { pending: number; completed: number; total: number };
    exams: { upcoming: number; completed: number; total: number };
    subscriptions: { active: number; pending: number; total: number };
    revenue: { thisMonth: number; currency: string };
}

const fetchDashboard = async () => {
    const { data } = await axiosInstance.get<{ data: DashboardStats }>('/dashboard');
    return data.data;
};

export default function Dashboard() {
    const t = useTranslations('Dashboard');
    const tCommon = useTranslations('Common');
    const tSidebar = useTranslations('Sidebar');
    const params = useParams();
    const isRTL = params.locale === 'ar';

    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['dashboard'],
        queryFn: fetchDashboard,
        staleTime: 5 * 60 * 1000
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">{tCommon('loading')}</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="text-center">
                    <p className="text-red-600 text-lg">{tCommon('errorLoadingData')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('welcomeAdmin')}</h1>
                <p className="text-gray-600 text-lg">{t('welcomeAdminSubtitle')}</p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Students Card */}
                <Link href="/students" className="no-underline group">
                    <div className="bg-white border-l-4 border-pink-500 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-sm mb-2 font-medium">{tSidebar('students')}</p>
                                <h2 className="text-pink-600 text-4xl font-bold">
                                    {stats.students.total}
                                </h2>
                            </div>
                            <div className="w-14 h-14 rounded-lg bg-pink-50 flex items-center justify-center">
                                <GraduationCap size={28} className="text-pink-600" />
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs pt-2 border-t border-gray-100">
                            <span className="text-gray-600">
                                {tCommon('active')}: <strong className="text-gray-900">{stats.students.active}</strong>
                            </span>
                            <span className="text-gray-600">
                                {tCommon('new')}: <strong className="text-emerald-600">{stats.students.new}</strong>
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Teachers Card */}
                <Link href="/teachers" className="no-underline group">
                    <div className="bg-white border-l-4 border-orange-500 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-sm mb-2 font-medium">{tSidebar('teachers')}</p>
                                <h2 className="text-orange-600 text-4xl font-bold">
                                    {stats.teachers.total}
                                </h2>
                            </div>
                            <div className="w-14 h-14 rounded-lg bg-orange-50 flex items-center justify-center">
                                <UserCog size={28} className="text-orange-600" />
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs pt-2 border-t border-gray-100">
                            <span className="text-gray-600">
                                {tCommon('active')}: <strong className="text-gray-900">{stats.teachers.active}</strong>
                            </span>
                            <span className="text-gray-600">
                                {tCommon('new')}: <strong className="text-emerald-600">{stats.teachers.new}</strong>
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Sessions Card */}
                <Link href="/sessions" className="no-underline group">
                    <div className="bg-white border-l-4 border-blue-500 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-sm mb-2 font-medium">{tSidebar('sessions')}</p>
                                <h2 className="text-blue-600 text-4xl font-bold">
                                    {stats.sessions.thisMonth}
                                </h2>
                            </div>
                            <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Calendar size={28} className="text-blue-600" />
                            </div>
                        </div>
                        <div className="flex gap-4 text-xs pt-2 border-t border-gray-100">
                            <span className="text-gray-600">
                                {tCommon('today')}: <strong className="text-gray-900">{stats.sessions.today}</strong>
                            </span>
                            <span className="text-gray-600">
                                {tCommon('thisWeek')}: <strong className="text-gray-900">{stats.sessions.thisWeek}</strong>
                            </span>
                        </div>
                    </div>
                </Link>

                {/* Revenue Card */}
                <Link href="/finances/transactions" className="no-underline group">
                    <div className="bg-white border-l-4 border-emerald-500 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-500 text-sm mb-2 font-medium">{tSidebar('expenses')}</p>
                                <h2 className="text-emerald-600 text-3xl font-bold">
                                    {stats.revenue.thisMonth.toLocaleString()} {t('currency') || 'ر.س'}
                                </h2>
                            </div>
                            <div className="w-14 h-14 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <DollarSign size={32} className="text-emerald-600" />
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                            {tCommon('thisMonth')}
                        </div>
                    </div>
                </Link>
            </div>

            {/* Secondary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Homework */}
                <Link href="/homework" className="no-underline group">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                                <FileText size={24} className="text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-medium uppercase">{tSidebar('homework')}</p>
                                <h3 className="text-gray-900 text-2xl font-bold">
                                    {stats.homework.total}
                                </h3>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs pt-3 border-t border-gray-100">
                            <span className="text-amber-600">{tCommon('pending')}: {stats.homework.pending}</span>
                            <span className="text-emerald-600">{tCommon('completed')}: {stats.homework.completed}</span>
                        </div>
                    </div>
                </Link>

                {/* Exams */}
                <Link href="/exams" className="no-underline group">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-red-300 transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                                <ClipboardList size={24} className="text-red-600" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-medium uppercase">{tSidebar('exams')}</p>
                                <h3 className="text-gray-900 text-2xl font-bold">
                                    {stats.exams.total}
                                </h3>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs pt-3 border-t border-gray-100">
                            <span className="text-amber-600">{tCommon('upcoming') || tCommon('future')}: {stats.exams.upcoming}</span>
                            <span className="text-emerald-600">{tCommon('completed')}: {stats.exams.completed}</span>
                        </div>
                    </div>
                </Link>

                {/* Subscriptions */}
                <Link href="/active-subscriptions" className="no-underline group">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-300 hover:-translate-y-1">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                <Clock size={24} className="text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs font-medium uppercase">{tSidebar('subscriptions')}</p>
                                <h3 className="text-gray-900 text-2xl font-bold">
                                    {stats.subscriptions.total}
                                </h3>
                            </div>
                        </div>
                        <div className="flex justify-between text-xs pt-3 border-t border-gray-100">
                            <span className="text-emerald-600">{tCommon('active')}: {stats.subscriptions.active}</span>
                            <span className="text-amber-600">{tCommon('pending')}: {stats.subscriptions.pending}</span>
                        </div>
                    </div>
                </Link>

                {/* Users Stats Card */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                            <Users size={24} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-medium uppercase">{t('summary')}</p>
                            <h3 className="text-gray-900 text-sm">
                                <span className="font-bold">{stats.homework.total + stats.exams.total}</span> {t('tasks')}
                            </h3>
                        </div>
                    </div>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-gray-600">
                            <span>{tSidebar('homework')} + {tSidebar('exams')}</span>
                            <strong className="text-gray-900">{stats.homework.total + stats.exams.total}</strong>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>{t('completionRate')}</span>
                            <strong className="text-emerald-600">
                                {stats.homework.total + stats.exams.total > 0 
                                    ? Math.round(((stats.homework.completed + stats.exams.completed) / (stats.homework.total + stats.exams.total)) * 100) 
                                    : 0}%
                            </strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Section */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h4 className="text-blue-900 font-semibold mb-2">📊 {t('statsUpdate')}</h4>
                    <p className="text-blue-700 text-sm">{t('statsUpdateDesc')}</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="text-green-900 font-semibold mb-2">✅ {t('systemStatus')}</h4>
                    <p className="text-green-700 text-sm">{t('systemStatusDesc')}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                    <h4 className="text-amber-900 font-semibold mb-2">🔔 {t('alerts')}</h4>
                    <p className="text-amber-700 text-sm">{t('noAlerts')}</p>
                </div>
            </div>
        </div>
    );
}