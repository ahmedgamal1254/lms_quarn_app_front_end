import type { Metadata } from 'next'
import { Cairo, Almarai } from 'next/font/google'
import './globals.css'
import AuthGuard from '@/components/AuthGuard'
import { Toaster } from 'react-hot-toast';
import Providers from './providers';
import Head from 'next/head';
import RegisterSW from '@/components/worker';
import NextTopLoader from 'nextjs-toploader';
import AppSettingsProvider from '@/components/providers';
import { useAppSettingsStore } from '@/store/appSetting';
import SettingsHead from '@/components/SettingsHead';
import FirebaseNotificationsListener from '@/utils/notifications_firbae';

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

export const metadata: Metadata = {
  title: 'أكاديمية التميز',
  description: 'نظام إدارة المنصة التعليمية',
  icons: {
    icon: '/favicon.ico', // fallback
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  
  return (
    <html lang="ar" dir="rtl">
      <RegisterSW />
      <body className={`${almarai.className}`}>
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
      </body>
    </html>
  )
}
