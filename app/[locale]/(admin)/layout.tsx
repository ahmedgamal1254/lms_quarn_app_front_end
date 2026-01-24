'use client';

import { Layout, Grid } from 'antd';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

const { Sider, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const tCommon = useTranslations('Common');
    const tAuth = useTranslations('Auth');
    const [collapsed, setCollapsed] = useState(false);
    const params = useParams();
    const isRTL = params.locale === 'ar';
    
    const screens = useBreakpoint();
    const isMobile = !screens.lg;
    const siderWidth = 260;

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

    return (
        <Layout style={{ minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr', overflow: 'hidden' }}>
            {/* Overlay (Mobile) */}
            {isMobile && !collapsed && (
                <div
                    onClick={() => setCollapsed(true)}
                    style={{
                        position: 'fixed',
                        display: collapsed ? 'none' : 'block',
                        inset: 0,
                        zIndex: 99,
                        background: 'rgba(0, 0, 0, 0.5)', 
                    }}
                />
            )}

            {/* Sidebar */}
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                width={siderWidth}
                breakpoint="lg"
                collapsedWidth={0}
                trigger={null}
                className="responsive-sider"
                style={{
                    position: 'fixed',
                    display: collapsed ? 'none' : 'block',
                    top: 0,
                    bottom: 0,
                    height: '100vh',
                    zIndex: 100,
                    [isRTL ? 'right' : 'left']: 0,
                }}
            >
                <Sidebar
                    isOpen={!collapsed}
                    onClose={() => setCollapsed(true)}
                />
            </Sider>

            {/* Main Area */}
            <Layout
                style={{
                    marginLeft: !isRTL && !isMobile && !collapsed ? siderWidth : 0,
                    marginRight: isRTL && !isMobile && !collapsed ? siderWidth : 0,
                    transition: 'all 0.3s ease',
                }}
            >
                {/* Header */}
                <Header onMenuClick={() => setCollapsed(!collapsed)} />

                {/* Content */}
                <Content
                    className="dark:bg-slate-900 bg-white"
                    style={{
                        margin: isMobile ? '12px' : '16px',
                    
                        borderRadius: '8px',
                        minHeight: 'calc(100vh - 160px)',
                        overflowY: 'auto',
                    }}
                >
                    {children}
                </Content>

                {/* Footer */}
                <Footer
                    // style={{
                    //     textAlign: 'center',
                    //     background: '#f9fafb',
                    //     // dark mode
                    //     background: '#f9fafb',
                    // }}
                    className="dark:text-white text-center
                     bg-white dark:bg-slate-900"
                >
                    © {new Date().getFullYear()} {tCommon('schoolName')} — {tAuth('copyright')}
                </Footer>
            </Layout>
        </Layout>
    );
}
