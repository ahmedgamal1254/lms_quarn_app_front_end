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

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    active: 'نشط',
    expired: 'منتهي',
    suspended: 'معلق',
    pending: 'قيد الانتظار'
  };
  return statusMap[status] || status;
};

const getCurrencySymbol = (currency: string): string => {
  const map: { [key: string]: string } = {
    'SAR': 'ر.س',
    'EGP': 'ج.م',
    'AED': 'د.إ',
    'USD': '$',
    'EUR': '€',
    'EG': 'ج.م'
  };
  return map[currency] || currency;
};

export default function SubscriptionsPage() {
  const queryClient = useQueryClient();
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
      toast.success('تم إضافة الاشتراك بنجاح');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ في الإضافة');
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
      toast.success('تم تحديث الاشتراك بنجاح');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ في التحديث');
    }
  });

  // Delete subscription
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.delete(`/subscriptions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('تم حذف الاشتراك بنجاح');
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ في الحذف');
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
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    if (new Date(form.start_date) >= new Date(form.end_date)) {
      toast.error('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
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
    <div className="flex bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">الاشتراكات</h1>
              <p className="text-sm text-gray-500 mt-0.5">إدارة اشتراكات الطلاب والخطط</p>
            </div>
            <div></div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-center gap-3">
                <AlertCircle size={20} />
                حدث خطأ في تحميل البيانات
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4">
              <button 
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus size={18} />
                <span>إضافة اشتراك</span>
              </button>

              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="بحث عن الطالب أو الخطة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <span>الفلاتر</span>
              </button>
            </div>

            {/* Filters */}
            {showFilters && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="all">الكل</option>
                    <option value="active">نشط</option>
                    <option value="expired">منتهي</option>
                    <option value="suspended">معلق</option>
                  </select>
                </div>
              </div>
            )}

            {/* Table */}
            {isLoading ? (
              <div className="text-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
                <p className="mt-4 text-gray-600">جاري التحميل...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الطالب</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الخطة</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">تاريخ البداية</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">تاريخ النهاية</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الحصص</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">السعر</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الحالة</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredSubscriptions.length > 0 ? (
                        filteredSubscriptions.map((sub: SubscriptionData) => {
                          const statusStyle = getStatusColor(sub.status);
                          const progress = ((sub.sessions_used / sub.total_sessions) * 100) || 0;
                          return (
                            <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{sub.student_name}</p>
                                  <p className="text-xs text-gray-500">{sub.student_email}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                                  {sub.plan_name}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {new Date(sub.start_date).toLocaleDateString('ar-SA')}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {new Date(sub.end_date).toLocaleDateString('ar-SA')}
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-gray-900">
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
                                {parseFloat(sub.plan_price).toLocaleString()} {getCurrencySymbol(sub.plan_currency)}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>
                                  {getStatusText(sub.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openEditModal(sub)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="تعديل"
                                  >
                                    <Edit size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(sub.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-medium">
                            لا توجد اشتراكات
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
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">حذف الاشتراك</h2>
            <p className="text-gray-600 mb-6">هل أنت متأكد من حذف هذا الاشتراك؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'جاري...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === 'create' ? 'إضافة اشتراك جديد' : 'تعديل الاشتراك'}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الطالب *</label>
                <select
                  value={form.student_id}
                  onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">اختر الطالب</option>
                  {students.map((student: Student) => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الخطة *</label>
                <select
                  value={form.plan_id}
                  onChange={(e) => setForm({ ...form, plan_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">اختر الخطة</option>
                  {plans.map((  plan: Plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price} {getCurrencySymbol(plan.currency)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ البداية *</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ النهاية *</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'جاري...' : (modalMode === 'create' ? 'إضافة' : 'تحديث')}
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