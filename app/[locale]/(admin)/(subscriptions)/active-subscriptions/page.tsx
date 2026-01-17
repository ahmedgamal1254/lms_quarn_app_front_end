'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import {
    Home,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    Filter,
    Search,
    MessageSquare,
    ChevronDown,
    CheckCircle,
    XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ActiveSubscription {
    id: number;
    student_name: string;
    student_email: string;
    student_phone: string;
    plan_name: string;
    plan_price: number | string;
    plan_currency: string;
    total_sessions: number;
    sessions_remaining: number;
    sessions_used?: number;
    start_date: string;
    end_date: string;
    status: string;
}

export default function ActiveSubscriptionsPage() {
    const t = useTranslations('AdminSubscriptions');
    const tCommon = useTranslations('Common');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const routeParams = useParams();
    const isRTL = routeParams.locale === 'ar';
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [subscriptions, setSubscriptions] = useState<ActiveSubscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const getCurrencySymbol = (currency: string): string => {
        const map: { [key: string]: string } = {
          'SAR': tCommon('currency_sar'),
          'EGP': tCommon('currency_egp'),
          'AED': tCommon('currency_aed'),
          'USD': tCommon('currency_usd'),
          'EUR': tCommon('currency_eur'),
          'EG': tCommon('currency_egp')
        };
        return map[currency] || currency;
    };

    async function fetchSubscriptions() {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/subscriptions?status=active&_t=${Date.now()}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });
            const data = await res.json();
            if (data.success) {
                setSubscriptions(data.data || []);
            } else {
                setError(data.error || t('loadingDataError'));
            }
        } catch (err) {
            console.error('Error fetching subscriptions:', err);
            setError(tCommon('tryAgainLater'));
        } finally {
            setLoading(false);
        }
    }

    const filteredSubscriptions = useMemo(() => {
        return (subscriptions || []).filter(sub => {
            const matchesStatus =
                statusFilter === 'all' ||
                (statusFilter === 'active' && sub.status === 'active') ||
                (statusFilter === 'inactive' && sub.status !== 'active');

            if (!matchesStatus) return false;

            const haystack = `${sub.student_name} ${sub.student_email} ${sub.student_phone}`.toLowerCase();
            if (searchQuery && !haystack.includes(searchQuery.toLowerCase())) return false;

            if (startDateFilter && new Date(sub.start_date) < new Date(startDateFilter)) return false;
            if (endDateFilter && new Date(sub.end_date) > new Date(endDateFilter)) return false;

            return true;
        });
    }, [subscriptions, statusFilter, searchQuery, startDateFilter, endDateFilter]);

    const handleWhatsApp = (phone: string) => {
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    return (
        <div className="layout" dir={isRTL ? 'rtl' : 'ltr'}>
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="main-content">
                <Header onMenuClick={() => setSidebarOpen(true)} />

                <div style={{ padding: '2rem' }}>
                    {/* Breadcrumbs */}
                    <div className="page-header">
                        <div className="page-title">{t('activeSubscriptions')}</div>
                        <div className="breadcrumbs">
                            <Home size={16} />
                            <Link href="/dashboard">{tCommon('dashboard')}</Link>
                            <ChevronRight size={16} className={isRTL ? 'rotate-180' : ''} />
                            <CreditCard size={16} />
                            <span style={{ fontWeight: 'bold' }}>{t('activeSubscriptions')}</span>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        <div className="card" style={{
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)',
                            border: '2px solid rgba(16, 185, 129, 0.2)',
                            padding: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('activeCount')}</p>
                                    <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#10b981' }}>
                                        {subscriptions.filter(s => s.status === 'active').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{
                            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(220, 38, 38, 0.08) 100%)',
                            border: '2px solid rgba(239, 68, 68, 0.2)',
                            padding: '1.5rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white'
                                }}>
                                    <XCircle size={24} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('expiredCount')}</p>
                                    <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: '700', color: '#ef4444' }}>
                                        {subscriptions.filter(s => s.status !== 'active').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar */}
                    <div className="toolbar">
                        {/* Filter Dropdown */}
                        <div style={{ position: 'relative' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setFilterOpen(!filterOpen)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                <Filter size={18} />
                                <span>{tCommon('filters')}</span>
                                <ChevronDown size={16} style={{
                                    transition: 'transform 0.3s',
                                    transform: filterOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                                }} />
                            </button>

                            {filterOpen && (
                                <div style={{
                                    position: 'absolute',
                                    top: 'calc(100% + 0.5rem)',
                                    [isRTL ? 'left' : 'right']: 0,
                                    background: 'white',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                                    padding: '1rem',
                                    minWidth: '340px',
                                    zIndex: 10
                                }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <label style={{
                                                display: 'block',
                                                marginBottom: '0.25rem',
                                                fontWeight: '600',
                                                color: 'var(--text-primary)'
                                            }}>{t('statusFilter')}</label>
                                            <select
                                                className="form-input"
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                            >
                                                <option value="all">{tCommon('all')}</option>
                                                <option value="active">{t('active')}</option>
                                                <option value="inactive">{t('expired')}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>{t('startDateLabel')}</label>
                                            <input type="date" className="form-input" value={startDateFilter} onChange={(e) => setStartDateFilter(e.target.value)} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>{t('endDateLabel')}</label>
                                            <input type="date" className="form-input" value={endDateFilter} onChange={(e) => setEndDateFilter(e.target.value)} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="search-input-wrapper">
                            <input
                                type="text"
                                className="search-input"
                                placeholder={t('searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search
                                size={18}
                                style={{
                                    position: 'absolute',
                                    [isRTL ? 'left' : 'right']: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: 'var(--text-secondary)'
                                }}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-container">
                        {loading && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                {tCommon('loading')}
                            </div>
                        )}
                        {error && !loading && (
                            <div style={{
                                padding: '1rem',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '0.75rem',
                                color: '#ef4444',
                                marginBottom: '1rem'
                            }}>
                                {error}
                            </div>
                        )}
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>{t('studentName')}</th>
                                    <th>{t('subscriptionDate')}</th>
                                    <th>{t('expiryDate')}</th>
                                    <th>{t('studentEmail')}</th>
                                    <th>{t('studentPhone')}</th>
                                    <th>{t('planName')}</th>
                                    <th>{t('planPrice')}</th>
                                    <th>{tCommon('status')}</th>
                                    <th>{t('sessionsRemaining')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubscriptions.length > 0 ? (
                                    filteredSubscriptions.map((sub, index) => (
                                        <tr key={sub.id}>
                                            <td style={{ fontWeight: '600', color: '#6366f1' }}>{index + 1}</td>
                                            <td style={{ fontWeight: '600' }}>{sub.student_name}</td>
                                            <td>
                                                {new Date(sub.start_date).toLocaleDateString(routeParams.locale as string, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td>
                                                {new Date(sub.end_date).toLocaleDateString(routeParams.locale as string, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td>{sub.student_email}</td>
                                            <td>
                                                <button
                                                    className="action-btn"
                                                    onClick={() => handleWhatsApp(sub.student_phone)}
                                                    style={{
                                                        color: '#10b981',
                                                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                                        border: '1px solid rgba(16, 185, 129, 0.2)',
                                                        padding: '0.5rem 1rem',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        margin: '0 auto',
                                                        fontFamily: 'monospace'
                                                    }}
                                                    title="WhatsApp"
                                                >
                                                    <MessageSquare size={16} />
                                                    <span>{sub.student_phone}</span>
                                                </button>
                                            </td>
                                            <td>{sub.plan_name}</td>
                                            <td>
                                                <span style={{
                                                    fontWeight: '700',
                                                    fontSize: '1.1rem',
                                                    color: '#10b981'
                                                }}>
                                                    {Number(sub.plan_price || 0).toLocaleString(routeParams.locale as string)} {getCurrencySymbol(sub.plan_currency)}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '8px',
                                                    backgroundColor: sub.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    border: sub.status === 'active' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                                                    color: sub.status === 'active' ? '#10b981' : '#ef4444',
                                                    fontWeight: '600',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {sub.status === 'active' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                                    {sub.status === 'active' ? t('active') : t('expired')}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{
                                                        fontSize: '0.875rem',
                                                        color: 'var(--text-secondary)',
                                                        marginBottom: '0.25rem'
                                                    }}>
                                                        {(sub.sessions_used || 0)} / {sub.total_sessions}
                                                    </div>
                                                    <div style={{
                                                        fontWeight: '700',
                                                        fontSize: '1.1rem',
                                                        color: (sub.sessions_remaining || 0) > 20 ? '#10b981' : '#ef4444'
                                                    }}>
                                                        {t('sessionsCount', { count: sub.sessions_remaining || 0 })}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                                            {loading ? tCommon('loading') : tCommon('noResults')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
