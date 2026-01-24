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
    ChevronLeft,
    Home,
    Mail,
    Phone,
    User,
    Calendar,
    Shield
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import { useParams, useSearchParams } from 'next/navigation';
import { FieldError, useFormErrors } from '@/components/FieldError';

interface Permission {
    id: number;
    name: string;
    name_ar: string;
    group: string;
}

interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string;
    country_code: string;
    role: 'admin' | 'teacher' | 'student' | 'parent';
    image: string | null;
    status: 'active' | 'inactive';
    created_at: string;
    permissions: Permission[];
}

interface UsersResponse {
    users: UserData[];
    current_page: number | undefined;
    last_page: number;
    per_page: number;
    total: number|undefined;
}


import { useTranslations, useLocale } from 'next-intl';

export default function UsersPage() {
    const tUsers = useTranslations('Users');
    const tCommon = useTranslations('Common');
    const tSidebar = useTranslations('Sidebar');
    const locale = useLocale();
    const routeParams = useParams();
    const isRTL = routeParams.locale === 'ar';
    const queryClient = useQueryClient();
    const [params, setParams] = useState({ page: 1, per_page: 5, search: '', role: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const { errors, setFieldErrors, clearErrors, getError, hasError } = useFormErrors();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        country_code: '+20',
        role: 'student',
        password: '',
        permissions: [] as number[],
    });

    // Fetch Users
    const { data: usersData, isLoading } = useQuery({
        queryKey: ['users', params],
        queryFn: async () => {
            const { data } = await axiosInstance.get<{ data: UsersResponse }>('/users', { params });
            return data.data;
        },
        staleTime: 5 * 60 * 1000
    });

    // get permissions
    const {data: permissionsData} = useQuery({
        queryKey: ['permissions'],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/usersdata/permissions');
            return data.data;
        },
        staleTime: 10 * 60 * 1000,
    });

    // Save User Mutation
    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            if (modalMode === 'edit' && selectedUser) {
                return axiosInstance.put(`/users/${selectedUser.id}`, data);
            }
            return axiosInstance.post('/users', data);
        },
        onSuccess: () => {
            const message = modalMode === 'edit' ? tCommon('successUpdate') : tCommon('successAdd');
            toast.success(message);
            queryClient.invalidateQueries({ queryKey: ['users'] });
            clearErrors();
            closeModal();
        },
        onError: (err: any) => {
            if (err.response?.data?.errors) {
                setFieldErrors(err.response.data.errors);
                toast.error(err.response?.data?.message || 'يرجى تصحيح الأخطاء في النموذج');
            } else {
                toast.error(err.response?.data?.message || tCommon('error'));
            }
        }
    });

    // Delete User Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => axiosInstance.delete(`/users/${id}`),
        onSuccess: () => {
            toast.success(tCommon('successDelete'));
            queryClient.invalidateQueries({ queryKey: ['users'] });
        }
    });

    const openModal = (mode: 'create' | 'edit' | 'view', user: UserData | null = null) => {
        setModalMode(mode);
        setSelectedUser(user);
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                phone: user.phone,
                country_code: user.country_code,
                role: user.role,
                password: '',
                permissions: user.permissions.map(permission => permission.id) || []
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                country_code: '+20',
                role: 'student',
                password: '',
                permissions: []
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedUser(null);
        clearErrors();
        setFormData({
            name: '',
            email: '',
            phone: '',
            country_code: '+20',
            role: 'student',
            password: '',
            permissions: []
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

    const getRoleColor = (role: string) => {
        const colors: Record<string, { bg: string; text: string; label: string }> = {
            admin: { bg: 'bg-purple-100', text: 'text-purple-700', label: tUsers('admin') },
            teacher: { bg: 'bg-orange-100', text: 'text-orange-700', label: tUsers('teacher') },
            student: { bg: 'bg-blue-100', text: 'text-blue-700', label: tCommon('student') },
            parent: { bg: 'bg-green-100', text: 'text-green-700', label: tUsers('parent') }
        };
        return colors[role] || { bg: 'bg-gray-100', text: 'text-gray-700', label: role };
    };

    const getStatusColor = (status: string) => {
        return status === 'active' 
            ? { bg: 'bg-green-100', text: 'text-green-700', label: tCommon('active') }
            : { bg: 'bg-red-100', text: 'text-red-700', label: tCommon('inactive') };
    };



    return (
        <div className="min-h-screen bg-gray-50 p-2 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex justify-between flex-col md:flex-row gap-4 items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{tUsers('usersManagement')}</h1>
                    <div className="flex items-center gap-2 mt-2 text-gray-600">
                        <Home size={16} />
                        <span className="text-sm">{tSidebar('home')}</span>
                        <span className="text-sm">/</span>
                        <span className="text-sm">{tSidebar('users')}</span>
                    </div>
                </div>
                <button
                    onClick={() => openModal('create')}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    {tUsers('addUser')}
                </button>
            </div>

            {/* Filters & Table Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder={tCommon('search')}
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
                            <tr className={`border-b border-gray-200 ${isRTL ? 'text-right' : 'text-left'}`}>
                                <th className="py-3 px-4 font-semibold text-gray-700">{tCommon('name')}</th>
                                <th className="py-3 px-4 font-semibold text-gray-700">{tCommon('email')}</th>
                                <th className="py-3 px-4 font-semibold text-gray-700">{tCommon('phone')}</th>
                                <th className="py-3 px-4 font-semibold text-gray-700">{tUsers('role')}</th>
                                <th className="py-3 px-4 font-semibold text-gray-700">{tCommon('status')}</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">{tCommon('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">
                                        {tCommon('loading')}
                                    </td>
                                </tr>
                            ) : usersData?.users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">
                                        {tUsers('noUsers')}
                                    </td>
                                </tr>
                            ) : (
                                usersData?.users.map((user) => {
                                    const roleColor = getRoleColor(user.role);
                                    const statusColor = getStatusColor(user.status);
                                    return (
                                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                                                        {user.image ? (
                                                            <img src={user.image} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                                        ) : (
                                                            <User size={20} className="text-gray-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{user.email}</td>
                                            <td className="py-3 px-4 text-gray-600 dir-ltr">
                                                <span dir="ltr">{user.country_code} {user.phone}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColor.bg} ${roleColor.text}`}>
                                                    {roleColor.label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                                                    {statusColor.label}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => openModal('view', user)}
                                                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                                        title={tCommon('view')}
                                                    >
                                                        <Eye size={16} className="text-gray-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => openModal('edit', user)}
                                                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                        title={tCommon('edit')}
                                                    >
                                                        <Edit2 size={16} className="text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(tCommon('confirmDelete', { name: user.name }))) {
                                                                deleteMutation.mutate(user.id);
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
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    total={usersData?.total ?? 0}
                    lastPage={usersData?.last_page ?? 1}
                    currentPage={params.page}
                    onPageChange={(page) =>
                        setParams(prev => ({ ...prev, page }))
                    }
                />
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">
                                {modalMode === 'create' ? tUsers('addUser') : modalMode === 'edit' ? tUsers('editUser') : tUsers('viewUser')}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            {modalMode === 'view' && selectedUser ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase mb-1">{tCommon('name')}</p>
                                            <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase mb-1">{tCommon('email')}</p>
                                            <p className="font-semibold text-gray-900 dir-ltr">{selectedUser.email}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase mb-1">{tCommon('phone')}</p>
                                            <p className="font-semibold text-gray-900 dir-ltr">{selectedUser.country_code} {selectedUser.phone}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase mb-1">{tUsers('role')}</p>
                                            <p className="font-semibold">{getRoleColor(selectedUser.role).label}</p>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase mb-1">{tCommon('status')}</p>
                                            <p className="font-semibold">{getStatusColor(selectedUser.status).label}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase mb-1">{tUsers('joinDate')}</p>
                                            <p className="font-semibold text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <form className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{tCommon('name')}</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                disabled={modalMode === 'view'}
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${hasError('name') ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            <FieldError error={getError('name')} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{tCommon('email')}</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                disabled={modalMode === 'view'}
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${hasError('email') ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            <FieldError error={getError('email')} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{tUsers('countryCode')}</label>
                                            <input
                                                type="text"
                                                value={formData.country_code}
                                                onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dir-ltr text-left"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{tCommon('phone')}</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                disabled={modalMode === 'view'}
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dir-ltr text-left ${hasError('phone') ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            <FieldError error={getError('phone')} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{tUsers('role')}</label>
                                            <select
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                            >
                                                <option value="student">{tCommon('student')}</option>
                                                <option value="teacher">{tUsers('teacher')}</option>
                                                <option value="admin">{tUsers('admin')}</option>
                                                <option value="parent">{tUsers('parent')}</option>
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{tCommon('password')}</label>
                                            <input
                                                type="password"
                                                value={formData.password}
                                                placeholder={tCommon('password')}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError('password') ? 'border-red-500' : 'border-gray-300'}`}
                                            />
                                            <FieldError error={getError('password')} />
                                        </div>
                                    </div>
                                        
                                        <div className="mt-6 w-full">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                {tUsers('permissions')}
                                            </label>
                                            
                                            <div className='grid grid-cols-1 sm:grid-cols-3'>
                                            {Object.entries(
                                                permissionsData.reduce((acc: Record<string, Permission[]>, perm: Permission) => {
                                                    if (!acc[perm.group]) acc[perm.group] = [];
                                                    acc[perm.group].push(perm);
                                                    return acc;
                                                }, {} as Record<string, Permission[]>)
                                            ).map(([group, perms] : any) => (
                                                <div key={group} className="mb-6">
                                                    <h3 className="text-sm font-semibold text-gray-800 mb-2 capitalize">
                                                        {group === 'dashboard' ? tCommon('dashboard') :
                                                        group === 'users' ? tSidebar('users') :
                                                        group === 'finance' ? tSidebar('finances') : group}
                                                    </h3>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {perms.map((perm:any) => (
                                                            <label
                                                                key={perm.id}
                                                                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={formData.permissions.includes(perm.id)}
                                                                    onChange={(e) => {
                                                                        setFormData(prev => ({
                                                                            ...prev,
                                                                            permissions: e.target.checked
                                                                                ? [...prev.permissions, perm.id]
                                                                                : prev.permissions.filter(id => id !== perm.id)
                                                                        }));
                                                                    }}
                                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                                />
                                                                <span className="text-sm text-gray-700">{locale === 'ar' ? perm.name_ar : perm.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            </div>
                                        </div>
                                    
                                </form>
                            )}
                        </div>

                        {/* Modal Footer */}
                        {modalMode !== 'view' && (
                            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    {tCommon('cancel')}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={saveMutation.isPending}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                    {saveMutation.isPending ? tCommon('loading') : modalMode === 'edit' ? tCommon('update') : tCommon('save')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}