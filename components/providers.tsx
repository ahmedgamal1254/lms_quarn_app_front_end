'use client';

import { useAppSettings } from '@/hooks/useAppSettings';

export default function AppSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useAppSettings();

  return <>{children}</>;
}
