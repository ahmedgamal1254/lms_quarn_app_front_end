"use client";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import {
  Home,
  ChevronLeft,
  Video,
  Search,
  Plus,
  Trash2,
  Edit,
  Filter,
  Menu,
  X,
  Calendar,
  Clock,
  AlertCircle,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';

interface Student {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

interface DataAllResponse{
  data: {
    students: Student[];
    teachers: Teacher[];
    subjects: Subject[];
  }
}

interface SessionData {
  id: number;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: string;
  meeting_link: string | null;
  student_name: string;
  teacher_name: string;
  subject_name: string;
}

interface SingleSessionForm {
  student_id: string;
  teacher_id: string;
  subject_id: string;
  title: string;
  description: string;
  session_date: string;
  start_time: string;
  end_time: string;
  meeting_link: string;
  notes: string;
}

interface BulkSessionForm {
  subscription_id: string;
  monthYear: string;
  weekDays: { day: string; time: string; selected: boolean }[];
  teacher_id: string;
  subject_id: string;
  student_id: string;
  start_time: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700' };
    case 'scheduled':
      return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' };
    case 'cancelled':
      return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
    default:
      return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' };
  }
};

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    completed: 'مكتملة',
    scheduled: 'مجدولة',
    cancelled: 'ملغية'
  };
  return statusMap[status] || status;
};

const weekDaysArabic = [
  { value: 'monday', label: 'الاثنين' },
  { value: 'tuesday', label: 'الثلاثاء' },
  { value: 'wednesday', label: 'الأربعاء' },
  { value: 'thursday', label: 'الخميس' },
  { value: 'friday', label: 'الجمعة' },
  { value: 'saturday', label: 'السبت' },
  { value: 'sunday', label: 'الأحد' }
];

export default function SessionsPage() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'single' | 'bulk'>('single');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [previewSchedule, setPreviewSchedule] = useState<SessionData[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [singleForm, setSingleForm] = useState<SingleSessionForm>({
    student_id: '',
    teacher_id: '',
    subject_id: '',
    title: '',
    description: '',
    session_date: '',
    start_time: '',
    end_time: '',
    meeting_link: '',
    notes: ''
  });

  const [bulkForm, setBulkForm] = useState<BulkSessionForm>({
    subscription_id: '',
    monthYear: '',
    weekDays: weekDaysArabic.map(d => ({ day: d.label, time: '10:00', selected: false })),
    teacher_id: '',
    subject_id: '',
    student_id: '',
    start_time: '10:00'
  });

  console.log(fromDate)
  console.log(toDate)

  // Fetch sessions
  const { data: sessionsData, isLoading, error: sessionsError } = useQuery({
    queryKey: ['sessions', searchQuery, statusFilter, currentPage, fromDate, toDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);
      params.append('page', currentPage.toString());
      const response = await axiosInstance.get(`/sessions?${params}`);
      return response.data;
    }
  });

  // Fetch all data (students, teachers, subjects)
  const { data: allData } = useQuery<DataAllResponse>({
    queryKey: ['data-all'],
    queryFn: async () => {
      const response = await axiosInstance.get('/data/all');
      return response.data;
    }
  });

  const students = allData?.data?.students || [];
  const teachers = allData?.data?.teachers || [];
  const subjects = allData?.data?.subjects || [];
  const sessions = sessionsData?.data?.sessions || [];
  
  const currentPageNum = sessionsData?.data?.current_page || 1;
  const lastPage = sessionsData?.data?.last_page || 1;
  const totalSessions = sessionsData?.data?.total || 0;

  const filteredSessions = sessions.filter((session: SessionData) => {
    const matchSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.teacher_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || session.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Create single session
  const createSingleMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/sessions', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('تم إضافة الحصة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ في الإضافة');
    }
  });

  // Create bulk sessions
  const createBulkMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/sessions/bulk', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('تم إضافة الحصص بنجاح');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ في الإضافة');
    }
  });

  // Delete session
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/sessions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('تم حذف الحصة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ في الحذف');
    }
  });

  const openCreateModal = (mode: 'single' | 'bulk') => {
    setModalMode(mode);
    setSelectedId(null);
    setSingleForm({
      student_id: '',
      teacher_id: '',
      subject_id: '',
      title: '',
      description: '',
      session_date: '',
      start_time: '',
      end_time: '',
      meeting_link: '',
      notes: ''
    });
    setBulkForm({
      subscription_id: '',
      monthYear: '',
      weekDays: weekDaysArabic.map(d => ({ day: d.label, time: '10:00', selected: false })),
      teacher_id: '',
      subject_id: '',
      student_id: '',
      start_time: '10:00'
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowPreview(false);
    setPreviewSchedule([]);
  };

  const generateBulkPreview = () => {
    if (!bulkForm.monthYear || !bulkForm.student_id || !bulkForm.teacher_id || !bulkForm.subject_id) {
      toast.error('الرجاء ملء جميع البيانات المطلوبة');
      return;
    }

    const selectedDays = bulkForm.weekDays.filter(d => d.selected);
    if (selectedDays.length === 0) {
      toast.error('الرجاء اختيار يوم واحد على الأقل');
      return;
    }

    const [year, month] = bulkForm.monthYear.split('-');
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const dayMap: { [key: string]: number } = {
      'الأحد': 0, 'الاثنين': 1, 'الثلاثاء': 2, 'الأربعاء': 3,
      'الخميس': 4, 'الجمعة': 5, 'السبت': 6
    };

    const preview: SessionData[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(parseInt(year), parseInt(month) - 1, day);
      const dayOfWeek = date.getDay();

      const selectedDay = selectedDays.find(d => dayMap[d.day] === dayOfWeek);

      if (selectedDay) {
        const dateStr = date.toISOString().split('T')[0];
        const endTime = addMinutes(selectedDay.time, 60);

        preview.push({
          id: 0,
          title: `حصة - ${selectedDay.day}`,
          session_date: dateStr,
          start_time: selectedDay.time,
          end_time: endTime,
          duration_minutes: 60,
          status: 'scheduled',
          meeting_link: null,
          student_name: students.find((s: Student) => s.id === parseInt(bulkForm.student_id))?.name || '',
          teacher_name: teachers.find((t: Teacher) => t.id === parseInt(bulkForm.teacher_id))?.name || '',
          subject_name: subjects.find((s: Subject) => s.id === parseInt(bulkForm.subject_id))?.name || ''
        });
      }
    }

    setPreviewSchedule(preview);
    setShowPreview(true);
  };

  const handleSubmitSingle = () => {
    if (!singleForm.student_id || !singleForm.teacher_id || !singleForm.subject_id ||
        !singleForm.title || !singleForm.session_date || !singleForm.start_time || !singleForm.end_time) {
      toast.error('الرجاء ملء جميع البيانات المطلوبة');
      return;
    }

    createSingleMutation.mutate({
      student_id: parseInt(singleForm.student_id),
      teacher_id: parseInt(singleForm.teacher_id),
      subject_id: parseInt(singleForm.subject_id),
      title: singleForm.title,
      description: singleForm.description,
      session_date: singleForm.session_date,
      start_time: singleForm.start_time,
      end_time: singleForm.end_time,
      meeting_link: singleForm.meeting_link,
      notes: singleForm.notes
    });
  };

  const handleSubmitBulk = () => {
    if (previewSchedule.length === 0) {
      toast.error('الرجاء إنشاء معاينة أولاً');
      return;
    }

    const sessionsData = previewSchedule.map(session => ({
      student_id: parseInt(bulkForm.student_id),
      teacher_id: parseInt(bulkForm.teacher_id),
      subject_id: parseInt(bulkForm.subject_id),
      title: session.title,
      session_date: session.session_date,
      start_time: session.start_time,
      end_time: session.end_time
    }));

    createBulkMutation.mutate({
      subscription_id: parseInt(bulkForm.subscription_id),
      sessions: sessionsData
    });
  };

  return (
    <div className="flex bg-gray-50">
     
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">الحصص</h1>
            <div></div>
          </div>

          {/* Breadcrumbs */}
          <div className="px-6 py-2 flex items-center gap-2 text-sm text-gray-600">
            <Home size={16} />
            <a href="#" className="hover:text-blue-600">الرئيسية</a>
            <ChevronLeft size={16} />
            <Video size={16} />
            <span className="font-semibold text-gray-900">الحصص</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {sessionsError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-3">
                <AlertCircle size={20} />
                حدث خطأ في تحميل البيانات
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex gap-2">
                <button 
                  onClick={() => openCreateModal('single')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus size={18} />
                  <span>حصة واحدة</span>
                </button>

                <button 
                  onClick={() => openCreateModal('bulk')}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  <Plus size={18} />
                  <span>حصص متعددة</span>
                </button>
              </div>

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="بحث عن الطالب أو المعلم أو المادة..."
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                  {/* الحالة */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الحالة
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="all">الكل</option>
                      <option value="scheduled">مجدولة</option>
                      <option value="completed">مكتملة</option>
                      <option value="cancelled">ملغية</option>
                    </select>
                  </div>

                  {/* من تاريخ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      من تاريخ
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>

                  {/* إلى تاريخ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      إلى تاريخ
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    />
                  </div>

                </div>
              </div>
            )}

            {/* Table */}
            {isLoading ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <p className="mt-4 text-gray-600">جاري التحميل...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">العنوان</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الطالب</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">المعلم</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">المادة</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">التاريخ والوقت</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">المدة</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الحالة</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredSessions.length > 0 ? (
                        filteredSessions.map((session: SessionData) => {
                          const statusStyle = getStatusColor(session.status);
                          return (
                            <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{session.title}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{session.student_name}</td>
                              <td className="px-6 py-4 text-sm text-gray-700">{session.teacher_name}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                                  {session.subject_name}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex flex-col gap-1">
                                  <span className="text-gray-900 font-medium">{session.session_date}</span>
                                  <span className="text-gray-500 text-xs flex items-center gap-1">
                                    <Clock size={12} />
                                    {session.start_time} - {session.end_time}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">{session.duration_minutes} د</td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>
                                  {getStatusText(session.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => setDeleteConfirmId(session.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="حذف"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-medium">
                            لا توجد حصص
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          total={totalSessions}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">حذف الحصة</h2>
            <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذه الحصة؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'جاري...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Bulk Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'single' ? 'إضافة حصة واحدة' : 'إضافة حصص متعددة'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {modalMode === 'single' ? (
                // Single Session Form
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">الطالب *</label>
                      <select
                        value={singleForm.student_id}
                        onChange={(e) => setSingleForm({ ...singleForm, student_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">اختر الطالب</option>
                        {students.map(student => (
                          <option key={student.id} value={student.id}>{student.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">المعلم *</label>
                      <select
                        value={singleForm.teacher_id}
                        onChange={(e) => setSingleForm({ ...singleForm, teacher_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">اختر المعلم</option>
                        {teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">المادة *</label>
                      <select
                        value={singleForm.subject_id}
                        onChange={(e) => setSingleForm({ ...singleForm, subject_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">اختر المادة</option>
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.id}>{subject.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">العنوان *</label>
                      <input
                        type="text"
                        value={singleForm.title}
                        onChange={(e) => setSingleForm({ ...singleForm, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="عنوان الحصة"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                    <textarea
                      value={singleForm.description}
                      onChange={(e) => setSingleForm({ ...singleForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                      placeholder="وصف الحصة"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الحصة *</label>
                      <input
                        type="date"
                        value={singleForm.session_date}
                        onChange={(e) => setSingleForm({ ...singleForm, session_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">رابط الاجتماع</label>
                      <input
                        type="url"
                        value={singleForm.meeting_link}
                        onChange={(e) => setSingleForm({ ...singleForm, meeting_link: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://zoom.us/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">وقت البداية *</label>
                      <input
                        type="time"
                        value={singleForm.start_time}
                        onChange={(e) => setSingleForm({ ...singleForm, start_time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">وقت النهاية *</label>
                      <input
                        type="time"
                        value={singleForm.end_time}
                        onChange={(e) => setSingleForm({ ...singleForm, end_time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                    <textarea
                      value={singleForm.notes}
                      onChange={(e) => setSingleForm({ ...singleForm, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                      placeholder="ملاحظات إضافية"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSubmitSingle}
                      disabled={createSingleMutation.isPending}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                    >
                      {createSingleMutation.isPending ? 'جاري...' : 'إضافة الحصة'}
                    </button>
                  </div>
                </div>
              ) : (
                // Bulk Sessions Form
                <div className="space-y-4">
                  {!showPreview ? (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">الطالب *</label>
                          <select
                            value={bulkForm.student_id}
                            onChange={(e) => setBulkForm({ ...bulkForm, student_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">اختر الطالب</option>
                            {students.map(student => (
                              <option key={student.id} value={student.id}>{student.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">المعلم *</label>
                          <select
                            value={bulkForm.teacher_id}
                            onChange={(e) => setBulkForm({ ...bulkForm, teacher_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">اختر المعلم</option>
                            {teachers.map(teacher => (
                              <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">المادة *</label>
                          <select
                            value={bulkForm.subject_id}
                            onChange={(e) => setBulkForm({ ...bulkForm, subject_id: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">اختر المادة</option>
                            {subjects.map(subject => (
                              <option key={subject.id} value={subject.id}>{subject.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">الشهر والسنة *</label>
                          <input
                            type="month"
                            value={bulkForm.monthYear}
                            onChange={(e) => setBulkForm({ ...bulkForm, monthYear: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">أيام الأسبوع والأوقات *</label>
                        <div className="grid grid-cols-2 gap-3">
                          {bulkForm.weekDays.map((day, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg">
                              <input
                                type="checkbox"
                                checked={day.selected}
                                onChange={(e) => {
                                  const newDays = [...bulkForm.weekDays];
                                  newDays[index].selected = e.target.checked;
                                  setBulkForm({ ...bulkForm, weekDays: newDays });
                                }}
                                className="w-4 h-4 rounded"
                              />
                              <span className="flex-1 text-sm font-medium">{day.day}</span>
                              <input
                                type="time"
                                value={day.time}
                                onChange={(e) => {
                                  const newDays = [...bulkForm.weekDays];
                                  newDays[index].time = e.target.value;
                                  setBulkForm({ ...bulkForm, weekDays: newDays });
                                }}
                                disabled={!day.selected}
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={closeModal}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={generateBulkPreview}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        >
                          <span>معاينة</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">معاينة الحصص ({previewSchedule.length})</h3>
                        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-100 sticky top-0">
                              <tr>
                                <th className="px-4 py-2 text-right font-semibold">#</th>
                                <th className="px-4 py-2 text-right font-semibold">التاريخ</th>
                                <th className="px-4 py-2 text-right font-semibold">الوقت</th>
                              </tr>
                            </thead>
                            <tbody>
                              {previewSchedule.map((session, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-2">{idx + 1}</td>
                                  <td className="px-4 py-2">{session.session_date}</td>
                                  <td className="px-4 py-2">{session.start_time} - {session.end_time}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowPreview(false)}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          رجوع
                        </button>
                        <button
                          onClick={handleSubmitBulk}
                          disabled={createBulkMutation.isPending}
                          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                        >
                          {createBulkMutation.isPending ? 'جاري...' : `إضافة ${previewSchedule.length} حصة`}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}