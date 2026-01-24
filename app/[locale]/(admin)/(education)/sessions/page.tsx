"use client";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Video,
  Search,
  Plus,
  Trash2,
  Filter,
  Menu,
  AlertCircle,
  Loader,
  Clock,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import SessionModal from '@/components/sessions/createmultisessions';
import { Modal } from 'antd';
import SessionAttendance from '@/components/sessions/SessionAttendance';
import { utcToLocalDate, utcToLocalDateTime, utcToLocalTime } from '@/utils/date';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

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

export default function SessionsPage() {
  const t = useTranslations('AdminSessions');
  const tCommon = useTranslations('Common');
  const queryClient = useQueryClient();
  const params = useParams();
  const isRTL = params.locale === 'ar';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'single' | 'bulk'>('single');
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // filters data
  const [filteredData, setFilteredData] = useState<any>({
    "variation": "all",
    "student": "all",
    "teacher": "all",
    "subject": "all",
  });

  const [sessionData, setSessionData] = useState<SessionData[]>([]);
  const [viewSessionModal, setViewSessionModal] = useState<boolean>(false);

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
    switch (status) {
      case 'completed': return t('completed');
      case 'scheduled': return t('scheduled');
      case 'cancelled': return t('cancelled');
      default: return status;
    }
  };

  // Fetch sessions
  const { data: sessionsData, isLoading, error: sessionsError } = useQuery({
    queryKey: ['sessions', searchQuery, statusFilter, currentPage, fromDate, toDate , filteredData],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (fromDate) params.append('from_date', fromDate);
      if (toDate) params.append('to_date', toDate);
      params.append('page', currentPage.toString());
      if (filteredData.variation !== 'all') params.append("variation", filteredData.variation);
      if (filteredData.student !== 'all') params.append("student", filteredData.student);
      if (filteredData.teacher !== 'all') params.append("teacher", filteredData.teacher);
      if (filteredData.subject !== 'all') params.append("subject", filteredData.subject);
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
  const sessions = sessionsData?.data?.sessions || [];
  const subjects = allData?.data?.subjects || [];
  
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
      toast.success(t('successAdd'));
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setShowModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('errorAdd'));
    }
  });

  // Create bulk sessions
  const createBulkMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/sessions/bulk', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('successBulkAdd'));
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setShowModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('errorAdd'));
    }
  });

  // Delete session
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/sessions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('successDelete'));
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('errorDelete'));
    }
  });

  const openCreateModal = (mode: 'single' | 'bulk') => {
    setModalMode(mode);
    setShowModal(true);
  };

  const handleViewAttendance = (session: any) => {
    setSessionData(session);

    setViewSessionModal(true)
  }

  const handleModalSubmit = (data: any, mode: 'single' | 'bulk') => {
    if (mode === 'single') {
      createSingleMutation.mutate(data);
    } else {
      createBulkMutation.mutate(data);
    }
  };

  return (
    <div className="flex bg-gray-50 dark:bg-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
            <div></div>
          </div>

          {/* Breadcrumbs */}
          <div className="px-6 py-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Home size={16} />
            <a href="#" className="hover:text-blue-600">{tCommon('dashboard')}</a>
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            <Video size={16} />
            <span className="font-semibold text-gray-900 dark:text-gray-100">{t('title')}</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {sessionsError && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-3">
                <AlertCircle size={20} />
                {t('errorLoading')}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex gap-2 flex-col md:flex-row">
                <button 
                  onClick={() => openCreateModal('single')}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus size={18} />
                  <span>{t('singleSession')}</span>
                </button>

                <button 
                  onClick={() => openCreateModal('bulk')}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  <Plus size={18} />
                  <span>{t('bulkSessions')}</span>
                </button>
              </div>

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-4 py-2 ${isRTL ? 'pr-10' : 'pl-10'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <Search size={18} className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} />
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
                <span>{tCommon('filters')}</span>
              </button>
            </div>

            {/* Filters Dropdown */}
            {showFilters && (
              <div className="mb-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('status')}
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">{t('all')}</option>
                      <option value="scheduled">{t('scheduled')}</option>
                      <option value="completed">{t('completed')}</option>
                      <option value="cancelled">{t('cancelled')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('fromDate')}
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('toDate')}
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    />
                  </div>

                  {/* filter viration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('filterVariation')}
                    </label>
                    <select
                      value={filteredData.variation}
                      onChange={(e) => setFilteredData({ ...filteredData, variation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">{t('all')}</option>
                      <option value="today">{t('today')}</option>
                      <option value="week">{t('week')}</option>
                      <option value="month">{t('month')}</option>
                    </select>
                  </div>

                  {/* filter teacher */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('filterTeacher')}
                    </label>
                    <select
                      value={filteredData.teacher}
                      onChange={(e) => setFilteredData({ ...filteredData, teacher: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">{t('all')}</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* filter student */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('filterStudent')}
                    </label>
                    <select
                      value={filteredData.student}
                      onChange={(e) => setFilteredData({ ...filteredData, student: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">{t('all')}</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filter subjects */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('filterSubject')}
                    </label>
                    <select
                      value={filteredData.subject}
                      onChange={(e) => setFilteredData({ ...filteredData, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    >
                      <option value="all">{t('all')}</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            {isLoading ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">{tCommon('loading')}</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-gray-900`}>{t('sessionTitle')}</th>
                        <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-gray-900`}>{t('student')}</th>
                        <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-gray-900`}>{t('teacher')}</th>
                        <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-gray-900`}>{t('subject')}</th>
                        <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-gray-900`}>{t('dateTime')}</th>
                        <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-gray-900`}>{t('duration')}</th>
                        <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-gray-900`}>{t('status')}</th>
                        <th className={`px-6 py-3 ${isRTL ? 'text-right' : 'text-left'} text-sm font-semibold text-gray-900`}>{t('attendanceData')}</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">{tCommon('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredSessions.length > 0 ? (
                        filteredSessions.map((session: SessionData) => {
                          const statusStyle = getStatusColor(session.status);
                          return (
                            <tr key={session.id} className="hover:bg-gray-50 dark:bg-slate-900 transition-colors">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{session.title}</td>
                              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{session.student_name}</td>
                              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{session.teacher_name}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700">
                                  {session.subject_name}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex flex-col gap-1">
                                  <span className="text-gray-900 dark:text-gray-100 font-medium">{utcToLocalDate(session.session_date)}</span>
                                  <span className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1">
                                    <Clock size={12} />
                                    {utcToLocalTime(session.start_time)} - {utcToLocalTime(session.end_time)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{t('minutes', { count: session.duration_minutes })}</td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>
                                  {getStatusText(session.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleViewAttendance(session)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors"
                                    title={t('viewAttendance')}
                                  >
                                    <Eye size={16} />
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => setDeleteConfirmId(session.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors"
                                    title={tCommon('delete')}
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
                          <td colSpan={9} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                            {t('noSessions')}
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
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('deleteSession')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('deleteConfirm')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:bg-slate-900 transition-colors font-medium"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {deleteMutation.isPending ? t('deleting') : tCommon('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* view attendance modal */}
      <Modal
      open={viewSessionModal}
      onCancel={() => setViewSessionModal(false)}
      title={t('viewAttendance')}
      footer={null}
      >
        {
          sessionData && (
            <div className="w-full h-full">
              <SessionAttendance sessionData={sessionData} />
            </div>
          )
        }
      </Modal>

      {/* Session Modal */}
      <SessionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        students={students}
        teachers={teachers}
        onSubmit={handleModalSubmit}
        isSubmitting={createSingleMutation.isPending || createBulkMutation.isPending}
        axiosInstance={axiosInstance}
      />

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