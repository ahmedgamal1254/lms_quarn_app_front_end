'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface MultiSelectProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
}

export default function MultiSelect({ options, selected, onChange, placeholder = 'Select...' }: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(item => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const removeOption = (option: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(selected.filter(item => item !== option));
    };

    return (
        <div className="relative" ref={containerRef} style={{ position: 'relative' }}>
            <div
                className="form-input"
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    cursor: 'pointer',
                    height: 'auto',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    padding: '0.25rem 0.5rem'
                }}
            >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', flex: 1 }}>
                    {selected.length > 0 ? (
                        selected.map(item => (
                            <span
                                key={item}
                                style={{
                                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                                    color: '#3b82f6',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}
                            >
                                {item}
                                <X size={12} style={{ cursor: 'pointer' }} onClick={(e) => removeOption(item, e)} />
                            </span>
                        ))
                    ) : (
                        <span style={{ color: 'var(--text-secondary)', padding: '0.5rem' }}>{placeholder}</span>
                    )}
                </div>
                <ChevronDown size={16} style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }} />
            </div>

            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: '#1f2937',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.5rem',
                        marginTop: '0.25rem',
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 50,
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                >
                    {options.map(option => (
                        <div
                            key={option}
                            onClick={() => toggleOption(option)}
                            style={{
                                padding: '0.75rem 1rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                color: selected.includes(option) ? '#60a5fa' : 'var(--text-primary)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                            <span>{option}</span>
                            {selected.includes(option) && <Check size={16} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
