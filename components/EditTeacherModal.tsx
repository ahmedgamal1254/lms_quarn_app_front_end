'use client';

import { useState } from 'react';
import { X, Lock, Eye, EyeOff, ImageIcon } from 'lucide-react';
import CountrySelector from './CountrySelector';
import MultiSelect from './MultiSelect';

interface EditTeacherModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherData?: any;
}

const subjectsList = ["قرآن كريم", "تجويد", "لغة عربية", "نحو", "فقه", "حديث", "سيرة", "عقيدة", "نورانية"];
const currencies = ["ر.س", "ج.م", "د.إ", "$"];

export default function EditTeacherModal({ isOpen, onClose, teacherData }: EditTeacherModalProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [subjects, setSubjects] = useState<string[]>(teacherData?.subjects || []);
    const [currency, setCurrency] = useState(teacherData?.currency || currencies[0]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div className="bg-card w-full max-w-2xl rounded-xl border border-white/10 p-6 shadow-2xl overflow-y-auto max-h-[90vh]" style={{
                backgroundColor: '#1e293b',
                width: '100%',
                maxWidth: '800px',
                borderRadius: '0.75rem',
                border: '1px solid var(--border-color)',
                padding: '2rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
            }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>تعديل بيانات المعلم</h2>
                    <button onClick={onClose} style={{ color: 'var(--text-secondary)', cursor: 'pointer', background: 'none', border: 'none' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Form Grid */}
                <div className="form-grid">

                    {/* Name */}
                    <div className="form-group">
                        <label className="form-label">الاسم <span className="required-star">*</span></label>
                        <input type="text" className="form-input" defaultValue={teacherData?.name} />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label className="form-label">البريد الإلكتروني <span className="required-star">*</span></label>
                        <input type="email" className="form-input" defaultValue="teacher@example.com" />
                    </div>

                    <div className="form-group">
                        <label className="form-label">رقم الهاتف <span className="required-star">*</span></label>
                        <div className="phone-input-container">
                            <CountrySelector />
                            <input type="text" className="form-input" defaultValue={teacherData?.phone} style={{ direction: 'rtl', textAlign: 'right' }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">كلمة المرور</label>
                        <div className="password-input-wrapper">
                            <Lock size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-input"
                                placeholder=".........."
                                style={{ paddingRight: '2.5rem' }}
                            />
                            <div className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">الجنس <span className="required-star">*</span></label>
                        <div className="radio-group" style={{ height: '44px' }}>
                            <label className="radio-label">
                                <input type="radio" name="edit-gender" className="radio-input" defaultChecked={teacherData?.gender === 'ذكر'} />
                                <span className="radio-text">ذكر</span>
                            </label>
                            <label className="radio-label">
                                <input type="radio" name="edit-gender" className="radio-input" defaultChecked={teacherData?.gender === 'أنثى'} />
                                <span className="radio-text">أنثى</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">سعر الساعة / العملة <span className="required-star">*</span></label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="number" className="form-input" defaultValue={teacherData?.hourlyRate} style={{ flex: 2 }} />
                            <select
                                className="form-input"
                                style={{ flex: 1, padding: '0 0.5rem', appearance: 'auto' }}
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                            >
                                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Subjects (Multi-Select) */}
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">المواد <span className="required-star">*</span></label>
                        <MultiSelect
                            options={subjectsList}
                            selected={subjects}
                            onChange={setSubjects}
                            placeholder="اختر المواد..."
                        />
                    </div>

                </div>

                {/* Image Upload */}
                <div className="form-group" style={{ marginTop: '1rem', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
                    <label className="form-label">الصورة الشخصية</label>
                    <div className="upload-area" style={{ padding: '1.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Click to upload new image...</span>
                    </div>
                </div>

                {/* Footer Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                    <button className="btn btn-secondary" onClick={onClose} style={{ width: '100px', justifyContent: 'center' }}>إلغاء</button>
                    <button className="btn btn-primary" style={{ backgroundColor: '#10b981', width: '100px', justifyContent: 'center' }}>حفظ</button>
                </div>

            </div>
        </div>
    );
}
