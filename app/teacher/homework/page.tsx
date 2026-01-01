'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, Search, Filter, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';

interface Homework {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: string;
  grade: string | null;
  student_id: number;
  subject_id: number;
  student_name: string;
  subject_name: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
}

interface Subject {
  id: number;
  name: string;
  color: string;
}

interface HomeworkResponse {
  success: boolean;
  data: {
    homework: Homework[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface FormDataResponse {
  success: boolean;
  data: {
    students: Student[];
    subjects: Subject[];
  };
}

interface HomeworkFormData {
  title: string;
  description: string;
  student_id: number;
  subject_id: number;
  due_date: string;
  status: string;
  grade?: string;
}

export default function HomeworkPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<HomeworkFormData>({
    defaultValues: {
      status: 'pending',
    },
  });

  // Fetch homework
  const { data: homeworkData, isLoading: homeworkLoading } = useQuery<HomeworkResponse>({
    queryKey: ['teacher-homework', statusFilter, searchTerm, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      const response = await axiosInstance.get(`/teacher/homework?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch form data (students and subjects)
  const { data: formData } = useQuery<FormDataResponse>({
    queryKey: ['teacher-form-data'],
    queryFn: async () => {
      const response = await axiosInstance.get('/teacher/form-data');
      return response.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  // Create/Update homework mutation
  const mutation = useMutation({
    mutationFn: async (formData: HomeworkFormData) => {
      if (editingId) {
        const response = await axiosInstance.put(`/teacher/homework/${editingId}`, formData);
        return response.data;
      } else {
        const response = await axiosInstance.post('/teacher/homework', formData);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-homework'] });
      setIsModalOpen(false);
      setEditingId(null);
      toast.success('تم حفظ الواجب بنجاح');
      reset();
    },
  });


  // Delete homework mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/teacher/homework/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-homework'] });
      toast.success('تم حذف الواجب بنجاح');
    },
  });

  const homework = homeworkData?.data?.homework || [];
  const students = formData?.data?.students || [];
  const subjects = formData?.data?.subjects || [];

  // Filter homework
  const filteredHomework = homework.filter((hw) => {
    const matchesStatus = statusFilter === 'all' || hw.status === statusFilter;
    const matchesSearch =
      hw.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hw.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hw.subject_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const onSubmit = (data: HomeworkFormData) => {
    mutation.mutate(data);
  };

  const handleEdit = (hw: Homework) => {
    console.log(hw);
    setEditingId(hw.id);
    setValue('title', hw.title);
    setValue('description', hw.description);
    setValue('due_date', hw.due_date);
    setValue('status', hw.status);
    setValue('grade', hw.grade || '');
    setValue('student_id', hw.student_id);
    setValue('subject_id', hw.subject_id);
    setIsModalOpen(true);
  };

  const handleNewHomework = () => {
    setEditingId(null);
    reset();
    setIsModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return { badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' };
      case 'submitted':
        return { badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' };
      case 'graded':
        return { badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' };
      default:
        return { badge: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' };
    }
  };

  const getStatusLabel = (status: string) => {
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

  if (homeworkLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الواجبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">الواجبات</h1>
          <p className="text-gray-600 mt-2">إدارة وتصحيح واجبات الطلاب</p>
        </div>
        <button
          onClick={handleNewHomework}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          واجب جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm mb-1">معلقة</p>
          <p className="text-2xl font-bold">{homework.filter((h) => h.status === 'pending').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm mb-1">مسلمة</p>
          <p className="text-2xl font-bold">{homework.filter((h) => h.status === 'submitted').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm mb-1">مصححة</p>
          <p className="text-2xl font-bold">{homework.filter((h) => h.status === 'graded').length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm mb-1">الإجمالي</p>
          <p className="text-2xl font-bold">{homework.length}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="ابحث عن واجب أو طالب..."
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
            <option value="pending">معلقة</option>
            <option value="submitted">مسلمة</option>
            <option value="graded">مصححة</option>
          </select>
        </div>
      </div>

      {/* Homework List */}
      <div className="space-y-4">
        {homework.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg font-semibold">لا توجد واجبات</p>
            <p className="text-gray-500 text-sm mt-1">ابدأ بإنشاء واجب جديد</p>
          </div>
        ) : (
          filteredHomework.map((hw) => {
            const colors = getStatusColor(hw.status);
            return (
              <div key={hw.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden">
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    {/* Title and Description */}
                    <div className="md:col-span-2">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${colors.dot} flex-shrink-0 mt-1.5`}></div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{hw.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{hw.description}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mr-6">
                        📚 {hw.subject_name} • 👤 {hw.student_name}
                      </div>
                    </div>

                    {/* Due Date and Status */}
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">تاريخ التسليم</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(hw.due_date).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${colors.badge}`}>
                          {getStatusLabel(hw.status)}
                        </span>
                      </div>
                    </div>

                    {/* Grade and Actions */}
                    <div className="flex flex-col gap-2">
                      {hw.grade && (
                        <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                          <p className="text-xs text-green-600 mb-1">الدرجة</p>
                          <p className="text-2xl font-bold text-green-700">{hw.grade}</p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(hw)}
                          className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-1 transition text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          تعديل
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(hw.id)}
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
      {homeworkData?.data?.last_page && homeworkData.data.last_page > 1 && (
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
            {Array.from({ length: homeworkData.data.last_page }, (_, i) => i + 1).map((page) => (
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
            onClick={() => setCurrentPage((p) => Math.min(homeworkData.data.last_page, p + 1))}
            disabled={currentPage === homeworkData.data.last_page}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors text-sm"
          >
            التالي
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Results Info */}
      {homework.length > 0 && (
        <div className="text-center text-gray-600 text-sm mt-6">
          <p>
            عرض <span className="font-semibold">{(currentPage - 1) * (homeworkData?.data?.per_page || 10) + 1}</span> إلى{' '}
            <span className="font-semibold">
              {Math.min(currentPage * (homeworkData?.data?.per_page || 10), homeworkData?.data?.total || 0)}
            </span>{' '}
            من <span className="font-semibold">{homeworkData?.data?.total || 0}</span> واجب
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'تعديل الواجب' : 'واجب جديد'}
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
                  placeholder="عنوان الواجب"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">الوصف</label>
                <textarea
                  {...register('description', { required: true })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="وصف الواجب"
                />
              </div>

              {/* Student and Subject */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">الطالب</label>
                  <select
                    {...register('student_id', { required: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر طالب</option>
                    {students.map((s) => (
                      <option key={s.id}
                       value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

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
              </div>

              {/* Due Date and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">تاريخ التسليم</label>
                  <input
                    type="date"
                    {...register('due_date', { required: true })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">الحالة</label>
                  <select
                    {...register('status')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">معلق</option>
                    <option value="submitted">مسلم</option>
                    <option value="graded">مصحح</option>
                  </select>
                </div>
              </div>

              {/* Grade */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">الدرجة (اختياري)</label>
                <input
                  type="number"
                  {...register('grade')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0-100"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={mutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition"
                >
                  {mutation.isPending ? 'جاري...' : editingId ? 'حفظ التعديلات' : 'إنشاء واجب'}
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