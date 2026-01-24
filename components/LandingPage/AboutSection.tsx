'use client';

import { useTranslations } from 'next-intl';
import { Target, Heart, Award, ShieldCheck, BookOpen, Users, GraduationCap, User } from 'lucide-react';

export default function AboutSection({ isRTL }: { isRTL: boolean }) {
  const t = useTranslations('LandingPage.About');

  const stats = [
    { label: t('stats.years'), value: "10+", icon: Award },
    { label: t('stats.students'), value: "50k+", icon: Heart },
    { label: t('stats.courses'), value: "100+", icon: Target },
    { label: t('stats.certified'), value: "100%", icon: ShieldCheck },
  ];

  return (
    <section id="about" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div className={`space-y-8 ${isRTL ? 'lg:order-last' : ''}`}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 text-cyan-600 font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
              {t('subtitle')}
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
              {t('title')} <span className="text-cyan-600">{t('titleHighlight')}</span>
            </h2>

            <p className="text-lg text-slate-600 leading-relaxed">
              {t('description')}
            </p>

            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-cyan-200 transition-colors group">
                  <stat.icon className="w-8 h-8 text-cyan-600 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
            
            <button className="px-8 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition-colors">
              {t('cta')}
            </button>
          </div>

          {/* Image Grid */}
          <div className="relative">
            {/* Background decoration removed as per request */}
            <div className="grid grid-cols-2 gap-4">
               {/* Placeholders for actual visuals */}
               <div className="space-y-4 translate-y-8">
                 <div className="h-64 bg-slate-200 rounded-2xl w-full flex items-center justify-center text-slate-400">
                    <Users className="w-16 h-16 opacity-50" />
                 </div>
                 <div className="h-40 bg-cyan-100 rounded-2xl w-full flex items-center justify-center text-cyan-500">
                    <GraduationCap className="w-12 h-12" />
                 </div>
               </div>
               <div className="space-y-4">
                 <div className="h-40 bg-sky-100 rounded-2xl w-full flex items-center justify-center text-sky-500">
                    <BookOpen className="w-12 h-12" />
                 </div>
                 <div className="h-64 bg-slate-200 rounded-2xl w-full flex items-center justify-center text-slate-400">
                    <User className="w-16 h-16 opacity-50" />
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
