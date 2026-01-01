"use client"
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Calendar, Clock, User, BookOpen, Menu, ChevronLeft, ChevronRight, MapPin, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';

dayjs.locale('ar');

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

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    completed: 'مكتملة',
    scheduled: 'مجدولة',
    cancelled: 'ملغية'
  };
  return statusMap[status] || status;
};

export default function CalendarPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentMonth, setCurrentMonth] = useState(dayjs());

  // Fetch all sessions with high per_page
  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['sessions-calendar', currentMonth.format('YYYY-MM')],
    queryFn: async () => {
      const response = await axiosInstance.get('/sessions?per_page=100');
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

  const arabicMonthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const arabicDayNames = ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'];
  const fullArabicDayNames = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

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
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">تقويم الحصص</h1>
              <p className="text-sm text-gray-500 mt-1">إدارة وتتبع جميع الحصص الدراسية</p>
            </div>
            <div></div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1">
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
                </div>
                <p className="mt-4 text-gray-600">جاري التحميل...</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">إجمالي الحصص</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{totalSessions}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="text-blue-600" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">قادمة</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{upcomingSessions}</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Clock className="text-blue-600" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">مكتملة</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">{completedSessions}</p>
                      </div>
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                        <Calendar className="text-emerald-600" size={24} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm font-medium">ملغية</p>
                        <p className="text-2xl font-bold text-red-600 mt-1">{cancelledSessions}</p>
                      </div>
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="text-red-600" size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Calendar Section */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      {/* Calendar Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
                        <div className="flex items-center justify-between mb-6">
                          <button
                            onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                          >
                            <ChevronLeft size={24} />
                          </button>
                          <h2 className="text-2xl font-bold text-white">
                            {arabicMonthNames[currentMonth.month()]} {currentMonth.year()}
                          </h2>
                          <button
                            onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                          >
                            <ChevronRight size={24} />
                          </button>
                        </div>

                        {/* Day Names */}
                        <div className="grid grid-cols-7 gap-2 text-center">
                          {arabicDayNames.map((day, idx) => (
                            <div key={day} className="text-sm font-semibold text-white/80 py-2">
                              {day}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Calendar Grid */}
                      <div className="p-4 bg-gray-50">
                        <div className="grid grid-cols-7 gap-3">
                          {calendarDays.map((day, idx) => {
                            if (!day) {
                              return (
                                <div
                                  key={`empty-${idx}`}
                                  className="aspect-square rounded-lg"
                                />
                              );
                            }

                            const dateStr = day.format('YYYY-MM-DD');
                            const daySessionCount = (sessionsByDate[dateStr] || []).length;
                            const isSelected = day.isSame(selectedDate, 'day');
                            const isToday = day.isSame(dayjs(), 'day');

                            return (
                              <button
                                key={dateStr}
                                onClick={() => setSelectedDate(day)}
                                className={`aspect-square rounded-lg border-2 p-2 transition-all flex flex-col items-center justify-center text-center hover:shadow-lg active:scale-95 ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-700 text-white shadow-lg'
                                    : isToday
                                    ? 'bg-white border-2 border-blue-500 text-gray-900 shadow-md'
                                    : daySessionCount > 0
                                    ? 'bg-green-50 border-green-300 text-gray-900 hover:border-green-400'
                                    : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
                                }`}
                              >
                                <div className={`text-sm font-bold ${isToday && !isSelected ? 'text-blue-600' : ''}`}>
                                  {day.date()}
                                </div>
                                {daySessionCount > 0 && (
                                  <div className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full ${
                                    isSelected 
                                      ? 'bg-blue-500 text-white' 
                                      : 'bg-blue-600/20 text-blue-700'
                                  }`}>
                                    {daySessionCount}
                                  </div>
                                )}
                                {isToday && !isSelected && (
                                  <div className="w-1 h-1 rounded-full bg-blue-600 mt-1"></div>
                                )}
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
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                        <h3 className="text-lg font-bold text-white">
                          {selectedDate.format('dddd')}
                        </h3>
                        <p className="text-indigo-100 text-sm mt-1">
                          {selectedDate.format('DD MMMM YYYY')}
                        </p>
                      </div>

                      <div className="px-6 py-4">
                        <p className="text-sm text-gray-600 font-medium mb-4">
                          {sessionsForSelectedDate.length} حصة
                        </p>

                        <div className="max-h-96 overflow-y-auto space-y-3">
                          {sessionsForSelectedDate.length > 0 ? (
                            sessionsForSelectedDate.map((session) => {
                              const statusStyle = getStatusColor(session.status);
                              return (
                                <div
                                  key={session.id}
                                  className={`p-4 rounded-lg border-2 ${statusStyle.bg} ${statusStyle.border} hover:shadow-md transition-shadow`}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <h4 className={`font-bold text-sm leading-tight flex-1 ${statusStyle.text}`}>
                                      {session.title}
                                    </h4>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ml-2 ${statusStyle.light} ${statusStyle.text}`}>
                                      {getStatusText(session.status)}
                                    </span>
                                  </div>

                                  <div className={`space-y-2 text-xs ${statusStyle.text}`}>
                                    <div className="flex items-center gap-2">
                                      <Clock size={14} className="flex-shrink-0" />
                                      <span className="font-medium">{session.start_time} - {session.end_time}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <User size={14} className="flex-shrink-0" />
                                      <span>{session.student_name}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <User size={14} className="flex-shrink-0" />
                                      <span>{session.teacher_name}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <BookOpen size={14} className="flex-shrink-0" />
                                      <span>{session.subject_name}</span>
                                    </div>

                                    {session.meeting_link && (
                                      <div className="flex items-center gap-2">
                                        <MapPin size={14} className="flex-shrink-0" />
                                        <a 
                                          href={session.meeting_link} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="underline hover:no-underline truncate"
                                        >
                                          رابط الاجتماع
                                        </a>
                                      </div>
                                    )}
                                  </div>

                                  <div className={`text-xs mt-3 pt-2 border-t border-current opacity-60 ${statusStyle.text}`}>
                                    المدة: {session.duration_minutes} دقيقة
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-8 text-gray-400">
                              <Calendar size={32} className="mx-auto mb-3 opacity-30" />
                              <p className="text-sm">لا توجد حصص في هذا اليوم</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Today's Sessions */}
                    {todaySessions.length > 0 && !selectedDate.isSame(dayjs(), 'day') && (
                      <div className="bg-white rounded-xl border border-amber-200 bg-amber-50 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4">
                          <h3 className="text-base font-bold text-white">اليوم</h3>
                          <p className="text-amber-100 text-xs mt-1">
                            {dayjs().format('DD MMMM YYYY')}
                          </p>
                        </div>

                        <div className="px-6 py-4 max-h-48 overflow-y-auto space-y-2">
                          {todaySessions.slice(0, 3).map((session) => (
                            <div key={session.id} className="text-sm">
                              <p className="font-semibold text-amber-900">{session.start_time}</p>
                              <p className="text-amber-700 text-xs">{session.title}</p>
                            </div>
                          ))}
                          {todaySessions.length > 3 && (
                            <p className="text-xs text-amber-700 text-center pt-2">
                              و {todaySessions.length - 3} حصص أخرى
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

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}