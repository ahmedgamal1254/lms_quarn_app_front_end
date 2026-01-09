"use client";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Home,
  ChevronLeft,
  FileText,
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

interface Student {
  id: number;
  name: string;
  email: string;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
}

interface Subject {
  id: number;
  name: string;
}

interface HomeworkData {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: string;
  grade: string | null;
  student_name: string;
  teacher_name: string;
  subject_name: string;
}

interface HomeworkResponse {
  success: boolean;
  data: {
    homework: HomeworkData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  total: number;
}

interface FormData {
  title: string;
  description: string;
  student_id: string;
  subject_id: string;
  teacher_id: string;
  due_date: string;
  status: string;
  grade?: string;
}

interface Filters {
  page: number;
  search: string;
  status: string;
  student: string;
  teacher: string;
  subject: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'graded':
      return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' };
    case 'pending':
      return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' };
    case 'overdue':
      return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
    default:
      return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };
  }
};

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    graded: 'مصحح',
    pending: 'قيد الانتظار',
    overdue: 'متأخر',
    completed: 'مكتمل'
  };
  return statusMap[status] || status;
};

export default function HomeworkPage() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    page: 1,
    search: '',
    status: 'all',
    student: '',
    teacher: '',
    subject: ''
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    student_id: '',
    subject_id: '',
    teacher_id: '',
    due_date: '',
    status: 'pending',
    grade: ''
  });

  const { data: allData } = useQuery({
    queryKey: ['allData'],
    queryFn: async () => {
      const response = await axiosInstance.get('/data/all');
      return response.data;
    }
  });

  const { data: homeworkData, isLoading, error } = useQuery<HomeworkResponse>({
    queryKey: ['homework', filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: filters.page.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.student && { student: filters.student }),
        ...(filters.teacher && { teacher: filters.teacher }),
        ...(filters.subject && { subject: filters.subject })
      });
      
      const response = await axiosInstance.get(`/homework?${params}`);
      return response.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await axiosInstance.post('/homework', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('تم إضافة الواجب بنجاح');
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      setShowModal(false);
    },
    onError: () => {
      toast.error('حدث خطأ في إضافة الواجب');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FormData }) => {
      const response = await axiosInstance.put(`/homework/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('تم تحديث الواجب بنجاح');
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      setShowModal(false);
    },
    onError: () => {
      toast.error('حدث خطأ في تحديث الواجب');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/homework/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('تم حذف الواجب بنجاح');
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      setShowModal(false);
    },
    onError: () => {
      toast.error('حدث خطأ في حذف الواجب');
    }
  });

  const students = allData?.data?.students || [];
  const teachers = allData?.data?.teachers || [];
  const subjects = allData?.data?.subjects || [];
  const homework = homeworkData?.data?.homework || [];

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      title: '',
      description: '',
      student_id: '',
      subject_id: '',
      teacher_id: '',
      due_date: '',
      status: 'pending',
      grade: ''
    });
    setShowModal(true);
  };

  const openEditModal = (hw: HomeworkData) => {
    setModalMode('edit');
    setSelectedId(hw.id);
    const student = students.find((s: Student) => s.name === hw.student_name);
    const teacher = teachers.find((t: Teacher) => t.name === hw.teacher_name);
    const subject = subjects.find((s: Subject) => s.name === hw.subject_name);
    
    setFormData({
      title: hw.title,
      description: hw.description,
      student_id: student?.id.toString() || '',
      subject_id: subject?.id.toString() || '',
      teacher_id: teacher?.id.toString() || '',
      due_date: hw.due_date,
      status: hw.status,
      grade: hw.grade || ''
    });
    setShowModal(true);
  };

  const openDeleteModal = (id: number) => {
    setModalMode('delete');
    setSelectedId(id);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (modalMode === 'create') {
      createMutation.mutate(formData);
    } else if (modalMode === 'edit' && selectedId) {
      updateMutation.mutate({ id: selectedId, data: formData });
    }
  };

  const handleDelete = () => {
    if (selectedId) {
      deleteMutation.mutate(selectedId);
    }
  };

  const updateFilter = (key: keyof Filters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? Number(value) : 1,
    }));
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">الواجبات</h1>
            <div></div>
          </div>

          <div className="px-6 py-2 flex items-center gap-2 text-sm text-gray-600">
            <Home size={16} />
            <a href="#" className="hover:text-blue-600">الرئيسية</a>
            <ChevronLeft size={16} />
            <FileText size={16} />
            <span className="font-semibold text-gray-900">الواجبات</span>
          </div>
        </header>

        <div className="flex-1">
          <div className="p-6 max-w-7xl mx-auto">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                فشل في جلب البيانات
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* <button 
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus size={18} />
                <span>إضافة واجب</span>
              </button> */}

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="بحث بالطالب أو العنوان..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
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

            {showFilters && (
              <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الطالب</label>
                  <select
                    value={filters.student}
                    onChange={(e) => updateFilter('student', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">الكل</option>
                    {students.map((student: Student) => (
                      <option key={student.id} value={student.name}>{student.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المعلم</label>
                  <select
                    value={filters.teacher}
                    onChange={(e) => updateFilter('teacher', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">الكل</option>
                    {teachers.map((teacher: Teacher) => (
                      <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المادة</label>
                  <select
                    value={filters.subject}
                    onChange={(e) => updateFilter('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="">الكل</option>
                    {subjects.map((subject: Subject) => (
                      <option key={subject.id} value={subject.name}>{subject.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                  <select
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="all">الكل</option>
                    <option value="graded">مصحح</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="overdue">متأخر</option>
                  </select>
                </div>
              </div>
            )}

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
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الطالب</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">المعلم</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">المادة</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">العنوان</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الوصف</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">التسليم</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الحالة</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {homework.length > 0 ? (
                        homework.map((hw: HomeworkData) => {
                          const statusStyle = getStatusColor(hw.status);
                          return (
                            <tr key={hw.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{hw.student_name}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{hw.teacher_name}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                  {hw.subject_name}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">{hw.title}</td>
                              <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{hw.description}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{hw.due_date}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>
                                  {getStatusText(hw.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openDeleteModal(hw.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="حذف"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                  <button 
                                    onClick={() => openEditModal(hw)}
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

                {homeworkData && (
                  <Pagination
                    currentPage={homeworkData.data.current_page}
                    lastPage={homeworkData.data.last_page}
                    total={homeworkData.data.total}
                    onPageChange={(page) => updateFilter('page', page)}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' && 'إضافة واجب جديد'}
                {modalMode === 'edit' && 'تعديل الواجب'}
                {modalMode === 'delete' && 'حذف الواجب'}
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
                  <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذا الواجب؟ لا يمكن التراجع عن هذا الإجراء.</p>
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
                      {deleteMutation.isPending ? 'جاري الحذف...' : 'حذف'}
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
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الطالب</label>
                    <select
                      value={formData.student_id}
                      onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">اختر طالب</option>
                      {students.map((student: Student) => (
                        <option key={student.id} value={student.id.toString()}>{student.name}</option>
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
                      {teachers.map((teacher: Teacher) => (
                        <option key={teacher.id} value={teacher.id.toString()}>{teacher.name}</option>
                      ))}
                    </select>
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
                      {subjects.map((subject: Subject) => (
                        <option key={subject.id} value={subject.id.toString()}>{subject.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ التسليم</label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="graded">مصحح</option>
                      <option value="overdue">متأخر</option>
                    </select>
                  </div>

                  {formData.status === 'graded' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الدرجة</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.grade}
                        onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
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
                      {(createMutation.isPending || updateMutation.isPending) 
                        ? 'جاري الحفظ...' 
                        : modalMode === 'create' ? 'إضافة' : 'تحديث'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}