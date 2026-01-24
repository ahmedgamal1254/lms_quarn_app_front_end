'use client';

import React, { useState } from 'react';
import { Modal, Form, Input, Upload, Button, Select, message } from 'antd';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('UploadMaterialModal');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleSubmit = async (values: any) => {
    if (fileList.length === 0) {
      message.error(t('file_required'));
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



      message.success(t('success_upload'));
      form.resetFields();
      setFileList([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.response?.data?.message || t('error_upload'));
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
          <span>{t('title')}</span>
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
          label={t('material_title')}
          rules={[{ required: true, message: t('title_required') }]}
        >
          <Input placeholder={t('title_placeholder')} />
        </Form.Item>

        <Form.Item name="description" label={t('description')}>
          <Input.TextArea
            rows={3}
            placeholder={t('desc_placeholder')}
          />
        </Form.Item>

        <Form.Item name="subject_id" label={t('subject')}>
          <Select placeholder={t('select_subject')} allowClear>
            {subjects.map((subject) => (
              <Select.Option key={subject.id} value={subject.id}>
                {subject.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label={t('pdf_file')}
          required
          help={t('max_size')}
        >
          <Upload
            accept=".pdf"
            maxCount={1}
            fileList={fileList}
            beforeUpload={(file) => {
              const isPDF = file.type === 'application/pdf';
              if (!isPDF) {
                message.error(t('file_type_error'));
                return false;
              }

              const isLt10M = file.size / 1024 / 1024 < 10;
              if (!isLt10M) {
                message.error(t('file_size_error'));
                return false;
              }

              setFileList([file as any]);
              return false; // Prevent auto upload
            }}
            onRemove={() => {
              setFileList([]);
            }}
          >
            <Button icon={<UploadOutlined />}>{t('choose_file')}</Button>
          </Upload>
        </Form.Item>

        <div className="flex justify-end gap-2 mt-6">
          <Button onClick={handleCancel}>{t('cancel')}</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {t('upload')}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
