'use client';

import { useState, useEffect } from 'react';
import {
    User, Calendar, CheckCircle, XCircle, Award, BookOpen,
    FileText, TrendingUp, Loader2, Phone, Mail, Clock
} from 'lucide-react';
import Link from 'next/link';

export default function ParentDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    async function fetchDashboardData() {
        try {
            const response = await fetch('https://perfect-due.com/api/parent/dashboard?parent_id=1');
            const result = await response.json();

            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('خطأ في جلب البيانات:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin" size={50} color="#3b82f6" />
            </div>
        );
    }

    const parent = data?.parent || {};
    const student = data?.student || {};
    const teacher = data?.teacher || {};
    const attendance = data?.attendance || {};
    const performance = data?.academic_performance || {};

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold mb-2">
                        مرحباً، {parent.name} 👋
                    </h1>
                    <p className="text-blue-100">
                        متابعة أداء ابنك/ابنتك
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6">
                {/* Student Info Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">معلومات الطالب</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold">
                                {student.name?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">{student.name}</h3>
                                <p className="text-gray-600 flex items-center gap-2 mt-1">
                                    <Mail size={16} />
                                    {student.student_email}
                                </p>
                                <p className="text-gray-600 flex items-center gap-2 mt-1">
                                    <Phone size={16} />
                                    {student.country_code} {student.phone}
                                </p>
                            </div>
                        </div>

                        {teacher && (
                            <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-semibold text-gray-900 mb-2">المعلم المسؤول</h4>
                                <p className="text-gray-900 font-bold">{teacher.name}</p>
                                <p className="text-sm text-gray-600">{teacher.email}</p>
                                <p className="text-sm text-gray-600">{teacher.phone}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {/* Attendance Rate */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-green-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-green-100 p-3 rounded-lg">
                                <CheckCircle size={24} color="#10b981" />
                            </div>
                            <TrendingUp size={20} color="#10b981" />
                        </div>
                        <h3 className="text-gray-600 text-sm mb-1">نسبة الحضور</h3>
                        <p className="text-3xl font-bold text-gray-900">{attendance.rate}%</p>
                    </div>

                    {/* Attended Sessions */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-blue-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Calendar size={24} color="#3b82f6" />
                            </div>
                        </div>
                        <h3 className="text-gray-600 text-sm mb-1">الحصص المحضورة</h3>
                        <p className="text-3xl font-bold text-gray-900">{attendance.attended}</p>
                    </div>

                    {/* Average Grade */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-purple-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-purple-100 p-3 rounded-lg">
                                <Award size={24} color="#8b5cf6" />
                            </div>
                        </div>
                        <h3 className="text-gray-600 text-sm mb-1">المعدل العام</h3>
                        <p className="text-3xl font-bold text-gray-900">{performance.average_grade}%</p>
                    </div>

                    {/* Homework Completion */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-orange-500">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-orange-100 p-3 rounded-lg">
                                <FileText size={24} color="#f97316" />
                            </div>
                        </div>
                        <h3 className="text-gray-600 text-sm mb-1">الواجبات المكتملة</h3>
                        <p className="text-3xl font-bold text-gray-900">{performance.completed_homework}</p>
                    </div>
                </div>

                {/* Attendance Details */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">تفاصيل الحضور</h2>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="bg-blue-100 text-blue-700 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                                {attendance.total_sessions}
                            </div>
                            <p className="text-gray-600 font-medium">إجمالي الحصص</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-100 text-green-700 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                                {attendance.attended}
                            </div>
                            <p className="text-gray-600 font-medium">حضر</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-red-100 text-red-700 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                                {attendance.missed}
                            </div>
                            <p className="text-gray-600 font-medium">غاب</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upcoming Sessions */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">الحصص القادمة</h2>

                        {data?.upcoming_sessions?.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                                <p>لا توجد حصص قادمة</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {data?.upcoming_sessions?.map((session: any) => (
                                    <div key={session.id} className="border-r-4 border-blue-500 bg-blue-50 p-4 rounded-lg">
                                        <h3 className="font-bold text-gray-900 mb-2">{session.title}</h3>
                                        <p className="text-sm text-gray-600 mb-2">
                                            <User className="inline ml-1" size={14} />
                                            {session.teacher_name}
                                        </p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(session.session_date).toLocaleDateString('ar-SA')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {session.start_time} - {session.end_time}
                                            </span>
                                        </div>
                                        {session.subject_name && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                <BookOpen className="inline ml-1" size={14} />
                                                {session.subject_name}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Grades */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">الدرجات الأخيرة</h2>

                        {data?.recent_grades?.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Award size={48} className="mx-auto mb-3 opacity-50" />
                                <p>لا توجد درجات بعد</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {data?.recent_grades?.map((grade: any, index: number) => {
                                    const percentage = (grade.marks_obtained / grade.total_marks) * 100;
                                    const gradeColor = percentage >= 90 ? 'green' : percentage >= 70 ? 'blue' : percentage >= 50 ? 'orange' : 'red';

                                    return (
                                        <div key={index} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-gray-900">{grade.exam_title}</h3>
                                                <span className={`bg-${gradeColor}-100 text-${gradeColor}-700 px-3 py-1 rounded-full text-sm font-bold`}>
                                                    {percentage.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>الدرجة: {grade.marks_obtained} / {grade.total_marks}</span>
                                                <span>{new Date(grade.exam_date).toLocaleDateString('ar-SA')}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Academic Performance Summary */}
                <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-8 text-white">
                    <h2 className="text-2xl font-bold mb-6">ملخص الأداء الأكاديمي</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold mb-1">{performance.total_exams}</p>
                            <p className="text-purple-100 text-sm">إجمالي الامتحانات</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold mb-1">{performance.average_grade}%</p>
                            <p className="text-purple-100 text-sm">المعدل العام</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold mb-1">{performance.total_homework}</p>
                            <p className="text-purple-100 text-sm">إجمالي الواجبات</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4 text-center">
                            <p className="text-3xl font-bold mb-1">{performance.pending_homework}</p>
                            <p className="text-purple-100 text-sm">واجبات معلقة</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
