'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Award,
  Edit2,
  Save,
  X,
  Camera,
  Lock,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe,
  BookOpen,
  Users,
  Link as LinkIcon,
  XCircle,
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslations, useLocale } from 'next-intl';

interface Subject {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  status: string;
}

interface Transaction {
  id: number;
  wallet_id: number;
  amount: string;
  approve_reason: string | null;
  reject_reason: string | null;
  currency: string;
  type: 'credit' | 'debit';
  reason: string | null;
  reference_type: string;
  reference_id: number;
  balance_before: string;
  balance_after: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

interface Wallet {
  id: number;
  balance: string;
  pendingWithdraw: number;
  totalEarnings: string;
  paidAmount: string;
  pendingAmount: string;
  transactions: Transaction[];
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone: string;
  country_code: string;
  gender: string;
  hourly_rate: string;
  total_hours: number;
  currency: string;
  rating: string;
  image: string | null;
  status: string;
  session_link_type: string;
  session_link: string;
  subjects_string: string;
  total_students: number;
  total_sessions: number;
  total_minutes: number;
  total_earned: number;
  subjects: Subject[];
  wallet: Wallet;
}


export default function TeacherProfile() {
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'transactions'>('profile');
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const t = useTranslations('TeacherProfile');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // Fetch profile data
  const { data: profileData, isLoading, error } = useQuery<Teacher>({
    queryKey: ['teacher-profile'],
    queryFn: async () => {
      const res = await axiosInstance.get('/teacher/profile');
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold">
            {axios.isAxiosError(error) ? error.response?.data?.message || t('errorLoading') : t('errorLoading')}
          </p>
        </div>
      </div>
    );
  }

  const teacher = profileData;

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600 mt-2">{t('description')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Users} label={t('totalStudents')} value={teacher?.total_students || 0} color="bg-blue-50 text-blue-600" />
          <StatCard icon={BookOpen} label={t('totalSessions')} value={teacher?.total_sessions || 0} color="bg-green-50 text-green-600" />
          <StatCard icon={Clock} label={t('totalHours')} value={teacher?.total_hours || 0} color="bg-orange-50 text-orange-600" />
          <StatCard icon={Award} label={t('rating')} value={`${teacher?.rating || 0} ⭐`} color="bg-yellow-50 text-yellow-600" />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6 p-2 flex gap-2 border border-gray-100">
          <TabButton
            active={activeTab === 'profile'}
            onClick={() => setActiveTab('profile')}
            icon={User}
            label={t('profile')}
          />
          <TabButton
            active={activeTab === 'wallet'}
            onClick={() => setActiveTab('wallet')}
            icon={Wallet}
            label={t('wallet')}
          />
          <TabButton
            active={activeTab === 'transactions'}
            onClick={() => setActiveTab('transactions')}
            icon={DollarSign}
            label={t('transactions')}
          />
        </div>

        {/* Content */}
        {activeTab === 'profile' && (
          <ProfileTab
            teacher={teacher!}
            editMode={editMode}
            setEditMode={setEditMode}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
            setShowPasswordModal={setShowPasswordModal}
            queryClient={queryClient}
            t={t}
            isRTL={isRTL}
          />
        )}

        {activeTab === 'wallet' && (
          <WalletTab wallet={teacher?.wallet!} currency={teacher?.currency!} t={t} />
        )}

        {activeTab === 'transactions' && (
          <TransactionsTab transactions={teacher?.wallet?.transactions || []} currency={teacher?.currency!} t={t} />
        )}
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <PasswordModal
          onClose={() => setShowPasswordModal(false)}
          queryClient={queryClient}
          t={t}
        />
      )}
    </div>
  );
}

// Profile Tab Component
function ProfileTab({ teacher, editMode, setEditMode, imagePreview, setImagePreview, setShowPasswordModal, queryClient, t, isRTL }: any) {
  const [formData, setFormData] = useState({
    name: teacher?.name || '',
    country_code: teacher?.country_code || '+20',
    phone: teacher?.phone || '',
    hourly_rate: teacher?.hourly_rate || '',
    session_link: teacher?.session_link || '',
    session_link_type: teacher?.session_link_type || '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post('/teacher/profile', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-profile'] });
      setEditMode(false);
      toast.success(t('successUpdate'));
    },
    onError: (error: any) => {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.message || t('errorUpdate') : t('errorUpdate'));
    }
  });

  const updateImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axiosInstance.post('/teacher/profile/update-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-profile'] });
      setImagePreview(null);
      toast.success(t('successImage'));
    },
    onError: (error: any) => {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.message || t('errorImage') : t('errorImage'));
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('image', file);
      updateImageMutation.mutate(formData);
    }
  };

  const handleSave = () => {
    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Profile Info Card */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">{t('basicInfo')}</h2>
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Edit2 className="w-4 h-4" />
                {t('edit')}
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {t('save')}
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  <X className="w-4 h-4" />
                  {t('cancel')}
                </button>
              </div>
            )}
          </div>

          {/* Profile Image */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <img
                src={imagePreview || teacher?.image || '/api/placeholder/150/150'}
                alt={teacher?.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-purple-100"
              />
              <label className={`absolute bottom-0 ${isRTL ? 'right-0' : 'right-0'} bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition`}>
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {updateImageMutation.isPending && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              icon={User}
              label={t('name')}
              value={formData.name}
              onChange={(e:any) => setFormData({ ...formData, name: e.target.value })}
              disabled={!editMode}
              isRTL={isRTL}
            />
            <FormField
              icon={Mail}
              label={t('email')}
              value={teacher?.email}
              disabled={true}
              isRTL={isRTL}
            />
            <FormField
              icon={Globe}
              label={t('countryCode')}
              value={formData.country_code}
              onChange={(e:any) => setFormData({ ...formData, country_code: e.target.value })}
              disabled={!editMode}
              isRTL={isRTL}
            />
            <FormField
              icon={Phone}
              label={t('phone')}
              value={formData.phone}
              onChange={(e:any) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!editMode}
              isRTL={isRTL}
            />
            
            <FormField
              icon={DollarSign}
              label={`${t('hourlyRate')} (${teacher?.currency})`}
              type="number"
              value={formData.hourly_rate}
              onChange={(e:any) => setFormData({ ...formData, hourly_rate: e.target.value })}
              disabled={!editMode}
              isRTL={isRTL}
            />
            <FormField
              icon={LinkIcon}
              label={t('sessionLinkType')}
              value={formData.session_link_type}
              onChange={(e:any) => setFormData({ ...formData, session_link_type: e.target.value })}
              disabled={!editMode}
              isRTL={isRTL}
            />
            <FormField
              icon={LinkIcon}
              label={t('sessionLink')}
              value={formData.session_link}
              onChange={(e:any) => setFormData({ ...formData, session_link: e.target.value })}
              disabled={!editMode}
              isRTL={isRTL}
            />
          </div>
        </div>

        {/* Action Card */}
        <ActionCard
          icon={Lock}
          title={t('changePassword')}
          description={t('changePasswordDesc')}
          onClick={() => setShowPasswordModal(true)}
          color="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Side Cards */}
      <div className="space-y-6">
        {/* Subjects Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t('subjects')}</h3>
          <div className="space-y-2">
            {teacher?.subjects?.map((subject: Subject) => (
              <div key={subject.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: subject.color }}>
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-900">{subject.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-4">{t('accountStatus')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>{t('status')}</span>
              <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-semibold">
                {teacher?.status === 'active' ? t('active') : t('inactive')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('gender')}</span>
              <span>{teacher?.gender === 'male' ? t('male') : t('female')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('totalMinutes')}</span>
              <span className="font-bold">{teacher?.total_minutes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wallet Tab Component
function WalletTab({ wallet, currency, t }: { wallet: Wallet; currency: string; t: any }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">{t('availableBalance')}</h3>
          <Wallet className="w-10 h-10" />
        </div>
        <div className="text-5xl font-bold mb-2">{wallet?.balance} {currency}</div>
        <p className="text-green-100">{t('availableToWithdraw')}</p>
      </div>

      {/* Pending Withdraw */}
      <div className="bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">{t('pendingWithdraw')}</h3>
          <Clock className="w-10 h-10" />
        </div>
        <div className="text-5xl font-bold mb-2">{wallet?.pendingWithdraw} {currency}</div>
        <p className="text-orange-100">{t('underReview')}</p>
      </div>

      {/* Total Earnings */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm text-gray-600">{t('totalEarnings')}</h4>
            <p className="text-2xl font-bold text-gray-900">{wallet?.totalEarnings} {currency}</p>
          </div>
        </div>
      </div>

      {/* Paid Amount */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h4 className="text-sm text-gray-600">{t('paidAmount')}</h4>
            <p className="text-2xl font-bold text-gray-900">{wallet?.paidAmount} {currency}</p>
          </div>
        </div>
      </div>

      {/* Pending Amount */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h4 className="text-sm text-gray-600">{t('pendingAmount')}</h4>
            <p className="text-2xl font-bold text-gray-900">{wallet?.pendingAmount} {currency}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Transactions Tab Component
function TransactionsTab({ transactions, currency, t }: { transactions: Transaction[]; currency: string; t: any }) {
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">{t('transactionsHistory')}</h2>
        <p className="text-sm text-gray-600 mt-1">{t('transactionsDesc')}</p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {sortedTransactions.length > 0 ? (
          sortedTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} currency={currency} t={t} />
          ))
        ) : (
          <div className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('noTransactions')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Transaction Item Component
function TransactionItem({ transaction, currency, t }: { transaction: Transaction; currency: string; t: any }) {
  const isCredit = transaction.type === 'credit';
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800'
  };
  
  const statusLabels: any = {
    completed: t('completed'),
    pending: t('pending'),
    failed: t('failed')
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isCredit ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {isCredit ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-gray-900">
                {isCredit ? t('addCredit') : t('withdrawCredit')}
              </h4>
              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusColors[transaction.status]}`}>
                {statusLabels[transaction.status]}
              </span>
            </div>
            
            {transaction.reason && (
              <p className="text-sm text-gray-600 mb-2">{transaction.reason}</p>
            )}
            
            {transaction.reject_reason && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg mb-2">
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-red-800">{t('rejectReason')}</p>
                  <p className="text-sm text-red-700">{transaction.reject_reason}</p>
                </div>
              </div>
            )}
            
            {transaction.approve_reason && (
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg mb-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-green-800">{t('approveNote')}</p>
                  <p className="text-sm text-green-700">{transaction.approve_reason}</p>
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-4 text-xs text-gray-500 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(transaction.created_at).toLocaleDateString(t('countryCode') === '+20' ? 'ar-EG' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(transaction.created_at).toLocaleTimeString(t('countryCode') === '+20' ? 'ar-EG' : 'en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              <span>{t('balanceBefore')} {transaction.balance_before} {currency}</span>
              <span className="mx-2">←</span>
              <span>{t('balanceAfter')} {transaction.balance_after} {currency}</span>
            </div>
          </div>
        </div>
        
        <div className="text-left flex-shrink-0">
          <p className={`text-2xl font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
            {isCredit ? '+' : '-'}{transaction.amount}
          </p>
          <p className="text-sm text-gray-600">{currency}</p>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className={`${color} rounded-xl shadow-md p-5 border border-gray-100`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">{label}</span>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition ${
        active
          ? 'bg-purple-600 text-white shadow-md'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function FormField({ icon: Icon, label, type = 'text', value, onChange, disabled, isRTL }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <Icon className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`} />
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full ${isRTL ? 'pl-10 pr-4' : 'pr-10 pl-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-600`}
        />
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, onClick, color, isRTL }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 text-start border border-gray-100 group`}
    >
      <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}

// Password Modal Component
function PasswordModal({ onClose, queryClient, t }: any) {
  const [formData, setFormData] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post('/teacher/profile/update-password', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success(t('successPassword'));
      onClose();
    },
    onError: (error: any) => {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.message || t('errorPassword') : t('errorPassword'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirmation) {
      toast.error(t('passwordMismatch'));
      return;
    }
    updatePasswordMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('changePassword')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('currentPassword')}</label>
            <input
              type="password"
              value={formData.current_password}
              onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('newPassword')}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('confirmPassword')}</label>
            <input
              type="password"
              value={formData.password_confirmation}
              onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={updatePasswordMutation.isPending}
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updatePasswordMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                t('save')
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}