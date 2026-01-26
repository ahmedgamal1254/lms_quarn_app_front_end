'use client';

import { useTranslations } from 'next-intl';
import { Star, Play, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

export default function TeachersSection({ isRTL }: { isRTL: boolean }) {
  const t = useTranslations('LandingPage.Teachers');

  const { data: teachersData } = useQuery({
    queryKey: ['public-teachers'],
    queryFn: async () => {
        const res = await axiosInstance.get('/public-teachers');
        return res.data.data;
    }
  });

  // Fallback or use fetched teachers
  const teachers = teachersData || [];

  const getColor = (index: number) => {
    const colors = ["bg-emerald-100", "bg-purple-100", "bg-blue-100", "bg-amber-100"];
    return colors[index % colors.length];
  };

  return (
    <section id="tutors" className="py-24 bg-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-sky-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-50 text-cyan-600 font-medium text-sm mb-4">
            {t('badge')}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{t('title')}</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {teachers.length === 0 ? (
             <div className="text-center text-gray-500 py-10">
                 No teachers available at the moment.
             </div>
        ) : (
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 2 },
                1024: { slidesPerView: 4 }
              }}
              dir={isRTL ? 'rtl' : 'ltr'}
              className="pb-12"
            >
              {teachers.map((teacher: any, index: number) => (
                <SwiperSlide key={teacher.id}>
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100 group hover:-translate-y-2 transition-transform duration-300 h-full">
                    <div className="relative mb-6 mx-auto w-32 h-32">
                      <div className={`absolute inset-0 rounded-full ${getColor(index)} opacity-20 group-hover:scale-110 transition-transform duration-500`}></div>
                      {teacher.image ? (
                          <img 
                              src={teacher.image} 
                              alt={teacher.name}
                              className="w-full h-full rounded-full object-cover border-4 border-white shadow-md relative z-10" 
                          />
                      ) : (
                          <div className="w-full h-full rounded-full bg-gray-200 border-4 border-white shadow-md relative z-10 flex items-center justify-center">
                              <User size={40} className="text-gray-400" />
                          </div>
                      )}
                      
                      <button className="absolute bottom-0 right-0 z-20 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-cyan-600 hover:bg-cyan-600 hover:text-white transition-colors">
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                    </div>

                    <div className="text-center">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">{teacher.name}</h3>
                      <p className="text-sm text-cyan-600 font-medium mb-3">{t('roles.quran')}</p> 

                      <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                          <Star className="w-3 h-3 text-amber-500 fill-current" />
                          <span className="text-xs font-bold text-amber-700">{teacher.rating || 5.0}</span>
                        </div>
                        <span className="text-xs text-slate-400">({teacher.students_count || 0} {t('students')})</span>
                      </div>

                      <div className="flex gap-2">
                        <a href={`/teacher/${teacher.id}`} className="flex-1 flex items-center justify-center py-2 rounded-lg bg-cyan-600 text-white text-sm font-bold hover:bg-cyan-700 transition-colors">
                          {t('book')}
                        </a>
                        <a href={`/teacher/${teacher.id}/profile`}  className="flex-1 flex items-center justify-center py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors">
                          {t('profile')}
                        </a>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
        )}
      </div>
    </section>
  );
}
