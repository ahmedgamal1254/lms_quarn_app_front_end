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
  Settings2Icon
} from 'lucide-react';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getUser, logout } from '@/lib/auth';
import { useAppSettingsStore } from '@/store/appSetting';
import { SettingFilled } from '@ant-design/icons';

/* ---------------- MENUS ---------------- */

const adminMenuGroups = [
  { title: 'الرئيسية', icon: LayoutDashboard, href: '/dashboard', permission: 'view-dashboard' },

  {
    title: 'إدارة المستخدمين',
    icon: Users,
    items: [
      { title: 'المستخدمين', href: '/users', icon: Users, permission: 'manage-users' },
      { title: 'الطلاب', href: '/students', icon: GraduationCap, permission: 'manage-students' },
      { title: 'المعلمين', href: '/teachers', icon: UserCog, permission: 'manage-teachers' }
    ]
  },

  {
    title: 'المحتوى الأكاديمي',
    icon: BookOpen,
    items: [
      { title: 'الحصص', href: '/sessions', icon: Video, permission: 'manage-sessions' },
      { title:"الاجندة", href:"/sessions/callender", icon:File, permission: 'manage-sessions' },
      { title: 'الامتحانات', href: '/exams', icon: FileQuestion, permission: 'manage-exams' },
      { title: 'الواجبات', href: '/homework', icon: ClipboardList, permission: 'manage-homework' }
    ]
  },

  {
    title: 'الماليات',
    icon: Banknote,
    items: [
      { title: 'العملات', href: '/finances/currencies', icon: Coins, permission: 'manage-finance' },
      { title: 'المعاملات', href: '/finances/transactions', icon: ArrowRightLeft, permission: 'manage-finance' },
      { title: 'المصاريف', href: '/finances/expenses', icon: Wallet, permission: 'manage-finance' }
    ]
  },

  {
    title:"الاشتراكات",
    icon:CreditCard,
    items:[
      { title: 'الاشتراكات', href: '/subscriptions', icon: CreditCard, permission: 'manage-subscriptions' },
      { title:"الخطط", href:"/plans", icon:CreditCard, permission: 'manage-plans' },
      { title:"طلبات الاشتراك", href:"/subscription-requests", icon:CreditCard, permission: 'manage-subscriptions' }
    ]
  },

  {
    title: 'الطلبات',
    icon: WalletIcon,
    items: [
      { title: 'طلبات السحب', href: '/orders/withdraw', icon: CreditCard, permission: 'manage-withdraw-requests' },
      { title: 'طلبات الأيداع', href: '/orders/deposit', icon: WalletCardsIcon, permission: 'manage-deposit-requests' },
    ]
  },

  {
    title: 'الإعدادات',
    icon: Settings,
    items: [
      { title: 'الإعدادت', href: '/settings', icon: Settings2Icon, permission: 'manage-subjects' },
      { title: 'المواد', href: '/subjects', icon: BookOpen, permission: 'manage-subjects' }
    ]
  }
];


const studentMenuGroups = [
  { title: 'الرئيسية', icon: LayoutDashboard, href: '/student/dashboard' },
  { title: 'الحصص', icon: Video, href: '/student/sessions' },
  { title: 'الواجبات', icon: ClipboardList, href: '/student/homework' },
  { title: 'الامتحانات', icon: FileQuestion, href: '/student/exams' }
];

const teacherMenuGroups = [
  { title: 'الرئيسية', icon: LayoutDashboard, href: '/teacher/dashboard' },
  { title: 'الحصص', icon: Video, href: '/teacher/sessions' },
  { title: 'الواجبات', icon: ClipboardList, href: '/teacher/homework' },
  { title: 'الامتحانات', icon: FileQuestion, href: '/teacher/exams' },
  { title: 'الطلاب', icon: Users, href: '/teacher/students' }
]

interface MenuSidebar {
  title: string;
  icon: any;
  href?: string;
  items?: any[];
  permission?: string;
}

type UserRole = 'student' | 'teacher' | "admin";


/* ---------------- COMPONENT ---------------- */

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [permissions, setPermissions] = useState<string[]>([]);

  const [expanded, setExpanded] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);

      const settings = useAppSettingsStore((state) => state.app_settings);
  

  useEffect(() => {
    const u = getUser();
    setUser(u);

    // جلب permissions
    const perms = u?.permissions || [];
    setPermissions(perms);
  }, []);

  const roleUrls: Record<UserRole, string> = {
    student: '/student/profile',
    teacher: '/teacher/profile',
    admin:"/admin/profile"
  };

  const role = user?.role as UserRole | undefined;

  const url = role ? roleUrls[role] : '';

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
    fixed top-0 right-0 h-screen
    z-50
    w-64 sm:w-72
    bg-white border-l
    transition-transform duration-300 ease-in-out

    ${isOpen ? 'translate-x-0' : 'translate-x-full'}

    lg:translate-x-0
    lg:sticky
    lg:top-0
    lg:h-screen
  `}
>

        {/* Logo */}
<div className="flex items-center gap-4 p-6 border-b">
  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
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
    <span className="text-lg font-bold text-gray-900">
      {settings?.app_name || 'اسم المدرسة'}
    </span>
    <span className="text-sm text-gray-500">
      لوحة التحكم
    </span>
  </div>
</div>


        {/* Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menu.map((group: any) => {
            const Icon = group.icon;

            if (group.items) {
              const open = expanded.includes(group.title);

              return (
                <div key={group.title}>
                  <button
                    onClick={() => toggle(group.title)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg
                    hover:bg-gray-100 text-gray-700"
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
                    <div className="mt-1 mr-6 space-y-1">
                      {group.items.map((item: any) => {
                        const ItemIcon = item.icon;
                        return (
                          <Link
                            key={item.title}
                            href={item.href}
                            className={`
                              flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                              hover:bg-emerald-50
                              ${
                                isActive(item.href)
                                  ? 'bg-emerald-100 text-emerald-700 font-medium'
                                  : 'text-gray-600'
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
                  hover:bg-emerald-50
                  ${
                    isActive(group.href)
                      ? 'bg-emerald-100 text-emerald-700 font-medium'
                      : 'text-gray-700'
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
        <div className="p-4 border-t">
          {user && (
            <Link href={url}>
              <div className="flex items-center gap-3 p-3 mb-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-emerald-500 text-white">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
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
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
