'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Mail, Phone, Globe, GraduationCap, CheckCircle, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import axiosInstance from '@/lib/axios';

interface Plan {
  id: number;
  name: string;
  sessions_count: number;
  sessions_remaining: number;
  sessions_used: number;
  start_date: string;
  end_date: string;
  total_sessions: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: string;
  image: string;
  status: string;
  plan: Plan;
  created_at: string;
}

interface StudentsResponse {
  success: boolean;
  data: {
    students: Student[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
  };
}

export default function TeacherStudentsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery<StudentsResponse>({
    queryKey: ['teacher-students', currentPage, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await axiosInstance.get(`/teacher/students?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الطلاب...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 text-center max-w-md">
          <p className="font-semibold mb-2">حدث خطأ في تحميل الطلاب</p>
          <p className="text-sm">يرجى المحاولة مرة أخرى لاحقاً</p>
        </div>
      </div>
    );
  }

  const students = data?.data?.students || [];
  const total = data?.data?.total || 0;
  const currentPageNum = data?.data?.current_page || 1;
  const lastPage = data?.data?.last_page || 1;
  const perPage = data?.data?.per_page || 10;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorForInitials = (id: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-purple-600',
      'bg-gradient-to-br from-green-500 to-emerald-600',
      'bg-gradient-to-br from-pink-500 to-rose-600',
      'bg-gradient-to-br from-orange-500 to-red-600',
      'bg-gradient-to-br from-cyan-500 to-blue-600',
    ];
    return colors[id % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">طلابي</h1>
        <p className="text-gray-600">
          قائمة الطلاب المسجلين معك ({total} طالب)
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="ابحث عن اسم الطالب أو البريد الإلكتروني..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pr-4 pl-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            لا يوجد طلاب
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'لم يتم العثور على نتائج تطابق بحثك' : 'لم يتم تعيين أي طلاب لك بعد'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Right Side - Avatar & Name */}
                <div className="flex items-center gap-4 order-2 md:order-1">
                  <div
                    className={`${getColorForInitials(
                      student.id
                    )} text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0`}
                  >
                    {getInitials(student.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {student.name}
                    </h3>
                    <div className="flex flex-col gap-1 text-sm text-gray-600 mt-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {student.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {student.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center - Plan Details */}
                <div className="flex-1 order-3 md:order-2 w-full md:w-auto">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-600 text-center">إجمالي الحصص</p>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">
                        {student.plan?.total_sessions || 0}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">حصة</p>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-300 rounded-full h-2 mt-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            ((student.plan?.sessions_used || 0) /
                              (student.plan?.total_sessions || 1)) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                    
                    <p className="text-xs text-gray-600 text-center mt-2">
                      من {new Date(student.plan?.start_date || '').toLocaleDateString('ar-SA')} إلى{' '}
                      {new Date(student.plan?.end_date || '').toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>

                {/* Middle - Status Cards */}
                <div className="grid grid-cols-2 gap-3 order-1 md:order-3 w-full md:w-auto">
                  {/* Plan Name */}
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">الخطة</p>
                    <p className="font-bold text-gray-900 text-sm">
                      {student.plan?.name || 'بدون'}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">الحالة</p>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded ${
                        student.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {student.status === 'active' ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          نشط
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          {student.status}
                        </>
                      )}
                    </span>
                  </div>

                  {/* Remaining */}
                  <div className="text-center bg-blue-50 rounded-lg p-2">
                    <p className="text-xs text-blue-600 mb-1">المتبقي</p>
                    <p className="font-bold text-blue-700 text-lg">
                      {student.plan?.sessions_remaining || 0}
                    </p>
                  </div>

                  {/* Used */}
                  <div className="text-center bg-orange-50 rounded-lg p-2">
                    <p className="text-xs text-orange-600 mb-1">المستخدم</p>
                    <p className="font-bold text-orange-700 text-lg">
                      {student.plan?.sessions_used || 0}
                    </p>
                  </div>
                </div>

                {/* Left - Actions */}
                <div className="flex gap-2 order-4 md:order-4 w-full md:w-auto">
                  <Link href={`/teacher/students/${student.id}`} className="flex-1 md:flex-none">
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors">
                      التفاصيل
                    </button>
                  </Link>
                  <Link
                    href={`/teacher/homework?student_id=${student.id}`}
                    className="flex-1 md:flex-none"
                  >
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors">
                      الواجبات
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 p-4 bg-white rounded-lg shadow-sm flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPageNum === 1}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm"
          >
            <ChevronRight className="w-4 h-4" />
            السابق
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg font-semibold transition-colors text-sm ${
                  currentPageNum === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
            disabled={currentPageNum === lastPage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm"
          >
            التالي
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Results Info */}
      {students.length > 0 && (
        <div className="text-center text-gray-600 text-sm mt-6">
          <p>
            عرض <span className="font-semibold">{(currentPageNum - 1) * perPage + 1}</span> إلى{' '}
            <span className="font-semibold">
              {Math.min(currentPageNum * perPage, total)}
            </span>{' '}
            من <span className="font-semibold">{total}</span> طالب
          </p>
        </div>
      )}
    </div>
  );
}