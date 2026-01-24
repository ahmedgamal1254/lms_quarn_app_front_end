'use client';

import React from 'react';
import SubscriptionCard from '@/components/SubscriptionCard';

export default function SubscriptionCardDemo() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Subscription Card Demo
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Active Subscription */}
          <SubscriptionCard
            planName="باقة اللامايبتية"
            price={250.00}
            currency="SAR"
            remainingSessions={20}
            totalSessions={16}
            completedSessions={4}
            startDate="2025-12-31"
            endDate="2026-03-31"
            isActive={true}
          />

          {/* Another Example */}
          <SubscriptionCard
            planName="الباقة الذهبية"
            price={500.00}
            currency="SAR"
            remainingSessions={15}
            totalSessions={20}
            completedSessions={5}
            startDate="2026-01-01"
            endDate="2026-04-01"
            isActive={true}
          />

          {/* Inactive Example */}
          <SubscriptionCard
            planName="الباقة الفضية"
            price={150.00}
            currency="SAR"
            remainingSessions={0}
            totalSessions={10}
            completedSessions={10}
            startDate="2025-10-01"
            endDate="2025-12-31"
            isActive={false}
          />
        </div>
      </div>
    </div>
  );
}
