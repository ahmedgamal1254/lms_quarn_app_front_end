'use client';

import { X, Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface FilterOptions {
    phone: string;
    teacher: string;
    student: string;
}

interface SessionsFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilter: (filters: FilterOptions) => void;
}

export default function SessionsFilterModal({
    isOpen,
    onClose,
    onApplyFilter
}: SessionsFilterModalProps) {
    const t = useTranslations('SessionsFilterModal');
    const [filters, setFilters] = useState<FilterOptions>({
        phone: '',
        teacher: '',
        student: ''
    });

    if (!isOpen) return null;

    const handleApply = () => {
        onApplyFilter(filters);
        onClose();
    };

    const handleReset = () => {
        setFilters({
            phone: '',
            teacher: '',
            student: ''
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '95%' }}>
                {/* Header */}
                <div className="modal-header">
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {t('title')}
                    </h2>
                    <button onClick={onClose} className="modal-close">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Phone Filter */}
                        <div className="form-group">
                            <label className="form-label">
                                {t('phone')}
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder={t('search_phone')}
                                value={filters.phone}
                                onChange={(e) => setFilters({ ...filters, phone: e.target.value })}
                            />
                        </div>

                        {/* Teacher Filter */}
                        <div className="form-group">
                            <label className="form-label">
                                {t('teacher')}
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder={t('search_teacher')}
                                value={filters.teacher}
                                onChange={(e) => setFilters({ ...filters, teacher: e.target.value })}
                            />
                        </div>

                        {/* Student Filter */}
                        <div className="form-group">
                            <label className="form-label">
                                {t('student')}
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder={t('search_student')}
                                value={filters.student}
                                onChange={(e) => setFilters({ ...filters, student: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button onClick={handleReset} className="btn btn-secondary">
                        {t('reset')}
                    </button>
                    <button onClick={handleApply} className="btn btn-primary">
                        <Search size={18} />
                        <span>{t('apply')}</span>
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
