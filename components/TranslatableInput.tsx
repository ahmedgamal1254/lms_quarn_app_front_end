'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface TranslatableInputProps {
    label: string;
    value: { ar: string; en: string };
    onChange: (value: { ar: string; en: string }) => void;
    placeholder?: { ar: string; en: string };
    required?: boolean;
    error?: string;
    isTextArea?: boolean;
}

export default function TranslatableInput({
    label,
    value,
    onChange,
    placeholder = { ar: '', en: '' },
    required = false,
    error,
    isTextArea = false
}: TranslatableInputProps) {
    const t = useTranslations('Common');
    const [activeTab, setActiveTab] = useState<'ar' | 'en'>('ar');

    const handleChange = (val: string) => {
        onChange({
            ...value,
            [activeTab]: val
        });
    };

    return (
        <div className="form-group mb-4">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        type="button"
                        onClick={() => setActiveTab('ar')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                            activeTab === 'ar'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        العربية
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('en')}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                            activeTab === 'en'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        English
                    </button>
                </div>
            </div>

            <div className="relative">
                {isTextArea ? (
                     <textarea
                     value={value[activeTab] || ''}
                     onChange={(e) => handleChange(e.target.value)}
                     placeholder={activeTab === 'ar' ? placeholder.ar : placeholder.en}
                     className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] ${
                         error ? 'border-red-500' : 'border-gray-300'
                     }`}
                     dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                 />
                ) : (
                    <input
                        type="text"
                        value={value[activeTab] || ''}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={activeTab === 'ar' ? placeholder.ar : placeholder.en}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            error ? 'border-red-500' : 'border-gray-300'
                        }`}
                        dir={activeTab === 'ar' ? 'rtl' : 'ltr'}
                    />
                )}
               
            </div>
            
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}
