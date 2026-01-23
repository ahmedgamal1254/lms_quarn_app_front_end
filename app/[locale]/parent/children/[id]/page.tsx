'use client';

import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Tabs, Table, Tag, Spin, message } from 'antd';
import {
  CalendarOutlined,
  FileTextOutlined,
  FileDoneOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { useParams } from 'next/navigation';
import { getChildDetails, getChildSessions, getChildHomework, getChildExams } from '@/services/api/parent.service';

const { TabPane } = Tabs;

export default function ChildDetailsPage() {
  const params = useParams();
  const childId = parseInt(params.id as string);
  const isRTL = params.locale === 'ar';
  
  const [loading, setLoading] = useState(true);
  const [childData, setChildData] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    fetchChildData();
  }, [childId]);

  const fetchChildData = async () => {
    try {
      setLoading(true);
      const [childRes, sessionsRes, homeworkRes, examsRes] = await Promise.all([
        getChildDetails(childId),
        getChildSessions(childId),
        getChildHomework(childId),
        getChildExams(childId),
      ]);

      setChildData(childRes.data);
      setSessions(sessionsRes.data?.sessions || []);
      setHomework(homeworkRes.data?.homework || []);
      setExams(examsRes.data?.exams || []);
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

  if (!childData) {
    return (
      <div className="text-center py-8">
        <p>لا توجد بيانات متاحة</p>
      </div>
    );
  }

  const sessionsColumns = [
    {
      title: 'العنوان',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'التاريخ',
      dataIndex: 'session_date',
      key: 'session_date',
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'green' : status === 'upcoming' ? 'blue' : 'orange'}>
          {status === 'completed' ? 'مكتملة' : status === 'upcoming' ? 'قادمة' : 'جارية'}
        </Tag>
      ),
    },
  ];

  const homeworkColumns = [
    {
      title: 'العنوان',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'تاريخ التسليم',
      dataIndex: 'due_date',
      key: 'due_date',
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'submitted' ? 'green' : status === 'pending' ? 'orange' : 'red'}>
          {status === 'submitted' ? 'مسلم' : status === 'pending' ? 'معلق' : 'متأخر'}
        </Tag>
      ),
    },
  ];

  const examsColumns = [
    {
      title: 'العنوان',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'التاريخ',
      dataIndex: 'exam_date',
      key: 'exam_date',
    },
    {
      title: 'الدرجة',
      dataIndex: 'score',
      key: 'score',
      render: (score: number, record: any) => (
        score ? `${score} / ${record.total_marks}` : '-'
      ),
    },
  ];

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">{childData.name}</h1>
        <p className="text-gray-600">{childData.email}</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="text-center">
              <BookOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
              <div className="mt-2">
                <div className="text-2xl font-bold">{childData.sessions_remaining || 0}</div>
                <div className="text-gray-600 text-sm">الحصص المتبقية</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="text-center">
              <CalendarOutlined style={{ fontSize: '32px', color: '#52c41a' }} />
              <div className="mt-2">
                <div className="text-2xl font-bold">{childData.upcoming_sessions || 0}</div>
                <div className="text-gray-600 text-sm">حصص قادمة</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="text-center">
              <FileTextOutlined style={{ fontSize: '32px', color: '#faad14' }} />
              <div className="mt-2">
                <div className="text-2xl font-bold">{childData.pending_homework || 0}</div>
                <div className="text-gray-600 text-sm">واجبات معلقة</div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <div className="text-center">
              <FileDoneOutlined style={{ fontSize: '32px', color: '#722ed1' }} />
              <div className="mt-2">
                <div className="text-2xl font-bold">{childData.upcoming_exams || 0}</div>
                <div className="text-gray-600 text-sm">امتحانات قادمة</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Tabs */}
      <Card>
        <Tabs defaultActiveKey="sessions">
          <TabPane tab="الحصص" key="sessions">
            <Table
              columns={sessionsColumns}
              dataSource={sessions}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'لا توجد حصص' }}
            />
          </TabPane>
          <TabPane tab="الواجبات" key="homework">
            <Table
              columns={homeworkColumns}
              dataSource={homework}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'لا توجد واجبات' }}
            />
          </TabPane>
          <TabPane tab="الامتحانات" key="exams">
            <Table
              columns={examsColumns}
              dataSource={exams}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              locale={{ emptyText: 'لا توجد امتحانات' }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
}
