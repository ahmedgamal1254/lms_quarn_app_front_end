import type { Metadata } from 'next'
import { Cairo, Almarai } from 'next/font/google'
import '@/app/globals.css'
import AuthGuard from '@/components/AuthGuard'
import { Toaster } from 'react-hot-toast';
import Providers from '@/app/providers';
import NextTopLoader from 'nextjs-toploader';
import AppSettingsProvider from '@/components/providers';
import SettingsHead from '@/components/SettingsHead';
import FirebaseNotificationsListener from '@/utils/notifications_firbae'; // Typo in original file preserved: notifications_firbae
import RegisterSW from '@/components/worker';
import {NextIntlClientProvider} from 'next-intl';
import {getMessages, getTranslations} from 'next-intl/server';

export const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['200','300','400','500','600','700','800','900'],
  display: 'swap',
});

export const almarai = Almarai({
  subsets: ['arabic'],
  weight: ['300','400','700','800'],
  display: 'swap',
});

export async function generateMetadata({
  params
}: {
  params: Promise<{locale: string}>
}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'HomePage'});
 
  return {
    title: t('title'),
    description: t('description'),
    icons: {
      icon: '/favicon.ico',
    },
  };
}

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{locale: string}>
}) {
  const {locale} = await params;
  const messages = await getMessages();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction}>
       <RegisterSW />
      <body className={`${almarai.className}`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <AppSettingsProvider>
              <SettingsHead />
              <NextTopLoader />
              <Toaster position="top-center" />
              <AuthGuard>
                {children}
              </AuthGuard>
              <FirebaseNotificationsListener />
            </AppSettingsProvider>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
