'use client';

import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Space, Popconfirm, message } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  getMaterials,
  approveMaterial,
  rejectMaterial,
  deleteMaterial,
  downloadMaterial,
} from '@/services/api/materials.service';
import { EducationalMaterial } from '@/services/api/materials.types';
import type { ColumnsType } from 'antd/es/table';
import { useTranslations } from 'next-intl';

interface MaterialsTableProps {
  role: 'admin' | 'teacher' | 'student';
  refresh?: number;
}

/**
 * Educational Materials Table
 * Displays materials with role-based actions
 */
export const MaterialsTable: React.FC<MaterialsTableProps> = ({
  role,
  refresh = 0,
}) => {
  const t = useTranslations('MaterialsTable');
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState<EducationalMaterial[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchMaterials();
  }, [refresh, pagination.current]);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await getMaterials({
        page: pagination.current,
        per_page: pagination.pageSize,
      });

      setMaterials(response.data?.materials || []);
      setPagination((prev) => ({
        ...prev,
        total: response.data?.total || 0,
      }));
    } catch (error) {
      message.error(t('error_load'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveMaterial(id);
      message.success(t('success_approve'));
      fetchMaterials();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('error_action'));
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectMaterial(id, t('reject_reason'));
      message.success(t('success_reject'));
      fetchMaterials();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('error_action'));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMaterial(id);
      message.success(t('success_delete'));
      fetchMaterials();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('error_action'));
    }
  };

  const handleDownload = async (id: number, fileName: string) => {
    try {
      const blob = await downloadMaterial(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      message.error(t('error_download'));
    }
  };

  const columns: ColumnsType<EducationalMaterial> = [
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('teacher'),
      dataIndex: ['teacher', 'name'],
      key: 'teacher',
      hidden: role === 'teacher',
    },
    {
      title: t('subject'),
      dataIndex: ['subject', 'name'],
      key: 'subject',
      render: (name: string) => name || '-',
    },
    {
      title: t('file_size'),
      dataIndex: 'formatted_file_size',
      key: 'file_size',
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'orange', text: t('pending') },
          approved: { color: 'green', text: t('approved') },
          rejected: { color: 'red', text: t('rejected') },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: t('actions'),
      key: 'actions',
      render: (_: any, record: EducationalMaterial) => (
        <Space>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.id, record.file_name)}
          >
            {t('download')}
          </Button>

          {role === 'admin' && record.status === 'pending' && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                style={{ color: 'green' }}
              >
                {t('approve')}
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
              >
                {t('reject')}
              </Button>
            </>
          )}

          {(role === 'admin' || role === 'teacher') && (
            <Popconfirm
              title={t('confirm_delete')}
              onConfirm={() => handleDelete(record.id)}
              okText={t('yes')}
              cancelText={t('no')}
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                {t('delete')}
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ].filter((col) => !col.hidden);

  return (
    <Table
      columns={columns}
      dataSource={materials}
      rowKey="id"
      loading={loading}
      pagination={{
        ...pagination,
        onChange: (page) => setPagination((prev) => ({ ...prev, current: page })),
      }}
    />
  );
};
