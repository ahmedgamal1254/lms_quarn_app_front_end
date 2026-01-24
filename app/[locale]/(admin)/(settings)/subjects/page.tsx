"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import axiosInstance from "@/lib/axios";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import TranslatableInput from "@/components/TranslatableInput";
import { Subject } from "@/services/api/types";
import Pagination from "@/components/Pagination";


interface SubjectsResponse {
    subjects: Subject[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function SubjectsPage() {
    const queryClient = useQueryClient();
    const t = useTranslations('AdminSubjects');
    const tCommon = useTranslations('Common');
    const routeParams = useParams();
    const isRTL = routeParams.locale === 'ar';

    // Pagination & Search State
    const [params, setParams] = useState({ 
        page: 1, 
        per_page: 10, 
        search: '', 
        status: '' 
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [formData, setFormData] = useState({
        name: { ar: '', en: '' },
        description: { ar: '', en: '' },
        icon: 'calculator',
        color: '#22c55e',
        status: 'active'
    });

    // Fetch Subjects with Pagination
    const { data: subjectsData, isLoading } = useQuery({
        queryKey: ['subjects', params],
        queryFn: async () => {
            // Backend returns { success: true, data: { subjects: [...], total: ... } }
            // The axiosInstance.get<...>() generic is usually the top-level response or data content.
            // Based on Student page example: axiosInstance.get<{ data: StudentsResponse }>
            // So here: axiosInstance.get<{ data: SubjectsResponse }>
            const { data } = await axiosInstance.get<{ data: SubjectsResponse }>('/subjects', { params });
            return data.data; // This returns the SubjectsResponse object
        },
        staleTime: 5 * 60 * 1000
    });

    // Save Subject Mutation
    const saveMutation = useMutation({
        mutationFn: async (values: any) => {
            // Prepare localized payload
            const payload = {
                ...values,
                ar: { name: values.name.ar || '', description: values.description.ar || '' },
                en: { name: values.name.en || '', description: values.description.en || '' }
            };
            // Remove raw name/description
            delete payload.name;
            delete payload.description;

            if (modalMode === 'edit' && selectedSubject) {
                return axiosInstance.put(`/subjects/${selectedSubject.id}`, payload);
            }
            return axiosInstance.post('/subjects', payload);
        },
        onSuccess: () => {
            const msg = modalMode === 'edit' ? t('successUpdate') : t('successAdd');
            toast.success(msg);
            queryClient.invalidateQueries({ queryKey: ['subjects'] });
            closeModal();
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<any>;
            toast.error(axiosError.response?.data?.message || tCommon('error'));
        }
    });

    // Delete Subject Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => axiosInstance.delete(`/subjects/${id}`),
        onSuccess: () => {
            toast.success(t('successDelete'));
            queryClient.invalidateQueries({ queryKey: ['subjects'] });
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<any>;
            toast.error(axiosError.response?.data?.message || tCommon('errorLoadingData'));
        }
    });

    const openModal = (mode: 'create' | 'edit', subject: Subject | null = null) => {
        setModalMode(mode);
        setSelectedSubject(subject);

        if (subject) {
            setFormData({
                name: {
                    ar: subject.translations?.ar?.name || '',
                    en: subject.translations?.en?.name || ''
                },
                description: {
                    ar: subject.translations?.ar?.description || '',
                    en: subject.translations?.en?.description || ''
                },
                icon: subject.icon || 'calculator',
                color: subject.color || '#22c55e',
                status: subject.status || 'active'
            });
        } else {
            setFormData({
                name: { ar: '', en: '' },
                description: { ar: '', en: '' },
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
            name: { ar: '', en: '' },
            description: { ar: '', en: '' },
            icon: 'calculator',
            color: '#22c55e',
            status: 'active'
        });
    };

    const handleSave = () => {
        // Basic validation - check if at least one language is filled?
        // Or specific rule. Assuming simple check for now.
        if (!formData.name.ar && !formData.name.en) {
             toast.error(tCommon('requiredFields'));
             return;
        }

        saveMutation.mutate(formData);
    };

    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
    // const icons = ['calculator', 'book', 'pencil', 'globe', 'flask', 'music', 'palette', 'microscope'];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
                            <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
                                <Home size={16} />
                                <Link href="/dashboard" className="hover:text-blue-600">{tCommon('dashboard')}</Link>
                                <ChevronRight size={16} />
                                <BookOpen size={16} />
                                <span className="text-sm">{tCommon('subjects')}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => openModal('create')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Plus size={20} />
                            {t('addSubject')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Search */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 mb-8">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={params.search}
                            onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader className="animate-spin text-blue-600" size={40} />
                    </div>
                ) : !subjectsData?.subjects?.length ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">{tCommon('noData')}</p>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {subjectsData.subjects.map((subject) => (
                                <div
                                    key={subject.id}
                                    className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
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
                                                    title={tCommon('edit')}
                                                >
                                                    <Edit2 size={16} className="text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(tCommon('confirmDelete').replace('{name}', subject.name))) {
                                                            deleteMutation.mutate(subject.id);
                                                        }
                                                    }}
                                                    disabled={deleteMutation.isPending}
                                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                    title={tCommon('delete')}
                                                >
                                                    <Trash2 size={16} className="text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">{subject.name}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                            {subject.description || tCommon('withoutDesc')}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                // @ts-ignore
                                                subject.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {/* @ts-ignore */
                                                subject.status === 'active' ? tCommon('active') : tCommon('inactive')}
                                            </span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {subject.created_at && new Date(subject.created_at).toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <Pagination 
                            currentPage={subjectsData.current_page}
                            lastPage={subjectsData.last_page}
                            total={subjectsData.total}
                            onPageChange={(page) => setParams({ ...params, page })}
                        />
                    </>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {modalMode === 'create' ? t('addSubject') : t('editSubject')}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            <TranslatableInput
                                label={t('subjectName')}
                                value={formData.name}
                                onChange={(val) => setFormData({ ...formData, name: val })}
                                placeholder={{ ar: 'مثال: الرياضيات', en: 'Ex: Math' }}
                                required
                            />

                            <TranslatableInput
                                label={tCommon('description')}
                                value={formData.description}
                                onChange={(val) => setFormData({ ...formData, description: val })}
                                placeholder={{ ar: 'وصف المادة...', en: 'Subject description...' }}
                                isTextArea
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tCommon('color')}</label>
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tCommon('status')}</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="active">{tCommon('active')}</option>
                                    <option value="inactive">{tCommon('inactive')}</option>
                                </select>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:bg-slate-800 transition-colors"
                            >
                                {tCommon('cancel')}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saveMutation.isPending}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center gap-2"
                            >
                                {saveMutation.isPending && <Loader size={16} className="animate-spin" />}
                                {modalMode === 'create' ? tCommon('add') : tCommon('save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
