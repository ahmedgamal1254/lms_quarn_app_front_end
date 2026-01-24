'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Menu, X, Globe } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSettingsStore } from '@/store/appSetting';

export default function LandingHeader() {
  const t = useTranslations('LandingPage.Header');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { app_settings } = useAppSettingsStore();
  const isRTL = locale === 'ar';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchLocale = () => {
    const newLocale = locale === 'en' ? 'ar' : 'en';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const navLinks = [
    { name: t('home'), href: '#' },
    { name: t('about'), href: '#about' },
    { name: t('plans'), href: '#plans' },
    { name: t('tutors'), href: '#tutors' },
    { name: t('contact'), href: '#contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-md py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            {app_settings?.logo ? (
                 <img src={app_settings.logo} alt={app_settings.app_name} className="h-10 w-auto" />
            ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  Q
                </div>
            )}
            <span className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-800 ${isScrolled ? '' : 'text-white'}`}>
              {app_settings?.app_name || 'QuranLMS'}
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href}
                className={`font-medium transition-colors hover:text-cyan-500 ${
                  isScrolled ? 'text-slate-600' : 'text-white/90 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={switchLocale}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${
                isScrolled ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium text-white">{locale === 'en' ? 'العربية' : 'English'}</span>
            </button>
            
            <Link 
              href="/login"
              className={`px-5 py-2 rounded-full font-bold transition-all transform hover:scale-105 ${
                isScrolled 
                  ? 'bg-cyan-600 text-white hover:bg-cyan-700 shadow-md' 
                  : 'bg-white text-cyan-700 hover:bg-cyan-50 shadow-lg'
              }`}
            >
              {t('login')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-slate-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-slate-800' : 'text-white'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-slate-800' : 'text-white'}`} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-slate-100 py-4 px-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href}
              className="text-slate-600 font-medium py-2 hover:text-cyan-600"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-slate-100 my-2"></div>
          <button 
            onClick={() => { switchLocale(); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-2 text-slate-600 font-medium py-2 hover:text-cyan-600"
          >
            <Globe className="w-5 h-5" />
            {locale === 'en' ? 'العربية' : 'English'}
          </button>
          <Link 
            href="/login"
            className="w-full py-3 bg-cyan-600 text-white rounded-lg font-bold text-center shadow-md"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {t('login')}
          </Link>
        </div>
      )}
    </header>
  );
}
