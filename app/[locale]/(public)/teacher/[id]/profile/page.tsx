'use client';

import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useParams } from 'next/navigation';
import { Spin, Rate, Button } from 'antd';
import { User, BookOpen, Clock, Users, Globe, Play } from 'lucide-react';
import LandingHeader from '@/components/LandingPage/LandingHeader';
import Footer from '@/components/LandingPage/Footer';
import Image from 'next/image';

export default function TeacherProfilePage() {
    const params = useParams();
    const id = params.id;
    const isRTL = params.locale === 'ar';

    const { data: teacher, isLoading } = useQuery({
        queryKey: ['public-teacher', id],
        queryFn: async () => {
            const res = await axiosInstance.get(`/public-teachers/${id}`);
            return res.data.data;
        },
        enabled: !!id
    });

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Spin size="large" /></div>;
    }

    if (!teacher) {
        return <div className="min-h-screen flex items-center justify-center">Teacher not found</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
             <LandingHeader isRTL={isRTL} />

             <main className="pt-32 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                    {/* Header / Cover */}
                    <div className="h-48 bg-gradient-to-r from-cyan-600 to-blue-600 relative">
                        <div className="absolute -bottom-16 left-8 sm:left-12">
                            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white shadow-lg bg-gray-200 overflow-hidden relative">
                                {teacher.image ? (
                                    <img src={teacher.image} alt={teacher.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                        <User size={64} />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="pt-20 px-8 sm:px-12 pb-12">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{teacher.name}</h1>
                                <p className="text-lg text-cyan-600 font-medium mb-2">{teacher.subjects_string || 'Quran Teacher'}</p>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                    <div className="flex items-center gap-1">
                                        <Globe size={16} />
                                        <span>{teacher.language || 'Arabic, English'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Rate disabled defaultValue={Number(teacher.rating)} allowHalf className="text-sm" />
                                        <span className="font-bold text-gray-700">({teacher.rating})</span>
                                    </div>
                                </div>
                            </div>

                            <a 
                                href="#book" 
                                className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold hover:bg-cyan-700 transition-shadow shadow-lg hover:shadow-cyan-500/30"
                            >
                                {isRTL ? 'احجز حصة تجريبية' : 'Book a Trial Session'}
                            </a>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 mt-12">
                            {/* Stats */}
                            <div className="col-span-1 space-y-4">
                                <div className="bg-cyan-50 rounded-2xl p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-cyan-600 shadow-sm">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-cyan-800 font-medium">{isRTL ? 'عدد الطلاب' : 'Active Students'}</p>
                                        <p className="text-2xl font-bold text-cyan-900">{teacher.total_students}</p>
                                    </div>
                                </div>
                                <div className="bg-purple-50 rounded-2xl p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-purple-800 font-medium">{isRTL ? 'عدد الحصص' : 'Total Sessions'}</p>
                                        <p className="text-2xl font-bold text-purple-900">{teacher.total_sessions || 0}</p>
                                    </div>
                                </div>
                                <div className="bg-amber-50 rounded-2xl p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-amber-800 font-medium">{isRTL ? 'إجمالي الساعات' : 'Total Hours'}</p>
                                        <p className="text-2xl font-bold text-amber-900">{teacher.total_hours || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* About */}
                            <div className="col-span-2 space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">{isRTL ? 'عن المعلم' : 'About Me'}</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {/* Fallback bio since it wasn't in list, or use what we have */}
                                        {teacher.bio || (isRTL 
                                            ? 'معلم خبير في تدريس القرآن الكريم وأحكام التجويد، حاصل على إجازة في القراءات العشر. أستخدم أساليب تعليمية حديثة ومبسطة تناسب جميع الأعمار والمستويات.'
                                            : 'Expert Quran & Tajweed teacher certified in the Ten Qira\'at. I use modern and simplified teaching methods suitable for all ages and levels.')}
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">{isRTL ? 'فيديو تعريفي' : 'Intro Video'}</h3>
                                    <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center relative overflow-hidden group cursor-pointer">
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                            <Play size={32} className="text-cyan-600 ml-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </main>

             <Footer isRTL={isRTL} />
        </div>
    );
}
