'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  Calendar,
  Clock,
  Search,
  Filter,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Award,
} from 'lucide-react';
import axios from 'axios';
import axiosInstance from '@/lib/axios';

// Fetch homework
const fetchHomework = async (page = 1, filter = 'all') => {
  const response = await axiosInstance.get('/student/homework', {
    params: { page, per_page: 10, status: filter !== 'all' ? filter : undefined },
  });
  return response.data.data;
};

export default function Page() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch homework with React Query
  const { data: homeworkData, isLoading, error } = useQuery({
    queryKey: ['homework', currentPage, filter],
    queryFn: () => fetchHomework(currentPage, filter),
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const homework = homeworkData?.homework || [];
  const statistics = homeworkData?.statistics || {};
  const pagination = {
    currentPage: homeworkData?.current_page || 1,
    lastPage: homeworkData?.last_page || 1,
    total: homeworkData?.total || 0,
  };

  // Filter homework based on search
  const filteredHomework = homework.filter((hw: any) => {
    return (
      hw.title?.toLowerCase().includes(search.toLowerCase()) ||
      hw.description?.toLowerCase().includes(search.toLowerCase())
    );
  });

  
  type Status = keyof typeof statusConfigs;

  const statusConfigs = {
    pending: {
      color: 'bg-amber-100 text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      text: 'معلقة',
    },
    submitted: {
      color: 'bg-blue-100 text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      text: 'مسلّمة',
    },
    graded: {
      color: 'bg-green-100 text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      text: 'مُقيّمة',
    },
  } as const;

  const getStatusInfo = (status: Status) => {
    return statusConfigs[status];
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">خطأ في تحميل الواجبات</h2>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">الواجبات</h1>
          <p className="text-gray-600">عرض جميع الواجبات الخاصة بك وتتبع تقدمك</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="بحث في الواجبات..."
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
                <option value="all">جميع الواجبات</option>
                <option value="pending">معلقة</option>
                <option value="submitted">مسلّمة</option>
                <option value="graded">مُقيّمة</option>
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
        ) : filteredHomework.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100 mb-8">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">لا توجد واجبات</p>
          </div>
        ) : (
          <>
            {/* Homework Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredHomework.map((hw: any) => {
                const statusInfo = getStatusInfo(hw.status);
                const overdue = isOverdue(hw.due_date) && hw.status === 'pending';

                return (
                  <div
                    key={hw.id}
                    className={`${statusInfo.bgColor} rounded-2xl shadow-lg hover:shadow-xl transition-all border ${statusInfo.borderColor} overflow-hidden`}
                  >
                    {/* Status Bar */}
                    <div className="h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {hw.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {hw.description || 'لا يوجد وصف'}
                          </p>
                        </div>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="space-y-3 mb-6 text-sm">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Calendar className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span>تاريخ التسليم:</span>
                          <span className="font-semibold">{formatDate(hw.due_date)}</span>
                          {overdue && (
                            <span className="text-red-600 font-bold text-xs ml-auto">منتهي</span>
                          )}
                        </div>

                        {hw.grade !== null && hw.grade !== undefined && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Award className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span>الدرجة:</span>
                            <span className="font-bold text-green-600">
                              {hw.grade}
                              {hw.total_marks && `/${hw.total_marks}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      {hw.status === 'pending' && !overdue && (
                        <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm">
                          تسليم الواجب
                        </button>
                      )}

                      {hw.status === 'submitted' && !overdue && (
                        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm">
                          عرض التفاصيل
                        </button>
                      )}

                      {hw.status === 'graded' && (
                        <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm">
                          عرض التقييم
                        </button>
                      )}

                      {overdue && hw.status === 'pending' && (
                        <button className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm opacity-60 cursor-not-allowed">
                          تم تجاوز موعد التسليم
                        </button>
                      )}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              إجمالي الواجبات
            </p>
            <p className="text-3xl font-bold text-gray-900">{statistics.total || 0}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              واجبات معلقة
            </p>
            <p className="text-3xl font-bold text-amber-600">
              {homework.filter((hw: any) => hw.status === 'pending').length}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
            <p className="text-gray-600 text-sm mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              واجبات مُقيّمة
            </p>
            <p className="text-3xl font-bold text-green-600">
              {homework.filter((hw: any) => hw.status === 'graded').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}