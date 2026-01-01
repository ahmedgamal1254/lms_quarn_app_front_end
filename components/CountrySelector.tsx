'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Country {
    code: string;
    name: string;
    dialCode: string;
    flag: string;
}

const countries: Country[] = [
    { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
    { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
    { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
    { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼' },
    { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦' },
    { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭' },
    { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲' },
    { code: 'JO', name: 'Jordan', dialCode: '+962', flag: '🇯🇴' },
    { code: 'LB', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧' },
    { code: 'SY', name: 'Syria', dialCode: '+963', flag: '🇸🇾' },
    { code: 'IQ', name: 'Iraq', dialCode: '+964', flag: '🇮🇶' },
    { code: 'YE', name: 'Yemen', dialCode: '+967', flag: '🇾🇪' },
    { code: 'PS', name: 'Palestine', dialCode: '+970', flag: '🇵🇸' },
    { code: 'SD', name: 'Sudan', dialCode: '+249', flag: '🇸🇩' },
    { code: 'LY', name: 'Libya', dialCode: '+218', flag: '🇱🇾' },
    { code: 'TN', name: 'Tunisia', dialCode: '+216', flag: '🇹🇳' },
    { code: 'MA', name: 'Morocco', dialCode: '+212', flag: '🇲🇦' },
    { code: 'DZ', name: 'Algeria', dialCode: '+213', flag: '🇩🇿' },
    { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷' },
    { code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰' },
    { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
];

interface CountrySelectorProps {
    value?: string;
    onChange?: (dialCode: string) => void;
}

export default function CountrySelector({ value, onChange }: CountrySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Find selected country based on value prop
    const getSelectedCountry = () => {
        if (!value) return countries[0]; // Default to Egypt
        const found = countries.find(c => c.dialCode === value || c.dialCode === '+' + value.replace('+', ''));
        return found || countries[0];
    };

    const selected = getSelectedCountry();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filtered = countries.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dialCode.includes(search)
    );

    const handleSelect = (country: Country) => {
        setIsOpen(false);
        setSearch('');
        if (onChange) {
            onChange(country.dialCode);
        }
    };

    return (
        <div className="country-selector" ref={dropdownRef}>
            <div className="country-selected" onClick={() => setIsOpen(!isOpen)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="country-flag">{selected.flag}</span>
                    <span className="country-dial-code">{selected.dialCode}</span>
                </div>
                <ChevronDown size={14} />
            </div>

            {isOpen && (
                <div className="country-dropdown open">
                    <div className="country-search">
                        <input
                            type="text"
                            placeholder="بحث..."
                            value={search}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    {filtered.map(country => (
                        <div
                            key={country.code}
                            className="country-option"
                            onClick={() => handleSelect(country)}
                        >
                            <span className="country-flag">{country.flag}</span>
                            <span style={{ flex: 1 }}>{country.name}</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{country.dialCode}</span>
                            {selected.code === country.code && <Check size={14} color="#10b981" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
