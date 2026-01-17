'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  Clock,
  User,
  Video,
  Search,
  Filter,
  X,
  BookOpen,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAppSettingsStore } from '@/store/appSetting';
import { Button } from 'antd';
import { AxiosError } from 'axios';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';


// Fetch sessions
const fetchSessions = async (params: any) => {
  const response = await axiosInstance.get('/student/sessions', {
    params,
  });
  return response.data.data;
};

// Fetch single session
const fetchSessionDetails = async (id: number) => {
  if (!id) return null;
  const response = await axiosInstance.get(`/student/sessions/${id}`);
  return response.data.data;
};

interface Session{
  id: number | null;
  notes: string | null;
  meeting_link: string | null;
  title: string | null;
  description: string | null;
  dateString: string | null;
  session_date: string | null;
  start_time: string | null;
  end_time: string | null;
  can_join: boolean | null;
  duration_minutes: number | null;
  status: string | null;
  subject: { name: string } | null;
  teacher: { name: string; email?: string; phone?: string } | null;
};

export default function StudentSessionsPage() {
  const t = useTranslations('Sessions');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const params = useParams();
  const isRTL = params.locale === 'ar';
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

   const queryParams = new URLSearchParams();
   queryParams.append('page', currentPage.toString());
   queryParams.append('search', search);
   queryParams.append('filter', filter);

  // Fetch sessions with React Query
  const { data: sessionsData, isLoading, error } = useQuery({
    queryKey: ['sessions', currentPage, filter,search],
    queryFn: () => fetchSessions(queryParams),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });


  // Fetch selected session details
  const { data: sessionDetails } = useQuery({
    queryKey: ['session', selectedSession?.id],
    queryFn: () => fetchSessionDetails(selectedSession?.id as number),
    enabled: !!selectedSession?.id,
    staleTime: 5 * 60 * 1000,
  });

  const sessions = sessionsData?.sessions || [];
  const statistics = sessionsData?.statistics || {};
  const pagination = {
    currentPage: sessionsData?.current_page || 1,
    lastPage: sessionsData?.last_page || 1,
    total: sessionsData?.total || 0,
  };

    const settings=useAppSettingsStore((s) => s.app_settings);

  const sessionDateTime = new Date(selectedSession?.session_date || '');
  const sessionEnd = new Date(selectedSession?.end_time || '');

  const minutesBefore = settings?.before_start_session ?? 15;
  const canJoinTime = new Date(sessionDateTime.getTime() - minutesBefore * 60 * 1000);
  const now = new Date();
  const canJoin = now >= canJoinTime && now <= sessionEnd;

  const getStatusInfo = (session: any) => {
    const today = new Date().toISOString().split('T')[0];
    const sessionDate = new Date(session.session_date).toISOString().split('T')[0];
    const isUpcoming = sessionDate >= today && session.status !== 'completed';
    const statusColor =
      session.status === 'completed'
        ? 'bg-green-100 text-green-700'
        : isUpcoming
        ? 'bg-blue-100 text-blue-700'
        : 'bg-gray-100 text-gray-700';
    const statusText =
      session.status === 'completed'
        ? t('completed')
        : isUpcoming
        ? t('upcoming')
        : t('finished');
    return { isUpcoming, statusColor, statusText };
  };

  const handleCheckIn = async (sessionId: number) => {
    try {
      const response = await axiosInstance.get(`/student/sessions/${sessionId}/checkin`);
      window.open(response?.data?.data.meeting_link, '_blank');
    } catch (error) {
      const axiosError = error as AxiosError<{ error: string }>;
      toast.error(axiosError?.response?.data?.error || t('checkInError'));
    }
  };



  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 md:p-8 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t('errorLoading')}</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
          <p className="text-gray-600">{t('description')}</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer`}
              >
                <option value="all">{t('filterAll')}</option>
                <option value="upcoming">{t('filterUpcoming')}</option>
                <option value="completed">{t('filterCompleted')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}

       { isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">{tCommon('loading')}</p>
            </div>
          </div>
        )}

        { sessionsData?.sessions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100 mb-8">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">{tCommon('noData')}</p>
          </div>
        ) : (
          <>
            {/* Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {sessionsData?.sessions.map((session: any) => {
                const { isUpcoming, statusColor, statusText } = getStatusInfo(session);
              
                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2"></div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {session.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{session.description}</p>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${statusColor}`}>
                          {statusText}
                        </span>
                      </div>

                      <div className="space-y-3 mb-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          {formatDate(session.session_date)}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          {formatTime(session.start_time)} - {formatTime(session.end_time)}
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          {session.teacher?.name}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSession(session);
                          }}
                            className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
                        >
                          {t('details')}
                        </button>
                        {session.meeting_link && (
                          <Button                            
                            rel="noopener noreferrer"
                            onClick={() => handleCheckIn(session.id)}
                            disabled={!session?.can_join}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm flex items-center justify-center gap-2"
                          >
                            <Video className="w-4 h-4" />
                            {t('join')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.lastPage > 1 && (
              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                  {tCommon('previous')}
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                        pagination.currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(pagination.lastPage, p + 1))}
                  disabled={pagination.currentPage === pagination.lastPage}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {tCommon('next')}
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <p className="text-gray-600 text-sm mb-2">{t('title')}</p> 
            <p className="text-3xl font-bold text-gray-900">{statistics.total || 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <p className="text-gray-600 text-sm mb-2">{t('filterUpcoming')}</p>
            <p className="text-3xl font-bold text-blue-600">{statistics.upcoming || 0}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <p className="text-gray-600 text-sm mb-2">{t('filterCompleted')}</p>
            <p className="text-3xl font-bold text-green-600">{statistics.completed || 0}</p>
          </div>
        </div>
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-500 to-blue-500 p-6 flex items-start justify-between border-b border-gray-200">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {selectedSession.title}
                </h2>
                <p className="text-indigo-100 text-sm">{selectedSession.description}</p>
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors flex-shrink-0 ml-4"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status & Action */}
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  {(() => {
                    const { statusColor, statusText } = getStatusInfo(selectedSession);
                    return (
                      <span className={`text-sm font-semibold px-4 py-2 rounded-full inline-block ${statusColor}`}>
                        {statusText}
                      </span>
                    );
                  })()}
                </div>
                {(() => {
                  const { isUpcoming } = getStatusInfo(selectedSession);
                  return (
                    selectedSession.meeting_link && (
                      <Button
                        onClick={()=>handleCheckIn(selectedSession?.id as number)}
                        rel="noopener noreferrer"
                        disabled={!selectedSession?.can_join}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                      >
                        <Video className="w-5 h-5" />
                        <Video className="w-5 h-5" />
                        {t('join')}
                      </Button>
                    )
                  );
                })()}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <p className="text-indigo-600 text-sm font-semibold mb-1">{tCommon('date')}</p>
                  <p className="text-gray-900 font-bold text-sm">
                    {formatDate(selectedSession.session_date as string)}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-blue-600 text-sm font-semibold mb-1">{tCommon('time')}</p>
                  <p className="text-gray-900 font-bold">
                    {formatTime(selectedSession.start_time)} - {formatTime(selectedSession.end_time)}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                  <p className="text-purple-600 text-sm font-semibold mb-1">{tCommon('duration')}</p>
                  <p className="text-gray-900 font-bold">
                    {selectedSession.duration_minutes} {tCommon('minutes')}
                  </p>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                  <p className="text-amber-600 text-sm font-semibold mb-1">{tCommon('subject')}</p>
                  <p className="text-gray-900 font-bold">{selectedSession.subject?.name}</p>
                </div>
              </div>

              {/* Teacher Info */}
              {selectedSession.teacher && (
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-600" />
                    {t('teacherInfo')}
                  </h3>
                  <div className="space-y-3">
                    <p className="text-gray-900">
                      <span className="font-semibold">{tCommon('name')}: </span>
                      {selectedSession.teacher.name}
                    </p>
                    {selectedSession.teacher.email && (
                      <p className="text-gray-700">
                        <span className="font-semibold">{tCommon('email')}: </span>
                        {selectedSession.teacher.email}
                      </p>
                    )}
                    {selectedSession.teacher.phone && (
                      <p className="text-gray-700">
                        <span className="font-semibold">{tCommon('phone')}: </span>
                        {selectedSession.teacher.phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedSession.notes && (
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    {tCommon('notes')}
                  </h4>
                  <p className="text-gray-700">{selectedSession.notes}</p>
                </div>
              )}

              {selectedSession.meeting_link && (
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('meetingLink')}</h4>
                  <Button
                    onClick={() => handleCheckIn(selectedSession?.id as number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 break-all text-sm"
                  >
                    {selectedSession.meeting_link}
                  </Button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => setSelectedSession(null)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                {tCommon('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}