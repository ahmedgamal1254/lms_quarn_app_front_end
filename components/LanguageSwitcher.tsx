'use client';

import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/routing';
import { useTransition } from 'react';
import { Select } from 'antd';

export default function LanguageSwitcher() {
  const t = useTranslations('Common');
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    startTransition(() => {
      router.replace(pathname, {locale: newLocale});
    });
  };

  return (
    <div className="relative inline-block text-left">
      <Select
        defaultValue={locale}
        disabled={isPending}
        onChange={(value) => handleChange(value)}
        className="block w-full px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        
        options={[
          { value: 'en', label: 'English' },
          { value: 'ar', label: 'العربية' },
        ]}
      />
    </div>
  );
}
