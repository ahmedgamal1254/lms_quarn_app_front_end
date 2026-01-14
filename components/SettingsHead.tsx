'use client';

import Head from 'next/head';
import { useAppSettingsStore } from '@/store/appSetting';

export default function SettingsHead() {
  const settings = useAppSettingsStore((s) => s.app_settings);

  if (!settings?.favicon) return null;

  return (
    <>
      <link rel="icon" href={settings.favicon} />
      <link rel="shortcut icon" href={settings.favicon} />
      <link rel="apple-touch-icon" href={settings.favicon} />
      <title>{settings?.app_name}</title>
      <meta name="description" content={settings?.app_description} />
      
      <meta name="theme-color" content="#000000" />
    </>
  );
}
