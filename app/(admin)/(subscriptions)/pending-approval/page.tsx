'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, CheckCircle2, Mail } from 'lucide-react';

export default function PendingApprovalPage() {
    const router = useRouter();

    useEffect(() => {
        // تحديث الصفحة كل 30 ثانية للتحقق من الموافقة
        const interval = setInterval(() => {
            checkApprovalStatus();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    async function checkApprovalStatus() {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            // يمكن إضافة API للتحقق من حالة الموافقة
            // إذا تمت الموافقة، توجيه للداشبورد
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                maxWidth: '500px',
                width: '100%',
                padding: '50px 40px',
                textAlign: 'center'
            }}>
                {/* Icon */}
                <div style={{
                    width: '100px',
                    height: '100px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 30px',
                    animation: 'pulse 2s infinite'
                }}>
                    <Clock size={50} color="white" />
                </div>

                {/* Title */}
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '15px'
                }}>
                    في انتظار الموافقة
                </h1>

                {/* Description */}
                <p style={{
                    fontSize: '1.1rem',
                    color: '#666',
                    lineHeight: '1.8',
                    marginBottom: '30px'
                }}>
                    شكراً لتسجيلك في أكاديمية التميز!
                    <br />
                    تم استلام طلبك بنجاح وهو الآن قيد المراجعة من قبل الإدارة.
                </p>

                {/* Steps */}
                <div style={{
                    background: '#f9fafb',
                    borderRadius: '15px',
                    padding: '25px',
                    marginBottom: '30px',
                    textAlign: 'right'
                }}>
                    <div style={{ marginBottom: '20px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px'
                        }}>
                            <CheckCircle2 size={24} color="#10b981" />
                            <span style={{ fontWeight: 'bold', color: '#333' }}>
                                تم استلام الطلب
                            </span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginRight: '36px' }}>
                            تم تسجيل بياناتك بنجاح في النظام
                        </p>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px'
                        }}>
                            <Clock size={24} color="#f59e0b" />
                            <span style={{ fontWeight: 'bold', color: '#333' }}>
                                قيد المراجعة
                            </span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginRight: '36px' }}>
                            الإدارة تقوم بمراجعة طلبك حالياً
                        </p>
                    </div>

                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '8px'
                        }}>
                            <Mail size={24} color="#999" />
                            <span style={{ fontWeight: 'bold', color: '#999' }}>
                                إشعار الموافقة
                            </span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#999', marginRight: '36px' }}>
                            سيتم إرسال إشعار لك عند الموافقة
                        </p>
                    </div>
                </div>

                {/* Info Box */}
                <div style={{
                    background: '#fffbeb',
                    border: '2px solid #fcd34d',
                    borderRadius: '10px',
                    padding: '20px',
                    marginBottom: '25px'
                }}>
                    <p style={{
                        fontSize: '0.95rem',
                        color: '#92400e',
                        lineHeight: '1.6',
                        margin: 0
                    }}>
                        <strong>ملاحظة:</strong> عادة ما تستغرق عملية المراجعة من 24 إلى 48 ساعة.
                        سيتم إرسال بريد إلكتروني لك عند الموافقة على طلبك.
                    </p>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button
                        onClick={() => router.push('/login')}
                        style={{
                            padding: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        العودة لتسجيل الدخول
                    </button>

                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px',
                            background: 'white',
                            color: '#667eea',
                            border: '2px solid #667eea',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        تحديث الحالة
                    </button>
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: '30px',
                    fontSize: '0.85rem',
                    color: '#999'
                }}>
                    هل لديك استفسار؟ تواصل معنا عبر البريد الإلكتروني
                </div>
            </div>

            <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }
      `}</style>
        </div>
    );
}
