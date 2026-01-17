'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Clock, CheckCircle2, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function PendingApprovalPage() {
    const t = useTranslations('AdminSubscriptions');
    const router = useRouter();
    const routeParams = useParams();
    const isRTL = routeParams.locale === 'ar';

    useEffect(() => {
        // Refresh page every 30 seconds to check approval
        const interval = setInterval(() => {
            checkApprovalStatus();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    async function checkApprovalStatus() {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            // Can add API to check approval status
            // If approved, redirect to dashboard
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
        }}
        dir={isRTL ? 'rtl' : 'ltr'}
    >
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
                    {t('waitingApproval')}
                </h1>

                {/* Description */}
                <p style={{
                    fontSize: '1.1rem',
                    color: '#666',
                    lineHeight: '1.8',
                    marginBottom: '30px'
                }}>
                    {t('thankYou')}
                    <br />
                    {t('requestReceived')}
                </p>

                {/* Steps */}
                <div style={{
                    background: '#f9fafb',
                    borderRadius: '15px',
                    padding: '25px',
                    marginBottom: '30px',
                    textAlign: isRTL ? 'right' : 'left'
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
                                {t('requestReceived')}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666', [isRTL ? 'marginRight' : 'marginLeft']: '36px' }}>
                            {t('underReview')}
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
                                {t('underReview')}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666', [isRTL ? 'marginRight' : 'marginLeft']: '36px' }}>
                            {t('adminReviewing')}
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
                                {t('approvalNotification')}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#999', [isRTL ? 'marginRight' : 'marginLeft']: '36px' }}>
                            {t('notificationSent')}
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
                        <strong>{t('note')}:</strong> {t('reviewTime')}.
                        {t('emailNotification')}
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
                        {t('backToLogin')}
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
                        {t('refreshStatus')}
                    </button>
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: '30px',
                    fontSize: '0.85rem',
                    color: '#999'
                }}>
                    {t('contactUs')}
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
