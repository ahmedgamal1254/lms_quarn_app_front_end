'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Search, Edit, Trash2, X, Download, Users, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/lib/axios';
import Pagination from '@/components/Pagination';
import { useTranslations, useLocale } from 'next-intl';

interface Exam {
  id: number;
  title: string;
  description: string;
  exam_date: string;
  start_time: string;
  total_marks: string;
  status: string;
  subject_name: string;
  duration_minutes?: number;
  file_url?: string;
  file_name?: string;
  submissions_count: number;
  graded_count: number;
}

interface ExamFormData {
  title: string;
  description: string;
  subject_id: number;
  exam_date: string;
  start_time: string;
  duration_minutes: number;
  total_marks: number;
  status: string;
  file?: FileList;
}

interface Submission {
  id: number;
  student_name: string;
  submitted_at: string;
  status: string;
  student_file_url?: string;
  student_file_name?: string;
  marks_obtained?: number;
}

export default function TeacherExamsPage() {
  const t = useTranslations('Exams');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState<number>(1);
  const [per_page, setPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [gradingModal, setGradingModal] = useState<{ open: boolean; submission: Submission | null }>({ 
    open: false, 
    submission: null 
  });
  const [gradingForm, setGradingForm] = useState({ marks: '', feedback: '' });
  
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm<ExamFormData>({
    defaultValues: {
      status: 'upcoming',
      duration_minutes: 90,
      total_marks: 100,
    },
  });

  const watchFile = watch('file');

  // Fetch exams
  const { data: examsData, isLoading } = useQuery({
    queryKey: ['teacher-exams', statusFilter, page, per_page, searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('per_page', per_page.toString());
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const response = await axiosInstance.get(`/teacher/exams?${params.toString()}`);
      return response.data;
    },
  });

  // Fetch form data
  const { data: formData } = useQuery({
    queryKey: ['teacher-form-data'],
    queryFn: async () => {
      const response = await axiosInstance.get('/teacher/form-data');
      return response.data;
    },
  });

  // Fetch submissions
  const { data: submissionsData } = useQuery({
    queryKey: ['exam-submissions', selectedExamId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/teacher/exams/${selectedExamId}/submissions`);
      return response.data;
    },
    enabled: !!selectedExamId && showSubmissions,
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (formData: ExamFormData) => {
      const data = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'file' && formData[key]?.[0]) {
          data.append('file', formData[key][0]);
        } else if (key !== 'file') {
          data.append(key, String(formData[key as keyof ExamFormData]));
        }
      });

      if (editingId) {
        const response = await axiosInstance.post(`/teacher/exams/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
      }
      const response = await axiosInstance.post('/teacher/exams', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-exams'] });
      setIsModalOpen(false);
      setEditingId(null);
      reset();
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/teacher/exams/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-exams'] });
    },
  });

  // Grade mutation
  const gradeMutation = useMutation({
    mutationFn: async ({ examId, resultId, data }: { examId: number; resultId: number; data: any }) => {
      const response = await axiosInstance.post(`/teacher/exams/${examId}/grade/${resultId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exam-submissions'] });
      setGradingModal({ open: false, submission: null });
      setGradingForm({ marks: '', feedback: '' });
    },
  });

  const exams = examsData?.data?.exams || [];
  const subjects = formData?.data?.subjects || [];
  const submissions = submissionsData?.data?.submissions || [];

  const filteredExams = exams.filter((exam: Exam) => {
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const onSubmit = (data: ExamFormData) => {
    mutation.mutate(data);
  };

  const handleEdit = (exam: Exam) => {
    setEditingId(exam.id);
    Object.keys(exam).forEach(key => {
      if (key !== 'file' && key !== 'file_url' && key !== 'file_name') {
        setValue(key as keyof ExamFormData, (exam as any)[key]);
      }
    });
    setIsModalOpen(true);
  };

  const handleGrade = (submission: Submission) => {
    setGradingModal({ open: true, submission });
    setGradingForm({ marks: '', feedback: '' });
  };

  const submitGrade = () => {
    if (!gradingModal.submission || !selectedExamId) return;
    
    gradeMutation.mutate({
      examId: selectedExamId,
      resultId: gradingModal.submission.id,
      data: {
        obtained_marks: parseFloat(gradingForm.marks),
        teacher_feedback: gradingForm.feedback,
      },
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      upcoming: 'bg-blue-100 text-blue-700',
      ongoing: 'bg-yellow-100 text-yellow-700',
      finished: 'bg-green-100 text-green-700',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    const labels = { 
      upcoming: t('upcomingLabel'), 
      ongoing: t('ongoingLabel'), 
      finished: t('finishedLabel') 
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="mb-8 flex md:flex-raw gap-3 items-center md:items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-2">{t('description')}</p>
        </div>
        <button
          onClick={() => { setEditingId(null); reset(); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {t('newExam')}
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full ${locale === 'ar' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border rounded-lg focus:ring-2 focus:ring-blue-500`}
            />
            <Search className={`absolute ${locale === 'ar' ? 'right-3' : 'left-3'} top-2.5 text-gray-400 w-5 h-5`} />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">{t('all')}</option>
            <option value="upcoming">{t('upcomingLabel')}</option>
            <option value="ongoing">{t('ongoingLabel')}</option>
            <option value="finished">{t('finishedLabel')}</option>
          </select>
        </div>
      </div>

      {/* Exams List */}
      <div className="space-y-4">
        {filteredExams.map((exam: Exam) => (
          <div key={exam.id} className="bg-white rounded-lg shadow-sm p-6 border-r-4 border-blue-500">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.title}</h3>
                <p className="text-gray-600 mb-3">{exam.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                  <span>📚 {exam.subject_name}</span>
                  <span>📅 {exam.exam_date}</span>
                  <span>🕐 {exam.start_time}</span>
                  <span>⏱️ {exam.duration_minutes} {t('minutes')}</span>
                  <span>📝 {exam.total_marks} {t('marks')}</span>
                </div>

                {exam.file_url && (
                  <a
                    href={exam.file_url}
                    download
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold mb-3"
                  >
                    <Download className="w-4 h-4" />
                    {t('downloadExam')}: {exam.file_name}
                  </a>
                )}

                <div className="flex items-center gap-4">
                  <div className="bg-purple-50 px-4 py-2 rounded-lg border border-purple-200">
                    <span className="text-purple-700 font-semibold">
                      📥 {t('submissions')}: {exam.submissions_count}
                    </span>
                  </div>
                  <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                    <span className="text-green-700 font-semibold">
                      ✅ {t('gradedCount')}: {exam.graded_count}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-raw flex-wrap sm:flex-col gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold text-center ${getStatusColor(exam.status)}`}>
                  {getStatusLabel(exam.status)}
                </span>
                
                <button
                  onClick={() => { setSelectedExamId(exam.id); setShowSubmissions(true); }}
                  className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm"
                >
                  <Users className="w-4 h-4" />
                  {t('submissions')}
                </button>

                <button
                  onClick={() => handleEdit(exam)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  {t('edit')}
                </button>

                <button
                  onClick={() => deleteMutation.mutate(exam.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('delete')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {
        filteredExams.length > 0 && (
            <Pagination
              currentPage={page}
              total={examsData?.total || 0}
              lastPage={examsData?.last_page || 1}
              onPageChange={(page) => setPage(page)}
            />
        )
      }

      {/* Exam Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold" dir={locale === 'ar' ? 'rtl' : 'ltr'}>{editingId ? t('edit') : t('newExam')}</h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <label className="block font-semibold mb-2">{tCommon('title')}</label>
                <input 
                  {...register('title', { required: true })} 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder={tCommon('title')}
                />
              </div>

              <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <label className="block font-semibold mb-2">{tCommon('description')}</label>
                <textarea 
                  {...register('description')} 
                  rows={3} 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder={tCommon('description')}
                />
              </div>

              <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <label className="block font-semibold mb-2">{t('subject')}</label>
                <select {...register('subject_id', { required: true })} className="w-full px-4 py-2 border rounded-lg">
                  <option value="">{t('subject')}</option>
                  {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <div>
                  <label className="block font-semibold mb-2">{t('date')}</label>
                  <input 
                    type="date" 
                    {...register('exam_date', { required: true })} 
                    className="w-full px-4 py-2 border rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">{t('time')}</label>
                  <input 
                    type="time" 
                    {...register('start_time')} 
                    className="w-full px-4 py-2 border rounded-lg" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <div>
                  <label className="block font-semibold mb-2">{t('duration')}</label>
                  <input 
                    type="number" 
                    {...register('duration_minutes')} 
                    className="w-full px-4 py-2 border rounded-lg" 
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2">{tCommon('totalGrade')}</label>
                  <input 
                    type="number" 
                    {...register('total_marks', { required: true })} 
                    className="w-full px-4 py-2 border rounded-lg" 
                  />
                </div>
              </div>

              <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <label className="block font-semibold mb-2">{t('examFile')}</label>
                <input
                  type="file"
                  {...register('file')}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                {watchFile?.[0] && (
                  <p className="text-sm text-green-600 mt-2">✓ {tCommon('fileSelected')}: {watchFile[0].name}</p>
                )}
              </div>

              <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <label className="block font-semibold mb-2">{tCommon('status')}</label>
                <select {...register('status')} className="w-full px-4 py-2 border rounded-lg">
                  <option value="upcoming">{t('upcomingLabel')}</option>
                  <option value="ongoing">{t('ongoingLabel')}</option>
                  <option value="finished">{t('finishedLabel')}</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <button 
                  onClick={handleSubmit(onSubmit)} 
                  disabled={mutation.isPending} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  {mutation.isPending ? tCommon('loading') : editingId ? tCommon('saveChanges') : t('createExam')}
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-semibold"
                >
                  {tCommon('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <h2 className="text-2xl font-bold">{t('submissions')}</h2>
              <button onClick={() => { setShowSubmissions(false); setSelectedExamId(null); }}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {submissions.length === 0 ? (
                <p className="text-center text-gray-600 py-8">{t('noExams')}</p>
              ) : (
                <div className="space-y-4">
                  {submissions.map((sub: Submission) => (
                    <div key={sub.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                          <h3 className="font-bold text-lg mb-1">{sub.student_name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{t('submittedAt')}: {sub.submitted_at}</p>
                          
                          {sub.student_file_url && (
                            <a 
                              href={sub.student_file_url} 
                              download 
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-semibold"
                            >
                              <Download className="w-4 h-4" />
                              {t('downloadExam')}: {sub.student_file_name}
                            </a>
                          )}

                          {sub.marks_obtained !== null && sub.marks_obtained !== undefined && (
                            <div className="mt-2 bg-green-50 px-3 py-1 rounded inline-block">
                              <span className="text-green-700 font-semibold">{t('mark')}: {sub.marks_obtained}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          {sub.status === 'submitted' ? (
                            <button
                              onClick={() => handleGrade(sub)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {t('gradeExam')}
                            </button>
                          ) : (
                             <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-semibold inline-block">
                               ✓ {t('gradedStatus')}
                             </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grading Modal */}
      {gradingModal.open && gradingModal.submission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b flex justify-between items-center" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <h2 className="text-xl font-bold">{t('gradeExam')}</h2>
              <button onClick={() => setGradingModal({ open: false, submission: null })}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <label className="block font-semibold mb-2">{tCommon('student')}</label>
                <input 
                  value={gradingModal.submission.student_name} 
                  disabled 
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50" 
                />
              </div>

              <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <label className="block font-semibold mb-2">{t('obtainedMarks')}</label>
                <input
                  type="number"
                  value={gradingForm.marks}
                  onChange={(e) => setGradingForm(prev => ({ ...prev, marks: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <label className="block font-semibold mb-2">{t('teacherFeedback')}</label>
                <textarea
                  value={gradingForm.feedback}
                  onChange={(e) => setGradingForm(prev => ({ ...prev, feedback: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="..."
                />
              </div>

              <div className="flex gap-3 pt-2" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <button 
                  onClick={submitGrade}
                  disabled={gradeMutation.isPending || !gradingForm.marks}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  {gradeMutation.isPending ? tCommon('loading') : t('saveGrade')}
                </button>
                <button 
                  onClick={() => setGradingModal({ open: false, submission: null })} 
                  className="flex-1 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg font-semibold"
                >
                  {tCommon('cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}