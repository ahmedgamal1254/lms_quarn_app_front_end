'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function PricingSection({ isRTL }: { isRTL: boolean }) {
  const t = useTranslations('LandingPage.Pricing');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const { data: plansData, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => axiosInstance.get('/get-plans').then(response => response.data),
  });

  const plans = plansData?.data || [];

  return (
    <section id="plans" className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">{t('title')}</h2>
          <p className="text-lg text-slate-600 mb-8">{t('subtitle')}</p>
          
          {/* Toggle */}
          <div className="inline-flex items-center p-1 bg-white rounded-full border border-slate-200">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'monthly' 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('monthly')}
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'yearly' 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('yearly')}
              <span className="text-xs ml-1 px-1.5 py-0.5 bg-cyan-100 text-cyan-700 rounded-full">{t('save20')}</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="w-8 h-8 border-4 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Swiper
            modules={[Pagination, Navigation, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-12 px-4"
            dir={isRTL ? 'rtl' : 'ltr'}
            key={isRTL ? 'rtl' : 'ltr'} 
          >
            {plans.map((plan: any) => (
              <SwiperSlide key={plan.id} className="h-auto">
                <div 
                  className={`relative bg-white rounded-2xl p-8 border hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col border-slate-100 shadow-sm h-full`}
                >
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <p className="text-sm text-slate-500 mb-6 min-h-[40px]">{plan.description || t('basic.description')}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                      <span className="text-slate-500">/{plan.currency || (billingCycle === 'monthly' ? t('mo') : t('yr'))}</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 mb-8">
                     <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-cyan-600" />
                        </div>
                        <span className="text-sm text-slate-700">
                          {t('features.sessions', { count: plan.sessions_count })}
                        </span>
                     </div>
                  </div>

                  <button className={`w-full py-3 rounded-xl font-bold transition-all bg-slate-100 text-slate-900 hover:bg-slate-200 mt-auto`}>
                    {t('choosePlan')}
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}
