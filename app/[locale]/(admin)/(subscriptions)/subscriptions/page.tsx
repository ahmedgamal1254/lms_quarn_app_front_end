"use client";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import {
  Home,
  ChevronLeft,
  CreditCard,
  Search,
  Plus,
  Trash2,
  Edit,
  Filter,
  Menu,
  X,
  AlertCircle,
  Loader,
  Calendar,
  Users,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
}

interface Plan {
  id: number;
  name: string;
  price: string;
  currency: string;
  sessions_count: number;
}

interface SubscriptionData {
  id: number;
  student_id: number;
  plan_id: number;
  status: string;
  start_date: string;
  end_date: string;
  sessions_remaining: number;
  sessions_used: number;
  total_sessions: number;
  student_name: string;
  student_email: string;
  student_phone: string;
  plan_name: string;
  plan_price: string;
  plan_currency: string;
  sessions_count: number;
}

interface SubscriptionForm {
  student_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800' };
    case 'expired':
      return { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800' };
    case 'suspended':
      return { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800' };
    default:
      return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800' };
  }
};

const getStatusText = (status: string, t: any) => {
  const statusMap: { [key: string]: string } = {
    active: t('active'),
    expired: t('expired'),
    suspended: t('suspended'),
    pending: t('pending')
  };
  return statusMap[status] || status;
};

const getCurrencySymbol = (currency: string, tCommon: any): string => {
  const map: { [key: string]: string } = {
    'SAR': tCommon('currency_sar'),
    'EGP': tCommon('currency_egp'),
    'AED': tCommon('currency_aed'),
    'USD': tCommon('currency_usd'),
    'EUR': tCommon('currency_eur'),
    'EG': tCommon('currency_egp')
  };
  return map[currency] || currency;
};

export default function SubscriptionsPage() {
  const t = useTranslations('AdminSubscriptions');
  const tCommon = useTranslations('Common');
  const queryClient = useQueryClient();
  const routeParams = useParams();
  const isRTL = routeParams.locale === 'ar';
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'delete'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const [form, setForm] = useState<SubscriptionForm>({
    student_id: '',
    plan_id: '',
    start_date: '',
    end_date: ''
  });

  // Fetch subscriptions
  const { data: subscriptionsData, isLoading, error } = useQuery({
    queryKey: ['subscriptions', searchQuery, statusFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);4
      params.append('page', currentPage.toString());
      params.append("per_page", "5");
      const response = await axiosInstance.get(`/subscriptions?${params}`);
      return response.data;
    }
  });

  // Fetch students and plans
  const { data: dataAll } = useQuery({
    queryKey: ['data-all-subscriptions'],
    queryFn: async () => {
      const response = await axiosInstance.get('/data/all');
      return response.data;
    }
  });

  const students = dataAll?.data?.students || [];
  const plans = dataAll?.data?.plans || [];
  const subscriptions = subscriptionsData?.data?.subscriptions || [];

  const currentPageNum = subscriptionsData?.data?.current_page || 1;
  const lastPage = subscriptionsData?.data?.last_page || 1;
  const totalSubscriptions = subscriptionsData?.data?.total || 0;

  const filteredSubscriptions = subscriptions.filter((sub: SubscriptionData) => {
    const matchSearch = sub.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.plan_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Create subscription
  const createMutation = useMutation({
    mutationFn: async (data: SubscriptionForm) => {
      const response = await axiosInstance.post('/subscriptions', {
        student_id: parseInt(data.student_id),
        plan_id: parseInt(data.plan_id),
        start_date: data.start_date,
        end_date: data.end_date
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('successAdd'));
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('errorAdd'));
    }
  });

  // Update subscription
  const updateMutation = useMutation({
    mutationFn: async (data: SubscriptionForm) => {
      const response = await axiosInstance.put(`/subscriptions/${selectedId}`, {
        student_id: parseInt(data.student_id),
        plan_id: parseInt(data.plan_id),
        start_date: data.start_date,
        end_date: data.end_date
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('successUpdate'));
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('errorUpdate'));
    }
  });

  // Delete subscription
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/subscriptions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('successDelete'));
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t('errorDelete'));
    }
  });

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedId(null);
    setForm({ student_id: '', plan_id: '', start_date: '', end_date: '' });
    setShowModal(true);
  };

  const openEditModal = (sub: SubscriptionData) => {
    setModalMode('edit');
    setSelectedId(sub.id);
    setForm({
      student_id: sub.student_id.toString(),
      plan_id: sub.plan_id.toString(),
      start_date: sub.start_date.split('T')[0],
      end_date: sub.end_date.split('T')[0]
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({ student_id: '', plan_id: '', start_date: '', end_date: '' });
  };

  const handleSubmit = () => {
    if (!form.student_id || !form.plan_id || !form.start_date || !form.end_date) {
      toast.error(tCommon('requiredFields'));
      return;
    }

    if (new Date(form.start_date) >= new Date(form.end_date)) {
      toast.error(t('dateError'));
      return;
    }

    if (modalMode === 'create') {
      createMutation.mutate(form);
    } else {
      updateMutation.mutate(form);
    }
  };

  const handleDelete = (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId);
    }
  };

  return (
    <div className="flex bg-gray-50 dark:bg-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('allSubscriptions')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t('subscriptionsSubtitle')}</p>
            </div>
            <div></div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-3">
                <AlertCircle size={20} />
                {t('loadingDataError')}
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus size={18} />
                <span>{t('addSubscription')}</span>
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-medium ${
                  showFilters
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter size={18} />
                <span>{tCommon('filters')}</span>
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('statusFilter')}</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                  >
                    <option value="all">{t('allStatuses')}</option>
                    <option value="active">{t('active')}</option>
                    <option value="expired">{t('expired')}</option>
                    <option value="suspended">{t('suspended')}</option>
                  </select>
                </div>
              </div>
            )}

            {/* Table */}
            {isLoading ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <p className="mt-4 text-gray-600 dark:text-gray-400">{tCommon('loading')}</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">{t('studentName')}</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">{t('planName')}</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">{t('startDate')}</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">{t('endDate')}</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">{t('sessions')}</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">{t('price')}</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">{tCommon('status')}</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">{tCommon('actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredSubscriptions.length > 0 ? (
                        filteredSubscriptions.map((sub: SubscriptionData) => {
                          const statusStyle = getStatusColor(sub.status);
                          const progress = ((sub.sessions_used / sub.total_sessions) * 100) || 0;
                          return (
                            <tr key={sub.id} className="hover:bg-gray-50 dark:bg-slate-900 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{sub.student_name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{sub.student_email}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700">
                                  {sub.plan_name}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                {new Date(sub.start_date).toLocaleDateString(routeParams.locale as string)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                {new Date(sub.end_date).toLocaleDateString(routeParams.locale as string)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {sub.sessions_used} / {sub.total_sessions}
                                  </div>
                                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-blue-600 transition-all"
                                      style={{ width: `${progress}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                                {parseFloat(sub.plan_price).toLocaleString(routeParams.locale as string)} {getCurrencySymbol(sub.plan_currency, tCommon)}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>
                                  {getStatusText(sub.status, t)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openEditModal(sub)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors"
                                    title="تعديل"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(sub.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors"
                                    title="حذف"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 font-medium">
                            {t('noSubscriptions')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                { subscriptions && (
                    <Pagination 
                      currentPage={currentPage}
                      lastPage={lastPage}
                      total={subscriptionsData.data.total}
                      onPageChange={setCurrentPage}
                    />
                  )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('deleteConfirmTitle')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('deleteConfirmMessage')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:bg-slate-900 transition-colors font-medium"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {deleteMutation.isPending ? t('formLoading') : tCommon('delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-slate-800">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {modalMode === 'create' ? t('addSubscription') : t('editSubscription')}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 dark:bg-slate-800 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tCommon('student')} *</label>
                <select
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                >
                  <option value="">{t('selectStudent')}</option>
                  {students.map((student: Student) => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{tCommon('plan')} *</label>
                <select
                  value={form.plan_id}
                  onChange={(e) => setForm({ ...form, plan_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                >
                  <option value="">{t('selectPlan')}</option>
                  {plans.map((  plan: Plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {parseFloat(plan.price).toLocaleString(routeParams.locale as string)} {getCurrencySymbol(plan.currency, tCommon)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('startDateLabel')} *</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('endDateLabel')} *</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:bg-slate-900 transition-colors font-medium"
                >
                  {tCommon('cancel')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? t('formLoading') : (modalMode === 'create' ? tCommon('add') : tCommon('save'))}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}