'use client';

import { useTranslations } from 'next-intl';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useAppSettingsStore } from '@/store/appSetting';
import { useState } from 'react';
import axiosInstance from '@/lib/axios';
import { message } from 'antd';

export default function ContactSection({ isRTL }: { isRTL: boolean }) {
  const t = useTranslations('LandingPage.Contact');
  const settings = useAppSettingsStore((state) => state.app_settings);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosInstance.post('/contact', formData);
      message.success(isRTL ? 'تم إرسال رسالتك بنجاح' : 'Your message has been sent successfully');
      setFormData({ first_name: '', last_name: '', email: '', message: '' });
    } catch (error) {
      message.error(isRTL ? 'فشل إرسال الرسالة' : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-cyan-500 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-500 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
          
          <div className="space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4 text-white">{t('title')}</h2>
              <p className="text-white text-lg">{t('subtitle')}</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-white">{t('email')}</h3>
                  <p className="text-white">{settings?.support_email || 'contact@quranlms.com'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-white">{t('phone')}</h3>
                  <p className="text-white" dir="ltr">{settings?.support_phone || '+20 123 456 7890'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-white">{t('address')}</h3>
                  <p className="text-white">{settings?.address || t('addressDetails')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 text-slate-900 shadow-xl">
            <h3 className="text-2xl font-bold mb-6">{t('formTitle')}</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('firstName')}</label>
                  <input 
                    name="first_name" 
                    value={formData.first_name}
                    onChange={handleChange}
                    type="text" 
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none" 
                    placeholder={t('firstName')} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('lastName')}</label>
                  <input 
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    type="text" 
                    required
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none" 
                    placeholder={t('lastName')} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t('emailAddress')}</label>
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email" 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-gray-100 text-gray-900 focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="john@example.com" 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">{t('message')}</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4} 
                  required
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-gray-100 text-gray-900 focus:ring-2 focus:ring-cyan-500 outline-none resize-none" 
                  placeholder={t('messagePlaceholder')}
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 bg-cyan-600 text-white rounded-lg font-bold hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <>
                        <Send className="w-4 h-4" />
                        {t('sendMessage')}
                    </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>
  );
}
