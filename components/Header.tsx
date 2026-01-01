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
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6">
      {/* Left - User Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <User size={20} className="text-gray-500" />
        </div>

        {user && (
          <div className="leading-tight">
            <p className="text-sm font-medium text-gray-900">
              {user.name}
            </p>
            <p className="text-xs text-gray-500">
              {user.email}
            </p>
          </div>
        )}
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-gray-100">
          <Moon size={18} className="text-gray-600" />
        </button>

        <button className="p-2 rounded-lg hover:bg-gray-100">
          <Bell size={18} className="text-gray-600" />
        </button>

        <button className="p-2 rounded-lg hover:bg-gray-100">
          <Globe size={18} className="text-gray-600" />
        </button>

        {/* Mobile Menu */}
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
        >
          <Menu size={20} className="text-gray-700" />
        </button>
      </div>
    </header>
  );
}
