'use client';

import { Bell, Globe, Menu, Moon, Sun, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';
import { useAppSettingsStore  } from '@/store/appSetting';
import toast from 'react-hot-toast';
import Notifications from './Notifications';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import { Link } from '@/i18n/routing';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [user, setUser] = useState<any>(null);
  const tHeader = useTranslations('Header');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setUser(getUser());
    setMounted(true);
  }, []);

  const settings = useAppSettingsStore((state) => state.app_settings);

  const locale = useLocale();
  const isRTL = locale === 'ar';

  const url = user?.role === "student" 
    ? "/student/profile" 
    : user?.role === "teacher"
    ? "/teacher/profile"
    : user?.role === "parent"
    ? "/parent-dashboard"
    : "/dashboard";

  return (
    <header 
    dir={isRTL ? "rtl" : "ltr"}
    className="h-16 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between px-3 sm:px-4 lg:px-6 sticky top-0 z-50">
  {/* Left */}
  <Link href={url}>
  <div className="flex items-center gap-3">
    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center">
      <User size={18} className="text-gray-500" />
    </div>

    {/* Hide on mobile */}
    {user && (
      <div className="leading-tight hidden sm:block">
        <p className="text-sm font-medium text-gray-900">{user.name}</p>
        <p className="text-xs text-gray-500">{user.email}</p>
      </div>
    )}
  </div>
  </Link>

  {/* Right */}
  <div className="flex items-center gap-1 sm:gap-2">
    {/* Hide some icons on mobile */}
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 hidden sm:block"
    >
      {mounted && theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
    </button>

    <Notifications />

    <div>
        <LanguageSwitcher />
    </div>

    {/* Mobile Menu */}
    <button
      onClick={onMenuClick}
      className="p-2 rounded-lg hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
    >
      <Menu size={20} />
    </button>
  </div>

  
</header>
  );
}
