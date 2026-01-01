'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  User,
  Phone,
  Mail,
  Award,
  ArrowRight,
} from 'lucide-react';
import axios from 'axios';
import axiosInstance from '@/lib/axios';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const res = await axiosInstance.get('/student/dashboard');
      setData(res.data.data);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.response?.data?.message || 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-semibold">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-semibold">لا توجد بيانات</p>
        </div>
      </div>
    );
  }

  const { student, teacher, subscription, statistics, upcoming_sessions, pending_homework } = data;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 md:p-8" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            مرحباً {student?.name} 👋
          </h1>
          <p className="text-gray-600">رحباً بك في لوحة التحكم الخاصة بك</p>
        </div>

        {/* Teacher Info Card */}
        {data.teacher && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{data.teacher?.name}</h2>
                <p className="text-indigo-600 font-semibold text-sm mt-1">{data.teacher?.subject_name}</p>
              </div>
            </div>
            <div className="flex gap-6 flex-wrap">
              {data.teacher?.email && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm">{data.teacher.email}</span>
                </div>
              )}
              {data.teacher?.phone && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm">{data.teacher.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Subscription & Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Subscription Card */}
          {data.subscription && (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">الاشتراك الحالي</h3>
              <Award className="w-6 h-6 text-amber-500" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">اسم الباقة</span>
                <span className="font-bold text-gray-900">{data.subscription?.plan_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">السعر</span>
                <span className="font-bold text-indigo-600">
                  {data.subscription?.price} {data.subscription?.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">الحصص المتبقية</span>
                <span className="font-bold text-green-600">{data.subscription?.sessions_remaining}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${((data.subscription?.sessions_total - data.subscription?.sessions_remaining) / data.subscription?.sessions_total) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 pt-2">
                {data.subscription?.sessions_used} من {data.subscription?.sessions_total} حصة
              </p>
            </div>
          </div>
          )}

          {/* Stats Grid */}
          {data.statistics && (
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="الحصص المكتملة"
              value={data.statistics?.sessions_completed}
              icon={<CheckCircle className="w-6 h-6 text-green-500" />}
              color="bg-green-50"
            />
            <StatCard
              title="الحصص القادمة"
              value={data.statistics?.sessions_upcoming}
              icon={<Calendar className="w-6 h-6 text-blue-500" />}
              color="bg-blue-50"
            />
            <StatCard
              title="إجمالي الحصص"
              value={data.statistics?.sessions_total}
              icon={<BookOpen className="w-6 h-6 text-indigo-500" />}
              color="bg-indigo-50"
            />
            <StatCard
              title="النسبة المئوية"
              value={`${Math.round((data.statistics?.sessions_completed / data.statistics?.sessions_total) * 100)}%`}
              icon={<Award className="w-6 h-6 text-amber-500" />}
              color="bg-amber-50"
            />
          </div>
          )}
        </div>

        {/* Upcoming Sessions */}
        <Section title="الحصص القادمة">
          {data.upcoming_sessions?.length ? (
            <div className="space-y-4">
              {data.upcoming_sessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100"
                >
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-lg">{session.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{session.subject_name}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-700 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {session.start_time} - {session.end_time}
                          </span>
                          <span>{session.session_date}</span>
                          <span className="text-gray-500">({session.duration_minutes} دقيقة)</span>
                        </div>
                      </div>
                    </div>
                    {session.meeting_link && (
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all hover:from-indigo-600 hover:to-blue-600 text-sm font-semibold flex items-center gap-2 flex-shrink-0"
                    >
                      الانضمام
                      <ArrowRight className="w-4 h-4" />
                    </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="لا توجد حصص قادمة" />
          )}
        </Section>

        {/* Homework */}
        <Section title="الواجبات المعلقة">
          {data.pending_homework?.length ? (
            <div className="space-y-4">
              {data.pending_homework.map((hw) => (
                <div
                  key={hw.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{hw.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{hw.description}</p>
                      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                        <span className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold">
                          تاريخ التسليم: {hw.due_date}
                        </span>
                        {hw.grade && (
                          <span className="text-sm font-bold text-green-600">الدرجة: {hw.grade}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="لا توجد واجبات معلقة 🎉" />
          )}
        </Section>
      </div>
    </div>
  );
}

/* ================= Components ================= */

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`${color} rounded-xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
        {title}
      </h2>
      <div>{children}</div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 text-center border border-gray-100">
      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-600 font-semibold">{text}</p>
    </div>
  );
}