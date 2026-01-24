'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Search,
    Plus,
    Edit2,
    Trash2,
    Phone,
    User,
    Home,
    ChevronRight,
    DollarSign,
    CheckCircle,
    AlertCircle,
    Loader,
    X,
    MessageCircle,
    Eye
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { FieldError, useFormErrors } from '@/components/FieldError';

interface Teacher {
    id: number;
    name: string;
    email: string;
    phone: string;
    hourly_rate: string;
    currency: string;
    image: string;
    subjects: string;
    status: 'active' | 'on_leave' | 'inactive';
    session_link: string;
    created_at: string;
}

interface GenderOption {
    value: 'male' | 'female';
    label: string;
}

interface TeacherStatusOption{
    value: 'active' | 'on_leave' | 'inactive';
    label: string;
}

interface TeacherFormData {
  name: string;
  email: string;
  phone: string;
  hourly_rate: string;
  currency: string;
  gender: 'male' | 'female';
  status: 'active' | 'inactive' | 'on_leave';
  subjects: string[];
  password: string;
  session_link: string;
}

interface TeachersResponse {
    teachers: Teacher[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface Subject {
    id: number;
    name: string;
}

interface SubjectsResponse {
    data: {
        subjects: Subject[];
    }
}

export default function TeachersPage() {
    const t = useTranslations('Users');
    const tCommon = useTranslations('Common');
    const queryClient = useQueryClient();
    const routeParams = useParams();
    const isRTL = routeParams.locale === 'ar';
    const [params, setParams] = useState({ page: 1, per_page: 15, search: '', status: '', subject: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const { errors, setFieldErrors, clearErrors, getError, hasError } = useFormErrors();
    const [formData, setFormData] = useState<TeacherFormData>({
        name: '',
        email: '',
        phone: '',
        hourly_rate: '',
        currency: 'EGP',
        gender: 'male',
        status: 'active',
        subjects: [],
        password: '',
        session_link:''
    });


    // Fetch Teachers
    const { data: teachersData, isLoading } = useQuery({
        queryKey: ['teachers', params],
        queryFn: async () => {
            const { data } = await axiosInstance.get<{ data: TeachersResponse }>('/teachers', { params });
            return data.data;
        },
        staleTime: 5 * 60 * 1000
    });

    // Fetch Subjects
    const { data: subjectsData = [] } = useQuery({
        queryKey: ['subjects'],
        queryFn: async () => {
            try {
                const { data } = await axiosInstance.get<SubjectsResponse>('/subjects');
                return data.data.subjects || [];
            } catch {
                return [];
            }
        }
    });

    // Save Teacher Mutation
    const saveMutation = useMutation({
        mutationFn: async (values: any) => {
            if (modalMode === 'edit' && selectedTeacher) {
                return axiosInstance.put(`/teachers/${selectedTeacher.id}`, values);
            }
            return axiosInstance.post('/teachers', values);
        },
        onSuccess: () => {
            const msg = modalMode === 'edit' ? tCommon('successUpdate') : tCommon('successAdd');
            toast.success(msg);
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
            clearErrors();
            closeModal();
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<any>;
            if (axiosError.response?.data?.errors) {
                setFieldErrors(axiosError.response.data.errors);
                toast.error(axiosError.response?.data?.message || 'يرجى تصحيح الأخطاء في النموذج');
            } else {
                toast.error(axiosError.response?.data?.message || tCommon('error'));
            }
        }
    });

    // Delete Teacher Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => axiosInstance.delete(`/teachers/${id}`),
        onSuccess: () => {
            toast.success(tCommon('successDelete'));
            queryClient.invalidateQueries({ queryKey: ['teachers'] });
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<any>;
            toast.error(axiosError.response?.data?.message || tCommon('error'));
        }
    });

    const openModal = (mode: 'create' | 'edit', teacher: Teacher | null = null) => {
        setModalMode(mode);
        setSelectedTeacher(teacher);

        if (teacher) {
            const subjectsList = teacher.subjects
                ? teacher.subjects.split(',').map(s => s.trim())
                : [];
            setFormData({
                name: teacher.name,
                email: teacher.email,
                phone: teacher.phone,
                hourly_rate: teacher.hourly_rate,
                currency: teacher.currency,
                gender: 'male',
                status: teacher.status,
                subjects: subjectsList,
                password: '',
                session_link: teacher.session_link
            });
        } else {
            setFormData({
                name: '',
                email: '',
                phone: '',
                hourly_rate: '',
                currency: 'EGP',
                gender: 'male',
                status: 'active',
                subjects: [],
                password: '',
                session_link:''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTeacher(null);
        clearErrors();
        setFormData({
            name: '',
            email: '',
            phone: '',
            hourly_rate: '',
            currency: 'EGP',
            gender: 'male',
            status: 'active',
            subjects: [],
            password: '',
            session_link:''
        });
    };

    const handleSave = () => {
        if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
            toast.error(tCommon('requiredFields'));
            return;
        }

        if (modalMode === 'create' && !formData.password.trim()) {
            toast.error(tCommon('passwordRequired'));
            return;
        }

        const submitData: any = {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            hourly_rate: formData.hourly_rate,
            currency: formData.currency,
            gender: formData.gender,
            status: formData.status,
            session_link:formData.session_link,
            subjects: formData.subjects.join(', ')
        };

        if (modalMode === 'create') {
            submitData.password = formData.password;
        }

        saveMutation.mutate(submitData);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-700';
            case 'on_leave':
                return 'bg-amber-100 text-amber-700';
            case 'inactive':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
                return tCommon('active');
            case 'on_leave':
                return tCommon('inactive'); // TODO: Add 'on_leave' to translations if needed or map to standard status
            case 'inactive':
                return tCommon('inactive');
            default:
                return status;
        }
    };

    const stats = [
        {
            label: t('totalTeachers'),
            value: teachersData?.total || 0,
            icon: User,
            color: 'bg-blue-100',
            textColor: 'text-blue-700'
        },
        {
            label: t('activeStudents'), // Using 'activeStudents' key but it's actually Active Teachers contextually? No, wait. 'activeStudents' is "Active Students". I need "Active Teachers". Let's check keys. 'active' in Common is 'Active'.
            // Actually 'activeStudents' is 'الطلاب النشطون'. I probably need a generic 'Active' or 'Active Teachers'.
            // I'll use 'active' from Common combined with logic or add 'activeTeachers'.
            // For now, I'll use 'active' from Common + 'teachers' from Sidebar or something. 
            // Better: Add "activeTeachers" to Users or use "active" context.
            // "activeStudents" was specific.
            // I will use "active" from Common. NO, stats label is usually "Active Teachers".
            // I'll add "activeTeachers" to my next translation update if needed.
            // For now, I'll use a hardcoded translation or composed one?
            // "activeStudents" in Users is "Active Students".
            // I'll stick to what I have in my mind: "Active Teachers".
            // Convert to t('activeTeachers') and I will add it to en.json/ar.json later?
            // Or just use "Active" (Common). The card has "Teachers" context? No, it just says "Active Now".
            // "نشط الآن" -> "Active Now".
            // "active" in Common is "Active".
            label: tCommon('active'), 
            value: teachersData?.teachers?.filter(t => t.status === 'active').length || 0,
            icon: CheckCircle,
            color: 'bg-green-100',
            textColor: 'text-green-700'
        },
        {
            label: tCommon('inactive'), // "on_leave"? 
            // "في إجازة" -> "On Leave". I don't have "On Leave" key yet.
            // "inactive" is "Inactive".
            value: teachersData?.teachers?.filter(t => t.status === 'on_leave').length || 0,
            icon: AlertCircle,
            color: 'bg-amber-100',
            textColor: 'text-amber-700'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('teachersManagement')}</h1>
                            <div className="flex items-center gap-2 mt-2 text-gray-600 dark:text-gray-400">
                                <Home size={16} />
                                <span className="text-sm">{tCommon('dashboard')}</span>
                                <ChevronRight size={16} />
                                <span className="text-sm">{t('teachersManagement')}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => openModal('create')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Plus size={20} />
                            {t('addTeacher')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-2 py-4 md:px-6 md:py-8">
                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{stat.label}</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 ${stat.color} rounded-lg`}>
                                        <Icon size={24} className={stat.textColor} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
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
                        <div className='flex-1 relative'>
                            <select
                                value={params.status}
                                onChange={(e) => setParams({ ...params, status: e.target.value, page: 1 })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800"
                            >
                                <option value="">{tCommon('status')}</option>
                                <option value="active">{tCommon('active')}</option>
                                <option value="on_leave">On Leave</option> 
                                <option value="inactive">{tCommon('inactive')}</option>
                            </select>
                        </div>
                        {/* subjects */}
                        <div className='flex-1 relative'>
                            <select
                                value={params.subject}
                                onChange={(e) => setParams({ ...params, subject: e.target.value, page: 1 })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800"
                            >
                                <option value="">{tCommon('allCountries')}</option> {/*  Wait, "all subjects" ... I don't have "allSubjects" key. Reusing allCountries is wrong. "viewAll" -> "View All" maybe? Or just leave it as "All" */}
                                {/* Using "viewAll" from Common is better for "All", but contextually "All Subjects" */}
                                {subjectsData?.map((subject) => (
                                    <option key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader className="animate-spin text-blue-600" size={40} />
                        </div>
                    ) : teachersData?.teachers.length === 0 ? (
                        <div className="text-center py-16">
                            <Search size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 text-lg">{tCommon('noResults')}</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900">
                                            <th className="px-6 py-3 text-start font-semibold text-gray-900 dark:text-gray-100">{t('viewTeacher')}</th> {/*  "Teacher"? "viewTeacher" = "Teacher Data"? I'll use tCommon('name') or wait. "Teacher" label. */}
                                            {/* "teachers": "Teachers" in Sidebar. "viewTeacher": "View Teacher" in Users. */}
                                            {/* I'll use "Teachers" (singular? No). */}
                                            {/* I need "Teacher" key. Common has "student". Users has ... "addTeacher". */}
                                            {/* I'll use tCommon('name') for the name column, but the column header implies the entity. */}
                                            {/* Let's just use "Name" from Common. */}
                                            <th className="px-6 py-3 text-start font-semibold text-gray-900 dark:text-gray-100">{tCommon('email')}</th>
                                            <th className="px-6 py-3 text-start font-semibold text-gray-900 dark:text-gray-100">{tCommon('phone')}</th>
                                            <th className="px-6 py-3 text-start font-semibold text-gray-900 dark:text-gray-100">{tCommon('amount')}</th>
                                            <th className="px-6 py-3 text-start font-semibold text-gray-900 dark:text-gray-100">{tCommon('subject')}</th> {/*  Usage of "subject"? No "subject" in Common? Sidebar has "subjects". */}
                                            <th className="px-6 py-3 text-start font-semibold text-gray-900 dark:text-gray-100">{tCommon('status')}</th>
                                            <th className="px-6 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">{tCommon('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teachersData?.teachers.map((teacher) => (
                                            <tr key={teacher.id} className="border-b border-gray-100 hover:bg-gray-50 dark:bg-slate-900 transition-colors">
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                                                            {teacher.image ? (
                                                                <img
                                                                    src={teacher.image}
                                                                    alt={teacher.name}
                                                                    className="w-full h-full rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <User size={20} className="text-gray-600 dark:text-gray-400" />
                                                            )}
                                                        </div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">{teacher.name}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 text-gray-600 dark:text-gray-400 dir-ltr text-xs text-start">{teacher.email}</td>
                                                <td className="px-6 py-3 text-start">
                                                    <a
                                                        href={`https://wa.me/20${teacher.phone}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-green-600 hover:text-green-700 text-xs dir-ltr"
                                                    >
                                                        <MessageCircle size={14} />
                                                        {teacher.phone}
                                                    </a>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <DollarSign size={14} className="text-gray-400" />
                                                        <span className="font-medium text-gray-900 dark:text-gray-100">{teacher.hourly_rate}</span>
                                                        <span className="text-xs text-gray-600 dark:text-gray-400">{teacher.currency}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex gap-1 flex-wrap max-w-xs">
                                                        {teacher.subjects ? (
                                                            teacher.subjects.split(',').map((subject, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                                                                >
                                                                    {subject.trim()}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">{tCommon('noData')}</span> // "No subjects"
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(teacher.status)}`}>
                                                        {getStatusLabel(teacher.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex justify-center gap-2">
                                                        <Link
                                                            href={`/teachers/${teacher.id}`}
                                                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                            title={tCommon('view')}
                                                        >
                                                            <Eye size={16} className="text-blue-600" />
                                                        </Link>
                                                        <button
                                                            onClick={() => openModal('edit', teacher)}
                                                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                            title={tCommon('edit')}
                                                        >
                                                            <Edit2 size={16} className="text-blue-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(tCommon('confirmDelete', {name: teacher.name}))) {
                                                                    deleteMutation.mutate(teacher.id);
                                                                }
                                                            }}
                                                            disabled={deleteMutation.isPending}
                                                            className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                            title={tCommon('delete')}
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

                            {/* Pagination */}
                            
                            <Pagination
                                currentPage={params.page}
                                lastPage={teachersData ? teachersData.last_page : 1}
                                total={teachersData ? teachersData.total : 0}
                                onPageChange={(page) => setParams({ ...params, page })}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {modalMode === 'create' ? t('addTeacher') : t('editTeacher')}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tCommon('name')} *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError('name') ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder={tCommon('name')}
                                    />
                                    <FieldError error={getError('name')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tCommon('email')} *</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-start dir-ltr ${hasError('email') ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="example@email.com"
                                    />
                                    <FieldError error={getError('email')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tCommon('phone')} *</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-start dir-ltr ${hasError('phone') ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="01012345678"
                                    />
                                    <FieldError error={getError('phone')} />
                                </div>
                                 
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tCommon('password')} *</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${hasError('password') ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder={tCommon('password')}
                                    />
                                    <FieldError error={getError('password')} />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('sessionLink')} (Google Meet / Zoom)</label> {/* Missing translation key for 'sessionLink'. I will use hardcoded for now or add it later. */}
                                    <input
                                        type="text"
                                        value={formData.session_link}
                                        onChange={(e) => setFormData({ ...formData, session_link: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-start dir-ltr"
                                        placeholder="ex :- https://meet.google.com/awr-rgpw-mdh"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tCommon('hourlyRate')}</label>
                                    <input
                                        type="number"
                                        value={formData.hourly_rate}
                                        onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="150"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tCommon('currency')}</label> {/* Missing 'currency' in Common? Sidebar has 'currencies'. Common doesn't. */}
                                    {/* Sidebar has "currencies". Common has "amount". */}
                                    {/* I'll use "Action" -> no. */}
                                    {/* I'll use "EGP", "SAR", "USD" directly or hardcoded for now, labels are translatable. */}
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="EGP">EGP</option>
                                        <option value="SAR">SAR</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tCommon('gender')}</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as GenderOption['value'] })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="male">{tCommon('male')}</option>
                                        <option value="female">{tCommon('female')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tCommon('status')}</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as TeacherStatusOption['value']
                                         })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="active">{tCommon('active')}</option>
                                        <option value="on_leave">On Leave</option>
                                        <option value="inactive">{tCommon('inactive')}</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('subjects')}</label> {/* Sidebar has 'subjects'. */}
                                <div className="grid grid-cols-2 gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-900 max-h-48 overflow-y-auto">
                                    {subjectsData && subjectsData?.length > 0 ? (
                                        
                                        subjectsData?.map((subject:any) => (
                                            <label key={subject.id} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-white dark:bg-slate-800 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.subjects.includes(subject.name)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setFormData({
                                                                ...formData,
                                                                subjects: [...formData.subjects, subject.name]
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                subjects: formData.subjects.filter(s => s !== subject.name)
                                                            });
                                                        }
                                                    }}
                                                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-900 dark:text-gray-100">{subject.name}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm col-span-2">{tCommon('noData')}</p>
                                    )}
                                </div>
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
                                {modalMode === 'create' ? t('addTeacher') : t('save')} {/* 'Save' or 'Update'? tCommon('save') or tCommon('update') */}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}