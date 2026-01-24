'use client';

import React from 'react';
import { Award, CheckCircle } from 'lucide-react';

interface SubscriptionCardProps {
  planName: string;
  price: number;
  currency: string;
  remainingSessions: number;
  totalSessions: number;
  completedSessions: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function SubscriptionCard({
  planName,
  price,
  currency,
  remainingSessions,
  totalSessions,
  completedSessions,
  startDate,
  endDate,
  isActive
}: SubscriptionCardProps) {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Gradient Card */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 shadow-2xl">
        {/* Header with Icon */}
        <div className="flex items-center justify-between mb-6">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
            <Award className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-white text-2xl font-bold">الخطة الحالية</h2>
        </div>

        {/* Plan Name */}
        <h3 className="text-white text-3xl font-bold text-center mb-6">
          {planName}
        </h3>

        {/* Price Section */}
        <div className="bg-slate-800/60 dark:bg-black/70 backdrop-blur-sm rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 dark:text-gray-200 text-sm">السعر</span>
            <span className="text-white text-2xl font-bold">
              {currency} {price.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Sessions Section */}
        <div className="bg-slate-800/60 dark:bg-black/70 backdrop-blur-sm rounded-2xl p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 dark:text-gray-200 text-sm">الحصص المتبقية</span>
            <span className="text-white text-xl font-bold">
              {remainingSessions}/{totalSessions}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300 dark:text-gray-200 text-sm">الحصص المنتهية</span>
            <span className="text-white text-xl font-bold">
              {completedSessions}
            </span>
          </div>
        </div>

        {/* Dates Section */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-800/60 dark:bg-black/70 backdrop-blur-sm rounded-2xl p-4">
            <div className="text-gray-300 dark:text-gray-200 text-xs mb-2 text-center">تاريخ البدء</div>
            <div className="text-white text-sm font-bold text-center">
              {startDate}
            </div>
          </div>
          <div className="bg-slate-800/60 dark:bg-black/70 backdrop-blur-sm rounded-2xl p-4">
            <div className="text-gray-300 dark:text-gray-200 text-xs mb-2 text-center">تاريخ الانتهاء</div>
            <div className="text-white text-sm font-bold text-center">
              {endDate}
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-center gap-2 text-white">
          <CheckCircle className="w-5 h-5" />
          <span className="font-semibold">
            الحالة: {isActive ? 'نشط' : 'غير نشط'}
          </span>
        </div>
      </div>
    </div>
  );
}
