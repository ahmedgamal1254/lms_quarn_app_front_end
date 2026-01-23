'use client';

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
          message.error(data.message || 'يرجى تصحيح الأخطاء في النموذج');
          return;
        }
        throw new Error(data.message || 'حدث خطأ');
      }

      message.success('تم إضافة الطالب بنجاح');
      form.resetFields();
      clearErrors();
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.message || 'حدث خطأ أثناء إضافة الطالب');
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
          <span>إضافة طالب جديد</span>
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
            label="الاسم"
            rules={[{ required: true, message: 'الاسم مطلوب' }]}
            validateStatus={hasError('name') ? 'error' : ''}
          >
            <Input placeholder="أدخل الاسم" />
            <FieldError error={getError('name')} />
          </Form.Item>

          {/* Email */}
          <Form.Item
            name="email"
            label="البريد الإلكتروني"
            rules={[
              { required: true, message: 'البريد الإلكتروني مطلوب' },
              { type: 'email', message: 'البريد الإلكتروني غير صالح' },
            ]}
            validateStatus={hasError('email') ? 'error' : ''}
          >
            <Input placeholder="example@email.com" />
            <FieldError error={getError('email')} />
          </Form.Item>

          {/* Phone */}
          <Form.Item
            name="phone"
            label="رقم الهاتف"
            rules={[{ required: true, message: 'رقم الهاتف مطلوب' }]}
            validateStatus={hasError('phone') ? 'error' : ''}
          >
            <Input placeholder="01234567890" />
            <FieldError error={getError('phone')} />
          </Form.Item>

          {/* WhatsApp Number */}
          <Form.Item
            name="whatsapp_number"
            label="رقم الواتساب (اختياري)"
            validateStatus={hasError('whatsapp_number') ? 'error' : ''}
          >
            <WhatsAppInput placeholder="+201234567890" />
            <FieldError error={getError('whatsapp_number')} />
          </Form.Item>

          {/* Gender */}
          <Form.Item
            name="gender"
            label="الجنس"
            rules={[{ required: true, message: 'الجنس مطلوب' }]}
            validateStatus={hasError('gender') ? 'error' : ''}
          >
            <Select placeholder="اختر الجنس">
              <Select.Option value="male">ذكر</Select.Option>
              <Select.Option value="female">أنثى</Select.Option>
            </Select>
            <FieldError error={getError('gender')} />
          </Form.Item>

          {/* Birth Date */}
          <Form.Item
            name="birth_date"
            label="تاريخ الميلاد"
            validateStatus={hasError('birth_date') ? 'error' : ''}
          >
            <DatePicker className="w-full" placeholder="اختر التاريخ" />
            <FieldError error={getError('birth_date')} />
          </Form.Item>

          {/* Plan */}
          <Form.Item
            name="plan_id"
            label="الباقة"
            validateStatus={hasError('plan_id') ? 'error' : ''}
          >
            <Select placeholder="اختر الباقة" allowClear>
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
            label="كلمة المرور"
            rules={[
              { required: true, message: 'كلمة المرور مطلوبة' },
              { min: 6, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
            ]}
            validateStatus={hasError('password') ? 'error' : ''}
          >
            <Input.Password placeholder="••••••••" />
            <FieldError error={getError('password')} />
          </Form.Item>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleCancel}>إلغاء</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            حفظ
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
