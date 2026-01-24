'use client';

import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText, Calendar, Search, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Award, Download, X,
  User, Book, File, MessageCircle, Upload
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';

// Types
interface HomeworkItem {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  total_marks: number;
  obtained_marks?: number | null;
  teacher_feedback?: string | null;
  file_name?: string | null;
  file_url?: string | null;
  student_file_name?: string | null;
  student_file_url?: string | null;
  submitted_at?: string | null;
  subject: { name: string };
  teacher: { name: string };
}

// API Functions
const fetchHomework = async (page = 1, status = 'all') => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', '10');
  if (status !== 'all') params.append('status', status);

  const response = await axiosInstance.get('/student/homework', { params });
  return response.data.data;
};

const fetchResult = async (id: number) => {
  const response = await axiosInstance.get(`/student/homework/${id}/result`);
  return response.data.data;
};

const fetchHomeworkDetails = async (id: number) => {
  const response = await axiosInstance.get(`/student/homework/${id}`);
  return response.data.data;
};



const submitHomework = async ({ id, file, notes }: { id: number; file: File; notes?: string }) => {
  const formData = new FormData();
  formData.append('file', file);
  if (notes) formData.append('notes', notes);

  const response = await axiosInstance.post(`/student/homework/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default function StudentHomeworkPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();
  const t = useTranslations('Homework');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const params = useParams();
  const isRTL = params.locale === 'ar';

  // Modal states
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [homeworkFileModalOpen, setHomeworkFileModalOpen] = useState(false);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [selectedHomeworkId, setSelectedHomeworkId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data, isLoading, error } = useQuery({
    queryKey: ['student-homework', page, statusFilter],
    queryFn: () => fetchHomework(page, statusFilter),
    staleTime: 5 * 60 * 1000,
  });

  const homework: HomeworkItem[] = data?.homework || [];
  const statistics = data?.statistics || {};
  const pagination = { current: data?.current_page || 1, last: data?.last_page || 1, total: data?.total || 0 };

  const { data: resultData, isLoading: resultLoading } = useQuery({
    queryKey: ['homework-result', selectedHomeworkId],
    queryFn: () => fetchResult(selectedHomeworkId!),
    enabled: !!selectedHomeworkId && resultModalOpen,
  });

  const { data: detailsData, isLoading: detailsLoading } = useQuery({
    queryKey: ['homework-details', selectedHomeworkId],
    queryFn: () => fetchHomeworkDetails(selectedHomeworkId!),
    enabled: !!selectedHomeworkId && (homeworkFileModalOpen || submissionModalOpen),
  });

  const submitMutation = useMutation({
    mutationFn: submitHomework,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-homework'] });
      setSubmitModalOpen(false);
      setSelectedFile(null);
      setNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success(t('successSubmit'));
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || t('errorSubmit'));
    },
  });

  const statsBadges = [
    {
      label: t('totalHomework'),
      value: statistics?.total || 0,
      color: 'border-blue-500',
      icon: '📊',
    },
    {
      label: t('pending'),
      value: statistics?.pending || 0,
      color: 'border-yellow-500',
      icon: '⏳',
    },
    {
      label: t('submitted'),
      value: statistics?.submitted || 0,
      color: 'border-purple-500',
      icon: '📤',
    },
    {
      label: t('graded'),
      value: statistics?.graded || 0,
      color: 'border-green-500',
      icon: '✅',
    },
    {
      label: t('late'),
      value: statistics?.late || 0,
      color: 'border-red-500',
      icon: '⚠️',
    },
  ];


  const filteredHomework = homework.filter((hw) =>
    hw.title?.toLowerCase().includes(search.toLowerCase()) ||
    hw.description?.toLowerCase().includes(search.toLowerCase())
  );

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const statusConfigs = {
    pending: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', text: t('pending') },
    submitted: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', text: t('submitted') },
    graded: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', text: t('graded') },
    late: { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', text: t('late') },
  };

  const openSubmitModal = (id: number) => {
    setSelectedHomeworkId(id);
    setSubmitModalOpen(true);
    setSelectedFile(null);
    setNotes('');
  };

  const openResultModal = (id: number) => {
    setSelectedHomeworkId(id);
    setResultModalOpen(true);
  };

  const openHomeworkFileModal = (id: number) => {
    setSelectedHomeworkId(id);
    setHomeworkFileModalOpen(true);
  };

  const openSubmissionModal = (id: number) => {
    setSelectedHomeworkId(id);
    setSubmissionModalOpen(true);
  };

  const downloadFile = (url: string, filename: string) => {
    window.location.href = url;
  };

  const selectedHomework = homework.find(hw => hw.id === selectedHomeworkId);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{tCommon('error')}</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('errorLoading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-6 md:p-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-2xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">{t('description')}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {statsBadges.map((stat, idx) => (
            <div
              key={idx}
              className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border-l-4 ${stat.color} hover:shadow-md transition`}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
            >
              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium mb-2 flex items-center gap-2">
                <span className="dark:text-white">{stat.icon}</span>
                {stat.label}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stat.value}
              </p>
            </div>
          ))}
        </div>


        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
          </div>
        ) : filteredHomework.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-12 text-center">
            <FileText className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">{t('noHomework')}</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {filteredHomework.map((hw) => {
              const config = statusConfigs[hw.status] || statusConfigs.pending;
              const overdue = isOverdue(hw.due_date) && hw.status === 'pending';

              return (
                <div key={hw.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
                  <div className="h-2 bg-gradient-to-r from-indigo-500 to-blue-500" />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{hw.title}</h3>
                      <span className={`px-4 py-1 rounded-full text-sm font-medium ${config.color} dark:bg-opacity-30`}>
                        {config.text}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">{hw.description || t('noDescription')}</p>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm dark:text-white">{t('dueDate')}: {formatDate(hw.due_date)}</span>
                        {overdue && <span className="text-red-600 dark:text-red-400 font-bold text-sm">• {t('overdue')}</span>}
                      </div>

                      {hw.obtained_marks !== null && (
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-green-600" />
                          <span className="font-bold text-green-600 dark:text-green-400">
                            {t('mark')}: {hw.obtained_marks} / {hw.total_marks}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      {hw.status === 'pending' && hw.file_name && !overdue && (
                        <button
                          onClick={() => openSubmitModal(hw.id)}
                          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                        >
                          <Upload className="w-5 h-5" />
                          {t('submitHomework')}
                        </button>
                      )}

                      {hw.status === 'graded' && (
                        <button
                          onClick={() => openResultModal(hw.id)}
                          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                          <Award className="w-5 h-5" />
                          {t('viewResult')}
                        </button>
                      )}

                      {hw.file_name && (
                        <button
                          onClick={() => openHomeworkFileModal(hw.id)}
                          className="w-full bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 transition flex items-center justify-center gap-2"
                        >
                          <File className="w-5 h-5" />
                          {t('homeworkFile')}
                        </button>
                      )}

                      {hw.student_file_name && (
                        <button
                          onClick={() => openSubmissionModal(hw.id)}
                          className="w-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 py-3 rounded-xl font-semibold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition flex items-center justify-center gap-2"
                        >
                          <FileText className="w-5 h-5" />
                          {t('mySubmission')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

       <Pagination
            currentPage={page || 1}
            lastPage={pagination.last || 1}
            total={pagination.total  || 0}
            onPageChange={(page) => setPage(page)}
          />


      {/* مودال تسليم الواجب */}
      {submitModalOpen && selectedHomework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('submitHomework')}</h2>
              <button onClick={() => setSubmitModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <X className="w-7 h-7" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">{selectedHomework.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedHomework.description || t('noDescription')}</p>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">{t('yourFile')}</label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-indigo-500 transition">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
                    className="hidden"
                    id="submit-file"
                  />
                  <label htmlFor="submit-file" className="cursor-pointer block">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {selectedFile ? selectedFile.name : t('clickToSelect')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('fileTypes')}</p>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">{t('notesOptional')}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder={t('notesPlaceholder')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    if (!selectedFile) return toast.error(t('chooseFileFirst'));
                    submitMutation.mutate({ id: selectedHomework.id, file: selectedFile, notes: notes || undefined });
                  }}
                  disabled={submitMutation.isPending}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {submitMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                  {submitMutation.isPending ? t('sending') : t('send')}
                </button>
                <button onClick={() => setSubmitModalOpen(false)} className="flex-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-gray-100 py-4 rounded-xl font-bold">
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* مودال عرض التقييم */}
      {resultModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-gray-700 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('resultTitle')}</h2>
              <button onClick={() => setResultModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"><X className="w-7 h-7" /></button>
            </div>
            <div className="p-6 space-y-6">
              {resultLoading ? (
                <div className="text-center py-8"><Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-600" /></div>
              ) : resultData ? (
                <>
                  <div className="text-center py-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-700">
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">{resultData.result.obtained_marks} / {resultData.result.total_marks}</p>
                    <p className="text-xl text-green-600 dark:text-green-400 mt-2">{t('percentage')}: {resultData.result.percentage.toFixed(1)}%</p>
                  </div>
                  {resultData.result.teacher_feedback && (
                    <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-5 border dark:border-gray-700">
                      <div className="flex items-center gap-3 mb-3"><MessageCircle className="w-6 h-6 text-indigo-600" /><p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{t('teacherFeedback')}</p></div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{resultData.result.teacher_feedback}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl"><p className="text-gray-600 dark:text-gray-400">{t('submittedAt')}</p><p className="font-bold text-gray-900 dark:text-gray-100">{formatDate(resultData.result.submitted_at)}</p></div>
                    <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-xl"><p className="text-gray-600 dark:text-gray-400">{t('status')}</p><p className="font-bold text-green-600 dark:text-green-400">{t('graded')}</p></div>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* مودال ملف الواجب */}
      {homeworkFileModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('homeworkFileTitle')}</h2>
              <button onClick={() => setHomeworkFileModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"><X className="w-7 h-7" /></button>
            </div>
            <div className="p-6">
              {detailsLoading ? (
                <div className="text-center py-8"><Loader2 className="w-10 h-10 animate-spin mx-auto" /></div>
              ) : detailsData ? (
                <div className="space-y-5">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{detailsData.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{detailsData.description || t('noDescription')}</p>
                  <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-5 border dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <File className="w-8 h-8 text-indigo-600" />
                        <div><p className="font-semibold text-gray-900 dark:text-gray-100">{detailsData.file_name}</p><p className="text-sm text-gray-500 dark:text-gray-400">{t('originalFile')}</p></div>
                      </div>
                      <a 
                      href={`${detailsData.file_url}`}
                      download
                      target="_blank"
                      className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 flex items-center gap-2">
                        <Download className="w-5 h-5" /> {t('download')}
                      </a>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* مودال تسليمي */}
      {submissionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('submissionTitle')}</h2>
              <button onClick={() => setSubmissionModalOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"><X className="w-7 h-7" /></button>
            </div>
            <div className="p-6">
              {detailsLoading ? (
                <div className="text-center py-8"><Loader2 className="w-10 h-10 animate-spin mx-auto" /></div>
              ) : detailsData ? (
                <div className="space-y-5">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{detailsData.title}</h3>
                  <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-purple-600" />
                        <div><p className="font-semibold text-gray-900 dark:text-gray-100">{detailsData.student_file_name}</p><p className="text-sm text-gray-600 dark:text-gray-400">{t('yourFile')}</p></div>
                      </div>
                      <a href={`${detailsData.student_file_url}`}
                      download target="_blank"
                      className="bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 flex items-center gap-2">
                        <Download className="w-5 h-5" /> {t('download')}
                      </a>
                    </div>
                  </div>
                  {detailsData.submitted_at && (
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                      {t('submittedAt')}: {formatDate(detailsData.submitted_at)}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}