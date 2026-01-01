'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';
import axiosInstance from '@/lib/axios';

interface Plan {
  id: number;
  name: string;
  description: string;
  sessions_count: number;
  price: string;
  currency: string;
}

interface FormValues {
  name: string;
  email: string;
  password: string;
  phone: string;
  country_code: string;
  plan_id: string;
}

export default function StudentRegisterPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      country_code: '+966',
      plan_id: ''
    }
  });

  const selectedPlan = watch('plan_id');

  // Fetch plans from API
  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await axiosInstance.get('/get-plans');
        const data = await res.data;
        if (data.success) setPlans(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPlans(false);
      }
    }
    fetchPlans();
  }, []);

  // Submit handler
  const onSubmit = async (values: FormValues) => {
    if (!values.plan_id) {
      setError('الرجاء اختيار الباقة');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axiosInstance.post('/auth/student-register', values);

      const data = await res.data;

      if (data.success) {
        // بعد التسجيل يمكن التوجيه للصفحة الرئيسية أو تسجيل الدخول
        router.push('/login');
      } else {
        setError(data.error || 'حدث خطأ في التسجيل');
      }
    } catch (err) {
      console.error(err);
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">تسجيل طالب جديد</h1>
        <p className="text-gray-500 text-center mb-6">انضم إلى أكاديمية التميز وابدأ رحلتك التعليمية</p>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">الاسم الكامل *</label>
            <input
              type="text"
              {...register('name', { required: 'الرجاء إدخال الاسم' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="أحمد محمد"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">رقم الهاتف *</label>
            <div className="flex gap-2">
              <select
                {...register('country_code')}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="+966">+966 🇸🇦</option>
                <option value="+20">+20 🇪🇬</option>
                <option value="+971">+971 🇦🇪</option>
                <option value="+965">+965 🇰🇼</option>
                <option value="+974">+974 🇶🇦</option>
                <option value="+973">+973 🇧🇭</option>
                <option value="+968">+968 🇴🇲</option>
                <option value="+962">+962 🇯🇴</option>
              </select>
              <input
                type="tel"
                {...register('phone', { required: 'الرجاء إدخال رقم الهاتف' })}
                placeholder="500000000"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">البريد الإلكتروني *</label>
            <input
              type="email"
              {...register('email', { required: 'الرجاء إدخال البريد الإلكتروني' })}
              placeholder="student@example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">كلمة المرور *</label>
            <input
              type="password"
              {...register('password', { required: 'الرجاء إدخال كلمة المرور', minLength: { value: 6, message: 'يجب أن تكون 6 أحرف على الأقل' } })}
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          {/* Plans */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">اختر الباقة *</label>
            {loadingPlans ? (
              <div className="flex justify-center py-4">
                <Loader2 className="animate-spin text-indigo-500" />
              </div>
            ) : (
              <Controller
                control={control}
                name="plan_id"
                rules={{ required: 'الرجاء اختيار الباقة' }}
                render={({ field }) => (
                  <div className="grid gap-2">
                    {plans.map(plan => (
                      <label
                        key={plan.id}
                        className={`border rounded-lg p-3 cursor-pointer flex flex-col ${
                          field.value === plan.id.toString() ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          value={plan.id}
                          checked={field.value === plan.id.toString()}
                          onChange={() => field.onChange(plan.id.toString())}
                          className="hidden"
                        />
                        <span className="font-semibold text-gray-800">{plan.name}</span>
                        <span className="text-gray-500 text-sm">
                          {plan.sessions_count} حصة • {plan.price} {plan.currency}
                        </span>
                        {plan.description && <span className="text-gray-400 text-xs mt-1">{plan.description}</span>}
                      </label>
                    ))}
                  </div>
                )}
              />
            )}
            {errors.plan_id && <p className="text-red-500 text-sm mt-1">{errors.plan_id.message}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || loadingPlans}
            className={`w-full py-3 rounded-lg text-white font-bold flex justify-center items-center gap-2 transition ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
            {loading ? 'جاري التسجيل...' : 'تسجيل الآن'}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-500 text-sm">
          بعد التسجيل، سيتم مراجعة طلبك من قبل الإدارة وسيتم إشعارك بالموافقة
        </div>
      </div>
    </div>
  );
}
