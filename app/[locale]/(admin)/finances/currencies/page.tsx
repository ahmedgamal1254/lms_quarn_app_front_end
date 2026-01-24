'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Home,
    ChevronRight,
    DollarSign,
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
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import TranslatableInput from '@/components/TranslatableInput';
import { Currency } from '@/services/api/types';

interface CurrenciesResponse {
    data: Currency[];
    total: number;
}

export default function CurrenciesPage() {
    const t = useTranslations('AdminCurrencies');
    const tCommon = useTranslations('Common');
    const queryClient = useQueryClient();
    const routeParams = useParams();
    const locale = routeParams.locale as string;
    const isRTL = locale === 'ar';
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        name: { ar: '', en: '' },
        symbol: '',
        exchange_rate: '',
        is_default: false,
        status: 'active'
    });

    // Fetch Currencies
    const { data: currenciesData, isLoading } = useQuery({
        queryKey: ['currencies'],
        queryFn: async () => {
            const { data } = await axiosInstance.get<CurrenciesResponse>('/finances/currencies');
            return data.data || [];
        },
        staleTime: 5 * 60 * 1000
    });

    // Save Currency Mutation
    const saveMutation = useMutation({
        mutationFn: async (values: any) => {
            // Prepare localized payload
            const payload = {
                ...values,
                ar: { name: values.name.ar },
                en: { name: values.name.en }
            };
            // Remove the raw name object as it is now in ar/en keys
            delete payload.name;

            if (modalMode === 'edit' && selectedCurrency) {
                return axiosInstance.put(`/finances/currencies/${selectedCurrency.id}`, payload);
            }
            return axiosInstance.post('/finances/currencies', payload);
        },
        onSuccess: () => {
            const msg = modalMode === 'edit' ? t('successUpdate') : t('successAdd');
            toast.success(msg);
            queryClient.invalidateQueries({ queryKey: ['currencies'] });
            closeModal();
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<any>;
            toast.error(axiosError.response?.data?.message || tCommon('error'));
        }
    });

    // Delete Currency Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => axiosInstance.delete(`/finances/currencies/${id}`),
        onSuccess: () => {
            toast.success(t('successDelete'));
            queryClient.invalidateQueries({ queryKey: ['currencies'] });
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<any>;
            toast.error(axiosError.response?.data?.message || t('errorDelete'));
        }
    });

    const openModal = (mode: 'create' | 'edit', currency: Currency | null = null) => {
        setModalMode(mode);
        setSelectedCurrency(currency);

        if (currency) {
            setFormData({
                code: currency.code,
                name: {
                    ar: currency.translations?.ar?.name || '',
                    en: currency.translations?.en?.name || ''
                },
                symbol: currency.symbol,
                exchange_rate: currency.exchange_rate.toString(),
                is_default: currency.is_default,
                status: 'active' // Assuming generic status for now as types might differ slightly
            });
        } else {
            setFormData({
                code: '',
                name: { ar: '', en: '' },
                symbol: '',
                exchange_rate: '',
                is_default: false,
                status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCurrency(null);
        setFormData({
            code: '',
            name: { ar: '', en: '' },
            symbol: '',
            exchange_rate: '',
            is_default: false,
            status: 'active'
        });
    };

    const handleSave = () => {
        if (!formData.code.trim() || !formData.name.ar.trim() || !formData.name.en.trim() || !formData.symbol.trim() || !formData.exchange_rate.trim()) {
            toast.error(tCommon('requiredFields'));
            return;
        }

        const submitData = {
            code: formData.code,
            name: formData.name, // This is {ar: '...', en: '...'}
            symbol: formData.symbol,
            exchange_rate: parseFloat(formData.exchange_rate),
            is_default: formData.is_default ? 1 : 0,
            status: formData.status
        };

        saveMutation.mutate(submitData);
    };

    const filteredCurrencies = (currenciesData || []).filter(currency =>
        currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        currency.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
                            <div className="flex items-center gap-2 mt-2 text-gray-600">
                                <Home size={16} />
                                <Link href="/dashboard" className="hover:text-blue-600">{tCommon('dashboard')}</Link>
                                <ChevronRight size={16} />
                                <DollarSign size={16} />
                                <span className="text-sm">{t('title')}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => openModal('create')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Plus size={20} />
                            {t('addCurrency')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-2 py-4 md:px-6 md:py-8">
                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-8">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('searchPlaceholder')}
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
                ) : filteredCurrencies.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">{tCommon('noResults')}</p>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {filteredCurrencies.map((currency) => (
                                <div
                                    key={currency.id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="text-3xl font-bold text-gray-900">{currency.symbol}</div>
                                                <p className="text-sm text-gray-600 mt-1">{currency.code}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openModal('edit', currency)}
                                                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                    title={tCommon('edit')}
                                                >
                                                    <Edit2 size={16} className="text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (currency.is_default) {
                                                            toast.error(t('errorDelete'));
                                                            return;
                                                        }
                                                        if (confirm(tCommon('confirmDelete').replace('{name}', currency.name))) {
                                                            deleteMutation.mutate(currency.id);
                                                        }
                                                    }}
                                                    disabled={deleteMutation.isPending || currency.is_default}
                                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                    title={tCommon('delete')}
                                                >
                                                    <Trash2 size={16} className="text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-3">{currency.name}</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">{t('exchangeRate')}:</span>
                                                <span className="font-medium text-gray-900">{currency.exchange_rate}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">{t('isDefault')}:</span>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                    currency.is_default
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {currency.is_default ? tCommon('yes') : tCommon('no')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Table View */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-start">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50 text-start">
                                            <th className="px-6 py-3 font-semibold text-gray-900">{t('code')}</th>
                                            <th className="px-6 py-3 font-semibold text-gray-900">{tCommon('name')}</th>
                                            <th className="px-6 py-3 font-semibold text-gray-900">{t('shortSymbol')}</th>
                                            <th className="px-6 py-3 font-semibold text-gray-900">{t('exchangeRate')}</th>
                                            <th className="px-6 py-3 font-semibold text-gray-900">{t('default')}</th>
                                            <th className="px-6 py-3 text-center font-semibold text-gray-900">{tCommon('actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredCurrencies.map((currency) => (
                                            <tr key={currency.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-center">
                                                <td className="px-6 py-3 font-bold text-gray-900">{currency.code}</td>
                                                <td className="px-6 py-3 text-gray-900">{currency.name}</td>
                                                <td className="px-6 py-3 text-2xl font-semibold text-gray-900">{currency.symbol}</td>
                                                <td className="px-6 py-3 text-gray-600">{currency.exchange_rate}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`px-3 py-1 rounded text-xs font-medium ${
                                                        currency.is_default
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {currency.is_default ? tCommon('yes') : tCommon('no')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => openModal('edit', currency)}
                                                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                            title={tCommon('edit')}
                                                        >
                                                            <Edit2 size={16} className="text-blue-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (currency.is_default) {
                                                                    toast.error(t('errorDelete'));
                                                                    return;
                                                                }
                                                                if (confirm(tCommon('confirmDelete').replace('{name}', currency.name))) {
                                                                    deleteMutation.mutate(currency.id);
                                                                }
                                                            }}
                                                            disabled={deleteMutation.isPending || currency.is_default}
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
                                {modalMode === 'create' ? t('addCurrency') : t('editCurrency')}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('currencyCode')} ({t('code')}) *</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={isRTL ? "USD, SAR, EGP" : "USD, SAR, EGP"}
                                    maxLength={3}
                                />
                            </div>

                            <TranslatableInput
                                label={t('currencyName')}
                                value={formData.name}
                                onChange={(val) => setFormData({ ...formData, name: val })}
                                placeholder={{ ar: 'الدولار الأمريكي', en: 'US Dollar' }}
                                required
                            />

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('shortSymbol')} *</label>
                                <input
                                    type="text"
                                    value={formData.symbol}
                                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={isRTL ? "$ أو ر.س" : "$ or SAR"}
                                    maxLength={5}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('exchangeRate')} *</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.exchange_rate}
                                    onChange={(e) => setFormData({ ...formData, exchange_rate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="3.75"
                                />
                            </div>

                             {/* Removed Status Field as it wasn't in original proper implementation or not critical for now, keeping simple */}
                                                         <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="is_default"
                                    checked={formData.is_default}
                                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="is_default" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    {t('makeDefault')}
                                </label>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
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