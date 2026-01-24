'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, GraduationCap, ArrowRight, Sparkles, UserCog, BookOpen, Users } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import { getFcmToken } from "@/utils/getFcmToken";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {Link} from '@/i18n/routing'; // Use localized Link

export default function LoginPage() {
  const t = useTranslations('Auth');
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
            token: await getFcmToken(),
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
             setError(res.data.message || t('loginError'));
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">

        {/* Top Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center shadow">
              <span className="text-3xl">🎓</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{t('welcomeTitle')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('welcomeSubtitle')}</p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{t('platformDescription')}</p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg p-8 space-y-6">

          {/* Quick Register */}
          <Link href="/register/student">
            <button className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2">
              <GraduationCap size={18} />
              {t('createStudentAccount')}
              <ArrowRight size={18} />
            </button>
          </Link>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
            <span className="text-gray-400 dark:text-gray-500 text-xs font-semibold px-2">{t('orLogin')}</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={t('enterEmail')}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder={t('enterPassword')}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                <span className="text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">{t('rememberMe')}</span>
              </label>
              <a href="#" className="text-indigo-600 hover:text-indigo-700 font-semibold transition-colors">
                {t('forgotPassword')}
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
                <span>{t('verifying')}</span>
              ) : (
                <>
                  <span>{t('login')}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 dark:text-gray-400 text-xs">
            © 2024 {t('welcomeTitle')} {t('welcomeSubtitle')}
            <span className="text-gray-400"> • </span>
            <a href="#" className="text-gray-500 hover:text-gray-700 transition-colors">{t('copyright')}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
