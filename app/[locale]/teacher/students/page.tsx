'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Users, Mail, Phone, Globe, GraduationCap, CheckCircle, Clock, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import axiosInstance from '@/lib/axios';
import Pagination from '@/components/Pagination';
import { Button } from 'antd';
import { AxiosError } from 'axios';
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from 'next-intl';

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
  user_id: number;
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
  const t = useTranslations('TeacherStudents');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setPage(newPage);
  };

  const { data, isLoading, error } = useQuery<StudentsResponse>({
    queryKey: ['teacher-students', currentPage, searchTerm , page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', perPage.toString());
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await axiosInstance.get(`/teacher/students?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });


  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 text-center max-w-md">
          <p className="font-semibold mb-2">{tCommon('errorLoadingData') || 'Error loading students'}</p>
          <p className="text-sm">{tCommon('tryAgainLater') || 'Please try again later'}</p>
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

  const queryClient = useQueryClient();
  const router = useRouter();

  const startConversationMutation = useMutation({
    mutationFn: async (studentId: number) => {
      const response = await axiosInstance.get(`/conversations/${studentId}`);
      return response.data;
    },
    onSuccess: (data) => {      
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });

      router.push(`/teacher/chat`);      
    },
    onError: (error: AxiosError<{ error: string }>) => {
      // toast.error(error?.response?.data?.error || 'فشل إرسال الرسالة');
    },
  });

  const handleStartChat=(id: number) => {
    startConversationMutation.mutate(id);
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('title')}</h1>
        <p className="text-gray-600">
          {t('count', { count: total })}
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className={`w-full ${locale === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <Search className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-2.5 text-gray-400 w-5 h-5`} />
        </div>
      </div>

      {/* Students List */}
      {students.length === 0 && !isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {t('noStudents')}
          </h3>
          <p className="text-gray-500">
            {searchTerm ? t('noResults') : t('notAssigned')}
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
                      <div className="flex items-center gap-2 break-words">
                        <Mail className="w-4 h-4" />
                        <span className="break-all">
                          {student.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {student.phone}
                      </div>
                    </div>
                    <Button className="mt-4" type='primary'
                    loading={startConversationMutation.isPending}
                    onClick={() => handleStartChat(student.user_id)}>{t('chat')}</Button>
                  </div>
                </div>

                {/* Center - Plan Details */}
                <div className="flex-1 order-3 md:order-2 w-full md:w-auto">
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-600 text-center">{t('totalSessions')}</p>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-purple-600">
                        {student.plan?.total_sessions || 0}
                      </p>
                      <p className="text-xs text-gray-600 mt-2">{t('sessions')}</p>
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
                      {t('from')} {new Date(student.plan?.start_date || '').toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')} {t('to')}{' '}
                      {new Date(student.plan?.end_date || '').toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                </div>

                {/* Middle - Status Cards */}
                <div className="grid grid-cols-2 gap-3 order-1 md:order-3 w-full md:w-auto">
                  {/* Plan Name */}
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">{tCommon('plans') || 'Plan'}</p>
                    <p className="font-bold text-gray-900 text-sm">
                      {student.plan?.name || tCommon('none') || 'None'}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-2">{tCommon('status') || 'Status'}</p>
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
                          {t('active')}
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
                    <p className="text-xs text-blue-600 mb-1">{t('remaining')}</p>
                    <p className="font-bold text-blue-700 text-lg">
                      {student.plan?.sessions_remaining || 0}
                    </p>
                  </div>

                  {/* Used */}
                  <div className="text-center bg-orange-50 rounded-lg p-2">
                    <p className="text-xs text-orange-600 mb-1">{t('used')}</p>
                    <p className="font-bold text-orange-700 text-lg">
                      {student.plan?.sessions_used || 0}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* overlay spinnner */}
      {isLoading && (
        <div className="flex items-center justify-center bg-gray-50">
          <div className="text-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">{tCommon('loading') || 'Loading...'}</p>
          </div>
        </div>
      )}

      {
        students && (
          <Pagination 
            currentPage={page}
            total={data?.data?.total || 0}
            lastPage={data?.data?.last_page || 0}
            onPageChange={handlePageChange}

          />
        )
      }
    </div>
  );
}