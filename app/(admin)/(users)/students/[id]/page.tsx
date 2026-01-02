"use client"
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { 
    User, Mail, Phone, Calendar, CreditCard, BookOpen, 
    CheckCircle, Clock, MessageCircle, ArrowRight,
    GraduationCap, UserCog
} from 'lucide-react';

interface StudentData {
    id: number;
    user_id: number;
    name: string;
    email: string;
    phone: string;
    country_code: string;
    gender: string;
    birth_date: string;
    image: string | null;
    plan_id: number;
    status: string;
    created_at: string;
    updated_at: string;
    completed_sessions: number;
    homework_count: number;
    pending_homework: number;
    plan: Array<{
        id: number;
        name: string;
        description: string;
        sessions_count: number;
        price: string;
        currency: string;
        status: string;
        created_at: string;
        updated_at: string;
        student_id: number;
        plan_id: number;
        start_date: string;
        end_date: string;
        sessions_remaining: number;
        sessions_used: number;
        total_sessions: number;
    }>;
    active_subscription: {
        id: number;
        student_id: number;
        plan_id: number;
        status: string;
        start_date: string;
        end_date: string;
        sessions_remaining: number;
        sessions_used: number;
        total_sessions: number;
        created_at: string;
        updated_at: string;
    };
    parents: Array<{
        id: number;
        name: string;
        email: string;
        phone: string;
        country_code: string;
    }>;
    total_sessions: number;
    attended_sessions: number;
    remaining_sessions: number;
    plan_name: string;
    plan_price: string;
    plan_currency: string;
    join_date: string;
}

interface ApiResponse {
    success: boolean;
    data: StudentData;
}

const getCurrencySymbol = (currencyCode: string): string => {
    const currencyMap: Record<string, string> = {
        'SAR': 'ر.س', 'EGP': 'ج.م', 'EG': 'ج.م', 'AED': 'د.إ', 'USD': '$', 'EUR': '€', 'GBP': '£',
        'KWD': 'د.ك', 'QAR': 'ر.ق', 'OMR': 'ر.ع', 'BHD': 'د.ب', 'JOD': 'د.أ',
        'TRY': '₺', 'INR': '₹', 'PKR': '₨',
    };
    return currencyMap[currencyCode] || currencyCode;
};

export default function StudentPage() {
    const params = { id: window.location.pathname.split('/').pop() };
    const id = params.id as string;

    const { data: studentData, isLoading, isError } = useQuery({
        queryKey: ['student', id],
        queryFn: async () => {
            const { data } = await axiosInstance.get<ApiResponse>(`/students/${id}`);
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

    if (isError || !studentData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center border border-gray-200">
                    <p className="text-red-600 text-lg mb-4">حدث خطأ في تحميل بيانات الطالب</p>
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

    const subscription = studentData.active_subscription;
    const attendedSessions = subscription?.sessions_used || 0;
    const remainingSessions = subscription?.sessions_remaining || 0;
    const totalSessions = subscription?.total_sessions || studentData.total_sessions || 0;

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
                        <span>العودة لقائمة الطلاب</span>
                    </button>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
                    <div className="p-6">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
                            {/* Avatar & Info */}
                            <div className="flex items-center gap-6 flex-1">
                                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                    <GraduationCap size={48} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{studentData.name}</h1>
                                    <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Mail size={16} />
                                            <span>{studentData.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2" dir="ltr">
                                            <Phone size={16} />
                                            <span>{studentData.country_code} {studentData.phone}</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-gray-500 text-sm">
                                        تاريخ الانضمام: {new Date(studentData.created_at).toLocaleDateString('ar-EG')}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const cleanCode = studentData.country_code.replace('+', '').trim();
                                        const cleanPhone = studentData.phone.trim();
                                        window.open(`https://wa.me/${cleanCode}${cleanPhone}`, '_blank');
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

                        {/* Plan & Teacher Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Plan Card */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <CreditCard size={24} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">الباقة الحالية</p>
                                        <p className="text-gray-900 font-bold text-lg">{studentData.plan_name || 'بدون باقة'}</p>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <p className="text-gray-600 text-sm">السعر</p>
                                    <p className="text-blue-600 font-bold text-xl">
                                        {studentData.plan_price} {getCurrencySymbol(studentData.plan_currency)}
                                    </p>
                                </div>
                            </div>

                            {/* Status Card */}
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <CheckCircle size={24} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">حالة الطالب</p>
                                        <p className="text-gray-900 font-bold text-lg">
                                            {studentData.status === 'active' ? 'نشط' : 'غير نشط'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <p className="text-gray-600 text-sm">النوع</p>
                                    <p className="text-green-600 font-bold text-xl">{studentData.gender}</p>
                                </div>
                            </div>
                        </div>

                        {/* Sessions Stats */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">إحصائيات الحصص</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Total Sessions */}
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Clock size={20} className="text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-sm">إجمالي الحصص</p>
                                            <p className="text-gray-900 font-bold text-2xl">{totalSessions}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Attended */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                            <CheckCircle size={20} className="text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-sm">محضورة</p>
                                            <p className="text-green-600 font-bold text-2xl">{attendedSessions}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Remaining */}
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                            <Clock size={20} className="text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-sm">المتبقية</p>
                                            <p className="text-orange-600 font-bold text-2xl">{remainingSessions}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Homework */}
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <BookOpen size={20} className="text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-gray-600 text-sm">الواجبات</p>
                                            <p className="text-purple-600 font-bold text-2xl">{studentData.homework_count || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Parents Section */}
                {studentData.parents && studentData.parents.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">أولياء الأمور</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {studentData.parents.map(parent => (
                                <div 
                                    key={parent.id} 
                                    className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                                            <User size={24} className="text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-gray-900 font-bold">{parent.name}</h4>
                                            <p className="text-gray-600 text-sm">{parent.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600 text-sm" dir="ltr">
                                        <Phone size={16} />
                                        <span>{parent.country_code} {parent.phone}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Subscription Details */}
                {subscription && (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">تفاصيل الاشتراك</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">تاريخ البداية</p>
                                <p className="text-gray-900 font-bold text-lg">
                                    {new Date(subscription.start_date).toLocaleDateString('ar-EG')}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm mb-1">تاريخ النهاية</p>
                                <p className="text-gray-900 font-bold text-lg">
                                    {new Date(subscription.end_date).toLocaleDateString('ar-EG')}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm mb-1">حالة الاشتراك</p>
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                                    subscription.status === 'active' 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {subscription.status === 'active' ? 'نشط' : 'غير نشط'}
                                </span>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm mb-1">معرف الاشتراك</p>
                                <p className="text-gray-900 font-bold text-lg">#{subscription.id}</p>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}