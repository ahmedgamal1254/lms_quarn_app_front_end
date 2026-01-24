'use client';

import { useTranslations } from 'next-intl';

import React, { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import { FieldError, useFormErrors } from '@/components/FieldError';
import { WhatsAppInput } from '@/components/WhatsAppInput';

interface AddStudentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plans?: Array<{ id: number; name: string; price: number; currency: string }>;
}

/**
 * Add Student Modal with Field-Specific Error Display
 */
export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  visible,
  onClose,
  onSuccess,
  plans = [],
}) => {
  const t = useTranslations('AddStudentModal');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { errors, setFieldErrors, clearErrors, getError, hasError } = useFormErrors();

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      clearErrors();

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (data.errors) {
          setFieldErrors(data.errors);
          message.error(data.message || t('fix_errors'));
          return;
        }
        throw new Error(data.message || t('error_add'));
      }

      message.success(t('success_add'));
      form.resetFields();
      clearErrors();
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.message || t('error_add'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    clearErrors();
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <UserAddOutlined />
          <span>{t('title')}</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <Form.Item
            name="name"
            label={t('name')}
            rules={[{ required: true, message: t('name_required') }]}
            validateStatus={hasError('name') ? 'error' : ''}
          >
            <Input placeholder={t('enter_name')} />
            <FieldError error={getError('name')} />
          </Form.Item>

          {/* Email */}
          <Form.Item
            name="email"
            label={t('email')}
            rules={[
              { required: true, message: t('email_required') },
              { type: 'email', message: t('email_invalid') },
            ]}
            validateStatus={hasError('email') ? 'error' : ''}
          >
            <Input placeholder={t('enter_email')} />
            <FieldError error={getError('email')} />
          </Form.Item>

          {/* Phone */}
          <Form.Item
            name="phone"
            label={t('phone')}
            rules={[{ required: true, message: t('phone_required') }]}
            validateStatus={hasError('phone') ? 'error' : ''}
          >
            <Input placeholder={t('enter_phone')} />
            <FieldError error={getError('phone')} />
          </Form.Item>

          {/* WhatsApp Number */}
          <Form.Item
            name="whatsapp_number"
            label={t('whatsapp_optional')}
            validateStatus={hasError('whatsapp_number') ? 'error' : ''}
          >
            <WhatsAppInput placeholder="+201234567890" />
            <FieldError error={getError('whatsapp_number')} />
          </Form.Item>

          {/* Gender */}
          <Form.Item
            name="gender"
            label={t('gender')}
            rules={[{ required: true, message: t('gender_required') }]}
            validateStatus={hasError('gender') ? 'error' : ''}
          >
            <Select placeholder={t('select_gender')}>
              <Select.Option value="male">{t('male')}</Select.Option>
              <Select.Option value="female">{t('female')}</Select.Option>
            </Select>
            <FieldError error={getError('gender')} />
          </Form.Item>

          {/* Birth Date */}
          <Form.Item
            name="birth_date"
            label={t('birth_date')}
            validateStatus={hasError('birth_date') ? 'error' : ''}
          >
            <DatePicker className="w-full" placeholder={t('select_date')} />
            <FieldError error={getError('birth_date')} />
          </Form.Item>

          {/* Plan */}
          <Form.Item
            name="plan_id"
            label={t('plan')}
            validateStatus={hasError('plan_id') ? 'error' : ''}
          >
            <Select placeholder={t('select_plan')} allowClear>
              {plans.map((plan) => (
                <Select.Option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.price} {plan.currency}
                </Select.Option>
              ))}
            </Select>
            <FieldError error={getError('plan_id')} />
          </Form.Item>

          {/* Password */}
          <Form.Item
            name="password"
            label={t('password')}
            rules={[
              { required: true, message: t('password_required') },
              { min: 6, message: t('password_min') },
            ]}
            validateStatus={hasError('password') ? 'error' : ''}
          >
            <Input.Password placeholder="••••••••" />
            <FieldError error={getError('password')} />
          </Form.Item>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleCancel}>{t('cancel')}</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {t('save')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
