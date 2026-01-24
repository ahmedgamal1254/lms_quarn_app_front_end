'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Home,
    ChevronRight,
    Package,
    Search,
    Plus,
    Edit2,
    Trash2,
    X,
    Loader,
    AlertCircle,
    DollarSign
} from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Types
interface Plan {
    id: number;
    name: string;
    description: string;
    sessions_count: number;
    price: string;
    currency: string;
    created_at: string;
    updated_at?: string;
}

interface PlansResponse {
    data: Plan[];
    success?: boolean;
}

const currencies = [
    { code: 'SAR', symbol: 'ر.س', name: 'الريال السعودي' },
    { code: 'EGP', symbol: 'ج.م', name: 'الجنية المصري' },
    { code: 'USD', symbol: '$', name: 'الدولار الأمريكي' },
    { code: 'EUR', symbol: '€', name: 'اليورو' },
    { code: 'AED', symbol: 'د.إ', name: 'الدرهم الإماراتي' }
];

const getCurrencySymbol = (code: string): string => {
    return currencies.find(c => c.code === code)?.symbol || code;
};

const getCurrencyName = (code: string): string => {
    return currencies.find(c => c.code === code)?.name || code;
};

export default function PlansPage() {
    const t = useTranslations('AdminPlans');
    const tCommon = useTranslations('Common');
    const queryClient = useQueryClient();
    const routeParams = useParams();
    const isRTL = routeParams.locale === 'ar';
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        sessions_count: '',
        price: '',
        currency: 'SAR'
    });

    // Fetch Plans
    const { data: plansData, isLoading } = useQuery({
        queryKey: ['plans'],
        queryFn: async () => {
            const { data } = await axiosInstance.get<PlansResponse>('/plans');
            return data.data || [];
        },
        staleTime: 5 * 60 * 1000
    });

    // Save Plan Mutation
    const saveMutation = useMutation({
        mutationFn: async (values: any) => {
            if (modalMode === 'edit' && selectedPlan) {
                return axiosInstance.put(`/plans/${selectedPlan.id}`, values);
            }
            return axiosInstance.post('/plans', values);
        },
        onSuccess: () => {
            const msg = modalMode === 'edit' ? t('successUpdate') : t('successAdd');
            toast.success(msg);
            queryClient.invalidateQueries({ queryKey: ['plans'] });
            closeModal();
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<any>;
            toast.error(axiosError.response?.data?.message || tCommon('error'));
        }
    });

    // Delete Plan Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => axiosInstance.delete(`/plans/${id}`),
        onSuccess: () => {
            toast.success(t('successDelete'));
            queryClient.invalidateQueries({ queryKey: ['plans'] });
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<any>;
            toast.error(axiosError.response?.data?.message || tCommon('errorLoadingData'));
        }
    });

    const openModal = (mode: 'create' | 'edit', plan: Plan | null = null) => {
        setModalMode(mode);
        setSelectedPlan(plan);

        if (plan) {
            setFormData({
                name: plan.name,
                description: plan.description,
                sessions_count: plan.sessions_count.toString(),
                price: plan.price,
                currency: plan.currency
            });
        } else {
            setFormData({
                name: '',
                description: '',
                sessions_count: '',
                price: '',
                currency: 'SAR'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPlan(null);
        setFormData({
            name: '',
            description: '',
            sessions_count: '',
            price: '',
            currency: 'SAR'
        });
    };

    const handleSave = () => {
        if (!formData.name.trim() || !formData.price.trim() || !formData.sessions_count.trim()) {
            toast.error(tCommon('requiredFields'));
            return;
        }

        const submitData = {
            name: formData.name,
            description: formData.description,
            sessions_count: parseInt(formData.sessions_count),
            price: parseFloat(formData.price),
            currency: formData.currency
        };

        saveMutation.mutate(submitData);
    };

    const filteredPlans = (plansData || []).filter(plan =>
        plan.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                                <Package size={16} />
                                <span className="text-sm">{t('title')}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => openModal('create')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Plus size={20} />
                            {t('addPlan')}
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
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader className="animate-spin text-blue-600" size={40} />
                    </div>
                ) : filteredPlans.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 text-lg">{tCommon('noData')}</p>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {filteredPlans.map((plan) => {
                                const pricePerSession = plan.sessions_count > 0
                                    ? (parseFloat(plan.price) / plan.sessions_count).toFixed(2)
                                    : '0';
                                return (
                                    <div
                                        key={plan.id}
                                        className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-1">{plan.name}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {plan.description || tCommon('withoutDesc')}
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openModal('edit', plan)}
                                                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title={tCommon('edit')}
                                                >
                                                    <Edit2 size={16} className="text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (confirm(tCommon('confirmDelete').replace('{name}', plan.name))) {
                                                            deleteMutation.mutate(plan.id);
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

                                        <div className="space-y-3 pt-4 border-t border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400 text-sm">{t('sessionsCount')}</span>
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">{plan.sessions_count}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400 text-sm">{t('totalPrice')}</span>
                                                <span className="font-bold text-green-600">
                                                    {parseFloat(plan.price).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400 text-sm">{t('pricePerSession')}</span>
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {pricePerSession} {getCurrencySymbol(plan.currency)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400 text-sm">{tCommon('currency')}</span>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                                    {plan.currency}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 pt-4 border-t border-gray-100">
                                            {tCommon('createdAt')}: {new Date(plan.created_at).toLocaleDateString('ar-EG')}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Table View */}
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hidden lg:block">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900">
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{t('planName')}</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{tCommon('description')}</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{t('sessionsCount')}</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{tCommon('price')}</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{tCommon('currency')}</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{t('pricePerSession')}</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{tCommon('date')}</th>
                                            <th className="px-6 py-3 text-center font-semibold text-gray-900 dark:text-gray-100">{tCommon('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPlans.map((plan) => {
                                            const pricePerSession = plan.sessions_count > 0
                                                ? (parseFloat(plan.price) / plan.sessions_count).toFixed(2)
                                                : '0';
                                            return (
                                                <tr key={plan.id} className="border-b border-gray-100 hover:bg-gray-50 dark:bg-slate-900 transition-colors">
                                                    <td className="px-6 py-3 font-semibold text-gray-900 dark:text-gray-100">{plan.name}</td>
                                                    <td className="px-6 py-3 text-gray-600 dark:text-gray-400 max-w-xs truncate">{plan.description || '-'}</td>
                                                    <td className="px-6 py-3 text-gray-900 dark:text-gray-100">{plan.sessions_count}</td>
                                                    <td className="px-6 py-3 font-bold text-green-600">
                                                        {parseFloat(plan.price).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">{getCurrencySymbol(plan.currency)}</td>
                                                    <td className="px-6 py-3 text-gray-600 dark:text-gray-400">
                                                        {pricePerSession} {getCurrencySymbol(plan.currency)}
                                                    </td>
                                                    <td className="px-6 py-3 text-gray-600 dark:text-gray-400 text-xs">
                                                        {new Date(plan.created_at).toLocaleDateString('ar-EG')}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex justify-center gap-2">
                                                            <button
                                                                onClick={() => openModal('edit', plan)}
                                                                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                                title={tCommon('edit')}
                                                            >
                                                                <Edit2 size={16} className="text-blue-600" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    if (confirm(`هل أنت متأكد من حذف خطة ${plan.name}؟`)) {
                                                                        deleteMutation.mutate(plan.id);
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
                                            );
                                        })}
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
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                                {modalMode === 'create' ? t('addPlan') : t('editPlan')}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('planName')} *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={t('enterPlanName')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tCommon('description')}</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={t('enterDescription')}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('sessionsCount')} *</label>
                                <input
                                    type="number"
                                    value={formData.sessions_count}
                                    onChange={(e) => setFormData({ ...formData, sessions_count: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="25"
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tCommon('price')} *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="125.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tCommon('currency')}</label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {currencies.map(curr => (
                                        <option key={curr.code} value={curr.code}>
                                            {curr.code === 'SAR' ? tCommon('currency_sar', 'الريال السعودي') : 
                                             curr.code === 'EGP' ? tCommon('currency_egp', 'الجنية المصري') :
                                             curr.code === 'USD' ? tCommon('currency_usd', 'الدولار الأمريكي') :
                                             curr.code === 'EUR' ? tCommon('currency_eur', 'اليورو') :
                                             curr.code === 'AED' ? tCommon('currency_aed', 'الدرهم الإماراتي') : curr.name} ({curr.code})
                                        </option>
                                    ))}
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