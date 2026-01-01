'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Clock } from 'lucide-react';
import {
    Home,
    ChevronRight,
    DollarSign,
    Search,
    Plus,
    Edit2,
    Trash2,
    X,
    Loader,
    TrendingUp,
    TrendingDown,
    Download,
    Calendar,
    CreditCard
} from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import { Button, Form, Modal, Select } from 'antd';
import { set } from 'zod';
import { get } from 'http';

interface Transaction {
    id: number;
    type: 'payment' | 'refund' | 'adjustment';
    amount: number;
    currency: string;
    transaction_date: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    reference: string | null;
    payment_method: string;
    student_name: string;
    created_at: string;
}

interface TransactionStats {
    this_month_revenue: number;
    last_month_revenue: number;
    pending_payments: number;
    completed_payments: number;
    currency: string;
}

interface TransactionSummary {
    total_revenue: number;
    total_expenses: number;
    total_teacher_payments: number;
    total_all_expenses: number;
    net_profit: number;
    currency: string;
    total_transactions: number;
    completed_transactions: number;
    pending_transactions: number;
}

interface TransactionsResponse {
    data: {
        transactions: Transaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    }
}

interface Student {
    id: number;
    name: string;
}

interface FormDataResponse {
    students: Student[];
}

export default function page() {
    const { Option } = Select;
    const [form] = Form.useForm();

    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [params, setParams] = useState({ page: 1, per_page: 5 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [formData, setFormData] = useState({
        student_id: '',
        subscription_id: '',
        type: 'payment',
        amount: '',
        currency: 'SAR',
        payment_method: '',
        reference_number: '',
        notes: ''
    });
    const [isModalOpenStatus, setIsModalOpenStutus] = useState(false);
    const [transactionId, setTransactionId] = useState<number | null>(null);


    const showModal = () => {
        setIsModalOpenStutus(true);
    };

    const handleOk = () => {
        setIsModalOpenStutus(false);
    };

    const handleCancel = () => {
        setIsModalOpenStutus(false);
    };


    // Fetch Transactions
    const { data: transactionsData, isLoading } = useQuery({
        queryKey: ['transactions', params],
        queryFn: async () => {
            const { data } = await axiosInstance.get<TransactionsResponse>('/finances/transactions', { params });
            return data.data;
        },
        staleTime: 5 * 60 * 1000
    });

    // Fetch Stats
    const { data: statsData } = useQuery({
        queryKey: ['transactions-stats'],
        queryFn: async () => {
            const { data } = await axiosInstance.get<{ data: TransactionStats }>('/finances/transactions/stats');
            return data.data;
        }
    });

    // Fetch Summary
    const { data: summaryData } = useQuery({
        queryKey: ['transactions-summary'],
        queryFn: async () => {
            const { data } = await axiosInstance.get<{ data: TransactionSummary }>('/finances/transactions/summary');
            return data.data;
        }
    });

    // Save Transaction Mutation
    const saveMutation = useMutation({
        mutationFn: async (values: any) => {
            if (modalMode === 'edit' && selectedTransaction) {
                return axiosInstance.put(`/finances/transactions/${selectedTransaction.id}`, values);
            }
            return axiosInstance.post('/finances/transactions', values);
        },
        onSuccess: () => {
            const msg = modalMode === 'edit' ? 'تم تحديث المعاملة' : 'تم إضافة المعاملة بنجاح';
            toast.success(msg);
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['transactions-stats'] });
            queryClient.invalidateQueries({ queryKey: ['transactions-summary'] });
            closeModal();
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<any>;
            toast.error(axiosError.response?.data?.message || 'حدث خطأ ما');
        }
    });

    const handleStatus=(id: number) => {
        setIsModalOpenStutus(true);
        setTransactionId(id);
        // toast.success('تم تحديث حالة المعاملة بنجاح');
    }

    const handleUpdateTransaction = async (values: { type: any }) => {
        const toastId = toast.loading('جاري التحديث...');

        try {
            await axiosInstance.put(`/finances/transactions/${transactionId}`, values);

            toast.success('تم تحديث نوع المعاملة بنجاح', { id: toastId });
            setIsModalOpenStutus(false);

            // لو React Query
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['transactions-stats'] });
            queryClient.invalidateQueries({ queryKey: ['transactions-summary'] });

        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || 'حدث خطأ أثناء التحديث',
                { id: toastId }
            );
        }
    };

    const {data:formDataData} = useQuery({
        queryKey: ['formData'],
        queryFn: async () => {
            const { data } = await axiosInstance.get<{ data: FormDataResponse }>('/data/all');
            return data.data;
        }
    });

    console.log(formDataData);

    // Delete Transaction Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => axiosInstance.delete(`/finances/transactions/${id}`),
        onSuccess: () => {
            toast.success('تم حذف المعاملة بنجاح');
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['transactions-stats'] });
            queryClient.invalidateQueries({ queryKey: ['transactions-summary'] });
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<any>;
            toast.error(axiosError.response?.data?.message || 'فشل الحذف');
        }
    });

    const openModal = (mode: 'create' | 'edit', transaction: Transaction | null = null) => {
        setModalMode(mode);
        setSelectedTransaction(transaction);

        if (transaction) {
            setFormData({
                student_id: '',
                subscription_id: '',
                type: transaction.type,
                amount: transaction.amount.toString(),
                currency: transaction.currency,
                payment_method: transaction.payment_method,
                reference_number: transaction.reference || '',
                notes: ''
            });
        } else {
            setFormData({
                student_id: '',
                subscription_id: '',
                type: 'payment',
                amount: '',
                currency: 'SAR',
                payment_method: '',
                reference_number: '',
                notes: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTransaction(null);
        setFormData({
            student_id: '',
            subscription_id: '',
            type: 'payment',
            amount: '',
            currency: 'SAR',
            payment_method: '',
            reference_number: '',
            notes: ''
        });
    };

    const handleSave = () => {
        if (!formData.amount.trim() || !formData.currency.trim()) {
            toast.error('يرجى ملء الحقول المطلوبة');
            return;
        }

        const submitData: any = {
            type: formData.type,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            payment_method: formData.payment_method,
            reference_number: formData.reference_number,
            notes: formData.notes
        };

        if (formData.student_id) submitData.student_id = parseInt(formData.student_id);
        if (formData.subscription_id) submitData.subscription_id = parseInt(formData.subscription_id);

        saveMutation.mutate(submitData);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'pending':
                return 'bg-amber-100 text-amber-700';
            case 'failed':
                return 'bg-red-100 text-red-700';
            case 'canceled':
                return 'bg-gray-100 text-gray-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed':
                return 'مكتملة';
            case 'pending':
                return 'قيد الانتظار';
            case 'failed':
                return 'فشل';
            case 'canceled':
                return 'ملغية';
            default:
                return 'غير معروف';
        }
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'payment':
                return '💰';
            case 'refund':
                return '↩️';
            case 'adjustment':
                return '⚙️';
            default:
                return '📄';
        }
    };

    const filteredTransactions = (transactionsData?.transactions || []).filter(transaction =>
        transaction.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">المعاملات المالية</h1>
                            <div className="flex items-center gap-2 mt-2 text-gray-600">
                                <Home size={16} />
                                <Link href="/dashboard" className="hover:text-blue-600">الرئيسية</Link>
                                <ChevronRight size={16} />
                                <DollarSign size={16} />
                                <span className="text-sm">المعاملات</span>
                            </div>
                        </div>
                        <button
                            onClick={() => openModal('create')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Plus size={20} />
                            إضافة معاملة
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Summary Cards */}
                {summaryData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">إجمالي الإيرادات</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {summaryData.total_revenue.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <TrendingUp size={24} className="text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">إجمالي المصروفات</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {summaryData.total_all_expenses.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-lg">
                                    <TrendingDown size={24} className="text-red-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">صافي الربح</p>
                                    <p className="text-2xl font-bold text-blue-600 mt-1">
                                        {summaryData.net_profit.toLocaleString()}
                                    </p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <DollarSign size={24} className="text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">معاملات مكتملة</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {summaryData.completed_transactions}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Check size={24} className="text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium">معاملات معلقة</p>
                                    <p className="text-2xl font-bold text-amber-600 mt-1">
                                        {summaryData.pending_transactions}
                                    </p>
                                </div>
                                <div className="p-3 bg-amber-100 rounded-lg">
                                    <Clock size={24} className="text-amber-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                {statsData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-sm p-6 border border-green-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">إيرادات هذا الشهر</h3>
                                <TrendingUp size={20} className="text-green-600" />
                            </div>
                            <p className="text-3xl font-bold text-green-600 mb-2">
                                {statsData.this_month_revenue.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600">
                                {statsData.this_month_revenue > statsData.last_month_revenue ? '↑' : '↓'} مقارنة بالشهر الماضي
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-sm p-6 border border-blue-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">حالة الدفع</h3>
                                <CreditCard size={20} className="text-blue-600" />
                            </div>
                            <div className="flex gap-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">مكتملة</p>
                                    <p className="text-2xl font-bold text-green-600">{statsData.completed_payments}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">معلقة</p>
                                    <p className="text-2xl font-bold text-amber-600">{statsData.pending_payments}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-8">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                        <input
                            type="text"
                            placeholder="ابحث باسم الطالب أو الرقم المرجعي..."
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
                ) : filteredTransactions.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                        <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">لا توجد معاملات</p>
                    </div>
                ) : (
                    <>
                        {/* Table View */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900">النوع</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900">الطالب</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900">المبلغ</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900">طريقة الدفع</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900">التاريخ</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900">الحالة</th>
                                            <th className="px-6 py-3 text-center font-semibold text-gray-900">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.map((transaction) => (
                                            <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3">
                                                    <span className="text-2xl">{getTypeIcon(transaction.type)}</span>
                                                </td>
                                                <td className="px-6 py-3 font-medium text-gray-900">{transaction.student_name}</td>
                                                <td className="px-6 py-3 text-gray-600">
                                                    {transaction.amount.toLocaleString()} {transaction.currency}
                                                </td>
                                                <td className="px-6 py-3 text-gray-600 text-xs">{transaction.payment_method}</td>
                                                <td className="px-6 py-3 text-gray-600 text-xs">
                                                    {new Date(transaction.transaction_date).toLocaleDateString('ar-EG')}
                                                </td>
                                                <td className="px-6 py-3 cursor-pointer">
                                                    <span
                                                     onClick={() => handleStatus(transaction.id)}
                                                    className={`px-3 py-1 rounded cursor-pointer text-xs font-medium
                                                        ${getStatusColor(transaction.status)}`}>
                                                        {getStatusLabel(transaction.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => openModal('edit', transaction)}
                                                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                            title="تعديل"
                                                        >
                                                            <Edit2 size={16} className="text-blue-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`هل أنت متأكد من حذف المعاملة؟`)) {
                                                                    deleteMutation.mutate(transaction.id);
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

                            {/* Pagination */}
                            {transactionsData && (
                                <Pagination
                                    currentPage={transactionsData.current_page}
                                    lastPage={transactionsData.last_page}
                                    total={transactionsData.total}
                                   onPageChange={(page) =>
                                        setParams((prev) => ({ ...prev, page }))
                                    }
                                />
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-blue-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {modalMode === 'create' ? 'إضافة معاملة جديدة' : 'تعديل المعاملة'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">النوع *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="payment">دفعة</option>
                                        <option value="refund">استرداد</option>
                                        <option value="adjustment">تعديل</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">العملة *</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="SAR">الريال السعودي</option>
                                        <option value="EG">الجنية المصري</option>
                                        <option value="USD">الدولار الأمريكي</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
                                    <input
                                        type="text"
                                        value={formData.payment_method}
                                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="نقدي، بطاقة..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الرقم المرجعي</label>
                                    <input
                                        type="text"
                                        value={formData.reference_number}
                                        onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="TRX123456"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">معرف الطالب</label>
                                    <select 
                                        value={formData.student_id}
                                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- اختر معرف الطالب --</option>
                                        {formDataData?.students.map((student) => (
                                            <option key={student.id} value={student.id}>
                                                {student.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="ملاحظات إضافية"
                                        rows={3}
                                    />
                                </div>
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

            <Modal
                title="Basic Modal"
                closable={{ 'aria-label': 'Custom Close Button' }}
                open={isModalOpenStatus}
                onOk={handleOk}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={(values) => {
                        // values.type => payment | refund | adjustment
                        handleUpdateTransaction(values);
                    }}
                >
                    <Form.Item
                        label="نوع العملية"
                        name="status"
                        rules={[{ required: true, message: 'حدد حالة العملية' }]}
                    >
                        <Select placeholder="اختر حالة العملية">
                            <Option value="pending">قيد الانتظار</Option>
                            <Option value="completed">مدفوع</Option>
                            <Option value="failed">مرتجع</Option>
                            <Option value="cancelled">ملغى</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item label={null}>
                        <Button type="primary" htmlType="submit">
                            تحديث
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}