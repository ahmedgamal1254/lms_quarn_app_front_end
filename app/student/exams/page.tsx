'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  Calendar,
  Clock,
  Search,
  Filter,
  Loader2,
  Award,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import axios from 'axios';
import axiosInstance from '@/lib/axios';


// Fetch exams
const fetchExams = async (page = 1, filter = 'all') => {
  const response = await axiosInstance.get('/student/exams', {
    params: { page, per_page: 10, status: filter !== 'all' ? filter : undefined },
  });
  return response.data.data;
};

export default function StudentExamsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch exams with React Query
  const { data: examsData, isLoading, error } = useQuery({
    queryKey: ['exams', currentPage, filter],
    queryFn: () => fetchExams(currentPage, filter),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });


  const exams = examsData?.exams || [];
  const pagination = {
    currentPage: examsData?.current_page || 1,
    lastPage: examsData?.last_page || 1,
    total: examsData?.total || 0,
  };

  // Filter exams based on search
  const filteredExams = exams.filter((exam: any) => {
    return (
      exam.title?.toLowerCase().includes(search.toLowerCase()) ||
      exam.subject_name?.toLowerCase().includes(search.toLowerCase()) ||
      exam.teacher_name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getStatusInfo = (status: string, examDate: string) => {
    const today = new Date().toISOString().split('T')[0];
    const isUpcoming = examDate >= today && status !== 'completed';

    const statusConfigs = {
      upcoming: {
        color: 'bg-amber-100 text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        text: 'قادم',
      },
      completed: {
        color: 'bg-green-100 text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        text: 'مكتمل',
      },
    };

    if (isUpcoming) {
      return statusConfigs.upcoming;
    } else if (status === 'completed') {
      return statusConfigs.completed;
    } else {
      return {
        color: 'bg-gray-100 text-gray-700',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        text: 'منتهي',
      };
    }
  };

const calculatePercentage = (studentMarks: number, totalMarks: number): number => {
  if (!totalMarks) return 0;
  return Math.round((studentMarks / totalMarks) * 100);
};

  const getGradeColor = (percentage: number | null) => {
    if (!percentage) return 'text-gray-600';
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const calculateAverageGrade = () => {
    const gradedExams = exams.filter((e: any) => e.student_marks !== null && e.student_marks !== undefined);
    if (gradedExams.length === 0) return 0;

    const totalPercentage =
      (gradedExams ?? []).reduce(
        (acc: number, e: any) =>
          acc + calculatePercentage(e.student_marks, e.total_marks),
        0
      );

    return Math.round(totalPercentage / gradedExams.length);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '-';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 md:p-8 flex items-center justify-center">
        <div className="max-w-md bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">خطأ في تحميل الامتحانات</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">الامتحانات</h1>
          <p className="text-gray-600">عرض جميع الامتحانات الخاصة بك والنتائج</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="بحث في الامتحانات..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-right cursor-pointer"
              >
                <option value="all">جميع الامتحانات</option>
                <option value="upcoming">القادمة</option>
                <option value="completed">المكتملة</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">جاري التحميل...</p>
            </div>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100 mb-8">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">لا توجد امتحانات</p>
          </div>
        ) : (
          <>
            {/* Exams Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-8">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">العنوان</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المادة</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الوقت</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">النهاية العظمى</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">درجتي</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExams.map((exam: any, index: number) => {
                      const statusInfo = getStatusInfo(exam.status, exam.exam_date);
                      const percentage = calculatePercentage(exam.student_marks, exam.total_marks);
                      const gradeColor = getGradeColor(percentage);

                      return (
                        <tr
                          key={exam.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {exam.title}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {exam.subject_name || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                              {formatDate(exam.exam_date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                              {formatTime(exam.start_time)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-gray-900">
                            {exam.total_marks}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {exam.student_marks !== null && exam.student_marks !== undefined ? (
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${gradeColor}`}>
                                  {exam.student_marks}
                                </span>
                                {percentage && (
                                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${gradeColor} bg-opacity-10`}>
                                    {percentage}%
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.color}`}
                            >
                              {statusInfo.text}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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
                  السابق
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(pagination.lastPage, 5) }, (_, i) => {
                    const startPage = Math.max(1, pagination.currentPage - 2);
                    return startPage + i;
                  }).map((page) => (
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
                  التالي
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">إجمالي الامتحانات</p>
                <p className="text-3xl font-bold text-gray-900">{pagination.total}</p>
              </div>
              <BookOpen className="w-12 h-12 text-indigo-100 rounded-full p-2" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">الامتحانات القادمة</p>
                <p className="text-3xl font-bold text-amber-600">
                  {exams.filter((e: any) => {
                    const today = new Date().toISOString().split('T')[0];
                    return e.exam_date >= today && e.status !== 'completed';
                  }).length}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-amber-100 rounded-full p-2" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">الامتحانات المكتملة</p>
                <p className="text-3xl font-bold text-green-600">
                  {exams.filter((e: any) => e.status === 'completed').length}
                </p>
              </div>
              <Award className="w-12 h-12 text-green-100 rounded-full p-2" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm mb-1">المعدل الكلي</p>
                <p className="text-3xl font-bold text-pink-600">{calculateAverageGrade()}%</p>
              </div>
              <Award className="w-12 h-12 text-pink-100 rounded-full p-2" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}