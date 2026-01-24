'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Spin } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import { getTeacherResetHistory } from '@/services/api/teacher-finance.service';
import { TeacherFinancialReset } from '@/services/api/materials.types';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';

interface ResetHistoryTableProps {
  teacherId: number;
  refresh?: number; // Used to trigger refresh
}

/**
 * Teacher Reset History Table
 * Displays the history of monthly balance resets for a teacher
 */
export const ResetHistoryTable: React.FC<ResetHistoryTableProps> = ({
  teacherId,
  refresh = 0,
}) => {
  const t = useTranslations('ResetHistoryTable');
  const tCommon = useTranslations('Common');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<TeacherFinancialReset[]>([]);

  useEffect(() => {
    fetchHistory();
  }, [teacherId, refresh]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await getTeacherResetHistory(teacherId);
      setHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching reset history:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<TeacherFinancialReset> = [
    {
      title: t('date'),
      dataIndex: 'reset_date',
      key: 'reset_date',
      render: (date: string) => new Date(date).toLocaleDateString('ar-EG'),
    },
    {
      title: t('prev_balance'),
      dataIndex: 'previous_balance',
      key: 'previous_balance',
      render: (balance: number) => (
        <span className="font-semibold">{balance.toFixed(2)} {tCommon('currency_sar')}</span>
      ),
    },
    {
      title: t('reset_amount'),
      dataIndex: 'reset_amount',
      key: 'reset_amount',
      render: (amount: number) => (
        <span className="text-red-600 font-semibold">
          {amount.toFixed(2)} {tCommon('currency_sar')}
        </span>
      ),
    },
    {
      title: t('admin'),
      dataIndex: 'admin_name',
      key: 'admin_name',
      render: (name: string) => name || t('unknown'),
    },
    {
      title: t('notes'),
      dataIndex: 'notes',
      key: 'notes',
      render: (notes: string) => notes || '-',
    },
  ];

  if (loading && history.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spin size="large" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <HistoryOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
        <p>{t('no_history')}</p>
      </div>
    );
  }

  return (
    <Table
      columns={columns}
      dataSource={history}
      rowKey="id"
      loading={loading}
      pagination={{
        pageSize: 10,
        showSizeChanger: false,
      }}
    />
  );
};
