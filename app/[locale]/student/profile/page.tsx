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
  Package,
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe,
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

interface Plan {
  id: number;
  name: string;
  description: string;
  sessions_count: number;
  price: string;
  currency: string;
  status: string;
  start_date?: string;
  end_date?: string;
  sessions_remaining?: number;
  sessions_used?: number;
  total_sessions?: number;
}

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  country_code?: string;
  birth_date?: string;
  gender: string;
  image: string;
  status: string;
  created_at: string;
  plan?: Plan;
}

interface ProfileData {
  student: Student;
}

export default function StudentProfile() {
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const t = useTranslations('Profile');

  const params=useParams();
  const isRTL = params.locale === 'ar';

  // Fetch profile data
  const { data: profileData, isLoading, error } = useQuery<ProfileData>({
    queryKey: ['student-profile'],
    queryFn: async () => {
      const res = await axiosInstance.get('/student/profile');
      return res.data.data;
    }
  });

  // Fetch available plans
  const { data: plansData } = useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await axiosInstance.get('/get-plans');
      return res.data.data;
    },
    enabled: showSubscriptionModal
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center border border-gray-100 dark:border-gray-700">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold">
            {axios.isAxiosError(error) ? error.response?.data?.message || t('errorLoading') : t('errorLoading')}
          </p>
        </div>
      </div>
    );
  }

  const student = profileData?.student;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 px-4" 
    dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('description')}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 space-y-6">
            <ProfileInfoCard
              student={student!}
              editMode={editMode}
              setEditMode={setEditMode}
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
              queryClient={queryClient}
            />

            {/* Action Cards */}
            <div className="grid md:grid-cols-2 gap-4">
              <ActionCard
                icon={Lock}
                title={t('changePassword')}
                description={t('changePasswordDesc')}
                onClick={() => setShowPasswordModal(true)}
                color="bg-orange-50 text-orange-600"
              />
              <ActionCard
                icon={Package}
                title={t('changePlan')}
                description={t('changePlanDesc')}
                onClick={() => setShowSubscriptionModal(true)}
                color="bg-purple-50 text-purple-600"
              />
            </div>
          </div>

          {/* Subscription Card */}
          <div className="lg:col-span-1">
            <SubscriptionCard plan={student?.plan} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPasswordModal && (
        <PasswordModal
          onClose={() => setShowPasswordModal(false)}
          queryClient={queryClient}
        />
      )}

      {showSubscriptionModal && (
        <SubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
          plans={plansData || []}
          currentPlanId={student?.plan?.id}
          queryClient={queryClient}
        />
      )}
    </div>
  );
}

// Profile Info Card Component
function ProfileInfoCard({ student, editMode, setEditMode, imagePreview, setImagePreview, queryClient }: any) {
  const t = useTranslations('Profile');
  const [formData, setFormData] = useState({
    name: student?.name || '',
    country_code: student?.country_code || '+20',
    phone: student?.phone || '',
    birth_date: student?.birth_date || '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post('/student/profile', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      setEditMode(false);
      toast.success(t('updateSuccess'));
    },
    onError: (error: any) => {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.message || t('updateError') : t('updateError'));
    }
  });

  const updateImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await axiosInstance.post('/student/profile/update-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      setImagePreview(null);
      toast.success(t('imageSuccess'));
    },
    onError: (error: any) => {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.message || t('imageError') : t('imageError'));
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
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('personalInfo')}</h2>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition"
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
            src={imagePreview || student?.image || '/placeholder.png'}
            alt={student?.name}
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
          />
          <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
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
        />
        <FormField
          icon={Mail}
          label={t('email')}
          value={student?.email}
          disabled={true}
        />
        <FormField
          icon={Globe}
          label={t('countryCode')}
          value={formData.country_code}
          onChange={(e:any) => setFormData({ ...formData, country_code: e.target.value })}
          disabled={!editMode}
        />
        <FormField
          icon={Phone}
          label={t('phone')}
          value={formData.phone}
          onChange={(e:any) => setFormData({ ...formData, phone: e.target.value })}
          disabled={!editMode}
        />
        <FormField
          icon={Calendar}
          label={t('birthDate')}
          type="date"
          value={formData.birth_date}
          onChange={(e:any) => setFormData({ ...formData, birth_date: e.target.value })}
          disabled={!editMode}
        />
        <FormField
          icon={CheckCircle}
          label={t('status')}
          value={student?.status === 'active' ? t('active') : t('inactive')}
          disabled={true}
        />
      </div>
    </div>
  );
}

// Form Field Component
function FormField({ icon: Icon, label, type = 'text', value, onChange, disabled }: any) {
  const params = useParams();
  const isRTL = params.locale === 'ar';

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <div className="relative">
        <Icon className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400`} />
        <input
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-slate-800 disabled:text-gray-600 dark:disabled:text-gray-400`}
        />
      </div>
    </div>
  );
}

// Subscription Card Component
function SubscriptionCard({ plan }: { plan?: Plan }) {
  const t = useTranslations('Profile');

  if (!plan) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('currentPlan')}</h2>
        <div className="text-center py-8">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{t('noPlan')}</p>
        </div>
      </div>
    );
  }

  const progress = ((plan.sessions_used || 0) / (plan.total_sessions || 1)) * 100;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{t('currentPlan')}</h2>
        <Award className="w-8 h-8" />
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
          <p className="text-blue-100 text-sm">{plan.description}</p>
        </div>

        <div className="bg-white/20 dark:bg-black/70 backdrop-blur-sm rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-100 dark:text-gray-200">{t('price')}</span>
            <span className="text-2xl font-bold text-white">{plan.price} {plan.currency}</span>
          </div>
        </div>

        <div className="bg-white/20 dark:bg-black/70 backdrop-blur-sm rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-100 dark:text-gray-200">{t('sessionsUsed')}</span>
            <span className="font-bold text-white">{plan.sessions_used} / {plan.total_sessions}</span>
          </div>
          <div className="w-full bg-white/30 dark:bg-black/40 rounded-full h-2">
            <div
              className="bg-white dark:bg-gray-200 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-blue-100 dark:text-gray-300">{t('sessionsRemaining')}</span>
            <span className="text-sm font-bold text-white">{plan.sessions_remaining}</span>
          </div>
        </div>

        {plan.start_date && plan.end_date && (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white/20 dark:bg-black/70 backdrop-blur-sm rounded-lg p-3">
              <div className="text-blue-100 dark:text-gray-300 mb-1">{t('startDate')}</div>
              <div className="font-semibold text-white">{plan.start_date}</div>
            </div>
            <div className="bg-white/20 dark:bg-black/70 backdrop-blur-sm rounded-lg p-3">
              <div className="text-blue-100 dark:text-gray-300 mb-1">{t('endDate')}</div>
              <div className="font-semibold text-white">{plan.end_date}</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>{t('status')}: {plan.status === 'active' ? t('active') : t('inactive')}</span>
        </div>
      </div>
    </div>
  );
}

// Action Card Component
function ActionCard({ icon: Icon, title, description, onClick, color }: any) {
  const isrtl=useParams().locale === 'ar';

  return (
    <button
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-all p-6 border border-gray-100 dark:border-gray-700 group`}
    >
      <div className={`w-12 h-12 ${color} dark:bg-opacity-20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className={`font-bold text-gray-900 dark:text-gray-100 mb-2 ${isrtl ? 'text-right' : 'text-left'}`}>{title}</h3>
      <p className={`text-sm text-gray-600 dark:text-gray-400 ${isrtl ? 'text-right' : 'text-left'}`}>{description}</p>
    </button>
  );
}

// Password Modal Component
function PasswordModal({ onClose, queryClient }: any) {
  const t = useTranslations('Profile');
  const params = useParams();
  const isRTL = params.locale === 'ar';
  const [formData, setFormData] = useState({
    current_password: '',
    password: '',
    confirmed_password: '',
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await axiosInstance.post('/student/profile/update-password', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success(t('passwordSuccess'));
      onClose();
    },
    onError: (error: any) => {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.message || t('passwordError') : t('passwordError'));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmed_password) {
      toast.error(t('passwordMismatch'));
      return;
    }
    updatePasswordMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('changePassword')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('currentPassword')}</label>
            <input
              type="password"
              value={formData.current_password}
              onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('newPassword')}</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('confirmPassword')}</label>
            <input
              type="password"
              value={formData.confirmed_password}
              onChange={(e) => setFormData({ ...formData, confirmed_password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={updatePasswordMutation.isPending}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
              className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Subscription Modal Component
function SubscriptionModal({ onClose, plans, currentPlanId, queryClient }: any) {
  const t = useTranslations('Profile');
  const params = useParams();
  const isRTL = params.locale === 'ar';
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const subscribeMutation = useMutation({
    mutationFn: async (plan_id: number) => {
      const res = await axiosInstance.post('/student/profile/subscription', { plan_id });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-profile'] });
      toast.success(t('subscribeSuccess'));
      onClose();
    },
    onError: (error: any) => {
      toast.error(axios.isAxiosError(error) ? error.response?.data?.message || t('subscribeError') : t('subscribeError'));
    }
  });

  const handleSubscribe = () => {
    if (selectedPlanId) {
      subscribeMutation.mutate(selectedPlanId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('choosePlan')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {plans.map((plan: Plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`cursor-pointer border-2 rounded-xl p-6 transition-all ${
                selectedPlanId === plan.id
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : currentPlanId === plan.id
                  ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              {currentPlanId === plan.id && (
                <div className="bg-green-600 text-white text-xs px-3 py-1 rounded-full mb-3 inline-block">
                  {t('currentPlan')}
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{plan.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('price')}</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{plan.price} {plan.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{t('sessionsCount')}</span>
                  <span className="font-bold text-gray-900 dark:text-gray-100">{plan.sessions_count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubscribe}
            disabled={!selectedPlanId || subscribeMutation.isPending}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {subscribeMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('subscribing')}
              </>
            ) : (
              t('subscribe')
            )}
          </button>
          <button
            onClick={onClose}
            className="px-6 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition"
          >
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}