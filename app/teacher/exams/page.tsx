'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Search, Filter, Edit, Trash2, X, Clock, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/lib/axios';

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
}

interface Subject {
  id: number;
  name: string;
  color: string;
}

interface ExamsResponse {
  success: boolean;
  data: {
    exams: Exam[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface FormDataResponse {
  success: boolean;
  data: {
    subjects: Subject[];
  };
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
}

export default function ExamsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<ExamFormData>({
    defaultValues: {
      status: 'upcoming',
      duration_minutes: 90,
    },
  });

  // Fetch exams
  const { data: examsData, isLoading: examsLoading } = useQuery<ExamsResponse>({
    queryKey: ['teacher-exams', statusFilter, searchTerm, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await axiosInstance.get(`/teacher/exams?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch form data (subjects)
  const { data: formData } = useQuery<FormDataResponse>({
    queryKey: ['teacher-form-data-exams'],
    queryFn: async () => {
      const response = await axiosInstance.get('/teacher/form-data');
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  // Create/Update exam mutation
  const mutation = useMutation({
    mutationFn: async (formData: ExamFormData) => {
      if (editingId) {
        const response = await axiosInstance.put(`/teacher/exams/${editingId}`, formData);
        return response.data;
      } else {
        const response = await axiosInstance.post('/teacher/exams', formData);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-exams'] });
      setIsModalOpen(false);
      setEditingId(null);
      reset();
    },
  });

  // Delete exam mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/teacher/exams/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-exams'] });
    },
  });

  const exams = examsData?.data?.exams || [];
  const subjects = formData?.data?.subjects || [];

  // Filter exams
  const filteredExams = exams.filter((exam) => {
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const onSubmit = (data: ExamFormData) => {
    mutation.mutate(data);
  };

  const handleEdit = (exam: Exam) => {
    setEditingId(exam.id);
    setValue('title', exam.title);
    setValue('description', exam.description);
    setValue('exam_date', exam.exam_date);
    setValue('start_time', exam.start_time);
    setValue('total_marks', parseInt(exam.total_marks) || 0);
    setValue('status', exam.status);
    setValue('duration_minutes', exam.duration_minutes || 90);
    setIsModalOpen(true);
  };

  const handleNewExam = () => {
    setEditingId(null);
    reset();
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return { badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', border: 'border-l-4 border-blue-500' };
      case 'ongoing':
        return { badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', border: 'border-l-4 border-yellow-500' };
      case 'completed':
        return { badge: 'bg-green-100 text-green-700', dot: 'bg-green-500', border: 'border-l-4 border-green-500' };
      case 'cancelled':
        return { badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', border: 'border-l-4 border-red-500' };
      default:
        return { badge: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500', border: 'border-l-4 border-gray-500' };
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'قادم';
      case 'ongoing':
        return 'جاري';
      case 'completed':
        return 'منتهي';
      case 'cancelled':
        return 'ملغى';
      default:
        return status;
    }
  };

  if (examsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الامتحانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">الامتحانات</h1>
          <p className="text-gray-600 mt-2">إدارة وتنظيم الامتحانات</p>
        </div>
        <button
          onClick={handleNewExam}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          امتحان جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm mb-1">قادمة</p>
          <p className="text-2xl font-bold">{exams.filter((e) => e.status === 'upcoming').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm mb-1">جاري</p>
          <p className="text-2xl font-bold">{exams.filter((e) => e.status === 'ongoing').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm mb-1">منتهية</p>
          <p className="text-2xl font-bold">{exams.filter((e) => e.status === 'completed').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm mb-1">الإجمالي</p>
          <p className="text-2xl font-bold">{exams.length}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ابحث عن امتحان أو مادة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-4 pl-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="upcoming">قادمة</option>
            <option value="ongoing">جاري</option>
            <option value="completed">منتهية</option>
            <option value="cancelled">ملغاة</option>
          </select>
        </div>
      </div>

      {/* Exams List */}
      <div className="space-y-4">
        {exams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg font-semibold">لا توجد امتحانات</p>
            <p className="text-gray-500 text-sm mt-1">ابدأ بإنشاء امتحان جديد</p>
          </div>
        ) : (
          filteredExams.map((exam) => {
            const colors = getStatusColor(exam.status);
            return (
              <div key={exam.id} className={`bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden ${colors.border}`}>
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    {/* Title and Description */}
                    <div className="md:col-span-2">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${colors.dot} flex-shrink-0 mt-1.5`}></div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{exam.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{exam.description}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mr-6">
                        📚 {exam.subject_name}
                      </div>
                    </div>

                    {/* Date and Time Info */}
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">التاريخ والوقت</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-1">
                          📅 {new Date(exam.exam_date).toLocaleDateString('ar-SA')}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          🕐 {exam.start_time}
                        </p>
                      </div>
                    </div>

                    {/* Marks and Status */}
                    <div className="flex flex-col gap-2 h-full">
                      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-3 border border-purple-200 flex-1">
                        <p className="text-xs text-purple-600 mb-1">الدرجة الكلية</p>
                        <p className="text-2xl font-bold text-purple-700">{exam.total_marks}</p>
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-center ${colors.badge}`}>
                        {getStatusLabel(exam.status)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(exam)}
                          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          تعديل
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(exam.id)}
                          className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {examsData?.data?.last_page && examsData.data.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 p-4 bg-white rounded-lg shadow-sm flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm"
          >
            <ChevronRight className="w-4 h-4" />
            السابق
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: examsData.data.last_page }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-9 h-9 rounded-lg font-semibold transition-colors text-sm ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(examsData.data.last_page, p + 1))}
            disabled={currentPage === examsData.data.last_page}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm"
          >
            التالي
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Results Info */}
      {exams.length > 0 && (
        <div className="text-center text-gray-600 text-sm mt-6">
          <p>
            عرض <span className="font-semibold">{(currentPage - 1) * (examsData?.data?.per_page || 10) + 1}</span> إلى{' '}
            <span className="font-semibold">
              {Math.min(currentPage * (examsData?.data?.per_page || 10), examsData?.data?.total || 0)}
            </span>{' '}
            من <span className="font-semibold">{examsData?.data?.total || 0}</span> امتحان
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'تعديل الامتحان' : 'امتحان جديد'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  reset();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">العنوان</label>
                <input
                  type="text"
                  {...register('title', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="عنوان الامتحان"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">الوصف</label>
                <textarea
                  {...register('description', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="وصف الامتحان"
                />
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">المادة</label>
                <select
                  {...register('subject_id', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر مادة</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">تاريخ الامتحان</label>
                  <input
                    type="date"
                    {...register('exam_date', { required: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">وقت البدء</label>
                  <input
                    type="time"
                    {...register('start_time', { required: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Duration and Marks */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">المدة (دقيقة)</label>
                  <input
                    type="number"
                    {...register('duration_minutes', { required: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">الدرجة الكلية</label>
                  <input
                    type="number"
                    {...register('total_marks', { required: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="100"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">الحالة</label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="upcoming">قادم</option>
                  <option value="ongoing">جاري</option>
                  <option value="completed">منتهي</option>
                  <option value="cancelled">ملغى</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={mutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  {mutation.isPending ? 'جاري...' : editingId ? 'حفظ التعديلات' : 'إنشاء امتحان'}
                </button>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    reset();
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 rounded-lg font-semibold transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}