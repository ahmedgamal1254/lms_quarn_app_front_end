"use client"
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { CheckCircle, XCircle, Clock, User, Calendar, DollarSign, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';

interface Subject {
    id: number;
    name: string;
}

interface Teacher {
    id: number;
    name: string;
    email: string;
    phone: string;
    hourly_rate: string;
    currency: string;
    subjects: Subject[];
    total_earned: number;
    available_balance: number;
}

interface Wallet {
    id: number;
    balance: string;
    owner: Teacher;
}

interface WithdrawRequest {
    id: number;
    wallet_id: number;
    amount: string;
    currency: string;
    type: string;
    reason: string;
    balance_before: string;
    balance_after: string;
    status: 'pending' | 'approved' | 'rejected';
    approve_reason: string | null;
    reject_reason: string | null;
    created_at: string;
    wallet: Wallet;
}

interface WithdrawResponse {
    success: boolean;
    data: WithdrawRequest[];
    total: number;
    current_page: number;
    per_page: number;
    last_page: number;
}

export default function page() {
    const [page, setPage] = useState(1);
    const [per_page, setPerPage] = useState(10);
    const queryClient = useQueryClient();
    const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
    const [approveReason, setApproveReason] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ['withdraw-requests'],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('per_page', per_page.toString());
            const { data } = await axiosInstance.get<WithdrawResponse>('/withdraw-requests', { params });
            return data;
        },
    });

    const approveMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
            const { data } = await axiosInstance.post(`/withdraw-requests/${id}/approve`, {
                approve_reason: reason,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['withdraw-requests'] });
            toast.success('تم تصديق الطلب بنجاح');
            setShowApproveModal(false);
            setApproveReason('');
            setSelectedRequest(null);
        },
        onError: () => {
            toast.error('حدث خطأ أثناء الموافقة على الطلب');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
            const { data } = await axiosInstance.post(`/withdraw-requests/${id}/reject`, {
                reject_reason: reason,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['withdraw-requests', page, per_page] });
            toast.error('تم رفض الطلب بنجاح');
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedRequest(null);
        },
        onError: () => {
            toast.error('حدث خطأ أثناء رفض الطلب');
        },
    });

    const handleApprove = (id: number) => {
        setSelectedRequest(id);
        setShowApproveModal(true);
    };

    const handleReject = (id: number) => {
        setSelectedRequest(id);
        setShowRejectModal(true);
    };

    const confirmApprove = () => {
        if (selectedRequest) {
            approveMutation.mutate({ id: selectedRequest, reason: approveReason });
        }
    };

    const confirmReject = () => {
        if (selectedRequest && rejectReason.trim()) {
            rejectMutation.mutate({ id: selectedRequest, reason: rejectReason });
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-600">خطأ في تحميل البيانات</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">طلبات السحب</h1>
                    <p className="text-gray-600 mt-2">إدارة طلبات سحب المعلمين</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            إجمالي الطلبات: <span className="font-semibold text-gray-900">{data?.total || 0}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-yellow-600" />
                                <span>قيد الانتظار</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {data?.data.map((request) => (
                        <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{request.wallet.owner.name}</h3>
                                        <p className="text-sm text-gray-600">{request.wallet.owner.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>قيد الانتظار</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">المبلغ</p>
                                        <p className="text-lg font-bold text-red-600">{request.amount} {request.currency}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">الرصيد قبل</p>
                                        <p className="font-semibold text-gray-900">{request.balance_before} {request.currency}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">الرصيد بعد</p>
                                        <p className="font-semibold text-gray-900">{request.balance_after} {request.currency}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 mb-1">الرصيد الحالي</p>
                                        <p className="font-semibold text-blue-600">{request.wallet.balance} {request.currency}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-1">السبب:</p>
                                <p className="text-gray-900">{request.reason}</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formatDate(request.created_at)}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleReject(request.id)}
                                        disabled={rejectMutation.isPending}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span>رفض</span>
                                    </button>
                                    <button
                                        onClick={() => handleApprove(request.id)}
                                        disabled={approveMutation.isPending}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        <span>موافقة</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {data?.data.length === 0 && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600">لا توجد طلبات سحب</p>
                        </div>
                    )}

                    {/* pagination */}
                    {
                        (data?.data.length ?? 0) > 0 && (
                            <Pagination
                                currentPage={page}
                                total={data?.total ?? 0}
                                lastPage={data?.last_page ?? 0}    
                                onPageChange={()=>setPage(page)}    
                            />
                        )
                    }
                </div>
            </div>

            {showApproveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">تأكيد الموافقة</h3>
                        <p className="text-gray-600 mb-4">هل أنت متأكد من الموافقة على هذا الطلب؟</p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">سبب الموافقة (اختياري)</label>
                            <textarea
                                value={approveReason}
                                onChange={(e) => setApproveReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                rows={3}
                                placeholder="أدخل سبب الموافقة..."
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowApproveModal(false);
                                    setApproveReason('');
                                    setSelectedRequest(null);
                                }}
                                disabled={approveMutation.isPending}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={confirmApprove}
                                disabled={approveMutation.isPending}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {approveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>تأكيد</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">تأكيد الرفض</h3>
                        <p className="text-gray-600 mb-4">هل أنت متأكد من رفض هذا الطلب؟</p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">سبب الرفض <span className="text-red-500">*</span></label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                rows={3}
                                placeholder="أدخل سبب الرفض..."
                                required
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setRejectReason('');
                                    setSelectedRequest(null);
                                }}
                                disabled={rejectMutation.isPending}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                إلغاء
                            </button>
                            <button
                                onClick={confirmReject}
                                disabled={rejectMutation.isPending || !rejectReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {rejectMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>تأكيد</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}