'use client';

import React from 'react';
import { Card, Tag, Progress } from 'antd';
import {
  BookOutlined,
  FileTextOutlined,
  FileDoneOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import Link from 'next/link';

interface ChildCardProps {
  child: {
    id: number;
    name: string;
    email: string;
    plan?: string;
    sessions_remaining: number;
    upcoming_sessions: number;
    pending_homework: number;
    upcoming_exams: number;
  };
}

/**
 * Child Summary Card
 * Displays individual child's progress and statistics
 */
export const ChildCard: React.FC<ChildCardProps> = ({ child }) => {
  const totalSessions = 20; // This should come from plan data
  const completedSessions = totalSessions - child.sessions_remaining;
  const progressPercent = (completedSessions / totalSessions) * 100;

  return (
    <Card
      className="hover:shadow-lg transition-shadow"
      title={
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">{child.name}</span>
          <Tag color="blue">{child.plan || 'لا توجد باقة'}</Tag>
        </div>
      }
      extra={
        <Link href={`/parent/children/${child.id}`} className="text-blue-600 hover:text-blue-700">
          التفاصيل
        </Link>
      }
    >
      <div className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>تقدم الحصص</span>
            <span className="font-semibold">
              {completedSessions} / {totalSessions}
            </span>
          </div>
          <Progress
            percent={progressPercent}
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
            showInfo={false}
          />
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <BookOutlined />
              <span className="text-xs">الحصص المتبقية</span>
            </div>
            <div className="text-2xl font-bold text-blue-700">
              {child.sessions_remaining}
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CalendarOutlined />
              <span className="text-xs">حصص قادمة</span>
            </div>
            <div className="text-2xl font-bold text-green-700">
              {child.upcoming_sessions}
            </div>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <FileTextOutlined />
              <span className="text-xs">واجبات معلقة</span>
            </div>
            <div className="text-2xl font-bold text-orange-700">
              {child.pending_homework}
            </div>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <FileDoneOutlined />
              <span className="text-xs">امتحانات قادمة</span>
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {child.upcoming_exams}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
