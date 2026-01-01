'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Home,
  ChevronLeft,
  ClipboardCheck,
  Search,
  Plus,
  Trash2,
  Edit,
  Filter,
  Menu,
  X
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';

interface Teacher {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

interface ExamData {
  id: number;
  title: string;
  description: string;
  subject_name: string;
  teacher_name: string;
  exam_date: string;
  start_time: string;
  duration_minutes: number;
  total_marks: number;
  status: string;
  created_at: string;
}

interface Teacher {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

interface FormData {
  title: string;
  description: string;
  subject_id: string;
  teacher_id: string;
  exam_date: string;
  start_time: string;
  duration_minutes: string;
  total_marks: string;
  status: string;
}

interface DataAllResponse {
  data: {
    subjects: Subject[];
    teachers: Teacher[];
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' };
    case 'ongoing':
      return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' };
    case 'upcoming':
      return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' };
    case 'cancelled':
      return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
    default:
      return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };
  }
};

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    completed: 'منتهي',
    ongoing: 'جاري',
    upcoming: 'قادم',
    cancelled: 'ملغي'
  };
  return statusMap[status] || status;
};

export default function ExamsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [params, setParams] = useState({ page: 1, per_page: 15 });
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    subject_id: '',
    teacher_id: '',
    exam_date: '',
    start_time: '',
    duration_minutes: '60',
    total_marks: '100',
    status: 'upcoming'
  });

  // Fetch exams
  const { data: examsData, isLoading, error: examsError } = useQuery({
    queryKey: ['exams'],
    queryFn: async () => {
      const response = await axiosInstance.get('/exams',{params});
      return response.data;
    }
  });

  // Fetch teachers and subjects
  const { data: dataAll } = useQuery<DataAllResponse>({
    queryKey: ['data-all'],
    queryFn: async () => {
      const response = await axiosInstance.get('/data/all');
      return response.data;
    }
  });

  const teachers = dataAll?.data?.teachers || [];
  const subjects = dataAll?.data?.subjects || [];
  const exams = examsData?.data?.exams || [];

  const filteredExams = exams.filter((exam: ExamData) => {
    const matchSearch = (exam.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exam.subject_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exam.teacher_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || exam.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axiosInstance.post('/exams', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('تم اضافة الامتحان بنجاح');
      setShowModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ في الإضافة');
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axiosInstance.put(`/exams/${selectedId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('تم تحديث الامتحان بنجاح');
      setShowModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ في التحديث');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await axiosInstance.delete(`/exams/${selectedId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('تم حذف الامتحان بنجاح');
      setShowModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ في الحذف');
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject_id: '',
      teacher_id: '',
      exam_date: '',
      start_time: '',
      duration_minutes: '60',
      total_marks: '100',
      status: 'upcoming'
    });
  };

  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (exam: ExamData) => {
    setModalMode('edit');
    setSelectedId(exam.id);
    const teacher = teachers.find(
      (t: Teacher) => t.name === exam.teacher_name
    );

    const subject = subjects.find(
      (s: Subject) => s.name === exam.subject_name
    );
    
    setFormData({
      title: exam.title,
      description: exam.description,
      subject_id: subject?.id.toString() || '',
      teacher_id: teacher?.id.toString() || '',
      exam_date: exam.exam_date,
      start_time: exam.start_time,
      duration_minutes: exam.duration_minutes?.toString(),
      total_marks: exam.total_marks.toString(),
      status: exam.status
    });
    setShowModal(true);
  };

  const openDeleteModal = (id: number) => {
    setModalMode('delete');
    setSelectedId(id);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (modalMode === 'create') {
      createMutation.mutate(formData);
    } else if (modalMode === 'edit') {
      updateMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">الامتحانات</h1>
            <div></div>
          </div>

          {/* Breadcrumbs */}
          <div className="px-6 py-2 flex items-center gap-2 text-sm text-gray-600">
            <Home size={16} />
            <a href="#" className="hover:text-blue-600">الرئيسية</a>
            <ChevronLeft size={16} />
            <ClipboardCheck size={16} />
            <span className="font-semibold text-gray-900">الامتحانات</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {examsError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                حدث خطأ في تحميل البيانات
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <button 
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus size={18} />
                <span>إضافة امتحان</span>
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="بحث بالعنوان أو المادة أو المعلم..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-medium ${
                  showFilters
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter size={18} />
                <span>الفلاتر</span>
              </button>
            </div>

            {/* Filters Dropdown */}
            {showFilters && (
              <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
                <div className="max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="all">الكل</option>
                    <option value="upcoming">قادم</option>
                    <option value="ongoing">جاري</option>
                    <option value="completed">منتهي</option>
                    <option value="cancelled">ملغي</option>
                  </select>
                </div>
              </div>
            )}

            {/* Table */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full"></div>
                </div>
                <p className="mt-4 text-gray-600">جاري التحميل...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">العنوان</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">المادة</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">المعلم</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">التاريخ</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">المدة</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الدرجة</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الحالة</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredExams.length > 0 ? (
                        filteredExams.map((exam: ExamData) => {
                          const statusStyle = getStatusColor(exam.status);
                          return (
                            <tr key={exam.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{exam.title}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                  {exam.subject_name || 'غير محدد'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">{exam.teacher_name || 'غير محدد'}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{exam.exam_date}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{exam.duration_minutes || 60} د</td>
                              <td className="px-6 py-4 text-sm font-bold text-gray-900">{exam.total_marks || 100}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>
                                  {getStatusText(exam.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openDeleteModal(exam.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="حذف"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => openEditModal(exam)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="تعديل"
                                  >
                                    <Edit size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-medium">
                            لا توجد نتائج
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Pagination */}
          {examsData && (
            <Pagination
              currentPage={params.page}
              lastPage={examsData.last_page}
              total={examsData.total}
              onPageChange={(page) =>
                setParams((prev) => ({ ...prev, page }))
              }
            />
          )}

        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' && 'إضافة امتحان جديد'}
                {modalMode === 'edit' && 'تعديل الامتحان'}
                {modalMode === 'delete' && 'حذف الامتحان'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {modalMode === 'delete' ? (
                <div>
                  <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذا الامتحان؟ لا يمكن التراجع عن هذا الإجراء.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={deleteMutation.isPending}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {deleteMutation.isPending ? 'جاري...' : 'حذف'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المادة</label>
                    <select
                      value={formData.subject_id}
                      onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">اختر مادة</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id.toString()}>{subject.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المعلم</label>
                    <select
                      value={formData.teacher_id}
                      onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">اختر معلم</option>
                      {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id.toString()}>{teacher.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الامتحان</label>
                    <input
                      type="date"
                      value={formData.exam_date}
                      onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">وقت البداية</label>
                    <input
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">المدة (دقيقة)</label>
                      <input
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الدرجة الكاملة</label>
                      <input
                        type="number"
                        value={formData.total_marks}
                        onChange={(e) => setFormData({ ...formData, total_marks: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="upcoming">قادم</option>
                      <option value="ongoing">جاري</option>
                      <option value="completed">منتهي</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {createMutation.isPending || updateMutation.isPending ? 'جاري...' : (modalMode === 'create' ? 'إضافة' : 'تحديث')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
