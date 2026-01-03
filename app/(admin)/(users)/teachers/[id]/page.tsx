"use client";
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { 
    User, Mail, Phone, Calendar, CreditCard, BookOpen, 
    CheckCircle, Clock, MessageCircle, ArrowRight,
    GraduationCap, DollarSign, Users, ClipboardList,
    FileText, Award
} from 'lucide-react';
import { useParams } from 'next/navigation';

interface Teacher {
    id: number;
    name: string;
    email: string;
    phone: string;
    hourly_rate: string;
    currency: string;
    image: string;
    subjects: string;
    status: string;
    created_at: string;
}

interface Student {
    id: number;
    name: string;
    email: string;
    phone: string;
    gender: string;
    image: string | null;
    plan: {
        id: number;
        name: string;
        price: string;
        currency: string;
        sessions_remaining: number;
        sessions_used: number;
        total_sessions: number;
    };
    status: string;
    created_at: string;
}

interface Statistics {
    students_count: number;
    sessions_today: number;
    sessions_completed: number;
    sessions_upcoming: number;
}

interface Salary {
  total_hours: number;
  hourly_rate: number;          // رقم مش string
  currency: string;

  total_earned: number;         // إجمالي الأرباح
  paid_amount: number;          // أرباح تم صرفها
  pending_amount: number;       // أرباح معلّقة

  available_balance: number;    // رصيد متاح للسحب
  pending_withdraw: number;     // طلبات سحب معلّقة
}


interface Session {
    id: number;
    title: string;
    session_date: string;
    start_time: string;
    end_time: string;
    duration_minutes: number;
    status: string;
    meeting_link: string | null;
    student_name: string;
    subject_name: string;
}

interface Homework {
    id: number;
    title: string;
    description: string;
    due_date: string;
    status: string;
    grade: string;
    student_name: string;
}

interface Exam {
    id: number;
    title: string;
    description: string;
    exam_date: string;
    start_time: string;
    total_marks: string;
    status: string;
    subject_name: string;
}

interface TeacherData {
    teacher: Teacher;
    students: Student[];
    statistics: Statistics;
    salary: Salary;
    upcoming_sessions: Session[];
    recent_homework: Homework[];
    upcoming_exams: Exam[];
}

interface ApiResponse {
    success: boolean;
    data: TeacherData;
}

const getCurrencySymbol = (currencyCode: string): string => {
    const currencyMap: Record<string, string> = {
        'SAR': 'ر.س', 'EGP': 'ج.م', 'EG': 'ج.م', 'AED': 'د.إ', 'USD': '$', 'EUR': '€', 'GBP': '£',
        'KWD': 'د.ك', 'QAR': 'ر.ق', 'OMR': 'ر.ع', 'BHD': 'د.ب', 'JOD': 'د.أ',
        'TRY': '₺', 'INR': '₹', 'PKR': '₨',
    };
    return currencyMap[currencyCode] || currencyCode;
};

export default function TeacherPage() {
    const params = useParams();
    const id = params.id as string;

    const { data: teacherData, isLoading, isError } = useQuery({
        queryKey: ['teacher', id],
        queryFn: async () => {
            const { data } = await axiosInstance.get<ApiResponse>(`/teachers/${id}`);
            return data.data;
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!id
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-700">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (isError || !teacherData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center border border-gray-200">
                    <p className="text-red-600 text-lg mb-4">حدث خطأ في تحميل بيانات المعلم</p>
                    <button 
                        onClick={() => window.history.back()}
                        className="text-blue-600 hover:text-blue-700 underline"
                    >
                        العودة
                    </button>
                </div>
            </div>
        );
    }

    const { teacher, students, statistics, salary, upcoming_sessions, recent_homework, upcoming_exams } = teacherData;

    // Get unique students
    const uniqueStudents = Array.from(
        new Map(students.map(student => [student.id, student])).values()
    );

    return (
         <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
            <div className="max-w-7xl mx-auto">

                {/* Back Button */}
                <div className="mb-4 sm:mb-6">
                <button
                    onClick={() => window.history.back()}
                    className="
                    w-full sm:w-auto
                    flex items-center justify-center sm:justify-start gap-2
                    bg-white hover:bg-gray-50 text-gray-700
                    px-4 py-2 rounded-lg border border-gray-300
                    transition-colors shadow-sm text-sm
                    "
                >
                    <ArrowRight size={18} className="text-green-600" />
                    <span>العودة لقائمة المعلمين</span>
                </button>
                </div>

                {/* ================= Profile Card ================= */}
                <div className="bg-white rounded-xl shadow border border-gray-200 mb-6">
                    <div className="p-4 sm:p-6">

                        {/* Header */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">

                        {/* Avatar & Info */}
                        <div className="flex items-center gap-4 sm:gap-6 flex-1">
                            <div className="hidden sm:flex w-20 h-20 sm:w-24 sm:h-24 
                            bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center
                             justify-center shadow">
                                <GraduationCap size={40} className="text-white" />
                            </div>

                            <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                                {teacher.name}
                            </h1>

                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-gray-600 text-sm mb-2">
                                <div className="flex items-center gap-2">
                                <Mail size={14} />
                                <span>{teacher.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                <Phone size={14} />
                                <span>{teacher.phone}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm">
                                <Award size={14} />
                                <span>{teacher.subjects}</span>
                            </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 w-full lg:w-auto">
                            <button className="flex-1 lg:flex-none p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow">
                            <MessageCircle size={20} />
                            </button>
                            <button className="flex-1 lg:flex-none p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow">
                            <Mail size={20} />
                            </button>
                            <button className="flex-1 lg:flex-none p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg shadow">
                            <Phone size={20} />
                            </button>
                        </div>
                        </div>

                        {/* Rate & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-xs text-gray-600">السعر بالساعة</p>
                            <p className="font-bold text-xl">
                            {teacher.hourly_rate} {getCurrencySymbol(teacher.currency)}
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-xs text-gray-600">الحالة</p>
                            <p className="font-bold text-xl">
                            {teacher.status === 'active' ? 'نشط' : 'غير نشط'}
                            </p>
                        </div>
                        </div>

                        {/* Statistics */}
                        <h3 className="text-lg sm:text-xl font-bold mb-4">الإحصائيات</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard icon={Users} label="عدد الطلاب" value={statistics.students_count} />
                        <StatCard icon={Calendar} label="حصص اليوم" value={statistics.sessions_today} />
                        <StatCard icon={CheckCircle} label="حصص مكتملة" value={statistics.sessions_completed} />
                        <StatCard icon={Clock} label="حصص قادمة" value={statistics.sessions_upcoming} />
                        </div>
                    </div>
                </div>

                {/* Salary */}
                {/* Salary Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <DollarSign className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">تفاصيل الأرباح</h2>
                    </div>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

                    {/* Total Hours */}
                    <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                    <p className="text-sm text-gray-500 mb-1">إجمالي الساعات</p>
                    <p className="text-2xl font-semibold text-gray-800">
                        {salary.total_hours || 0}
                    </p>
                    </div>

                    {/* Hourly Rate */}
                    <div className="p-4 rounded-lg border border-gray-100 bg-gray-50">
                    <p className="text-sm text-gray-500 mb-1">السعر / ساعة</p>
                    <p className="text-2xl font-semibold text-gray-800">
                        {salary.hourly_rate || 0} {salary.currency || ''}
                    </p>
                    </div>

                    {/* Total Earned */}
                    <div className="p-4 rounded-lg border border-emerald-100 bg-emerald-50">
                    <p className="text-sm text-emerald-700 mb-1">إجمالي الأرباح</p>
                    <p className="text-2xl font-bold text-emerald-800">
                        {(salary.total_earned || 0).toFixed(2)}
                    </p>
                    </div>

                    {/* Paid Earnings */}
                    <div className="p-4 rounded-lg border border-blue-100 bg-blue-50">
                    <p className="text-sm text-blue-700 mb-1">أرباح تم صرفها</p>
                    <p className="text-2xl font-bold text-blue-800">
                        {(salary.paid_amount || 0).toFixed(2)}
                    </p>
                    </div>

                    {/* Pending Earnings */}
                    <div className="p-4 rounded-lg border border-yellow-100 bg-yellow-50">
                    <p className="text-sm text-yellow-700 mb-1">أرباح معلّقة</p>
                    <p className="text-2xl font-bold text-yellow-800">
                        {(salary.pending_amount || 0).toFixed(2)}
                    </p>
                    </div>

                    {/* Available Balance */}
                    <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-100">
                    <p className="text-sm text-emerald-700 mb-1">رصيد متاح للسحب</p>
                    <p className="text-3xl font-extrabold text-emerald-900">
                        {(salary.available_balance || 0).toFixed(2)}
                    </p>
                    </div>

                    {/* Pending Withdraw */}
                    <div className="p-4 rounded-lg border border-red-100 bg-red-50">
                    <p className="text-sm text-red-700 mb-1">طلبات سحب معلّقة</p>
                    <p className="text-2xl font-bold text-red-800">
                        {(salary.pending_withdraw || 0).toFixed(2)}
                    </p>
                    </div>

                </div>
                </div>

            </div>
        </div>
    );
}


function StatCard({ icon: Icon, label, value }: any) {
  return (
    <div className="bg-gray-50 border rounded-lg p-4">
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <Icon size={16} />
        <span>{label}</span>
      </div>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function SalaryItem({ label, value }: any) {
  return (
    <div>
      <p className="text-green-100 text-sm">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}