'use client';

import { useCallback } from 'react';
import { LandingMetodoSteps } from '@/components/landing/LandingMetodoSteps';
import { LandingPricingSplit } from '@/components/landing/LandingPricingSplit';
import { LandingAutoridade } from '@/components/landing/sections/LandingAutoridade';
import { LandingComparativo } from '@/components/landing/sections/LandingComparativo';
import { LandingCtaFinal } from '@/components/landing/sections/LandingCtaFinal';
import { LandingDemo } from '@/components/landing/sections/LandingDemo';
import { LandingFaq } from '@/components/landing/sections/LandingFaq';
import { LandingFooter } from '@/components/landing/sections/LandingFooter';
import { LandingHeader } from '@/components/landing/sections/LandingHeader';
import { LandingHero } from '@/components/landing/sections/LandingHero';
import { LandingNeuroSlides } from '@/components/landing/sections/LandingNeuroSlides';
import { LandingProblema } from '@/components/landing/sections/LandingProblema';
import { LandingRecursos } from '@/components/landing/sections/LandingRecursos';
import { LandingTrustStrip } from '@/components/landing/sections/LandingTrustStrip';
import { LANDING_PRECO_PRO } from '@/lib/marketing/landingCopy';
import { useEditorialTheme } from '@/lib/layout/useEditorialTheme';

export default function LandingHomeClient() {
  useEditorialTheme();

  const scrollToPricing = useCallback(() => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f1f5f9] text-slate-900 selection:bg-[#8fe020]/30">
      <LandingHeader onProClick={scrollToPricing} />

      <main>
        <LandingHero />
        <LandingTrustStrip />
        <LandingProblema />
        <LandingComparativo />
        <LandingMetodoSteps />
        <LandingDemo />
        <LandingNeuroSlides />
        <LandingRecursos />
        <LandingAutoridade />
        <LandingPricingSplit precoPro={LANDING_PRECO_PRO} />
        <LandingFaq />
        <LandingCtaFinal onPricingClick={scrollToPricing} />
      </main>

      <LandingFooter />
    </div>
  );
}
