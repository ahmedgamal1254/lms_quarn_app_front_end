"use client"
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Calendar, Clock, User, BookOpen, Menu, ChevronLeft, ChevronRight, MapPin, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

interface SessionData {
  id: number;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  student_name: string;
  teacher_name: string;
  subject_name: string;
  meeting_link?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800', light: 'bg-emerald-50' };
    case 'scheduled':
      return { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800', light: 'bg-blue-50' };
    case 'cancelled':
      return { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', light: 'bg-red-50' };
    default:
      return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800', light: 'bg-gray-50' };
  }
};

export default function CalendarPage() {
  const t = useTranslations('SessionsCalendar');
  const routeParams = useParams();
  const locale = routeParams.locale as string;
  const isRTL = locale === 'ar';
  
  // Set dayjs locale
  dayjs.locale(locale);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  // Fetch all sessions with high per_page
  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['sessions-calendar', currentMonth.format('YYYY-MM')],
    queryFn: async () => {
      const params= new URLSearchParams();
      params.append('date', currentMonth.format('YYYY-MM'));
      params.append('per_page', "31");
      const response = await axiosInstance.get('/sessions', { params });
      return response.data;
    }
  });

  const sessions = sessionsData?.data?.sessions || [];

  // Group sessions by date
  const sessionsByDate: { [key: string]: SessionData[] } = {};
  sessions.forEach((session: SessionData) => {
    const date = session.session_date;
    if (!sessionsByDate[date]) {
      sessionsByDate[date] = [];
    }
    sessionsByDate[date].push(session);
  });

  // Get sessions for selected date sorted by time
  const selectedDateStr = selectedDate.format('YYYY-MM-DD');
  const sessionsForSelectedDate = (sessionsByDate[selectedDateStr] || []).sort((a, b) => 
    a.start_time.localeCompare(b.start_time)
  );

  // Get today's sessions
  const todayStr = dayjs().format('YYYY-MM-DD');
  const todaySessions = (sessionsByDate[todayStr] || []).sort((a, b) => 
    a.start_time.localeCompare(b.start_time)
  );

  // Stats
  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s: SessionData) => s.status === 'completed').length;
  const upcomingSessions = sessions.filter((s: SessionData) => s.status === 'scheduled').length;
  const cancelledSessions = sessions.filter((s: SessionData) => s.status === 'cancelled').length;

  // Generate weekday names based on current locale
  // Start mainly from Sunday as logic implies, but dayjs handles it
  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    weekDays.push(dayjs().day(i).format('ddd'));
  }

  // Simple calendar grid
  const monthStart = currentMonth.startOf('month');
  const monthEnd = currentMonth.endOf('month');
  const daysInMonth = monthEnd.date();
  const startingDayOfWeek = monthStart.day();

  const calendarDays = [];
  
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(dayjs(currentMonth).date(day));
  }

  return (
    <div className="flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
          <div className="px-4 md:px-6 py-4 flex items-center justify-between">

            <div className={`flex-1 text-center ${isRTL ? 'md:text-right' : 'md:text-left'}`}>
              <h1 className="text-2xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('description')}</p>
            </div>
            <div className="hidden md:flex items-center space-x-4"></div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">
                  <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 rounded-full"></div>
                </div>
                <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading') ?? 'Loading...'}</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {/** Card Template **/}
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('totalSessions')}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{totalSessions}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Calendar className="text-blue-600" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('upcoming')}</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{upcomingSessions}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Clock className="text-blue-600" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('completed')}</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{completedSessions}</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                        <Calendar className="text-emerald-600" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{t('cancelled')}</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">{cancelledSessions}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                        <AlertCircle className="text-red-600" size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Calendar Section */}
                  <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                      {/* Calendar Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 md:px-6 py-4 md:py-6">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                          <button
                            onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
                            className="p-2 hover:bg-white dark:bg-slate-800/20 rounded-lg transition-colors text-white"
                          >
                            <ChevronLeft size={24} />
                          </button>
                          <h2 className="text-xl md:text-2xl font-bold text-white">
                            {currentMonth.format('MMMM YYYY')}
                          </h2>
                          <button
                            onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
                            className="p-2 hover:bg-white dark:bg-slate-800/20 rounded-lg transition-colors text-white"
                          >
                            <ChevronRight size={24} />
                          </button>
                        </div>

                        {/* Day Names */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                          {weekDays.map((day, idx) => (
                            <div key={day} className="text-xs md:text-sm font-semibold text-white/80 py-1 md:py-2">
                              {day}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Calendar Grid */}
                      <div className="p-2 md:p-4 bg-gray-50 dark:bg-slate-900">
                        <div className="grid grid-cols-7 gap-2">
                          {calendarDays.map((day, idx) => {
                            if (!day) {
                              return <div key={`empty-${idx}`} className="aspect-square rounded-lg" />;
                            }

                            const dateStr = day.format('YYYY-MM-DD');
                            const daySessionCount = (sessionsByDate[dateStr] || []).length;
                            const isSelected = day.isSame(selectedDate, 'day');
                            const isToday = day.isSame(dayjs(), 'day');

                            return (
                              <button
                                key={dateStr}
                                onClick={() => setSelectedDate(day)}
                                className={`aspect-square rounded-lg border-2 p-1 md:p-2 transition-all flex flex-col items-center justify-center text-center hover:shadow-lg active:scale-95 ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-700 text-white shadow-lg'
                                    : isToday
                                    ? 'bg-white dark:bg-slate-700 border-2 border-blue-500 text-gray-900 dark:text-gray-100 shadow-md'
                                    : daySessionCount > 0
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-gray-900 dark:text-gray-100 hover:border-green-400'
                                    : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-500'
                                }`}
                              >
                                <div className={`text-xs md:text-sm font-bold ${isToday && !isSelected ? 'text-blue-600' : ''}`}>
                                  {day.date()}
                                </div>
                                {daySessionCount > 0 && (
                                  <div className={`text-[10px] md:text-xs font-bold mt-1 px-2 py-0.5 rounded-full ${
                                    isSelected 
                                      ? 'bg-blue-500 text-white' 
                                      : 'bg-blue-600/20 text-blue-700'
                                  }`}>
                                    {daySessionCount}
                                  </div>
                                )}
                                {isToday && !isSelected && <div className="w-1 h-1 rounded-full bg-blue-600 mt-1"></div>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Side Panel */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Selected Date Sessions */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 md:px-6 py-3 md:py-4">
                        <h3 className="text-sm md:text-lg font-bold text-white">{selectedDate.format('dddd')}</h3>
                        <p className="text-indigo-100 text-xs md:text-sm mt-1">{selectedDate.format('DD MMMM YYYY')}</p>
                      </div>

                      <div className="px-4 md:px-6 py-4">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-4">{t('sessionsCount', {count: sessionsForSelectedDate.length})}</p>
                        <div className="max-h-72 md:max-h-96 overflow-y-auto space-y-3">
                          {sessionsForSelectedDate.length > 0 ? (
                            sessionsForSelectedDate.map((session) => {
                              const statusStyle = getStatusColor(session.status);
                              return (
                                <div key={session.id} className={`p-3 md:p-4 rounded-lg border-2 ${statusStyle.bg} ${statusStyle.border} hover:shadow-md transition-shadow`}>
                                  <div className="flex items-start justify-between mb-2 md:mb-3">
                                    <h4 className={`font-bold text-xs md:text-sm leading-tight flex-1 ${statusStyle.text}`}>
                                      {session.title}
                                    </h4>
                                    <span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${isRTL ? 'mr-auto ml-0' : 'ml-auto mr-0'} ${statusStyle.light} ${statusStyle.text}`}>
                                      {t(`status.${session.status}`)}
                                    </span>
                                  </div>

                                  <div className={`space-y-1 md:space-y-2 text-[10px] md:text-xs ${statusStyle.text}`}>
                                    <div className="flex items-center gap-1 md:gap-2">
                                      <Clock size={12} className="flex-shrink-0" />
                                      <span className="font-medium text-[10px] md:text-xs">{session.start_time} - {session.end_time}</span>
                                    </div>
                                    <div className="flex items-center gap-1 md:gap-2">
                                      <User size={12} className="flex-shrink-0" />
                                      <span className="text-[10px] md:text-xs">{session.student_name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 md:gap-2">
                                      <User size={12} className="flex-shrink-0" />
                                      <span className="text-[10px] md:text-xs">{session.teacher_name}</span>
                                    </div>
                                    <div className="flex items-center gap-1 md:gap-2">
                                      <BookOpen size={12} className="flex-shrink-0" />
                                      <span className="text-[10px] md:text-xs">{session.subject_name}</span>
                                    </div>
                                    {session.meeting_link && (
                                      <div className="flex items-center gap-1 md:gap-2">
                                        <MapPin size={12} className="flex-shrink-0" />
                                        <a
                                          href={session.meeting_link}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="underline hover:no-underline truncate text-[10px] md:text-xs"
                                        >
                                          {t('meetingLink')}
                                        </a>
                                      </div>
                                    )}
                                  </div>

                                  <div className={`text-[10px] md:text-xs mt-2 pt-2 border-t border-current opacity-60 ${statusStyle.text}`}>
                                    {t('duration', {minutes: session.duration_minutes})}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                              <Calendar size={32} className="mx-auto mb-3 opacity-30" />
                              <p className="text-sm md:text-base">{t('noSessionsDay')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Today's Sessions */}
                    {todaySessions.length > 0 && !selectedDate.isSame(dayjs(), 'day') && (
                      <div className="bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-4 md:px-6 py-2 md:py-4">
                          <h3 className="text-sm md:text-base font-bold text-white">{t('today')}</h3>
                          <p className="text-amber-100 text-xs md:text-sm mt-1">{dayjs().format('DD MMMM YYYY')}</p>
                        </div>

                        <div className="px-4 md:px-6 py-3 md:py-4 max-h-40 md:max-h-48 overflow-y-auto space-y-2">
                          {todaySessions.slice(0, 3).map((session) => (
                            <div key={session.id} className="text-xs md:text-sm">
                              <p className="font-semibold text-amber-900">{session.start_time}</p>
                              <p className="text-amber-700 truncate">{session.title}</p>
                            </div>
                          ))}
                          {todaySessions.length > 3 && (
                            <p className="text-xs md:text-sm text-amber-700 text-center pt-2">
                              {t('moreSessions', {count: todaySessions.length - 3})}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>

  );
}