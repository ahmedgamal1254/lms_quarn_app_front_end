"use client";
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import {
  Clock,
  Search,
  Check,
  X,
  Filter,
  Menu,
  AlertCircle,
  Loader,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';

interface SubscriptionRequest {
  id: number;
  student_id: number;
  plan_id: number;
  status: string;
  start_date: string;
  end_date: string;
  sessions_remaining: number;
  sessions_used: number;
  total_sessions: number;
  created_at: string;
  updated_at: string;
}

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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return { bg: 'bg-amber-100', border: 'border-amber-300', text: 'text-amber-800', light: 'bg-amber-50' };
    case 'active':
      return { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-800', light: 'bg-emerald-50' };
    case 'rejected':
      return { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', light: 'bg-red-50' };
    default:
      return { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800', light: 'bg-gray-50' };
  }
};

const getStatusText = (status: string) => {
  const statusMap: { [key: string]: string } = {
    pending: 'قيد الانتظار',
    active: 'نشط',
    rejected: 'مرفوض'
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

export default function SubscriptionRequestsPage() {
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch subscription requests
  const { data: requestsData, isLoading, error } = useQuery({
    queryKey: ['subscription-requests', searchQuery, statusFilter, currentPage],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', currentPage.toString());
      const response = await axiosInstance.get(`/subscriptions-requests?${params}`);
      return response.data;
    }
  });

  // Fetch students and plans
  const { data: dataAll } = useQuery({
    queryKey: ['data-all-requests'],
    queryFn: async () => {
      const response = await axiosInstance.get('/data/all');
      return response.data;
    }
  });

  const students = dataAll?.data?.students || [];
  const plans = dataAll?.data?.plans || [];
  const requests = requestsData?.data?.subscriptions || [];

  const currentPageNum = requestsData?.data?.current_page || 1;
  const lastPage = requestsData?.data?.last_page || 1;
  const totalRequests = requestsData?.data?.total || 0;

  // Activate subscription
  const activateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.get(`/subscriptions/${id}/activate`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('تم تفعيل الاشتراك بنجاح');
      queryClient.invalidateQueries({ queryKey: ['subscription-requests'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ في التفعيل');
    }
  });

  // Reject subscription
  const rejectMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.post(`/subscriptions/${id}/reject`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('تم رفض الطلب بنجاح');
      queryClient.invalidateQueries({ queryKey: ['subscription-requests'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ في الرفض');
    }
  });

  const getStudentInfo = (studentId: number) => {
    return students.find((s:Student) => s.id === studentId);
  };

  const getPlanInfo = (planId: number) => {
    return plans.find((p:Plan) => p.id === planId);
  };

  const pendingCount = requests.filter((r:SubscriptionRequest) => r.status === 'pending').length;

  return (
    <div className="flex h-screen bg-gray-50">
      

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">طلبات الاشتراك</h1>
              <p className="text-sm text-gray-500 mt-0.5">إدارة وتفعيل طلبات الاشتراك الجديدة</p>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-lg border border-amber-200">
                <Clock size={20} className="text-amber-600" />
                <span className="text-sm font-semibold text-amber-800">{pendingCount} معلق</span>
              </div>
            )}
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
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="pending">قيد الانتظار</option>
                    <option value="active">نشط</option>
                    <option value="rejected">مرفوض</option>
                    <option value="all">الكل</option>
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
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">تاريخ الطلب</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الحالة</th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {requests.length > 0 ? (
                        requests.map((req: SubscriptionRequest) => {
                          const student = getStudentInfo(req.student_id);
                          const plan = getPlanInfo(req.plan_id);
                          const statusStyle = getStatusColor(req.status);

                          return (
                            <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{student?.name || 'غير معروف'}</p>
                                  <p className="text-xs text-gray-500">{student?.email}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{plan?.name || 'غير معروفة'}</p>
                                  <p className="text-xs text-gray-500">{plan?.price} {getCurrencySymbol(plan?.currency || 'SAR')}</p>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {new Date(req.start_date).toLocaleDateString('ar-SA')}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {new Date(req.end_date).toLocaleDateString('ar-SA')}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-medium text-xs">
                                  <Package size={14} />
                                  {req.total_sessions} حصة
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-700">
                                {new Date(req.created_at).toLocaleDateString('ar-SA')}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>
                                  {getStatusText(req.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  {req.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => activateMutation.mutate(req.id)}
                                        disabled={activateMutation.isPending}
                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center gap-1"
                                        title="تفعيل"
                                      >
                                        <Check size={16} />
                                      </button>
                                      <button
                                        onClick={() => rejectMutation.mutate(req.id)}
                                        disabled={rejectMutation.isPending}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center gap-1"
                                        title="رفض"
                                      >
                                        <X size={16} />
                                      </button>
                                    </>
                                  )}
                                  {req.status === 'active' && (
                                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                      مفعل
                                    </span>
                                  )}
                                  {req.status === 'rejected' && (
                                    <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                                      مرفوض
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center text-gray-500 font-medium">
                            لا توجد طلبات اشتراك
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {
                  lastPage > 1 && (
                    <Pagination currentPage={currentPage} 
                    lastPage={lastPage} total={totalRequests} onPageChange={setCurrentPage} />
                  )
                }
              </div>
            )}
          </div>
        </div>
      </main>

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