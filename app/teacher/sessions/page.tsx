'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, User, BookOpen, Video, Filter, Search, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import axiosInstance from '@/lib/axios';
import Pagination from '@/components/Pagination';
import { Button } from 'antd';
import toast from 'react-hot-toast';
import { useAppSettingsStore } from '@/store/appSetting';
import { utcToLocalDate, utcToLocalDateTime, utcToLocalTime } from '@/utils/date';

interface Session {
  id: number;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  can_join: boolean;
  duration_minutes: number;
  status: string;
  meeting_link: string;
  student_name: string;
  subject_name: string;
}

interface SessionsResponse {
  success: boolean;
  data: {
    sessions: Session[];
    statics: {
      total_sessions: number;
      upcoming_sessions: number;
      completed_sessions: number;
      scheduled_sessions: number;
    };
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

export default function SessionsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  
  const { data, isLoading, error } = useQuery<SessionsResponse>({
    queryKey: ['teacher-sessions', statusFilter, searchTerm, dateFilter,page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('search', searchTerm);
      params.append('per_page', '10');
      if(dateFilter) params.append('date', dateFilter);
      const response = await axiosInstance.get('/teacher/sessions', { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const settings = useAppSettingsStore((s) => s.app_settings);

  const handleCheckIn = async (sessionId: number) => {
    try {
      const response = await axiosInstance.get(`/teacher/sessions/${sessionId}/checkin`);
      window.open(response?.data?.data.meeting_link, '_blank');
    } catch (error) {
      toast.error('حدث خطاء في التسجيل');
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">حدث خطأ في تحميل الحصص</p>
          <p className="text-sm mt-1">يرجى المحاولة مرة أخرى لاحقاً</p>
        </div>
      </div>
    );
  }

  const sessions = data?.data?.sessions || [];
  const stats = data?.data?.statics || {
    total_sessions: 0,
    upcoming_sessions: 0,
    completed_sessions: 0,
    scheduled_sessions: 0
  };

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const matchesStatus = statusFilter === 'all' || session.status === statusFilter;
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.subject_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return { bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-700', border: 'border-l-4 border-blue-500' };
      case 'completed':
        return { bg: 'bg-green-50', badge: 'bg-green-100 text-green-700', border: 'border-l-4 border-green-500' };
      case 'cancelled':
        return { bg: 'bg-red-50', badge: 'bg-red-100 text-red-700', border: 'border-l-4 border-red-500' };
      default:
        return { bg: 'bg-gray-50', badge: 'bg-gray-100 text-gray-700', border: 'border-l-4 border-gray-500' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'مجدولة';
      case 'completed':
        return 'مكتملة';
      case 'cancelled':
        return 'ملغاة';
      default:
        return status;
    }
  };

  const statsBadges = [
    { label: 'إجمالي الحصص', value: stats.total_sessions || 0, color: 'border-blue-500', icon: '📊' },
    { label: 'الحصص القادمة', value: stats.upcoming_sessions || 0, color: 'border-purple-500', icon: '📅' },
    { label: 'المكتملة', value: stats.completed_sessions || 0, color: 'border-green-500', icon: '✓' },
    { label: 'المجدولة', value: stats.scheduled_sessions || 0, color: 'border-yellow-500', icon: '📌' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {statsBadges.map((stat, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${stat.color} hover:shadow-md transition`}
          >
            <p className="text-gray-600 text-xs md:text-sm font-medium mb-2">{stat.label}</p>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none w-full md:w-48 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-right"
            >
              <option value="all">جميع الحصص</option>
              <option value="scheduled">مجدولة</option>
              <option value="completed">مكتملة</option>
              <option value="cancelled">ملغاة</option>
            </select>
            <ChevronDown className="absolute left-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ابحث عن حصة أو طالب..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-4 pl-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>

          {/* Filter by date */}
          <div className="relative">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full pr-4 pl-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Calendar className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 && !isLoading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg font-semibold">لا توجد حصص</p>
            <p className="text-gray-500 text-sm mt-1">حاول تغيير معايير البحث أو الفلترة</p>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const colors = getStatusColor(session.status);
            
            return (
              <div
                key={session.id}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden ${colors.border}`}
              >
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {/* Left - Session Info */}
                    <div className="md:col-span-2">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg md:text-xl font-bold text-gray-900">{session.title || 'بدون عنوان'}</h3>
                          <p className="text-sm text-gray-500 mt-1">{session.subject_name || 'بدون مادة'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap ml-3 ${colors.badge}`}>
                          {getStatusLabel(session.status)}
                        </span>
                      </div>

                      {/* Session Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {/* Student */}
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{session.student_name || 'غير معروف'}</span>
                        </div>

                        {/* Date */}
                        {/* <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{new Date(session.session_date).toDateString()}</span>
                        </div> */}

                        {/* Date */}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            {utcToLocalDate(session.start_time)}
                          </span>
                        </div>

                        {/* Time */}
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            من {utcToLocalTime(session.start_time)} إلى {utcToLocalTime(session.end_time)}
                          </span>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-orange-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{session.duration_minutes || 0} دقيقة</span>
                        </div>
                      </div>
                    </div>

                    {/* Right - Action Buttons */}
                    <div className="flex flex-col gap-2 md:mt-0">
                      {session.status === 'scheduled' && (
                        <Button
                          onClick={() =>handleCheckIn(session.id)}
                          type='primary'
                          rel="noopener noreferrer"
                          disabled={!session?.can_join}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center justify-center transition text-sm"
                        >
                          <Video className="w-4 h-4 ml-2" />
                          دخول الحصة
                        </Button>
                      )}
                      {session.status === 'completed' && (
                        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-center font-semibold text-sm">
                          ✓ منتهية
                        </div>
                      )}
                      {session.status === 'cancelled' && (
                        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-center font-semibold text-sm">
                          ✕ ملغاة
                        </div>
                      )}
                      <Link
                        href={`/teacher/sessions/${session.id}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-lg font-semibold transition text-sm text-center"
                      >
                        التفاصيل
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {
        isLoading && (
          <div className="flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">جاري التحميل...</p>
            </div>
          </div>
        )
      }

      {/* Results Count */}
      {sessions.length > 0 && (
        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>
            عرض <span className="font-semibold">{filteredSessions.length}</span> من{' '}
            <span className="font-semibold">{sessions.length}</span> حصة
          </p>
        </div>
      )}

      {
        sessions && <Pagination
        currentPage={data?.data?.current_page || 1}
        lastPage={data?.data?.last_page || 1}
        onPageChange={(page) => setPage(page)}
        total={data?.data?.total || 0}
        />
      }
    </div>
  );
}