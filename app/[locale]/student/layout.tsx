'use client';

import { Layout, Grid } from 'antd';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import AppHeader from '@/components/Header';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

const { Sider, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const params = useParams();
  const isRTL = params.locale === 'ar';

  const tAuth = useTranslations('Auth');
  const tCommon = useTranslations('Common');

  useEffect(() => {
    const handleResize = () => {
        if (window.innerWidth < 992) {
            setCollapsed(true);
        }
    };

    // Initial check on mount
    handleResize();

    // Optional: Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const siderWidth = 280;

  return (
    <Layout
      style={{
        minHeight: '100vh',
        direction: isRTL ? 'rtl' : 'ltr',
        overflow: 'hidden', // ❗ مهم
      }}
    >
      {/* Overlay (Mobile) */}
      {isMobile && !collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: 'fixed',
            display: collapsed ? 'none' : 'block',
            inset: 0,
            zIndex: 99,
          }}
        />
      )}

      {/* Sidebar (ثابت) */}
      <Sider
        width={siderWidth}
        collapsedWidth={0}
        collapsed={collapsed}
        trigger={null}
        style={{
          position: 'fixed', // ✅ ثابت فعلًا
          top: 0,
          bottom: 0,
          height: '100vh',
          zIndex: 100,
          background: 'transparent',
          [isRTL ? 'right' : 'left']: 0,
        }}
      >
        <Sidebar isOpen={!collapsed} onClose={() => setCollapsed(true)} />
      </Sider>

      {/* Main Layout */}
      <Layout
        style={{
          marginLeft: !isRTL && !isMobile && !collapsed ? siderWidth : 0,
          marginRight: isRTL && !isMobile && !collapsed ? siderWidth : 0,
          transition: 'all 0.3s ease',
        }}
      >
        {/* Header */}
        <AppHeader onMenuClick={() => setCollapsed(!collapsed)} />

        {/* Content (هو اللي يتحرك) */}
        <Content
          className='bg-white dark:bg-slate-900'
          style={{
            margin: isMobile ? '12px' : '16px',
            padding: isMobile ? '12px' : '16px',
            borderRadius: 12,
          }}
        >
          {children}
        </Content>

        {/* Footer */}
        <Footer
          style={{
            textAlign: 'center',
            background: 'transparent',
          }}
        >
          © {new Date().getFullYear()} {tCommon('schoolName')} — {tAuth('copyright')}
        </Footer>
      </Layout>
    </Layout>
  );
}
