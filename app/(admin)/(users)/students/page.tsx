'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Eye,
    User,
    Mail,
    Phone,
    Calendar,
    BookOpen,
    Check,
    X,
    MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';

interface Student {
    id: number;
    name: string;
    email: string;
    phone: string;
    gender: string;
    image: string | null;
    plan: { id: number; name: string } | null;
    status: 'active' | 'inactive';
    created_at: string;
    country_code?: string;
    birth_date?: string;
}

interface StudentsResponse {
    students: Student[];
    plans: { id: number; name: string }[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function StudentsPage() {
    const queryClient = useQueryClient();
    const [params, setParams] = useState({ page: 1, per_page: 5, search: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        country_code: '+20',
        gender: 'male',
        birth_date: '',
        plan_id: '',
        status: 'active',
        password: ''
    });

    // Fetch Students and Plans
    const { data: studentsData, isLoading } = useQuery({
        queryKey: ['students', params],
        queryFn: async () => {
            const { data } = await axiosInstance.get<{ data: StudentsResponse }>('/students', { params });
            return data.data;
        },
        staleTime: 5 * 60 * 1000
    });

    // Save Student Mutation
    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            if (modalMode === 'edit' && selectedStudent) {
                return axiosInstance.put(`/students/${selectedStudent.id}`, data);
            }
            return axiosInstance.post('/students', data);
        },
        onSuccess: () => {
            const msg = modalMode === 'edit' ? 'تم التحديث بنجاح' : 'تم إضافة الطالب بنجاح';
            toast.success(msg);
            queryClient.invalidateQueries({ queryKey: ['students'] });
            closeModal();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'حدث خطأ ما');
        }
    });

    // Delete Student Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => axiosInstance.delete(`/students/${id}`),
        onSuccess: () => {
            toast.success('تم حذف الطالب بنجاح');
            queryClient.invalidateQueries({ queryKey: ['students'] });
        }
    });

    const openModal = (mode: 'create' | 'edit' | 'view', student: Student | null = null) => {
        setModalMode(mode);
        setSelectedStudent(student);
        if (student) {
            setFormData({
                name: student.name,
                email: student.email,
                phone: student.phone,
                country_code: student.country_code || '+20',
                gender: student.gender,
                birth_date: student.birth_date || '',
                plan_id: student.plan?.id?.toString() || '',
                status: student.status,
                password: ''
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                country_code: '+20',
                gender: 'male',
                birth_date: '',
                plan_id: '',
                status: 'active',
                password: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedStudent(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            country_code: '+20',
            gender: 'male',
            birth_date: '',
            plan_id: '',
            status: 'active',
            password: ''
        });
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.email || !formData.phone) {
            toast.error('الرجاء ملء جميع الحقول المطلوبة');
            return;
        }
        if (modalMode === 'create' && !formData.password) {
            toast.error('كلمة المرور مطلوبة');
            return;
        }
        saveMutation.mutate(formData);
    };

    const stats = [
        {
            label: 'إجمالي الطلاب',
            value: studentsData?.total || 0,
            color: 'bg-blue-100',
            textColor: 'text-blue-700'
        },
        {
            label: 'الطلاب النشطون',
            value: studentsData?.students?.filter(s => s.status === 'active').length || 0,
            color: 'bg-green-100',
            textColor: 'text-green-700'
        },
        {
            label: 'الطلاب المتوقفون',
            value: studentsData?.students?.filter(s => s.status === 'inactive').length || 0,
            color: 'bg-red-100',
            textColor: 'text-red-700'
        },
        {
            label: 'عدد الخطط',
            value: studentsData?.plans?.length || 0,
            color: 'bg-purple-100',
            textColor: 'text-purple-700'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">إدارة الطلاب</h1>
                    <p className="text-gray-600 text-sm mt-1">إدارة بيانات جميع الطلاب والخطط الدراسية</p>
                </div>
                <button
                    onClick={() => openModal('create')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus size={20} />
                    إضافة طالب جديد
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
                            <span className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</span>
                        </div>
                        <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                {/* Search */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                            value={params.search}
                            onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-right py-3 px-4 font-semibold text-gray-700">الطالب</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-700">البريد الإلكتروني</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-700">الهاتف</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-700">الخطة</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-700">الحالة</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">
                                        جاري التحميل...
                                    </td>
                                </tr>
                            ) : studentsData?.students.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">
                                        لا توجد طلاب
                                    </td>
                                </tr>
                            ) : (
                                studentsData?.students.map((student) => (
                                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                                                    {student.image ? (
                                                        <img src={student.image} alt={student.name} className="w-full h-full rounded-full object-cover" />
                                                    ) : (
                                                        <User size={20} className="text-gray-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{student.name}</p>
                                                    <p className="text-xs text-gray-500">{student.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dir-ltr text-xs">{student.email}</td>
                                        <td className="py-3 px-4 text-gray-600 dir-ltr text-xs">
                                            <button
                                                onClick={() => window.open(`https://wa.me/${student.country_code || '+20'}${student.phone}`, '_blank')}
                                                className="flex items-center gap-1 text-green-600 hover:text-green-700"
                                            >
                                                <MessageCircle size={14} />
                                                {student.country_code || '+20'} {student.phone}
                                            </button>
                                        </td>
                                        <td className="py-3 px-4">
                                            {student.plan ? (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                    {student.plan.name}
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                                    بدون خطة
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                                                student.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {student.status === 'active' ? <Check size={14} /> : <X size={14} />}
                                                {student.status === 'active' ? 'نشط' : 'متوقف'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => openModal('view', student)}
                                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                    title="عرض"
                                                >
                                                    <Eye size={16} className="text-gray-600" />
                                                </button>
                                                <button
                                                    onClick={() => openModal('edit', student)}
                                                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit2 size={16} className="text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`هل أنت متأكد من حذف ${student.name}؟`)) {
                                                            deleteMutation.mutate(student.id);
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={16} className="text-red-600" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                

                <Pagination 
                    currentPage={params.page}
                    lastPage={studentsData?.last_page || 1}
                    total={studentsData?.total || 0}
                    onPageChange={(page) => setParams({ ...params, page })}
                />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                {modalMode === 'create' ? '🎓 تسجيل طالب جديد' : modalMode === 'edit' ? '✏️ تعديل بيانات الطالب' : '👤 بيانات الطالب'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700 text-xl">
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {modalMode === 'view' && selectedStudent ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase mb-1">الاسم</p>
                                            <p className="font-semibold text-gray-900">{selectedStudent.name}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase mb-1">البريد الإلكتروني</p>
                                            <p className="font-semibold text-gray-900 dir-ltr text-sm">{selectedStudent.email}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase mb-1">الهاتف</p>
                                            <p className="font-semibold text-gray-900 dir-ltr">{selectedStudent.country_code || '+20'} {selectedStudent.phone}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase mb-1">الجنس</p>
                                            <p className="font-semibold text-gray-900">{selectedStudent.gender === 'male' ? 'ذكر' : 'أنثى'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase mb-1">الخطة</p>
                                            <p className="font-semibold text-gray-900">{selectedStudent.plan?.name || 'بدون خطة'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase mb-1">الحالة</p>
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                selectedStudent.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}>
                                                {selectedStudent.status === 'active' ? 'نشط' : 'متوقف'}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg col-span-2">
                                            <p className="text-xs text-gray-500 uppercase mb-1">تاريخ الانضمام</p>
                                            <p className="font-semibold text-gray-900">
                                                {new Date(selectedStudent.created_at).toLocaleDateString('ar-EG')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">الاسم *</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني *</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">رمز الدولة</label>
                                            <input
                                                type="text"
                                                value={formData.country_code}
                                                onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف *</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">الجنس</label>
                                            <select
                                                value={formData.gender}
                                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="male">ذكر</option>
                                                <option value="female">أنثى</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الميلاد</label>
                                            <input
                                                type="date"
                                                value={formData.birth_date}
                                                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">الخطة الدراسية</label>
                                            <select
                                                value={formData.plan_id}
                                                onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="">بدون خطة</option>
                                                {studentsData?.plans.map(plan => (
                                                    <option key={plan.id} value={plan.id}>
                                                        {plan.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="active">نشط</option>
                                                <option value="inactive">متوقف</option>
                                            </select>
                                        </div>
                                        {modalMode === 'create' && (
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">كلمة المرور *</label>
                                                <input
                                                    type="password"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            {modalMode !== 'view' && (
                                <>
                                    <button
                                        onClick={closeModal}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={saveMutation.isPending}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                                    >
                                        {saveMutation.isPending ? 'جاري...' : modalMode === 'edit' ? 'تحديث' : 'حفظ'}
                                    </button>
                                </>
                            )}
                            {modalMode === 'view' && (
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    إغلاق
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}