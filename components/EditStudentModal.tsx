'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Country {
    code: string;
    name: string;
    dialCode: string;
    flag: string;
}

interface Plan {
    id: number;
    name: string;
    price: number;
    currency: string;
    sessions_count: number;
}

const countries: Country[] = [
    { code: 'EG', name: 'Egypt', dialCode: '+20', flag: '🇪🇬' },
    { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
    { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
];

// Main Edit Modal
interface EditStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentData?: any;
    onSave?: () => void;
}

export default function EditStudentModal({ isOpen, onClose, studentData, onSave }: EditStudentModalProps) {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        country_code: '+966',
        gender: 'male',
        plan_id: 0,
        total_sessions: 0,
        attended_sessions: 0,
        remaining_sessions: 0,
        guardian_name: '',
        guardian_phone: ''
    });

    const [countryOpen, setCountryOpen] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState(countries[1]); // Default Saudi
    const [countrySearch, setCountrySearch] = useState('');
    const [guardianCountryOpen, setGuardianCountryOpen] = useState(false);
    const [selectedGuardianCountry, setSelectedGuardianCountry] = useState(countries[1]);
    const [guardianCountrySearch, setGuardianCountrySearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const guardianDropdownRef = useRef<HTMLDivElement>(null);

    // Fetch plans on mount
    useEffect(() => {
        if (isOpen) {
            fetchPlans();
        }
    }, [isOpen]);

    // Update form when studentData changes
    useEffect(() => {
        if (studentData) {
            // Find country by dial code
            const country = countries.find(c => studentData.country_code?.includes(c.dialCode)) || countries[1];
            setSelectedCountry(country);

            setFormData({
                name: studentData.name || '',
                email: studentData.email || '',
                phone: studentData.phone || '',
                country_code: studentData.country_code || '+966',
                gender: studentData.gender === 'أنثى' ? 'female' : studentData.gender === 'ذكر' ? 'male' : studentData.gender || 'male',
                plan_id: studentData.plan_id || 0,
                total_sessions: studentData.total_sessions || 0,
                attended_sessions: studentData.attended_sessions || 0,
                remaining_sessions: studentData.remaining_sessions || 0,
                guardian_name: studentData.guardian_name || '',
                guardian_phone: studentData.guardian_phone || ''
            });

            // Set guardian country if available
            if (studentData.guardian_country_code) {
                const guardianCountry = countries.find(c => studentData.guardian_country_code?.includes(c.dialCode)) || countries[1];
                setSelectedGuardianCountry(guardianCountry);
            }
        }
    }, [studentData]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setCountryOpen(false);
            }
            if (guardianDropdownRef.current && !guardianDropdownRef.current.contains(event.target as Node)) {
                setGuardianCountryOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function fetchPlans() {
        setLoading(true);
        try {
            const response = await fetch('/api/plans');
            const data = await response.json();
            if (data.success && data.data) {
                setPlans(data.data);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!studentData?.id) return;

        setSubmitting(true);
        try {
            const response = await fetch(`/api/students/${studentData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    country_code: selectedCountry.dialCode,
                    gender: formData.gender,
                    plan_id: formData.plan_id || undefined,
                    guardian_name: formData.guardian_name || null,
                    guardian_phone: formData.guardian_phone || null,
                    guardian_country_code: formData.guardian_phone ? selectedGuardianCountry.dialCode : null
                })
            });

            const data = await response.json();
            if (data.success) {
                toast.success('تم تحديث بيانات الطالب بنجاح');
                onSave?.();
                onClose();
            } else {
                toast.error('حدث خطأ: ' + (data.error || 'فشل التحديث'));
            }
        } catch (error) {
            console.error('Error updating student:', error);
            toast.error('حدث خطأ في الاتصال بالخادم');
        } finally {
            setSubmitting(false);
        }
    }

    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
        c.dialCode.includes(countrySearch)
    );

    const filteredGuardianCountries = countries.filter(c =>
        c.name.toLowerCase().includes(guardianCountrySearch.toLowerCase()) ||
        c.dialCode.includes(guardianCountrySearch)
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="bg-card w-full max-w-2xl rounded-xl border border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[90vh]" style={{ backgroundColor: '#1e293b', width: '100%', maxWidth: '800px', borderRadius: '0.75rem', border: '1px solid var(--border-color)', padding: '2rem', margin: '1rem', position: 'relative' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>تعديل بيانات الطالب</h2>
                    <button onClick={onClose} style={{ color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}>
                        <X size={24} />
                    </button>
                </div>

                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        جاري التحميل...
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Content - 2 Columns */}
                        <div className="form-grid">

                            {/* Name */}
                            <div className="form-group">
                                <label className="form-label">الاسم <span className="required-star">*</span></label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="form-group">
                                <label className="form-label">البريد الإلكتروني <span className="required-star">*</span></label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Phone */}
                            <div className="form-group">
                                <label className="form-label">رقم الهاتف <span className="required-star">*</span></label>
                                <div className="phone-input-container">
                                    <div className="country-selector" ref={dropdownRef}>
                                        <div className="country-selected" onClick={() => setCountryOpen(!countryOpen)}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span className="country-flag">{selectedCountry.flag}</span>
                                                <span className="country-dial-code">{selectedCountry.dialCode}</span>
                                            </div>
                                            <ChevronDown size={14} />
                                        </div>

                                        {countryOpen && (
                                            <div className="country-dropdown open">
                                                <div className="country-search">
                                                    <input
                                                        type="text"
                                                        placeholder="search"
                                                        value={countrySearch}
                                                        autoFocus
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => setCountrySearch(e.target.value)}
                                                    />
                                                </div>
                                                {filteredCountries.map(country => (
                                                    <div
                                                        key={country.code}
                                                        className="country-option"
                                                        onClick={() => {
                                                            setSelectedCountry(country);
                                                            setCountryOpen(false);
                                                            setCountrySearch('');
                                                        }}
                                                    >
                                                        <span className="country-flag">{country.flag}</span>
                                                        <span style={{ flex: 1 }}>{country.name}</span>
                                                        <span style={{ color: 'var(--text-secondary)' }}>{country.dialCode}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        style={{ direction: 'rtl', textAlign: 'right' }}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Gender */}
                            <div className="form-group">
                                <label className="form-label">الجنس <span className="required-star">*</span></label>
                                <div className="radio-group" style={{ justifyContent: 'flex-end' }}>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="edit-gender"
                                            className="radio-input"
                                            checked={formData.gender === 'male'}
                                            onChange={() => setFormData({ ...formData, gender: 'male' })}
                                        />
                                        <span className="radio-text">ذكر</span>
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="edit-gender"
                                            className="radio-input"
                                            checked={formData.gender === 'female'}
                                            onChange={() => setFormData({ ...formData, gender: 'female' })}
                                        />
                                        <span className="radio-text">أنثى</span>
                                    </label>
                                </div>
                            </div>

                            {/* Plan Select */}
                            <div className="form-group">
                                <label className="form-label">الباقة</label>
                                <select
                                    className="form-input"
                                    value={formData.plan_id}
                                    onChange={(e) => setFormData({ ...formData, plan_id: parseInt(e.target.value) })}
                                    style={{ appearance: 'auto' }}
                                >
                                    <option value={0}>بدون باقة</option>
                                    {plans.map(plan => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name} - {plan.price} {plan.currency}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Stats Display */}
                            <div className="form-group">
                                <label className="form-label">إحصائيات الحصص</label>
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, 1fr)',
                                    gap: '0.5rem',
                                    backgroundColor: 'var(--bg-hover)',
                                    padding: '1rem',
                                    borderRadius: '0.5rem'
                                }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>إجمالي</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{formData.total_sessions}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>محضورة</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>{formData.attended_sessions}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>متبقية</div>
                                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f59e0b' }}>{formData.remaining_sessions}</div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Guardian Section */}
                        <div style={{
                            marginTop: '2rem',
                            paddingTop: '2rem',
                            borderTop: '1px solid var(--border-color)'
                        }}>
                            <h3 style={{
                                fontSize: '1.2rem',
                                fontWeight: 'bold',
                                marginBottom: '1.5rem',
                                color: 'var(--text-primary)'
                            }}>
                                معلومات ولي الأمر (اختياري)
                            </h3>

                            <div className="form-grid">
                                {/* Guardian Name */}
                                <div className="form-group">
                                    <label className="form-label">اسم ولي الأمر</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="أدخل اسم ولي الأمر"
                                        value={formData.guardian_name}
                                        onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                                    />
                                </div>

                                {/* Guardian Phone */}
                                <div className="form-group">
                                    <label className="form-label">رقم هاتف ولي الأمر</label>
                                    <div className="phone-input-container">
                                        <div className="country-selector" ref={guardianDropdownRef}>
                                            <div className="country-selected" onClick={() => setGuardianCountryOpen(!guardianCountryOpen)}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span className="country-flag">{selectedGuardianCountry.flag}</span>
                                                    <span className="country-dial-code">{selectedGuardianCountry.dialCode}</span>
                                                </div>
                                                <ChevronDown size={14} />
                                            </div>

                                            {guardianCountryOpen && (
                                                <div className="country-dropdown open">
                                                    <div className="country-search">
                                                        <input
                                                            type="text"
                                                            placeholder="search"
                                                            value={guardianCountrySearch}
                                                            autoFocus
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => setGuardianCountrySearch(e.target.value)}
                                                        />
                                                    </div>
                                                    {filteredGuardianCountries.map(country => (
                                                        <div
                                                            key={country.code}
                                                            className="country-option"
                                                            onClick={() => {
                                                                setSelectedGuardianCountry(country);
                                                                setGuardianCountryOpen(false);
                                                                setGuardianCountrySearch('');
                                                            }}
                                                        >
                                                            <span className="country-flag">{country.flag}</span>
                                                            <span style={{ flex: 1 }}>{country.name}</span>
                                                            <span style={{ color: 'var(--text-secondary)' }}>{country.dialCode}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="رقم الهاتف"
                                            value={formData.guardian_phone}
                                            onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                                            style={{ direction: 'rtl', textAlign: 'right' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ width: '100px', justifyContent: 'center' }}>إلغاء</button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ backgroundColor: '#10b981', width: '100px', justifyContent: 'center' }}
                                disabled={submitting}
                            >
                                {submitting ? 'جاري...' : 'حفظ'}
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
}
