"use client"
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Calendar, Clock, User, BookOpen, Video, FileText, Save, X, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';

type SessionStatus = 'scheduled' | 'completed' | 'cancelled' | 'missed';

interface Student {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  country_code: string;
  gender: string;
  birth_date: string;
  image: string;
  plan_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Subject {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Session {
  id: number;
  student_id: number;
  teacher_id: number;
  subject_id: number;
  subscription_id: number;
  title: string;
  description: string;
  session_date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: SessionStatus;
  meeting_link: string;
  notes: string;
  created_at: string;
  updated_at: string;
  student: Student;
  subject: Subject;
}

interface ApiResponse {
  success: boolean;
  data: Session;
}

interface UpdateSessionData {
  notes: string;
  status: SessionStatus;
}

interface SessionPageProps {
  sessionId?: string;
}

export default function SessionPage() {

  const param=useParams();
  const sessionId = param.id;

  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<UpdateSessionData>({
    notes: '',
    status: 'scheduled'
  });

  const { data: session, isLoading, error } = useQuery<Session>({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse>(`/teacher/sessions/${sessionId}`);
      const sessionData = response.data.data;
      setFormData({
        notes: sessionData.notes || '',
        status: sessionData.status
      });
      return sessionData;
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateSessionData) => {
      const response = await axiosInstance.put<ApiResponse>(`/teacher/sessions/${sessionId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['teacher-sessions'] });
      toast.success('تم التحديث بنجاح');
      setIsModalOpen(false);
    }
  });

  const handleOpenModal = () => {
    setFormData({
      notes: session?.notes || '',
      status: session?.status || 'scheduled'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      notes: session?.notes || '',
      status: session?.status || 'scheduled'
    });
  };

  const handleSubmit = () => {
    updateMutation.mutate(formData);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string): string => {
    return new Date(timeString).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: SessionStatus): string => {
    const colors: Record<SessionStatus, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      missed: 'bg-gray-100 text-gray-800'
    };
    return colors[status];
  };

  const getStatusText = (status: SessionStatus): string => {
    const texts: Record<SessionStatus, string> = {
      scheduled: 'مجدولة',
      completed: 'مكتملة',
      cancelled: 'ملغاة',
      missed: 'فائتة'
    };
    return texts[status];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
          حدث خطأ في تحميل البيانات
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header Section */}
      <div className="bg-gradient-to-l from-blue-600 to-blue-700 px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">{session.title}</h1>
              <p className="text-blue-100 text-sm sm:text-base">{session.description}</p>
            </div>
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium shadow-lg whitespace-nowrap"
            >
              <Edit className="w-4 h-4" />
              تعديل الحصة
            </button>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
            {getStatusText(session.status)}
          </span>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Session Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Date & Time Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">تفاصيل الموعد</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 mb-1">تاريخ الحصة</p>
                    <p className="text-gray-900 font-semibold text-sm break-words">{formatDate(session.session_date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 mb-1">وقت الحصة</p>
                    <p className="text-gray-900 font-semibold text-sm">
                      {formatTime(session.start_time)} - {formatTime(session.end_time)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">المدة: {session.duration_minutes} دقيقة</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Meeting Link Card */}
            {session.meeting_link && (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">رابط الاجتماع</h2>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-l from-blue-50 to-blue-100 rounded-lg">
                  <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                    <Video className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <a
                      href={session.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm break-all"
                    >
                      {session.meeting_link}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Notes Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">الملاحظات</h2>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                  {session.notes || 'لا توجد ملاحظات'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Student & Subject Info */}
          <div className="space-y-4 sm:space-y-6">
            {/* Student Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">معلومات الطالب</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">الاسم</p>
                  <p className="text-gray-900 font-semibold text-sm">{session.student.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">البريد الإلكتروني</p>
                  <p className="text-gray-900 text-sm break-all">{session.student.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">رقم الهاتف</p>
                  <p className="text-gray-900 text-sm">{session.student.country_code} {session.student.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">الجنس</p>
                  <p className="text-gray-900 text-sm">{session.student.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                </div>
              </div>
            </div>

            {/* Subject Card */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-green-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">المادة الدراسية</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: session.subject.color }}
                  ></div>
                  <p className="text-gray-900 font-semibold text-sm">{session.subject.name}</p>
                </div>
                {session.subject.description && (
                  <p className="text-gray-600 text-sm">{session.subject.description}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-l from-blue-600 to-blue-700 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-lg sm:text-xl font-bold text-white">تعديل الحصة</h3>
              <button
                onClick={handleCloseModal}
                className="p-1.5 hover:bg-blue-500 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  حالة الحصة
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as SessionStatus })}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                >
                  <option value="scheduled">مجدولة</option>
                  <option value="completed">مكتملة</option>
                  <option value="cancelled">ملغاة</option>
                  <option value="missed">فائتة</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline ml-1" />
                  الملاحظات
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none text-sm"
                  placeholder="أضف ملاحظاتك هنا..."
                />
              </div>

              {updateMutation.isError && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  حدث خطأ أثناء حفظ التعديلات. الرجاء المحاولة مرة أخرى.
                </div>
              )}

              {updateMutation.isSuccess && (
                <div className="bg-green-50 border-2 border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
                  تم حفظ التعديلات بنجاح
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-2 sm:gap-3 rounded-b-xl border-t">
              <button
                onClick={handleSubmit}
                disabled={updateMutation.isPending}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm order-1 sm:order-2 sm:flex-1"
              >
                <Save className="w-4 h-4" />
                {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
              <button
                onClick={handleCloseModal}
                disabled={updateMutation.isPending}
                className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm order-2 sm:order-1"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}