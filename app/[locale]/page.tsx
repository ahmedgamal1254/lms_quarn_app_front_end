'use client';

import { useLocale } from 'next-intl';
import LandingHeader from '@/components/LandingPage/LandingHeader';
import HeroSection from '@/components/LandingPage/HeroSection';
import AboutSection from '@/components/LandingPage/AboutSection';
import PricingSection from '@/components/LandingPage/PricingSection';
import TeachersSection from '@/components/LandingPage/TeachersSection';
import ContactSection from '@/components/LandingPage/ContactSection';
import Footer from '@/components/LandingPage/Footer';
import FeaturesSection from '@/components/LandingPage/FeaturesSection';

export default function Home() {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <main className="min-h-screen bg-white">
      <LandingHeader />
      <HeroSection isRTL={isRTL} />
      <FeaturesSection />
      <AboutSection isRTL={isRTL} />
      <PricingSection isRTL={isRTL} />
      <TeachersSection isRTL={isRTL} />
      <ContactSection isRTL={isRTL} />
      <Footer isRTL={isRTL} />
    </main>
  );
}
