import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import AuthGuard from '@/components/AuthGuard'
import { Toaster } from 'react-hot-toast';
import Providers from './providers';

const cairo = Cairo({ subsets: ['arabic'] })

export const metadata: Metadata = {
  title: 'أكاديمية التميز',
  description: 'نظام إدارة المنصة التعليمية',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={cairo.className}>
        <Providers>
          <Toaster position="top-center" />
          <AuthGuard>
            {children}
          </AuthGuard>
        </Providers>
      </body>
    </html>
  )
}
