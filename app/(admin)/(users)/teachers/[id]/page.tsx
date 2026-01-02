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
    hourly_rate: string;
    currency: string;
    total_earned: number;
    remaining: number;
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
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                
                {/* Back Button */}
                <div className="mb-6">
                    <button 
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg border border-gray-300 transition-colors shadow-sm"
                    >
                        <ArrowRight size={20} className="text-green-600" />
                        <span>العودة لقائمة المعلمين</span>
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
                    <div className="p-6">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                            {/* Avatar & Info */}
                            <div className="flex items-center gap-6 flex-1">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                                    <GraduationCap size={48} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{teacher.name}</h1>
                                    <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm mb-2">
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} />
                                            <span>{teacher.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2" dir="ltr">
                                            <Phone size={16} />
                                            <span>{teacher.phone}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-purple-600 font-semibold">
                                        <Award size={16} />
                                        <span>{teacher.subjects}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        window.open(`https://wa.me/${teacher.phone}`, '_blank');
                                    }}
                                    className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-md"
                                >
                                    <MessageCircle size={20} />
                                </button>
                                <button className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-md">
                                    <Mail size={20} />
                                </button>
                                <button className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors shadow-md">
                                    <Phone size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Rate & Status */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Hourly Rate */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <DollarSign size={24} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">السعر بالساعة</p>
                                        <p className="text-gray-900 font-bold text-lg">
                                            {teacher.hourly_rate} {getCurrencySymbol(teacher.currency)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <CheckCircle size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">الحالة</p>
                                        <p className="text-gray-900 font-bold text-lg">
                                            {teacher.status === 'active' ? 'نشط' : 'غير نشط'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <p className="text-gray-600 text-sm">تاريخ الانضمام</p>
                                    <p className="text-blue-600 font-bold">
                                        {new Date(teacher.created_at).toLocaleDateString('ar-EG')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">الإحصائيات</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Students Count */}
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <Users size={20} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-sm">عدد الطلاب</p>
                                            <p className="text-gray-900 font-bold text-2xl">{statistics.students_count}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sessions Today */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Calendar size={20} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-sm">حصص اليوم</p>
                                            <p className="text-blue-600 font-bold text-2xl">{statistics.sessions_today}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Completed Sessions */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <CheckCircle size={20} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-sm">حصص مكتملة</p>
                                            <p className="text-green-600 font-bold text-2xl">{statistics.sessions_completed}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Upcoming Sessions */}
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <Clock size={20} className="text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-sm">حصص قادمة</p>
                                            <p className="text-orange-600 font-bold text-2xl">{statistics.sessions_upcoming}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Salary Card */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 mb-6 text-white">
                    <h3 className="text-2xl font-bold mb-4">الراتب والأرباح</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-green-100 text-sm mb-1">إجمالي الساعات</p>
                            <p className="text-3xl font-bold">{salary.total_hours}</p>
                        </div>
                        <div>
                            <p className="text-green-100 text-sm mb-1">إجمالي الأرباح</p>
                            <p className="text-3xl font-bold">
                                {salary.total_earned} {getCurrencySymbol(salary.currency)}
                            </p>
                        </div>
                        <div>
                            <p className="text-green-100 text-sm mb-1">المتبقي</p>
                            <p className="text-3xl font-bold">
                                {salary.remaining} {getCurrencySymbol(salary.currency)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Students List */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Users size={24} className="text-purple-600" />
                            الطلاب ({uniqueStudents.length})
                        </h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {uniqueStudents.map(student => (
                                <div 
                                    key={student.id} 
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                                                <User size={20} className="text-white" />
                                            </div>
                                            <div>
                                                <h4 className="text-gray-900 font-bold">{student.name}</h4>
                                                <p className="text-gray-600 text-sm">{student.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-gray-600 text-xs">{student.plan?.name}</p>
                                            <p className="text-purple-600 font-bold text-sm">
                                                {student.plan?.sessions_remaining}/{student.plan?.total_sessions}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Sessions */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar size={24} className="text-blue-600" />
                            الحصص القادمة ({upcoming_sessions.length})
                        </h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {upcoming_sessions.slice(0, 5).map(session => (
                                <div 
                                    key={session.id} 
                                    className="bg-blue-50 border border-blue-200 rounded-lg p-4"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="text-gray-900 font-bold">{session.title}</h4>
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                            {session.status}
                                        </span>
                                    </div>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p className="flex items-center gap-2">
                                            <User size={14} />
                                            {session.student_name}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <BookOpen size={14} />
                                            {session.subject_name}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Calendar size={14} />
                                            {new Date(session.session_date).toLocaleDateString('ar-EG')}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Clock size={14} />
                                            {session.start_time} - {session.end_time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Homework */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ClipboardList size={24} className="text-orange-600" />
                            الواجبات الحديثة ({recent_homework.length})
                        </h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {recent_homework.slice(0, 5).map(homework => (
                                <div 
                                    key={homework.id} 
                                    className="bg-orange-50 border border-orange-200 rounded-lg p-4"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="text-gray-900 font-bold">{homework.title}</h4>
                                        <span className={`text-xs px-2 py-1 rounded-full ${
                                            homework.status === 'pending' 
                                                ? 'bg-yellow-100 text-yellow-700' 
                                                : 'bg-green-100 text-green-700'
                                        }`}>
                                            {homework.status === 'pending' ? 'معلق' : 'مكتمل'}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2">{homework.description}</p>
                                    <div className="flex items-center justify-between text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <User size={14} />
                                            {homework.student_name}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(homework.due_date).toLocaleDateString('ar-EG')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Upcoming Exams */}
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText size={24} className="text-red-600" />
                            الامتحانات القادمة ({upcoming_exams.length})
                        </h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {upcoming_exams.map(exam => (
                                <div 
                                    key={exam.id} 
                                    className="bg-red-50 border border-red-200 rounded-lg p-4"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="text-gray-900 font-bold">{exam.title}</h4>
                                        <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                            {exam.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-2">{exam.description}</p>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            <BookOpen size={14} />
                                            {exam.subject_name}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Award size={14} />
                                            {exam.total_marks} درجة
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(exam.exam_date).toLocaleDateString('ar-EG')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {exam.start_time}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}