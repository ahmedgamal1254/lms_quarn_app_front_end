"use client"
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { CheckCircle, XCircle, Clock, User, Calendar, DollarSign, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { AxiosError } from 'axios';

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

export default function WithdrawPage() {
    const t = useTranslations('AdminOrders');
    const tCommon = useTranslations('Common');
    const params_route = useParams();
    const isRTL = params_route.locale === 'ar';

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
            toast.success(t('successApprove'));
            setShowApproveModal(false);
            setApproveReason('');
            setSelectedRequest(null);
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<any>;
            toast.error(axiosError.response?.data?.message || t('errorApprove'));
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
            toast.success(t('successReject'));
            setShowRejectModal(false);
            setRejectReason('');
            setSelectedRequest(null);
        },
        onError: (err: unknown) => {
            const axiosError = err as AxiosError<any>;
            toast.error(axiosError.response?.data?.message || t('errorReject'));
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
        return new Date(dateString).toLocaleString(params_route.locale as string, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-red-600">{t('loadingError')}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('withdrawRequests')}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">{t('withdrawSubtitle')}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {t('totalRequests')}: <span className="font-semibold text-gray-900 dark:text-gray-100">{data?.total?.toLocaleString(params_route.locale as string) || 0}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-yellow-600" />
                                <span>{t('waitingApproval')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {data?.data.map((request) => (
                        <div key={request.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{request.wallet.owner.name}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{request.wallet.owner.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                    <Clock className="w-4 h-4" />
                                    <span>{t('waitingApproval')}</span>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-slate-900 rounded-lg p-4 mb-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('requestAmount')}</p>
                                        <p className="text-lg font-bold text-red-600">
                                            {parseFloat(request.amount).toLocaleString(params_route.locale as string)} {request.currency}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('balanceBefore')}</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {parseFloat(request.balance_before).toLocaleString(params_route.locale as string)} {request.currency}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('balanceAfter')}</p>
                                        <p className="font-semibold text-gray-900 dark:text-gray-100">
                                            {parseFloat(request.balance_after).toLocaleString(params_route.locale as string)} {request.currency}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t('currentBalance')}</p>
                                        <p className="font-semibold text-blue-600">
                                            {parseFloat(request.wallet.balance).toLocaleString(params_route.locale as string)} {request.currency}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('requestReason')}:</p>
                                <p className="text-gray-900 dark:text-gray-100">{request.reason}</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white">
                                    <Calendar className="w-4 h-4" />
                                    <span className="dark:text-white">{formatDate(request.created_at)}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleReject(request.id)}
                                        disabled={rejectMutation.isPending}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span>{t('reject')}</span>
                                    </button>
                                    <button
                                        onClick={() => handleApprove(request.id)}
                                        disabled={approveMutation.isPending}
                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        <span>{t('approve')}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {data?.data.length === 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
                            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">{t('noRequests')}</p>
                        </div>
                    )}

                    {/* pagination */}
                    {
                        (data?.data.length ?? 0) > 0 && (
                            <Pagination
                                currentPage={page}
                                total={data?.total ?? 0}
                                lastPage={data?.last_page ?? 0}    
                                onPageChange={(p)=>setPage(p)}    
                            />
                        )
                    }
                </div>
            </div>

            {showApproveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('approveConfirm')}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{t('approveQuestion')}</p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('approveReason')}</label>
                            <textarea
                                value={approveReason}
                                onChange={(e) => setApproveReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                rows={3}
                                placeholder={t('enterApproveReason')}
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
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-slate-900 transition-colors"
                            >
                                {tCommon('cancel')}
                            </button>
                            <button
                                onClick={confirmApprove}
                                disabled={approveMutation.isPending}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {approveMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>{tCommon('confirm')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('rejectConfirm')}</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{t('rejectQuestion')}</p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('rejectReason')} <span className="text-red-500">*</span></label>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                rows={3}
                                placeholder={t('enterRejectReason')}
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
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-slate-900 transition-colors"
                            >
                                {tCommon('cancel')}
                            </button>
                            <button
                                onClick={confirmReject}
                                disabled={rejectMutation.isPending || !rejectReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {rejectMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                <span>{tCommon('confirm')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}