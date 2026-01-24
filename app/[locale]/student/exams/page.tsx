'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  Calendar,
  Clock,
  Search,
  Filter,
  Loader2,
  Award,
  AlertCircle,
  Download,
  Upload,
  Eye,
  X,
  FileText,
  CheckCircle,
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import Pagination from '@/components/Pagination';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';

interface Exam {
  id: number;
  title: string;
  description: string;
  exam_date: string;
  start_time: string;
  total_marks: number;
  status: string;
  subject_name: string;
  teacher_name: string;
  duration_minutes: number;
  file_url?: string;
  file_name?: string;
  has_submitted: boolean;
  submission?: {
    id: number;
    submitted_at: string;
    status: string;
    marks_obtained?: number;
    percentage?: number;
    grade?: string;
    teacher_feedback?: string;
  };
}

export default function StudentExamsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [page,setPage] = useState<number>(1)

  const [submitModal, setSubmitModal] = useState<{ open: boolean; exam: Exam | null }>({ 
    open: false, 
    exam: null 
  });
  const [resultModal, setResultModal] = useState<{ open: boolean; exam: Exam | null }>({
    open: false,
    exam: null,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  const queryClient = useQueryClient();
  const t = useTranslations('Exams');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const params = useParams();
  const isRTL = params.locale === 'ar';

  // Fetch exams
  const { data: examsData, isLoading, error } = useQuery({
    queryKey: ['student-exams', filter,page],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page",page.toString())
      if (filter !== 'all') params.append('status', filter);
      const response = await axiosInstance.get(`/student/exams?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Submit exam mutation
  const submitMutation = useMutation({
    mutationFn: async ({ examId, file, notes }: { examId: number; file: File; notes: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('notes', notes);

      const response = await axiosInstance.post(`/student/exams/${examId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-exams'] });
      setSubmitModal({ open: false, exam: null });
      setSelectedFile(null);
      setNotes('');
      toast.success(tCommon('success'));
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || tCommon('error'));
    },
  });

  const exams = examsData?.data?.exams || [];
  const statistics = examsData?.data?.statistics || {};
  const pagination = {
    "total" : examsData?.data?.total,
    "per_page":examsData?.data?.per_page,
    "last_page":examsData?.data?.last_page
  }


  // Filter exams based on search
  const filteredExams = exams.filter((exam: Exam) => {
    return (
      exam.title?.toLowerCase().includes(search.toLowerCase()) ||
      exam.subject_name?.toLowerCase().includes(search.toLowerCase()) ||
      exam.teacher_name?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleSubmit = () => {
    if (!submitModal.exam || !selectedFile) return;
    
    submitMutation.mutate({
      examId: submitModal.exam.id,
      file: selectedFile,
      notes,
    });
  };

  const getStatusInfo = (status: string, examDate: string, hasSubmitted: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const isUpcoming = examDate >= today && status !== 'finished';

    if (hasSubmitted) {
      return {
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        text: t('submitted'),
        icon: '✓',
      };
    }

    if (isUpcoming && status === 'ongoing') {
      return {
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
        text: t('now'),
        icon: '⏳',
      };
    }

    if (isUpcoming) {
      return {
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        text: t('upcoming'),
        icon: '📅',
      };
    }

    return {
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      text: t('finished'),
      icon: '⏹️',
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6 md:p-8 flex items-center justify-center">
        <div className="max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center border border-gray-100 dark:border-gray-700">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('errorLoading')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6 md:p-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('description')}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('totalExams')}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{statistics.total || 0}</p>
              </div>
              <BookOpen className="w-12 h-12 text-indigo-100 rounded-full p-2" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('upcoming')}</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{statistics.upcoming || 0}</p>
              </div>
              <Calendar className="w-12 h-12 text-blue-100 rounded-full p-2" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('submitted')}</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{statistics.submitted || 0}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-100 rounded-full p-2" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{t('graded')}</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{statistics.graded || 0}</p>
              </div>
              <Award className="w-12 h-12 text-purple-100 rounded-full p-2" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full ${locale === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              />
            </div>

            <div className="relative">
              <Filter className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5`} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`w-full ${locale === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer`}
              >
                <option value="all">{t('allExams')}</option>
                <option value="upcoming">{t('upcoming')}</option>
                <option value="ongoing">{t('ongoing')}</option>
                <option value="finished">{t('finished')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-semibold">{tCommon('loading')}</p>
            </div>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 text-center border border-gray-100 dark:border-gray-700">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">{tCommon('noData')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExams.map((exam: Exam) => {
              const statusInfo = getStatusInfo(exam.status, exam.exam_date, exam.has_submitted);
              // const canSubmit = exam.status === 'ongoing' && !exam.has_submitted;
              const canSubmit = true;

              return (
                <div key={exam.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <FileText className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{exam.title}</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{exam.description}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1 dark:text-white">
                          <BookOpen className="w-4 h-4 text-indigo-600" />
                          {exam.subject_name}
                        </span>
                        <span className="flex items-center gap-1 dark:text-white">
                          <Calendar className="w-4 h-4 text-indigo-600" />
                          {formatDate(exam.exam_date)}
                        </span>
                        <span className="flex items-center gap-1 dark:text-white">
                          <Clock className="w-4 h-4 text-indigo-600" />
                          {formatTime(exam.start_time)}
                        </span>
                        <span className="dark:text-white">⏱️ {exam.duration_minutes} {t('minutes')}</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">📝 {exam.total_marks} {t('marks')}</span>
                      </div>

                      {exam.file_url && (
                        <a
                          href={exam.file_url}
                          download
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold mb-2"
                        >
                          <Download className="w-4 h-4" />
                          {t('downloadExamFile')}: {exam.file_name}
                        </a>
                      )}

                      {exam.submission && exam.submission.marks_obtained !== null && (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg border border-green-200 dark:border-green-700">
                            <span className="text-green-700 dark:text-green-400 font-bold">
                              {t('mark')}: {exam.submission.marks_obtained} / {exam.total_marks}
                            </span>
                          </div>
                          {exam.submission.percentage && (
                            <div className="bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-lg border border-purple-200 dark:border-purple-700">
                              <span className="text-purple-700 dark:text-purple-400 font-bold">
                                {t('percentage')}: {exam.submission.percentage}%
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold text-center ${statusInfo.color}`}>
                        {statusInfo.icon} {statusInfo.text}
                      </span>

                      {canSubmit && (
                        <button
                          onClick={() => setSubmitModal({ open: true, exam })}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm"
                        >
                          <Upload className="w-4 h-4" />
                          {t('uploadAnswer')}
                        </button>
                      )}

                      {exam.submission?.status === 'graded' && (
                        <button
                          onClick={() => setResultModal({ open: true, exam })}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          {t('viewResult')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination 
          currentPage={page}
          total={pagination.total}
          lastPage={pagination.last_page}
          onPageChange={(page) => setPage(page)}
        />
      </div>

      {/* Submit Modal */}
      {submitModal.open && submitModal.exam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('submitExam')}</h2>
              <button onClick={() => { setSubmitModal({ open: false, exam: null }); setSelectedFile(null); setNotes(''); }} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-900 dark:text-gray-100">{t('examLabel')}</label>
                <input 
                  value={submitModal.exam.title} 
                  disabled 
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100" 
                />
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-900 dark:text-gray-100">{t('answerFileLabel')}</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                />
                {selectedFile && (
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">✓ {t('fileSelected')}: {selectedFile.name}</p>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-2 text-gray-900 dark:text-gray-100">{t('notesLabel')}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                  placeholder={t('notesPlaceholder')}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={submitMutation.isPending || !selectedFile}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  {submitMutation.isPending ? t('uploading') : t('uploadAnswer')}
                </button>
                <button
                  onClick={() => { setSubmitModal({ open: false, exam: null }); setSelectedFile(null); setNotes(''); }}
                  className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg font-semibold"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {resultModal.open && resultModal.exam?.submission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-lg w-full">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('resultTitle')}</h2>
              <button onClick={() => setResultModal({ open: false, exam: null })} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6 text-center border border-indigo-200 dark:border-indigo-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t('obtainedMark')}</p>
                <p className="text-5xl font-bold text-indigo-700 dark:text-indigo-400 mb-2">
                  {resultModal.exam.submission.marks_obtained}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('outOf')} <span className="font-bold dark:text-white">{resultModal.exam.total_marks}</span>
                </p>
                {resultModal.exam.submission.percentage && (
                  <div className="mt-4">
                    <span className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold text-lg">
                      {resultModal.exam.submission.percentage}%
                    </span>
                  </div>
                )}
                {resultModal.exam.submission.grade && (
                  <div className="mt-3">
                    <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full font-bold">
                      {t('grade')}: {resultModal.exam.submission.grade}
                    </span>
                  </div>
                )}
              </div>

              {resultModal.exam.submission.teacher_feedback && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <p className="font-semibold text-blue-900 dark:text-blue-300 mb-2">📝 {t('teacherFeedback')}:</p>
                  <p className="text-gray-700 dark:text-gray-300">{resultModal.exam.submission.teacher_feedback}</p>
                </div>
              )}

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>{t('submittedAt')}: {resultModal.exam.submission.submitted_at}</p>
              </div>

              <button
                onClick={() => setResultModal({ open: false, exam: null })}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-semibold"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}