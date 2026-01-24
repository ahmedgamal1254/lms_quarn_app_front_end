'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Eye,
    User,
    UserPlus,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { FieldError, useFormErrors } from '@/components/FieldError';
import { Select } from 'antd';
import { WhatsAppInput } from '@/components/WhatsAppInput';

interface Parent {
    id: number;
    user_id?: number;
    name: string;
    email: string;
    phone: string;
    whatsapp_number?: string;
    country_code: string;
    students?: any[];
    created_at: string;
}

interface ParentsResponse {
    parents: Parent[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export default function ParentsPage() {
    const t = useTranslations('Users');
    const tCommon = useTranslations('Common');
    const routeParams = useParams();
    const isRTL = routeParams.locale === 'ar';
    const queryClient = useQueryClient();
    const [params, setParams] = useState({ page: 1, per_page: 10, search: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view' | 'link'>('create');
    const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
    const { errors, setFieldErrors, clearErrors, getError, hasError } = useFormErrors();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        whatsapp_number: '',
        country_code: '+20',
        password: '',
        student_ids: [] as number[]
    });

    // Fetch Parents
    const { data: parentsData, isLoading } = useQuery({
        queryKey: ['parents', params],
        queryFn: async () => {
            const { data } = await axiosInstance.get<{ data: ParentsResponse }>('/parents', { params });
            return data.data;
        },
        staleTime: 5 * 60 * 1000
    });

    // Fetch Students for linking
    const { data: studentsData } = useQuery({
        queryKey: ['students-list'],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/students', { params: { per_page: 1000 } });
            return data.data.students || [];
        }
    });

    // Save Parent Mutation
    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            if (modalMode === 'edit' && selectedParent) {
                return axiosInstance.put(`/parents/${selectedParent.id}`, data);
            }
            return axiosInstance.post('/parents', data);
        },
        onSuccess: () => {
            const msg = modalMode === 'edit' ? tCommon('successUpdate') : tCommon('successAdd');
            toast.success(msg);
            queryClient.invalidateQueries({ queryKey: ['parents'] });
            clearErrors();
            closeModal();
        },
        onError: (err: any) => {
            if (err.response?.data?.errors) {
                setFieldErrors(err.response.data.errors);
                toast.error(err.response?.data?.message || tCommon('error'));
            } else {
                toast.error(err.response?.data?.message || tCommon('error'));
            }
        }
    });

    // Delete Parent Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => axiosInstance.delete(`/parents/${id}`),
        onSuccess: () => {
            toast.success(tCommon('successDelete'));
            queryClient.invalidateQueries({ queryKey: ['parents'] });
        }
    });

    const openModal = (mode: 'create' | 'edit' | 'view' | 'link', parent: Parent | null = null) => {
        setModalMode(mode);
        setSelectedParent(parent);
        if (parent) {
            setFormData({
                name: parent.name,
                email: parent.email,
                phone: parent.phone,
                whatsapp_number: parent.whatsapp_number || '',
                country_code: parent.country_code || '+20',
                password: '',
                student_ids: parent.students?.map(s => s.id) || []
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                whatsapp_number: '',
                country_code: '+20',
                password: '',
                student_ids: []
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedParent(null);
        clearErrors();
        setFormData({
            name: '',
            email: '',
            phone: '',
            whatsapp_number: '',
            country_code: '+20',
            password: '',
            student_ids: []
        });
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.email || !formData.phone) {
            toast.error(tCommon('requiredFields'));
            return;
        }
        if (modalMode === 'create' && !formData.password) {
            toast.error(tCommon('passwordRequired'));
            return;
        }
        saveMutation.mutate(formData);
    };

    const getModalTitle = () => {
        switch (modalMode) {
            case 'create': return t('addParent');
            case 'edit': return t('editParent');
            case 'view': return t('viewParent');
            case 'link': return t('linkStudents');
            default: return '';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-2 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex justify-between items-start flex-col gap-2 md:flex-row mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('parentsManagement')}</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t('manageParentsDesc')}</p>
                </div>
                <button
                    onClick={() => openModal('create')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <Plus size={20} />
                    {t('addParent')}
                </button>
            </div>

            {/* Table Card */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8">
                {/* Search */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-3 text-gray-400 rtl:right-3 rtl:left-auto" />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
                            value={params.search}
                            onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })}
                            className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-start py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('parent')}</th>
                                <th className="text-start py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{tCommon('email')}</th>
                                <th className="text-start py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{tCommon('phone')}</th>
                                <th className="text-start py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{t('childrenCount')}</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">{tCommon('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        {tCommon('loading')}
                                    </td>
                                </tr>
                            ) : parentsData?.parents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500 dark:text-gray-400">
                                        {tCommon('noData')}
                                    </td>
                                </tr>
                            ) : (
                                parentsData?.parents.map((parent) => (
                                    <tr key={parent.id} className="border-b border-gray-100 hover:bg-gray-50 dark:bg-slate-900 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                    <User size={20} className="text-green-600" />
                                                </div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">{parent.name}</p>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-600 dir-ltr text-xs text-start">{parent.email}</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-600 dir-ltr text-xs text-start">
                                            {parent.country_code} {parent.phone}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                                {parent.students?.length || 0} {t('children')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => openModal('link', parent)}
                                                    className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                                                    title={t('linkStudents')}
                                                >
                                                    <UserPlus size={16} className="text-green-600" />
                                                </button>
                                                <button
                                                    onClick={() => openModal('view', parent)}
                                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                    title={tCommon('view')}
                                                >
                                                    <Eye size={16} className="text-gray-600 dark:text-gray-400" />
                                                </button>
                                                <button
                                                    onClick={() => openModal('edit', parent)}
                                                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title={tCommon('edit')}
                                                >
                                                    <Edit2 size={16} className="text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(tCommon('confirmDelete', { name: parent.name }))) {
                                                            deleteMutation.mutate(parent.id);
                                                        }
                                                    }}
                                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                    title={tCommon('delete')}
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
                    lastPage={parentsData?.last_page || 1}
                    total={parentsData?.total || 0}
                    onPageChange={(page) => setParams({ ...params, page })}
                />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{getModalTitle()}</h2>
                            <button
                                onClick={closeModal}
                                className="p-2 hover:bg-gray-100 dark:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {modalMode === 'view' ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{tCommon('name')}</label>
                                        <p className="text-gray-900 dark:text-gray-100">{selectedParent?.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{tCommon('email')}</label>
                                        <p className="text-gray-900 dark:text-gray-100 dir-ltr text-start">{selectedParent?.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{tCommon('phone')}</label>
                                        <p className="text-gray-900 dark:text-gray-100 dir-ltr text-start">{selectedParent?.country_code} {selectedParent?.phone}</p>
                                    </div>
                                    {selectedParent?.whatsapp_number && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('whatsappNumber')}</label>
                                            <p className="text-gray-900 dark:text-gray-100 dir-ltr text-start">{selectedParent.whatsapp_number}</p>
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('linkedStudents')}</label>
                                        {selectedParent?.students && selectedParent.students.length > 0 ? (
                                            <div className="space-y-2">
                                                {selectedParent.students.map((student: any) => (
                                                    <div key={student.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-900 rounded">
                                                        <User size={16} className="text-gray-600 dark:text-gray-400" />
                                                        <span>{student.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 dark:text-gray-400">{t('noLinkedStudents')}</p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {tCommon('name')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                hasError('name') ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder={tCommon('name')}
                                        />
                                        <FieldError error={getError('name')} />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {tCommon('email')} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-start ${
                                                hasError('email') ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                            placeholder="example@email.com"
                                        />
                                        <FieldError error={getError('email')} />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {tCommon('phone')} <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={formData.country_code}
                                                onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                                                className="w-24 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr text-center"
                                                placeholder="+20"
                                            />
                                            <input
                                                type="text"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dir-ltr ${
                                                    hasError('phone') ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder="1234567890"
                                            />
                                        </div>
                                        <FieldError error={getError('phone')} />
                                    </div>

                                    {/* WhatsApp */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {t('whatsappNumber')}
                                        </label>
                                        <WhatsAppInput
                                            value={formData.whatsapp_number}
                                            onChange={(value) => setFormData({ ...formData, whatsapp_number: value })}
                                        />
                                        <FieldError error={getError('whatsapp_number')} />
                                    </div>

                                    {/* Password */}
                                    {modalMode === 'create' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                {tCommon('password')} <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    hasError('password') ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder={tCommon('password')}
                                            />
                                            <FieldError error={getError('password')} />
                                        </div>
                                    )}

                                    {modalMode === 'edit' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                {t('newPassword')}
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    hasError('password') ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                                placeholder={t('passwordOptional')}
                                            />
                                            <FieldError error={getError('password')} />
                                        </div>
                                    )}

                                    {/* Students Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {t('linkedStudents')}
                                        </label>
                                        <Select
                                            mode="multiple"
                                            style={{ width: '100%' }}
                                            placeholder={t('selectStudents')}
                                            value={formData.student_ids}
                                            onChange={(value) => setFormData({ ...formData, student_ids: value })}
                                            options={studentsData?.map((student: any) => ({
                                                label: student.name,
                                                value: student.id
                                            }))}
                                            className="w-full"
                                        />
                                        <FieldError error={getError('student_ids')} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        {modalMode !== 'view' && (
                            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-slate-900 transition-colors"
                                >
                                    {tCommon('cancel')}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={saveMutation.isPending}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {saveMutation.isPending ? t('saving') : tCommon('save')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
