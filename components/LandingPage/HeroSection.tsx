'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, PlayCircle } from 'lucide-react';

export default function HeroSection({ isRTL }: { isRTL: boolean }) {
  const t = useTranslations('LandingPage.Hero');

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white min-h-screen flex items-center">
      {/* Abstract Background Shapes Removed as per request */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className={`space-y-8 ${isRTL ? 'text-right' : 'text-left'}`}>
            <h1 className="text-4xl lg:text-7xl font-bold leading-tight tracking-tight">
              {t('title.part1')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{t('title.highlight')}</span> {t('title.part2')}
            </h1>

            <p className="text-md lg:text-lg text-slate-300 max-w-xl leading-relaxed">
              {t('description')}
            </p>

            <div className={`flex flex-wrap gap-4 ${isRTL ? 'justify-end lg:justify-start' : ''}`}>
              <Link
                href="/register"
                className="group relative inline-flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full font-bold transition-all transform hover:scale-105 hover:shadow-lg shadow-cyan-900/20"
              >
                {t('cta.primary')}
                <ArrowRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isRTL ? 'rotate-180 group-hover:-translate-x-1 group-hover:translate-x-0' : ''}`} />
              </Link>

              <button className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 text-white rounded-full font-semibold transition-all hover:scale-105">
                <PlayCircle className="w-5 h-5 text-cyan-400" />
                {t('cta.secondary')}
              </button>
            </div>

            <div className="pt-8 border-t border-white/10 flex items-center gap-8">
              <div>
                <p className="text-3xl font-bold text-white">5k+</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{t('stats.students')}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">120+</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{t('stats.tutors')}</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">4.9</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">{t('stats.rating')}</p>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              
              {/* Glass card effect */}
              <div className="absolute inset-4 bg-white/5 backdrop-blur-2xl rounded-[2rem] border border-white/10 shadow-2xl flex items-center justify-center p-8 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                 {/* Placeholder for Hero Image - Ideally use a real image */}
                 <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">📖</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">{t('card.title')}</h3>
                    <p className="text-slate-300">{t('card.desc')}</p>
                    <div className="flex justify-center -space-x-2 rtl:space-x-reverse py-4">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-800 flex items-center justify-center text-xs">U{i}</div>
                        ))}
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
