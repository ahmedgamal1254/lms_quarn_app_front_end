'use client';

import { Layout, Grid } from 'antd';
import { useState } from 'react';
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

  return (
    <Layout
      style={{
        minHeight: '100vh',
        direction: isRTL ? 'rtl' : 'ltr',
        overflow: 'hidden',
      }}
    >
      {/* Overlay (Mobile Only) */}
      {isMobile && !collapsed && (
        <div
          onClick={() => setCollapsed(true)}
          style={{
            position: 'fixed',
            inset: 0,
            background: "transparent",
            zIndex: 99,
          }}
        />
      )}

      {/* Sidebar */}
      <Sider
        width={280}
        collapsedWidth={0}
        collapsible
        collapsed={collapsed}
        trigger={null}
        style={{
          position: isMobile ? 'fixed' : 'sticky',
          top: 0,
          bottom: 0,
          height: '100vh',
          zIndex: 100,
          background:"transparent",
          [isRTL ? 'right' : 'left']: 0,
        }}
      >
        <Sidebar isOpen={!collapsed} onClose={() => setCollapsed(true)} />
      </Sider>

      {/* Main Layout */}
      <Layout
        style={{
          
          transition: 'all 0.3s ease',
        }}
      >
        {/* Header */}
        <AppHeader onMenuClick={() => setCollapsed(!collapsed)} />

        {/* Content */}
        <Content
          style={{
            margin: isMobile ? '12px' : '16px',
            padding: isMobile ? '12px' : '16px',
            background: '#fff',
            borderRadius: 12,
            minHeight: 'calc(100vh - 140px)',
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
