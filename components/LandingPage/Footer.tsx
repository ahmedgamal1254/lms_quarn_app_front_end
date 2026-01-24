'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Heart } from 'lucide-react';
import { useAppSettingsStore } from '@/store/appSetting';

export default function Footer({ isRTL }: { isRTL: boolean }) {
  const t = useTranslations('LandingPage.Footer');
  const currentYear = new Date().getFullYear();
  const { app_settings } = useAppSettingsStore();

  return (
    <footer className="bg-slate-50 pt-16 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              {app_settings?.logo ? (
                  <img src={app_settings.logo} alt={app_settings.app_name} className="h-8 w-auto" />
              ) : (
                <div className="w-8 h-8 bg-cyan-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    Q
                </div>
              )}
              <span className="text-xl font-bold text-slate-900">{app_settings?.app_name || 'QuranLMS'}</span>
            </Link>
            <p className="text-slate-600 leading-relaxed">
              {t('description')}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-cyan-600 hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-cyan-600 hover:text-white transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-cyan-600 hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-cyan-600 hover:text-white transition-all">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6">{t('quickLinks')}</h3>
            <ul className="space-y-4">
              {['about', 'courses', 'tutors', 'pricing', 'contact'].map((item) => (
                <li key={item}>
                  <Link href={`#${item}`} className="text-slate-600 hover:text-cyan-600 transition-colors">
                    {t(item)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6">{t('support')}</h3>
            <ul className="space-y-4">
              {['help', 'terms', 'privacy', 'faq', 'sitemap'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-600 hover:text-cyan-600 transition-colors">
                    {t(item)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6">{t('newsletter')}</h3>
            <p className="text-slate-600 mb-4">{t('newsletterDesc')}</p>
            <form className="space-y-2">
              <input 
                type="email" 
                placeholder={t('emailPlaceholder')} 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cyan-500 outline-none bg-white"
              />
              <button className="w-full py-2 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-colors">
                {t('subscribe')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="py-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">
            © {currentYear} QuranLMS. {t('rights')}
          </p>
          <p className="text-slate-500 text-sm flex items-center gap-1">
            {t('madeWith')} <Heart className="w-4 h-4 text-red-500 fill-current" /> {t('byTeam')}
          </p>
        </div>
      </div>
    </footer>
  );
}
