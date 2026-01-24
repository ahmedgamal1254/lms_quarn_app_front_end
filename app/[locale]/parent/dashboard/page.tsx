'use client';

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { getParentDashboard } from '@/services/api/parent.service';
import { ParentDashboardStats } from '@/services/api/types';
import { ChildCard } from '@/components/ChildCard';

/**
 * Parent Dashboard Page
 * Main dashboard for parents to monitor all their children
 */
export default function ParentDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<ParentDashboardStats | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await getParentDashboard();
      setDashboardData(response.data!);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p>لا توجد بيانات متاحة</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">
          مرحباً، {dashboardData.parent.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          متابعة تقدم أبنائك الدراسي
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="عدد الأبناء"
              value={dashboardData.statistics.total_children}
              prefix={<TeamOutlined />}
              styles={{ content: { color: '#3f8600' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="الحصص هذا الشهر"
              value={dashboardData.statistics.total_sessions_this_month}
              prefix={<CalendarOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="الواجبات المعلقة"
              value={dashboardData.statistics.total_homework_pending}
              prefix={<FileTextOutlined />}
              styles={{ content: { color: '#cf1322' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Children Cards */}
      <div>
        <h2 className="text-2xl font-bold mb-4">الأبناء</h2>
        {dashboardData.children.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <UserOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <p>لم يتم ربط أي طالب بحسابك بعد</p>
            </div>
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {dashboardData.children.map((child) => (
              <Col key={child.id} xs={24} md={12} lg={8}>
                <ChildCard child={child} />
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
