'use client';

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  BookOpen,
  Video,
  FileQuestion,
  ClipboardList,
  CreditCard,
  Settings,
  ChevronDown,
  Banknote,
  Coins,
  ArrowRightLeft,
  Wallet,
  LogOut,
  User,
  File,
  WalletIcon,
  WalletMinimalIcon,
  WalletCardsIcon,
  Settings2Icon,
  MessageCircle
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { getUser, logout } from '@/lib/auth';
import { useAppSettingsStore } from '@/store/appSetting';
import { SettingFilled } from '@ant-design/icons';
import { useTranslations } from 'next-intl';

interface MenuItem {
  title: string;
  icon: any;
  href?: string;
  items?: MenuItem[];
  permission?: string;
}

type UserRole = 'student' | 'teacher' | 'admin' | 'parent';

interface MenuSidebar {
  title: string;
  icon: any;
  items?: MenuItem[];
  permission?: string;
}

/* ---------------- MENUS ---------------- */

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const t = useTranslations('Sidebar');
  const pathname = usePathname();
  const router = useRouter();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const settings = useAppSettingsStore((state) => state.app_settings);
  const tCommon = useTranslations('Common');
  const params = useParams();
  const isRTL = params.locale === 'ar';

  useEffect(() => {
    const u = getUser();
    setUser(u);
    const perms = u?.permissions || [];
    setPermissions(perms);
  }, []);

  const roleUrls: Record<UserRole, string> = {
    student: '/student/profile',
    teacher: '/teacher/profile',
    admin: '/admin/dashboard',
    parent: '/parent-dashboard'
  };

  const role = user?.role as UserRole | undefined;
  const url = role ? roleUrls[role] : '';

  // Define menus inside component to access translations
  const adminMenuGroups = [
    { title: t('home'), icon: LayoutDashboard, href: '/dashboard', permission: 'view-dashboard' },
    {
      title: t('userManagement'),
      icon: Users,
      items: [
        { title: t('users'), href: '/users', icon: Users, permission: 'manage-users' },
        { title: t('students'), href: '/students', icon: GraduationCap, permission: 'manage-students' },
        { title: t('teachers'), href: '/teachers', icon: UserCog, permission: 'manage-teachers' },
        { title: t('parents'), href: '/parent', icon: Users, permission: 'manage-users' }
      ]
    },
    {
      title: t('academicContent'),
      icon: BookOpen,
      items: [
        { title: t('sessions'), href: '/sessions', icon: Video, permission: 'manage-sessions' },
        { title: t('calendar'), href: "/sessions/callender", icon:File, permission: 'manage-sessions' },
        { title: t('exams'), href: '/exams', icon: FileQuestion, permission: 'manage-exams' },
        { title: t('homework'), href: '/homework', icon: ClipboardList, permission: 'manage-homework' }
      ]
    },
    {
      title: t('finances'),
      icon: Banknote,
      items: [
        { title: t('currencies'), href: '/finances/currencies', icon: Coins, permission: 'manage-finance' },
        { title: t('transactions'), href: '/finances/transactions', icon: ArrowRightLeft, permission: 'manage-finance' },
        { title: t('expenses'), href: '/finances/expenses', icon: Wallet, permission: 'manage-finance' }
      ]
    },
    {
      title: t('subscriptions'),
      icon:CreditCard,
      items:[
        { title: t('subscriptions'), href: '/subscriptions', icon: CreditCard, permission: 'manage-subscriptions' },
        { title: t('plans'), href:"/plans", icon:CreditCard, permission: 'manage-plans' },
        { title: t('subscriptionRequests'), href:"/subscription-requests", icon:CreditCard, permission: 'manage-subscriptions' }
      ]
    },
    {
      title: t('orders'),
      icon: WalletIcon,
      items: [
        { title: t('withdrawRequests'), href: '/orders/withdraw', icon: CreditCard, permission: 'manage-withdraw-requests' },
        { title: t('depositRequests'), href: '/orders/deposit', icon: WalletCardsIcon, permission: 'manage-deposit-requests' },
      ]
    },
    {
      title: t('settings'),
      icon: Settings,
      items: [
        { title: t('generalSettings'), href: '/settings', icon: Settings2Icon, permission: 'manage-subjects' },
        { title: t('subjects'), href: '/subjects', icon: BookOpen, permission: 'manage-subjects' }
      ]
    }
  ];

  const studentMenuGroups = [
    { title: t('home'), icon: LayoutDashboard, href: '/student/dashboard' },
    { title: t('sessions'), icon: Video, href: '/student/sessions' },
    { title: t('homework'), icon: ClipboardList, href: '/student/homework' },
    { title: t('exams'), icon: FileQuestion, href: '/student/exams' },
    { title: t('chat'), icon: MessageCircle, href: '/student/chat' },
  ];

  const teacherMenuGroups = [
    { title: t('home'), icon: LayoutDashboard, href: '/teacher/dashboard' },
    { title: t('sessions'), icon: Video, href: '/teacher/sessions' },
    { title: t('homework'), icon: ClipboardList, href: '/teacher/homework' },
    { title: t('exams'), icon: FileQuestion, href: '/teacher/exams' },
    { title: t('students'), icon: Users, href: '/teacher/students' },
    { title: t('chat'), icon: MessageCircle, href: '/teacher/chat' },
  ];

  const parentMenuGroups = [
    { title: t('home'), icon: LayoutDashboard, href: '/parent-dashboard' },
  ];

  const filteredMenu = (menu: MenuSidebar[]) => {
    return menu
      .map(group => {
        if (group.items) {
          const filteredItems = group.items.filter(item => !item.permission || permissions.includes(item.permission));
          if (filteredItems.length === 0) return null;
          return { ...group, items: filteredItems };
        }
        if (group.permission && !permissions.includes(group.permission)) return null;
        return group;
      })
      .filter(Boolean);
  };

  const menu =
  user?.role === 'student'
    ? studentMenuGroups
    : user?.role === 'teacher'
    ? teacherMenuGroups
    : user?.role === 'parent'
    ? parentMenuGroups
    : filteredMenu(adminMenuGroups);

  const isActive = (href?: string) => href && pathname.startsWith(href);

  const toggle = (title: string) => {
    setExpanded(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/20 z-40 lg:hidden transition
        ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-[calc(100vh)]
          z-50
          w-64 sm:w-72
          bg-white dark:bg-slate-900 ${isRTL ? 'border-l' : 'border-r'} dark:border-slate-800
          transition-transform duration-300 ease-in-out
          flex flex-col

          ${isOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}

          lg:translate-x-0
          lg:sticky
          lg:top-0
          lg:h-screen
        `}
      >

        {/* Logo */}
<div className="flex items-center gap-4 p-6 border-b dark:border-slate-800">
  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
    {settings?.logo ? (
      <img
        src={settings.logo}
        alt={settings?.app_name || 'App Logo'}
        className="w-full h-full object-contain"
      />
    ) : (
      <span className="text-sm text-gray-400 font-semibold">
        LOGO
      </span>
    )}
  </div>

  <div className="flex flex-col">
    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
      {settings?.app_name || tCommon('schoolName')}
    </span>
    <span className="text-sm text-gray-500 dark:text-gray-400">
      {tCommon('controlPanel')}
    </span>
  </div>
</div>


        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-gray-300 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700
          [&::-webkit-scrollbar-thumb]:rounded-full
        ">
          {menu.map((group: any) => {
            const Icon = group.icon;

            if (group.items) {
              const open = expanded.includes(group.title);

              return (
                <div key={group.title}>
                  <button
                    onClick={() => toggle(group.title)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg
                    hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      {group.title}
                    </div>
                    <ChevronDown
                      size={16}
                      className={`transition ${open ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {open && (
                    <div className={`mt-1 ${isRTL ? 'mr-6' : 'ml-6'} space-y-1`}>
                      {group.items.map((item: any) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.title}
                            href={item.href}
                            className={`
                              flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                              hover:bg-emerald-50 dark:hover:bg-emerald-900/30
                              ${
                                isActive(item.href)
                                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-medium'
                                  : 'text-gray-600 dark:text-gray-400'
                              }
                            `}
                          >
                            <ItemIcon size={16} />
                            {item.title}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={group.title}
                href={group.href}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg
                  hover:bg-emerald-50 dark:hover:bg-emerald-900/30
                  ${
                    isActive(group.href)
                      ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 font-medium'
                      : 'text-gray-700 dark:text-gray-200'
                  }
                `}
              >
                <Icon size={18} />
                {group.title}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t dark:border-slate-800">
          {user && (
            <Link href={url}>
              <div className="flex items-center gap-3 p-3 mb-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500 text-white">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                </div>
              </div>
            </Link>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2
            bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
          >
            <LogOut size={18} />
            {t('logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
