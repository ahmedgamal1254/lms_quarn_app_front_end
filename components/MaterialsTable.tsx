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
      message.error('حدث خطأ أثناء تحميل المواد');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await approveMaterial(id);
      message.success('تم الموافقة على المادة بنجاح');
      fetchMaterials();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rejectMaterial(id, 'تم رفض المادة من قبل الإدارة');
      message.success('تم رفض المادة');
      fetchMaterials();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMaterial(id);
      message.success('تم حذف المادة بنجاح');
      fetchMaterials();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'حدث خطأ');
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
      message.error('حدث خطأ أثناء تحميل الملف');
    }
  };

  const columns: ColumnsType<EducationalMaterial> = [
    {
      title: 'العنوان',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'المعلم',
      dataIndex: ['teacher', 'name'],
      key: 'teacher',
      hidden: role === 'teacher',
    },
    {
      title: 'المادة',
      dataIndex: ['subject', 'name'],
      key: 'subject',
      render: (name) => name || '-',
    },
    {
      title: 'حجم الملف',
      dataIndex: 'formatted_file_size',
      key: 'file_size',
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          pending: { color: 'orange', text: 'قيد المراجعة' },
          approved: { color: 'green', text: 'موافق عليه' },
          rejected: { color: 'red', text: 'مرفوض' },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record.id, record.file_name)}
          >
            تحميل
          </Button>

          {role === 'admin' && record.status === 'pending' && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
                style={{ color: 'green' }}
              >
                موافقة
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
              >
                رفض
              </Button>
            </>
          )}

          {(role === 'admin' || role === 'teacher') && (
            <Popconfirm
              title="هل أنت متأكد من حذف هذه المادة؟"
              onConfirm={() => handleDelete(record.id)}
              okText="نعم"
              cancelText="لا"
            >
              <Button type="link" danger icon={<DeleteOutlined />}>
                حذف
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
