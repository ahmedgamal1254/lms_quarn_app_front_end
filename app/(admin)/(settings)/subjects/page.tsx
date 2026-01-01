'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Home,
    ChevronRight,
    BookOpen,
    Search,
    Plus,
    Trash2,
    Edit2,
    X,
    Loader,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';

interface Subject {
    id: number;
    name: string;
    description: string;
    icon?: string;
    color?: string;
    status?: string;
    created_at: string;
}

interface SubjectsResponse {
    data: {
        subjects: Subject[];
    };
}

export default function SubjectsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        icon: 'calculator',
        color: '#22c55e',
        status: 'active'
    });

    // Fetch Subjects
    const { data: subjectsData, isLoading } = useQuery({
        queryKey: ['subjects'],
        queryFn: async () => {
            const { data } = await axiosInstance.get<SubjectsResponse>('/subjects');
            return data.data.subjects || [];
        },
        staleTime: 5 * 60 * 1000
    });

    // Save Subject Mutation
    const saveMutation = useMutation({
        mutationFn: async (values: any) => {
            if (modalMode === 'edit' && selectedSubject) {
                return axiosInstance.put(`/subjects/${selectedSubject.id}`, values);
            }
            return axiosInstance.post('/subjects', values);
        },
        onSuccess: () => {
            const msg = modalMode === 'edit' ? 'تم تحديث المادة' : 'تم إضافة المادة بنجاح';
            toast.success(msg);
            queryClient.invalidateQueries({ queryKey: ['subjects'] });
            closeModal();
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<any>;
            toast.error(axiosError.response?.data?.message || 'حدث خطأ ما');
        }
    });

    // Delete Subject Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => axiosInstance.delete(`/subjects/${id}`),
        onSuccess: () => {
            toast.success('تم حذف المادة بنجاح');
            queryClient.invalidateQueries({ queryKey: ['subjects'] });
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<any>;
            toast.error(axiosError.response?.data?.message || 'فشل الحذف');
        }
    });

    const openModal = (mode: 'create' | 'edit', subject: Subject | null = null) => {
        setModalMode(mode);
        setSelectedSubject(subject);

        if (subject) {
            setFormData({
                name: subject.name,
                description: subject.description,
                icon: subject.icon || 'calculator',
                color: subject.color || '#22c55e',
                status: subject.status || 'active'
            });
        } else {
            setFormData({
                name: '',
                description: '',
                icon: 'calculator',
                color: '#22c55e',
                status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSubject(null);
        setFormData({
            name: '',
            description: '',
            icon: 'calculator',
            color: '#22c55e',
            status: 'active'
        });
    };

    const handleSave = () => {
        if (!formData.name.trim()) {
            toast.error('اسم المادة مطلوب');
            return;
        }

        saveMutation.mutate(formData);
    };

    const filteredSubjects = (subjectsData || []).filter(subject =>
        subject.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    const icons = ['calculator', 'book', 'pencil', 'globe', 'flask', 'music', 'palette', 'microscope'];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">المواد الدراسية</h1>
                            <div className="flex items-center gap-2 mt-2 text-gray-600">
                                <Home size={16} />
                                <Link href="/dashboard" className="hover:text-blue-600">الرئيسية</Link>
                                <ChevronRight size={16} />
                                <BookOpen size={16} />
                                <span className="text-sm">المواد</span>
                            </div>
                        </div>
                        <button
                            onClick={() => openModal('create')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Plus size={20} />
                            إضافة مادة
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-8">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث باسم المادة..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader className="animate-spin text-blue-600" size={40} />
                    </div>
                ) : filteredSubjects.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">لا توجد مواد</p>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {filteredSubjects.map((subject) => (
                                <div
                                    key={subject.id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div
                                                className="w-12 h-12 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: (subject.color || '#22c55e') + '20' }}
                                            >
                                                <BookOpen size={24} style={{ color: subject.color || '#22c55e' }} />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openModal('edit', subject)}
                                                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit2 size={16} className="text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(`هل أنت متأكد من حذف ${subject.name}؟`)) {
                                                            deleteMutation.mutate(subject.id);
                                                        }
                                                    }}
                                                    disabled={deleteMutation.isPending}
                                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                    title="حذف"
                                                >
                                                    <Trash2 size={16} className="text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-2">{subject.name}</h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                            {subject.description || 'لا يوجد وصف'}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                subject.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {subject.status === 'active' ? 'نشط' : 'غير نشط'}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(subject.created_at).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Table View */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900">اسم المادة</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900">الوصف</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900">الحالة</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900">تاريخ الإنشاء</th>
                                            <th className="px-6 py-3 text-center font-semibold text-gray-900">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSubjects.map((subject) => (
                                            <tr key={subject.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                                                            style={{ backgroundColor: (subject.color || '#22c55e') + '20' }}
                                                        >
                                                            <BookOpen size={16} style={{ color: subject.color || '#22c55e' }} />
                                                        </div>
                                                        <span className="font-medium text-gray-900">{subject.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-gray-600 max-w-xs truncate">
                                                    {subject.description || '-'}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                        subject.status === 'active'
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {subject.status === 'active' ? 'نشط' : 'غير نشط'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-gray-600 text-xs">
                                                    {new Date(subject.created_at).toLocaleDateString('ar-EG')}
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => openModal('edit', subject)}
                                                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                            title="تعديل"
                                                        >
                                                            <Edit2 size={16} className="text-blue-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`هل أنت متأكد من حذف ${subject.name}؟`)) {
                                                                    deleteMutation.mutate(subject.id);
                                                                }
                                                            }}
                                                            disabled={deleteMutation.isPending}
                                                            className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                            title="حذف"
                                                        >
                                                            <Trash2 size={16} className="text-red-600" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-blue-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {modalMode === 'create' ? 'إضافة مادة جديدة' : 'تعديل المادة'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">اسم المادة *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="مثال: الرياضيات"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="وصف المادة"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">اللون</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setFormData({ ...formData, color })}
                                            className={`w-full h-10 rounded-lg border-2 transition-all ${
                                                formData.color === color
                                                    ? 'border-gray-900'
                                                    : 'border-gray-200'
                                            }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="active">نشط</option>
                                    <option value="inactive">غير نشط</option>
                                </select>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saveMutation.isPending}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
                            >
                                {saveMutation.isPending && <Loader size={16} className="animate-spin" />}
                                {modalMode === 'create' ? 'إضافة' : 'حفظ'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}