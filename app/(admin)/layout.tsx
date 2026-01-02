'use client';

import { Layout } from 'antd';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

const { Sider, Content, Footer } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            width={260}
            breakpoint="lg"
            collapsedWidth={0}
            trigger={null}
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
                    style={{
                        margin: '1rem',
                        
                        background: '#ffffff',
                        borderRadius: '8px',
                        minHeight: 'calc(100vh - 160px)'
                    }}
                >
                    {children}
                </Content>

                {/* Footer */}
                <Footer
                    style={{
                        textAlign: 'center',
                        background: '#f9fafb'
                    }}
                >
                    © {new Date().getFullYear()} أكاديمية التميز — جميع الحقوق محفوظة
                </Footer>
            </Layout>
        </Layout>
    );
}
