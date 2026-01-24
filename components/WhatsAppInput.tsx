'use client';

import React from 'react';
import { Input } from 'antd';
import { WhatsAppOutlined } from '@ant-design/icons';
import { useTranslations } from 'next-intl';

interface WhatsAppInputProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * WhatsApp Input Component
 * Displays a phone input with WhatsApp icon and validation
 */
export const WhatsAppInput: React.FC<WhatsAppInputProps> = ({
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className = '',
}) => {
  const t = useTranslations('WhatsAppInput');
  return (
    <Input
      prefix={<WhatsAppOutlined style={{ color: '#25D366' }} />}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder || t('placeholder')}
      required={required}
      disabled={disabled}
      className={className}
      dir="ltr"
      style={{ textAlign: 'left' }}
    />
  );
};

/**
 * WhatsApp Link Component
 * Displays a clickable WhatsApp link
 */
interface WhatsAppLinkProps {
  number?: string;
  className?: string;
  children?: React.ReactNode;
}

export const WhatsAppLink: React.FC<WhatsAppLinkProps> = ({
  number,
  className = '',
  children,
}) => {
  if (!number) return null;

  // Remove any non-numeric characters except +
  const cleanNumber = number.replace(/[^0-9+]/g, '');
  const whatsappUrl = `https://wa.me/${cleanNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 text-green-600 hover:text-green-700 ${className}`}
    >
      <WhatsAppOutlined style={{ fontSize: '18px', color: '#25D366' }} />
      {children || number}
    </a>
  );
};
