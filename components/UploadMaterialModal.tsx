'use client';

import React, { useState } from 'react';
import { Modal, Form, Input, Upload, Button, Select, message } from 'antd';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { uploadMaterial } from '@/services/api/materials.service';
import type { UploadFile } from 'antd/es/upload/interface';

interface UploadMaterialModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subjects?: Array<{ id: number; name: string }>;
}

/**
 * Upload Educational Material Modal
 * Allows teachers to upload PDF materials
 */
export const UploadMaterialModal: React.FC<UploadMaterialModalProps> = ({
  visible,
  onClose,
  onSuccess,
  subjects = [],
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      message.error('الرجاء اختيار ملف PDF');
      return;
    }

    try {
      setLoading(true);
      const file = fileList[0].originFileObj as File;

      await uploadMaterial({
        title: values.title,
        description: values.description,
        subject_id: values.subject_id,
        file,
      });

      message.success('تم رفع المادة بنجاح وهي في انتظار الموافقة');
      form.resetFields();
      setFileList([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'حدث خطأ أثناء رفع الملف');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <FileTextOutlined />
          <span>رفع مادة تعليمية</span>
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          name="title"
          label="عنوان المادة"
          rules={[{ required: true, message: 'الرجاء إدخال عنوان المادة' }]}
        >
          <Input placeholder="مثال: كتاب القرآن الكريم - الجزء الأول" />
        </Form.Item>

        <Form.Item name="description" label="الوصف (اختياري)">
          <Input.TextArea
            rows={3}
            placeholder="وصف مختصر عن المادة التعليمية..."
          />
        </Form.Item>

        <Form.Item name="subject_id" label="المادة (اختياري)">
          <Select placeholder="اختر المادة" allowClear>
            {subjects.map((subject) => (
              <Select.Option key={subject.id} value={subject.id}>
                {subject.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="ملف PDF"
          required
          help="الحد الأقصى لحجم الملف: 10 ميجابايت"
        >
          <Upload
            accept=".pdf"
            maxCount={1}
            fileList={fileList}
            beforeUpload={(file) => {
              const isPDF = file.type === 'application/pdf';
              if (!isPDF) {
                message.error('يجب أن يكون الملف بصيغة PDF فقط!');
                return false;
              }

              const isLt10M = file.size / 1024 / 1024 < 10;
              if (!isLt10M) {
                message.error('يجب أن يكون حجم الملف أقل من 10 ميجابايت!');
                return false;
              }

              setFileList([file as any]);
              return false; // Prevent auto upload
            }}
            onRemove={() => {
              setFileList([]);
            }}
          >
            <Button icon={<UploadOutlined />}>اختر ملف PDF</Button>
          </Upload>
        </Form.Item>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleCancel}>إلغاء</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            رفع المادة
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
