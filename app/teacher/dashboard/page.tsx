'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, CheckCircle, Clock, DollarSign, BookOpen, FileText } from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';

interface Session{
  id: number;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  meeting_link: string;
  student_name: string;
  subject_name: string;
}

interface Homework{
   id: number;
    title: string;
    description: string;
    due_date: string;
    status: string;
    grade: string | null;
    student_name: string;
}

interface Exam{
      id: number;
    title: string;
    description: string;
    exam_date: string;
    start_time: string;
    total_marks: string;
    status: string;
    subject_name: string;
}

interface TeacherData {
  teacher: {
    name: string;
  };
  statistics: {
    students_count: number;
    sessions_today: number;
    sessions_completed: number;
    sessions_upcoming: number;
  };
  salary: {
    total_hours: number;
    hourly_rate: number;          // رقم مش string
    currency: string;

    total_earned: number;         // إجمالي الأرباح
    paid_amount: number;          // أرباح تم صرفها
    pending_amount: number;       // أرباح معلّقة

    available_balance: number;    // رصيد متاح للسحب
    pending_withdraw: number;   
  };
  upcoming_sessions: Session[];
  recent_homework: Homework[];
  upcoming_exams: Exam[];
}

export default function TeacherDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: async () => {
      const response = await axiosInstance.get('/teacher/dashboard?teacher_id=1');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-semibold">حدث خطأ في تحميل البيانات</p>
          <p className="text-sm mt-1">يرجى المحاولة مرة أخرى لاحقاً</p>
        </div>
      </div>
    );
  }

  const dashboardData = data?.data || {};
  const teacher = dashboardData.teacher || {};
  const stats = dashboardData.statistics || {};
  const salary = dashboardData.salary || {};
  const upcomingSessions = dashboardData.upcoming_sessions || [];
  const recentHomework = dashboardData.recent_homework || [];
  const upcomingExams = dashboardData.upcoming_exams || [];

  const getHomeworkStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'submitted':
        return 'bg-blue-100 text-blue-700';
      case 'graded':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getHomeworkStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'معلق';
      case 'submitted':
        return 'مسلّم';
      case 'graded':
        return 'مصحح';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          مرحباً، {teacher.name || 'المعلم'} 👋
        </h1>
        <p className="text-gray-600">لوحة التحكم الخاصة بالمعلم</p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Students Count */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">عدد الطلاب</p>
              <p className="text-3xl font-bold text-gray-900">{stats.students_count || 0}</p>
            </div>
            <Users className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </div>

        {/* Today's Sessions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">حصص اليوم</p>
              <p className="text-3xl font-bold text-gray-900">{stats.sessions_today || 0}</p>
            </div>
            <Clock className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </div>

        {/* Completed Sessions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-emerald-500 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">الحصص المكتملة</p>
              <p className="text-3xl font-bold text-gray-900">{stats.sessions_completed || 0}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-emerald-500 opacity-20" />
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500 hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">الحصص القادمة</p>
              <p className="text-3xl font-bold text-gray-900">{stats.sessions_upcoming || 0}</p>
            </div>
            <Calendar className="w-10 h-10 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Salary Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">تفاصيل الأرباح</h2>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {/* Total Hours */}
          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500 mb-1">إجمالي الساعات</p>
            <p className="text-2xl font-semibold text-gray-800">
              {salary.total_hours || 0}
            </p>
          </div>

          {/* Hourly Rate */}
          <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
            <p className="text-sm text-gray-500 mb-1">السعر / ساعة</p>
            <p className="text-2xl font-semibold text-gray-800">
              {salary.hourly_rate || 0} {salary.currency || ''}
            </p>
          </div>

          {/* Total Earned */}
          <div className="p-4 rounded-lg border border-emerald-100 bg-emerald-50">
            <p className="text-sm text-emerald-700 mb-1">إجمالي الأرباح</p>
            <p className="text-2xl font-bold text-emerald-800">
              {(salary.total_earned || 0).toFixed(2)}
            </p>
          </div>

          {/* Paid Earnings */}
          <div className="p-4 rounded-lg border border-blue-100 bg-blue-50">
            <p className="text-sm text-blue-700 mb-1">أرباح تم صرفها</p>
            <p className="text-2xl font-bold text-blue-800">
              {(salary.paid_amount || 0).toFixed(2)}
            </p>
          </div>

          {/* Pending Earnings */}
          <div className="p-4 rounded-lg border border-yellow-100 bg-yellow-50">
            <p className="text-sm text-yellow-700 mb-1">أرباح معلّقة</p>
            <p className="text-2xl font-bold text-yellow-800">
              {(salary.pending_amount || 0).toFixed(2)}
            </p>
          </div>

          {/* Available Balance */}
          <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-100">
            <p className="text-sm text-emerald-700 mb-1">رصيد متاح للسحب</p>
            <p className="text-3xl font-extrabold text-emerald-900">
              {(salary.available_balance || 0).toFixed(2)}
            </p>
          </div>

          {/* Pending Withdraw */}
          <div className="p-4 rounded-lg border border-red-100 bg-red-50">
            <p className="text-sm text-red-700 mb-1">طلبات سحب معلّقة</p>
            <p className="text-2xl font-bold text-red-800">
              {(salary.pending_withdraw || 0).toFixed(2)}
            </p>
          </div>

        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Sessions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Calendar className="w-6 h-6 text-purple-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">الحصص القادمة</h2>
              </div>
              <Link href="/teacher/sessions" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                عرض الكل
              </Link>
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto opacity-30 mb-2" />
                <p>لا توجد حصص قادمة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingSessions.map((session: Session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{session.title || 'بدون عنوان'}</h3>
                      <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">
                        {session.status === 'scheduled' ? 'مجدولة' : session.status || 'غير معروف'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">الطالب: {session.student_name || 'غير معروف'}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>📅 {new Date(session.session_date).toLocaleDateString('ar-SA')}</span>
                      <span>🕐 {session.start_time || '--'} - {session.end_time || '--'}</span>
                      {session.subject_name && <span>📚 {session.subject_name}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Homework */}
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <BookOpen className="w-6 h-6 text-blue-600 mr-2" />
                <h2 className="text-lg font-bold text-gray-900">الواجبات</h2>
              </div>
              <Link href="/teacher/homework" className="text-blue-600 hover:text-blue-700 text-xs font-semibold">
                عرض الكل
              </Link>
            </div>

            {recentHomework.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-10 h-10 mx-auto opacity-30 mb-2" />
                <p className="text-sm">لا توجد واجبات</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentHomework.map((hw: Homework) => (
                  <div key={hw.id} className="border border-gray-200 rounded p-3 hover:border-blue-300 transition">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-sm text-gray-900">{hw.title || 'بدون عنوان'}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${getHomeworkStatusColor(hw.status)}`}>
                        {getHomeworkStatusLabel(hw.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{hw.student_name || 'غير معروف'}</p>
                    <p className="text-xs text-gray-600">📅 {new Date(hw.due_date).toLocaleDateString('ar-SA')}</p>
                    {hw.grade && <p className="text-xs text-green-600 mt-1 font-semibold">الدرجة: {hw.grade}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upcoming Exams */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">الامتحانات القادمة</h2>
          <Link href="/teacher/exams" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
            عرض الكل
          </Link>
        </div>

        {upcomingExams.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto opacity-30 mb-2" />
            <p>لا توجد امتحانات قادمة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingExams.map((exam: Exam) => (
              <div key={exam.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition">
                <h3 className="font-semibold text-gray-900 mb-2">{exam.title || 'بدون عنوان'}</h3>
                <p className="text-sm text-gray-600 mb-3">{exam.description || 'بدون وصف'}</p>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>📅 {new Date(exam.exam_date).toLocaleDateString('ar-SA')}</p>
                  {exam.start_time && <p>🕐 {exam.start_time}</p>}
                  <p className="font-semibold text-orange-600">الدرجة الكلية: {exam.total_marks || 0}</p>
                  {exam.subject_name && <p>📚 {exam.subject_name}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/teacher/students" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition border-t-4 border-blue-500">
          <Users className="w-8 h-8 text-blue-600 mb-2" />
          <h3 className="font-semibold text-gray-900">طلابي</h3>
          <p className="text-sm text-gray-600 mt-1">عرض قائمة الطلاب المسجلين معك</p>
        </Link>
        <Link href="/teacher/homework" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition border-t-4 border-green-500">
          <BookOpen className="w-8 h-8 text-green-600 mb-2" />
          <h3 className="font-semibold text-gray-900">الواجبات</h3>
          <p className="text-sm text-gray-600 mt-1">إدارة الواجبات والتصحيح</p>
        </Link>
        <Link href="/teacher/exams" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition border-t-4 border-purple-500">
          <FileText className="w-8 h-8 text-purple-600 mb-2" />
          <h3 className="font-semibold text-gray-900">الامتحانات</h3>
          <p className="text-sm text-gray-600 mt-1">إدارة الامتحانات والدرجات</p>
        </Link>
      </div>
    </div>
  );
}