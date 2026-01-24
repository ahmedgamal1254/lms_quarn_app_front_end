'use client';

import React, { useState } from 'react';
import { Modal, Button, Input, message } from 'antd';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('ResetBalanceModal');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    try {
      setLoading(true);
      await resetTeacherBalance(teacherId, { notes });
      message.success(t('success_reset'));
      onSuccess();
      onClose();
      setNotes('');
    } catch (error: any) {
      message.error(error.response?.data?.message || t('error_reset'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <ExclamationCircleOutlined className="text-yellow-500" />
          <span>{t('title')}</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          {t('cancel')}
        </Button>,
        <Button
          key="submit"
          type="primary"
          danger
          loading={loading}
          onClick={handleReset}
        >
          {t('confirm')}
        </Button>,
      ]}
      width={500}
    >
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>{t('warning')}</strong>
          </p>
        </div>

        <div className="space-y-2">
          <p>
            <strong>{t('teacher')}:</strong> {teacherName}
          </p>
          <p>
            <strong>{t('current_balance')}:</strong>{' '}
            <span className="text-lg font-bold text-red-600">
              {currentBalance.toFixed(2)} {t('currency')}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            {t('reset_message')} <strong>0.00 {t('currency')}</strong>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t('notes')}
          </label>
          <Input.TextArea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t('notes_placeholder')}
            rows={3}
          />
        </div>
      </div>
    </Modal>
  );
};
