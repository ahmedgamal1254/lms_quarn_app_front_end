'use client';

import React, { useState } from 'react';
import { Modal, Button, Input, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { resetTeacherBalance } from '@/services/api/teacher-finance.service';

interface ResetBalanceModalProps {
  visible: boolean;
  teacherId: number;
  teacherName: string;
  currentBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * Reset Teacher Balance Modal
 * Allows admin to reset teacher's monthly balance with confirmation
 */
export const ResetBalanceModal: React.FC<ResetBalanceModalProps> = ({
  visible,
  teacherId,
  teacherName,
  currentBalance,
  onClose,
  onSuccess,
}) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    try {
      setLoading(true);
      await resetTeacherBalance(teacherId, { notes });
      message.success('تم إعادة تعيين رصيد المعلم بنجاح');
      onSuccess();
      onClose();
      setNotes('');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'حدث خطأ أثناء إعادة تعيين الرصيد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-yellow-500" />
          <span>تأكيد إعادة تعيين الرصيد</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          إلغاء
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          loading={loading}
          onClick={handleReset}
        >
          تأكيد إعادة التعيين
        </Button>,
      ]}
      width={500}
    >
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>تحذير:</strong> هذا الإجراء لا يمكن التراجع عنه!
          </p>
        </div>

        <div className="space-y-2">
          <p>
            <strong>المعلم:</strong> {teacherName}
          </p>
          <p>
            <strong>الرصيد الحالي:</strong>{' '}
            <span className="text-lg font-bold text-red-600">
              {currentBalance.toFixed(2)} ريال
            </span>
          </p>
          <p className="text-sm text-gray-600">
            سيتم إعادة تعيين الرصيد إلى <strong>0.00 ريال</strong>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            ملاحظات (اختياري)
          </label>
          <Input.TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="أضف ملاحظات حول سبب إعادة التعيين..."
            rows={3}
          />
        </div>
      </div>
    </Modal>
  );
};
