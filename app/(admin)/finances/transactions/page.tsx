'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Clock, DollarSign, ChevronDown } from 'lucide-react';
import {
    Home,
    ChevronRight,
    Search,
    Plus,
    Edit2,
    Trash2,
    X,
    Loader,
    TrendingUp,
    TrendingDown,
    Calendar,
    CreditCard
} from 'lucide-react';
import axiosInstance from '@/lib/axios';

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

interface Currency {
    id: number;
    code: string;
    name: string;
    symbol: string;
    exchange_rate: string;
    is_default: number;
    status: string;
}

interface Student {
    id: number;
    name: string;
}

// Currency Switcher Component
function CurrencySwitcher({ 
    selectedCurrency, 
    onCurrencyChange 
}: { 
    selectedCurrency: string; 
    onCurrencyChange: (code: string) => void 
}) {
    const [isOpen, setIsOpen] = useState(false);

    const { data: currenciesData, isLoading } = useQuery({
        queryKey: ['currencies'],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/finances/currencies');
            return data.data;
        },
        staleTime: 10 * 60 * 1000
    });

    const activeCurrencies = currenciesData?.filter((c: Currency) => c.status === 'active') || [];
    const selectedCurrencyData = activeCurrencies.find((c: Currency) => c.code === selectedCurrency);

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                <DollarSign size={18} className="text-gray-400" />
                <span className="text-gray-500 text-sm">جاري التحميل...</span>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-3 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-blue-400 transition-colors min-w-[200px]"
            >
                <div className="flex items-center gap-2">
                    <DollarSign size={18} className="text-blue-600" />
                    <span className="font-medium text-gray-900">
                        {selectedCurrencyData?.symbol || selectedCurrency}
                    </span>
                    <span className="text-gray-600 text-sm">
                        {selectedCurrencyData?.name || ''}
                    </span>
                </div>
                <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                        {activeCurrencies.map((currency: Currency) => (
                            <button
                                key={currency.id}
                                onClick={() => {
                                    onCurrencyChange(currency.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-3 text-right hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                                    selectedCurrency === currency.code 
                                        ? 'bg-blue-50 text-blue-600' 
                                        : 'text-gray-900'
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{currency.symbol}</span>
                                        <span className="text-sm">{currency.name}</span>
                                    </div>
                                    {currency.is_default === 1 && (
                                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                            الافتراضي
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function TransactionsPage() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const [currentCurrency, setCurrentCurrency] = useState('SAR');
    const [params, setParams] = useState({ page: 1, per_page: 10, currency: 'SAR' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [formData, setFormData] = useState({
        student_id: '',
        type: 'payment',
        amount: '',
        currency: 'SAR',
        payment_method: '',
        reference_number: '',
        notes: ''
    });

    // Fetch Transactions
    const { data: transactionsData, isLoading } = useQuery({
        queryKey: ['transactions', params],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/finances/transactions', { params });
            return data.data;
        },
        staleTime: 5 * 60 * 1000
    });

    // Fetch Stats
    const { data: statsData } = useQuery({
        queryKey: ['transactions-stats', currentCurrency],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/finances/transactions/stats', { 
                params: { currency: currentCurrency }
            });
            return data.data;
        }
    });

    // Fetch Summary
    const { data: summaryData } = useQuery({
        queryKey: ['transactions-summary', currentCurrency],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/finances/transactions/summary', { 
                params: { currency: currentCurrency }
            });
            return data.data;
        }
    });

    // Fetch Students
    const { data: studentsData } = useQuery({
        queryKey: ['students'],
        queryFn: async () => {
            const { data } = await axiosInstance.get('/data/all');
            return data.data.students;
        }
    });

    // Handle Currency Change
    const handleCurrencyChange = (newCurrency: string) => {
        setCurrentCurrency(newCurrency);
        setParams(prev => ({ ...prev, currency: newCurrency }));
        setFormData(prev => ({ ...prev, currency: newCurrency }));
    };

    // Save Transaction
    const saveMutation = useMutation({
        mutationFn: async (values: any) => {
            if (modalMode === 'edit' && selectedTransaction) {
                return axiosInstance.put(`/finances/transactions/${selectedTransaction.id}`, values);
            }
            return axiosInstance.post('/finances/transactions', values);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['transactions-stats'] });
            queryClient.invalidateQueries({ queryKey: ['transactions-summary'] });
            closeModal();
        }
    });

    // Delete Transaction
    const deleteMutation = useMutation({
        mutationFn: (id: number) => axiosInstance.delete(`/finances/transactions/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['transactions-stats'] });
            queryClient.invalidateQueries({ queryKey: ['transactions-summary'] });
        }
    });

    const openModal = (mode: 'create' | 'edit', transaction: Transaction | null = null) => {
        setModalMode(mode);
        setSelectedTransaction(transaction);

        if (transaction) {
            setFormData({
                student_id: '',
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
                type: 'payment',
                amount: '',
                currency: currentCurrency,
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
    };

    const handleSave = () => {
        const submitData: any = {
            type: formData.type,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            payment_method: formData.payment_method,
            reference_number: formData.reference_number,
            notes: formData.notes
        };

        if (formData.student_id) submitData.student_id = parseInt(formData.student_id);
        saveMutation.mutate(submitData);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'failed': return 'bg-red-100 text-red-700';
            case 'cancelled': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'completed': return 'مكتملة';
            case 'pending': return 'قيد الانتظار';
            case 'failed': return 'فشل';
            case 'cancelled': return 'ملغية';
            default: return 'غير معروف';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'payment': return '💰';
            case 'refund': return '↩️';
            case 'adjustment': return '⚙️';
            default: return '📄';
        }
    };

    const filteredTransactions = (transactionsData?.transactions || []).filter((transaction: Transaction) =>
        transaction.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.reference?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-2 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-2 md:p-6 mb-6 border border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">المعاملات المالية</h1>
                            <div className="flex items-center gap-2 mt-2 text-gray-600">
                                <Home size={16} />
                                <span className="text-sm">الرئيسية</span>
                                <ChevronRight size={16} />
                                <DollarSign size={16} />
                                <span className="text-sm">المعاملات</span>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-3">
                            <CurrencySwitcher
                                selectedCurrency={currentCurrency}
                                onCurrencyChange={handleCurrencyChange}
                            />
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

                {/* Summary Cards */}
                {summaryData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
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

                {/* Search */}
                <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
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

                {/* Transactions Table */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader className="animate-spin text-blue-600" size={40} />
                    </div>
                ) : (
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
                                    {filteredTransactions.map((transaction: Transaction) => (
                                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-6 py-3">
                                                <span className="text-2xl">{getTypeIcon(transaction.type)}</span>
                                            </td>
                                            <td className="px-6 py-3 font-medium text-gray-900">{transaction.student_name}</td>
                                            <td className="px-6 py-3 text-gray-600">
                                                {transaction.amount.toLocaleString()} {transaction.currency}
                                            </td>
                                            <td className="px-6 py-3 text-gray-600">{transaction.payment_method}</td>
                                            <td className="px-6 py-3 text-gray-600">
                                                {new Date(transaction.transaction_date).toLocaleDateString('ar-EG')}
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`px-3 py-1 rounded text-xs font-medium ${getStatusColor(transaction.status)}`}>
                                                    {getStatusLabel(transaction.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => openModal('edit', transaction)}
                                                        className="p-2 hover:bg-blue-100 rounded-lg"
                                                    >
                                                        <Edit2 size={16} className="text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteMutation.mutate(transaction.id)}
                                                        className="p-2 hover:bg-red-100 rounded-lg"
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
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-blue-50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {modalMode === 'create' ? 'إضافة معاملة جديدة' : 'تعديل المعاملة'}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">النوع</label>
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">المبلغ</label>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">العملة</label>
                                    <CurrencySwitcher
                                        selectedCurrency={formData.currency}
                                        onCurrencyChange={(code) => setFormData({ ...formData, currency: code })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
                                    <input
                                        type="text"
                                        value={formData.payment_method}
                                        onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الطالب</label>
                                    <select
                                        value={formData.student_id}
                                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">-- اختر الطالب --</option>
                                        {studentsData?.map((student: Student) => (
                                            <option key={student.id} value={student.id}>
                                                {student.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الرقم المرجعي</label>
                                    <input
                                        type="text"
                                        value={formData.reference_number}
                                        onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saveMutation.isPending}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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