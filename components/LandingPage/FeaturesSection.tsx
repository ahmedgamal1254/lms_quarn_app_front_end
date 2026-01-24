'use client';

import { useTranslations } from 'next-intl';
import { BookOpen, Video, Users, Clock } from 'lucide-react';

export default function FeaturesSection() {
  const t = useTranslations('LandingPage.Features');

  const features = [
    {
      icon: Users,
      title: t('certifiedTutors.title'),
      desc: t('certifiedTutors.desc'),
      color: "bg-cyan-100 text-cyan-600"
    },
    {
      icon: Video,
      title: t('interactive.title'),
      desc: t('interactive.desc'),
      color: "bg-sky-100 text-sky-600"
    },
    {
      icon: Clock,
      title: t('flexible.title'),
      desc: t('flexible.desc'),
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: BookOpen,
      title: t('reports.title'),
      desc: t('reports.desc'),
      color: "bg-indigo-100 text-indigo-600"
    }
  ];

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{t('title')}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">{t('subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-slate-100 group">
              <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
