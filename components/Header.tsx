'use client';

import { Bell, Globe, Menu, Moon, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-3 sm:px-4 lg:px-6">
  {/* Left */}
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

  {/* Right */}
  <div className="flex items-center gap-1 sm:gap-2">
    {/* Hide some icons on mobile */}
    <button className="p-2 rounded-lg hover:bg-gray-100 hidden sm:block">
      <Moon size={18} />
    </button>

    <button className="p-2 rounded-lg hover:bg-gray-100">
      <Bell size={18} />
    </button>

    <button className="p-2 rounded-lg hover:bg-gray-100 hidden md:block">
      <Globe size={18} />
    </button>

    {/* Mobile Menu */}
    <button
      onClick={onMenuClick}
      className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
    >
      <Menu size={20} />
    </button>
  </div>
</header>

  );
}
