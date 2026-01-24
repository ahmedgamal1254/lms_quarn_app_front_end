'use client';

'use client';

import { X, ExternalLink, CheckCircle, XCircle, Clock, MinusCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SessionDetail {
    id: number;
    sessionNumber: number;
    day: string;
    date: string;
    time: string;
    meetingLink: string;
    status: 'attended' | 'absent' | 'late' | 'pending';
}

interface SessionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionName: string;
    teacherName: string;
    studentName: string;
    totalSessions: number;
}

// دالة لتوليد بيانات الحصص التجريبية
const generateSessionDetails = (totalSessions: number): SessionDetail[] => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const statuses: SessionDetail['status'][] = ['attended', 'attended', 'late', 'absent', 'pending'];

    return Array.from({ length: totalSessions }, (_, index) => {
        const dayIndex = index % 7;
        const weekNumber = Math.floor(index / 7);
        const date = new Date();
        date.setDate(date.getDate() + (index * 2)); // كل حصة بعد يومين

        return {
            id: index + 1,
            sessionNumber: index + 1,
            day: days[dayIndex],
            date: date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'numeric', day: 'numeric' }),
            time: `${8 + (index % 4)}:00 ${index % 2 === 0 ? 'صباحاً' : 'مساءً'}`,
            meetingLink: `https://meet.google.com/abc-defg-${String(index + 1).padStart(3, '0')}`,
            status: index < 5 ? statuses[index] : 'pending'
        };
    });
};

const getStatusInfo = (status: SessionDetail['status'], t: any) => {
    switch (status) {
        case 'attended':
            return {
                label: t('attended'),
                color: '#10b981',
                bgColor: 'rgba(16, 185, 129, 0.1)',
                icon: CheckCircle
            };
        case 'absent':
            return {
                label: t('absent'),
                color: '#ef4444',
                bgColor: 'rgba(239, 68, 68, 0.1)',
                icon: XCircle
            };
        case 'late':
            return {
                label: t('late'),
                color: '#f59e0b',
                bgColor: 'rgba(245, 158, 11, 0.1)',
                icon: Clock
            };
        case 'pending':
            return {
                label: t('pending'),
                color: '#6b7280',
                bgColor: 'rgba(107, 114, 128, 0.1)',
                icon: MinusCircle
            };
    }
};

export default function SessionDetailsModal({
    isOpen,
    onClose,
    sessionName,
    teacherName,
    studentName,
    totalSessions
}: SessionDetailsModalProps) {
    const t = useTranslations('SessionDetailsModal');

    if (!isOpen) return null;

    const sessionDetails = generateSessionDetails(totalSessions);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px', width: '95%' }}>
                {/* Header */}
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {t('title')} - {sessionName}
                    </h2>
                    <button onClick={onClose} className="modal-close">
                        <X size={24} />
                    </button>
                </div>

                {/* Session Info */}
                <div style={{
                    padding: '1rem 1.5rem',
                    backgroundColor: 'rgba(99, 102, 241, 0.05)',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    gap: '2rem',
                    flexWrap: 'wrap'
                }}>
                    <div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('teacher')}: </span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{teacherName}</span>
                    </div>
                    <div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('student')}: </span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{studentName}</span>
                    </div>
                    <div>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('total_sessions')}: </span>
                        <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{totalSessions}</span>
                    </div>
                </div>

                {/* Table */}
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                    <table className="data-table">
                        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--card-bg)', zIndex: 1 }}>
                            <tr>
                                <th>#</th>
                                <th>{t('day')}</th>
                                <th>{t('date')}</th>
                                <th>{t('time')}</th>
                                <th>{t('link')}</th>
                                <th>{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessionDetails.map((session) => {
                                const statusInfo = getStatusInfo(session.status, t);
                                const StatusIcon = statusInfo.icon;

                                return (
                                    <tr key={session.id}>
                                        <td style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                            {session.sessionNumber}
                                        </td>
                                        <td>{session.day}</td>
                                        <td style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            {session.date}
                                        </td>
                                        <td style={{ fontWeight: '500' }}>{session.time}</td>
                                        <td>
                                            <a
                                                href={session.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    color: '#3b82f6',
                                                    textDecoration: 'none',
                                                    fontSize: '0.875rem',
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '4px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }}
                                            >
                                                <ExternalLink size={14} />
                                                <span>{t('join')}</span>
                                            </a>
                                        </td>
                                        <td>
                                            <div style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.4rem 0.8rem',
                                                borderRadius: '6px',
                                                backgroundColor: statusInfo.bgColor,
                                                color: statusInfo.color,
                                                fontSize: '0.875rem',
                                                fontWeight: '600'
                                            }}>
                                                <StatusIcon size={16} />
                                                <span>{statusInfo.label}</span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button onClick={onClose} className="btn btn-secondary">
                        {t('close')}
                    </button>
                </div>
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    padding: 1rem;
                    backdrop-filter: blur(4px);
                }

                .modal-content {
                    background: var(--card-bg);
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    max-height: 90vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.5rem;
                    border-bottom: 1px solid var(--border-color);
                }

                .modal-close {
                    background: none;
                    border: none;
                    color: var(--text-secondary);
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 6px;
                    transition: all 0.2s;
                }

                .modal-close:hover {
                    background-color: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                .modal-footer {
                    padding: 1rem 1.5rem;
                    border-top: 1px solid var(--border-color);
                    display: flex;
                    justify-content: flex-end;
                    gap: 0.75rem;
                }
            `}</style>
        </div>
    );
}
