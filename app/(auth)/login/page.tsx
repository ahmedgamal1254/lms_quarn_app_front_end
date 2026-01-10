'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, GraduationCap, ArrowRight, Sparkles, UserCog, BookOpen, Users } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';



export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
        const res = await axiosInstance.post('/auth/login', {
            email,
            password,
            }, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (res.data.success) {
        // حفظ التوكن والمستخدم
            const { saveAuth, getRedirectPath } = await import('@/lib/auth');
            saveAuth(res.data.data.token, res.data.data.user);

            // إعادة توجيه حسب دور المستخدم
            const redirectPath = getRedirectPath(res.data.data.user.role);
            router.push(redirectPath || '/dashboard');
        } else {
             setError(res.data.message || 'خطأ في تسجيل الدخول');
        }
    } catch (err: any) {
        const message = err?.response?.data?.message || 'حدث خطأ في الاتصال بالخادم';
        setError(message);
        console.error(err);
        toast.error(message);
    } finally {
        setLoading(false);
    }
    }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" dir="rtl">
      <div className="w-full max-w-md">

        {/* Top Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center shadow">
              <span className="text-3xl">🎓</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">أكاديمية</h1>
              <p className="text-sm text-gray-500">التميز التعليمية</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm">منصة تعليمية متكاملة لإدارة العملية التعليمية</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">

          {/* Quick Register */}
          <Link href="/register/student">
            <button className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2">
              <GraduationCap size={18} />
              إنشاء حساب طالب جديد
              <ArrowRight size={18} />
            </button>
          </Link>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-400 text-xs font-semibold px-2">أو سجل الدخول</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="أدخل بريدك الإلكتروني"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all text-right placeholder:text-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="أدخل كلمة المرور"
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all text-right placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-600 group-hover:text-gray-800 transition-colors">تذكرني</span>
              </label>
              <a href="#" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                هل نسيت كلمة المرور؟
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md hover:scale-105'
              }`}
            >
              {loading ? (
                <span>جاري التحقق...</span>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            © 2024 أكاديمية التميز
            <span className="text-gray-400"> • </span>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">جميع الحقوق محفوظة</a>
          </p>
        </div>
      </div>
    </div>
  );
}
