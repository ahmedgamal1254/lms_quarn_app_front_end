'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Home,
    ChevronRight,
    TrendingDown,
    Search,
    Plus,
    Edit2,
    Trash2,
    X,
    Loader,
    AlertCircle,
    Filter,
    DollarSign
} from 'lucide-react';
import Link from 'next/link';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';

interface Expense {
    id: number;
    category: string;
    description: string;
    amount: string;
    currency: string;
    expense_date: string;
    payment_method: string | null;
    receipt_image: string | null;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

interface ExpensesResponse {
    data:{
        expenses: Expense[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    }
}

const categories = [
    { value: 'salaries', label: 'رواتب' },
    { value: 'utilities', label: 'مرافق' },
    { value: 'supplies', label: 'لوازم' },
    { value: 'marketing', label: 'تسويق' },
    { value: 'general', label: 'عام' },
    { value: 'administrative', label: 'إدارية' },
    { value: 'other', label: 'أخرى' }
];

const getCurrencySymbol = (code: string): string => {
    const map: Record<string, string> = {
        'SAR': 'ر.س', 'EGP': 'ج.م', 'USD': '$', 'EUR': '€', 'AED': 'د.إ'
    };
    return map[code] || code;
};

export default function ExpensesPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [page, setPage] = useState(1);
    const [formData, setFormData] = useState({
        category: 'general',
        description: '',
        amount: '',
        currency: 'SAR',
        expense_date: new Date().toISOString().split('T')[0],
        payment_method: '',
        status: 'pending'
    });

    // Fetch Expenses
    const { data: expensesData, isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (searchQuery) params.append('search', searchQuery);
            if (categoryFilter !== 'all') params.append('category', categoryFilter);
            if (statusFilter !== 'all') params.append('status', statusFilter);
            params.append('page', page.toString());
            params.append('per_page', '10');
            const { data } = await axiosInstance.get<ExpensesResponse>('/finances/expenses',{params});
            return data.data;
        },
        staleTime: 5 * 60 * 1000
    });

    // Save Expense Mutation
    const saveMutation = useMutation({
        mutationFn: async (values: any) => {
            if (modalMode === 'edit' && selectedExpense) {
                return axiosInstance.put(`/finances/expenses/${selectedExpense.id}`, values);
            }
            return axiosInstance.post('/finances/expenses', values);
        },
        onSuccess: () => {
            const msg = modalMode === 'edit' ? 'تم تحديث المصروف' : 'تم إضافة المصروف بنجاح';
            toast.success(msg);
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            closeModal();
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<any>;
            toast.error(axiosError.response?.data?.message || 'حدث خطأ ما');
        }
    });

    // Delete Expense Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: number) => axiosInstance.delete(`/finances/expenses/${id}`),
        onSuccess: () => {
            toast.success('تم حذف المصروف بنجاح');
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<any>;
            toast.error(axiosError.response?.data?.message || 'فشل الحذف');
        }
    });

    const openModal = (mode: 'create' | 'edit', expense: Expense | null = null) => {
        setModalMode(mode);
        setSelectedExpense(expense);

        if (expense) {
            setFormData({
                category: expense.category,
                description: expense.description,
                amount: expense.amount,
                currency: expense.currency,
                expense_date: expense.expense_date.split('T')[0],
                payment_method: expense.payment_method || '',
                status: expense.status
            });
        } else {
            setFormData({
                category: 'general',
                description: '',
                amount: '',
                currency: 'SAR',
                expense_date: new Date().toISOString().split('T')[0],
                payment_method: '',
                status: 'pending'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedExpense(null);
        setFormData({
            category: 'general',
            description: '',
            amount: '',
            currency: 'SAR',
            expense_date: new Date().toISOString().split('T')[0],
            payment_method: '',
            status: 'pending'
        });
    };

    const handleSave = () => {
        if (!formData.amount.trim() || !formData.category.trim()) {
            toast.error('يرجى ملء الحقول المطلوبة');
            return;
        }

        const submitData = {
            category: formData.category,
            description: formData.description,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            expense_date: formData.expense_date,
            payment_method: formData.payment_method,
            status: formData.status
        };

        saveMutation.mutate(submitData);
    };

    const filteredExpenses = (expensesData?.expenses || []).filter(expense => {
        const matchSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = categoryFilter === 'all' || expense.category === categoryFilter;
        const matchStatus = statusFilter === 'all' || expense.status === statusFilter;
        return matchSearch && matchCategory && matchStatus;
    });

    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-700';
            case 'pending':
                return 'bg-amber-100 text-amber-700';
            case 'rejected':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved': return 'موافق عليه';
            case 'pending': return 'معلق';
            case 'rejected': return 'مرفوض';
            default: return status;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">المصروفات</h1>
                            <div className="flex items-center gap-2 mt-2 text-gray-600">
                                <Home size={16} />
                                <Link href="/dashboard" className="hover:text-blue-600">الرئيسية</Link>
                                <ChevronRight size={16} />
                                <TrendingDown size={16} />
                                <span className="text-sm">المصروفات</span>
                            </div>
                        </div>
                        <button
                            onClick={() => openModal('create')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Plus size={20} />
                            إضافة مصروف
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Summary Card */}
                {filteredExpenses.length > 0 && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg shadow-sm p-6 border border-red-200 mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">إجمالي المصروفات</p>
                                <p className="text-3xl font-bold text-red-600 mt-2">
                                    {totalAmount.toLocaleString('ar-EG', { maximumFractionDigits: 2 })}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">{filteredExpenses.length} مصروف</p>
                            </div>
                            <div className="p-4 bg-red-100 rounded-lg">
                                <DollarSign size={32} className="text-red-600" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="ابحث بالوصف..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="all">جميع الفئات</option>
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="pending">معلق</option>
                            <option value="approved">موافق عليه</option>
                            <option value="rejected">مرفوض</option>
                        </select>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader className="animate-spin text-blue-600" size={40} />
                    </div>
                ) : filteredExpenses.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                        <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg">لا توجد مصروفات</p>
                    </div>
                ) : (
                    <>
                        {/* Grid View - Mobile/Tablet */}
                        <div className="block md:hidden space-y-4 mb-8">
                            {filteredExpenses.map((expense) => (
                                <div
                                    key={expense.id}
                                    className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-semibold text-gray-900">{expense.description}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(expense.expense_date).toLocaleDateString('ar-EG')}
                                            </p>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(expense.status)}`}>
                                            {getStatusLabel(expense.status)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <p className="text-2xl font-bold text-red-600">
                                                {parseFloat(expense.amount).toLocaleString()}
                                            </p>
                                            <p className="text-sm text-gray-600">{getCurrencySymbol(expense.currency)}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                            {categories.find(c => c.value === expense.category)?.label || expense.category}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openModal('edit', expense)}
                                            className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                        >
                                            <Edit2 size={16} className="inline mr-1" /> تعديل
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm(`هل أنت متأكد من حذف هذا المصروف؟`)) {
                                                    deleteMutation.mutate(expense.id);
                                                }
                                            }}
                                            disabled={deleteMutation.isPending}
                                            className="flex-1 px-3 py-2 text-sm text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 size={16} className="inline mr-1" /> حذف
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Table View - Desktop */}
                        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-200 bg-gray-50">
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900">الوصف</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900">الفئة</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900">المبلغ</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900">التاريخ</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900">الطريقة</th>
                                            <th className="px-6 py-3 text-right font-semibold text-gray-900">الحالة</th>
                                            <th className="px-6 py-3 text-center font-semibold text-gray-900">الإجراءات</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredExpenses.map((expense) => (
                                            <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-3 font-medium text-gray-900">{expense.description}</td>
                                                <td className="px-6 py-3">
                                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                                                        {categories.find(c => c.value === expense.category)?.label || expense.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-red-600 font-semibold">
                                                    {parseFloat(expense.amount).toLocaleString()} {getCurrencySymbol(expense.currency)}
                                                </td>
                                                <td className="px-6 py-3 text-gray-600 text-xs">
                                                    {new Date(expense.expense_date).toLocaleDateString('ar-EG')}
                                                </td>
                                                <td className="px-6 py-3 text-gray-600 text-sm">{expense.payment_method || '-'}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(expense.status)}`}>
                                                        {getStatusLabel(expense.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => openModal('edit', expense)}
                                                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                                            title="تعديل"
                                                        >
                                                            <Edit2 size={16} className="text-blue-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`هل أنت متأكد من حذف هذا المصروف؟`)) {
                                                                    deleteMutation.mutate(expense.id);
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

                {
                    expensesData && (
                        <Pagination
                            currentPage={expensesData?.current_page || 1}
                            lastPage={expensesData?.last_page || 1}
                            total={expensesData?.total || 0}
                            onPageChange={(page) => setPage(page)}
                        />
                    )
                }
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-blue-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {modalMode === 'create' ? 'إضافة مصروف جديد' : 'تعديل المصروف'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الوصف *</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="وصف المصروف"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الفئة *</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {categories.map(cat => (
                                            <option key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </option>
                                        ))}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">العملة</label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="SAR">الريال السعودي</option>
                                        <option value="EGP">الجنية المصري</option>
                                        <option value="USD">الدولار الأمريكي</option>
                                        <option value="EUR">اليورو</option>
                                        <option value="AED">درهم إماراتي</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">التاريخ *</label>
                                    <input
                                        type="date"
                                        value={formData.expense_date}
                                        onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="pending">معلق</option>
                                        <option value="approved">موافق عليه</option>
                                        <option value="rejected">مرفوض</option>
                                    </select>
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
        </div>
    );
}