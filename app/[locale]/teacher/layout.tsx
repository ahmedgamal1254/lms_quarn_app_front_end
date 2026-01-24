'use client';

import { Layout } from 'antd';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

const { Sider, Content, Footer } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
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

    return (
        <Layout style={{ minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr' }}>
            {/* Sidebar */}
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                width={260}
                breakpoint="lg"
                collapsedWidth={0}
                trigger={null}
                style={{
                    display: collapsed ? 'none' : 'block',
                }}
                className="responsive-sider"
            >
                
                <Sidebar
                    isOpen={!collapsed}
                    onClose={() => setCollapsed(true)}
                />
            </Sider>


            {/* Main Area */}
            <Layout>
                {/* Header */}
                <Header onMenuClick={() => setCollapsed(!collapsed)} />

                {/* Content */}
                <Content
                    className="bg-white dark:bg-slate-700"
                    style={{
                        margin: '1rem',
                        borderRadius: '8px',
                        minHeight: 'calc(100vh - 180px)'
                    }}
                >
                    {children}
                </Content>

                {/* Footer */}
                <Footer
                    className='text-gray-500 dark:text-white dark:bg-slate-900'
                    style={{
                        textAlign: 'center'
                    }}
                >
                    © {new Date().getFullYear()} {tCommon('schoolName')} — {tAuth('copyright')}
                </Footer>
            </Layout>
        </Layout>
    );
}
