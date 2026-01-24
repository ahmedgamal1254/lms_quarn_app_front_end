'use client';

import { Layout, Grid } from 'antd';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import AppHeader from '@/components/Header';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

const { Sider, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const params = useParams();
  const isRTL = params.locale === 'ar';

  const tAuth = useTranslations('Auth');
  const tCommon = useTranslations('Common');

  const siderWidth = 280;

  useEffect(() => {
    const handleResize = () => {
        // if (window.innerWidth < 992) {
            setCollapsed(true);
        // }
    };

    // Initial check on mount
    handleResize();

    // Optional: Listen for resize events
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
}, []);

  return (
    <Layout
      style={{
        minHeight: '100vh',
        direction: isRTL ? 'rtl' : 'ltr',
        overflow: 'hidden',
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

      {/* Sidebar */}
      <Sider
        width={siderWidth}
        collapsedWidth={0}
        collapsed={collapsed}
        trigger={null}
        style={{
          position: 'fixed',
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

        {/* Content */}
        <Content
          style={{
            margin: isMobile ? '12px' : '16px',
            padding: isMobile ? '12px' : '16px',
            background: '#fff',
            borderRadius: 12,
            height: 'calc(100vh - 140px)',
            overflowY: 'auto',
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
