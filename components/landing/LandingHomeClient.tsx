'use client';

import { useCallback } from 'react';
import { LandingMetodoSteps } from '@/components/landing/LandingMetodoSteps';
import { LandingPricingSplit } from '@/components/landing/LandingPricingSplit';
import { LandingAutoridade } from '@/components/landing/sections/LandingAutoridade';
import { LandingComparativo } from '@/components/landing/sections/LandingComparativo';
import { LandingCtaFinal } from '@/components/landing/sections/LandingCtaFinal';
import { LandingFaq } from '@/components/landing/sections/LandingFaq';
import { LandingFooter } from '@/components/landing/sections/LandingFooter';
import { LandingHeader } from '@/components/landing/sections/LandingHeader';
import { LandingHero } from '@/components/landing/sections/LandingHero';
import { LandingMissaoSemanal } from '@/components/landing/sections/LandingMissaoSemanal';
import { LandingProductChapter } from '@/components/landing/sections/LandingProductChapter';
import { LandingProblema } from '@/components/landing/sections/LandingProblema';
import { LandingRecursos } from '@/components/landing/sections/LandingRecursos';
import { LandingStickyCta } from '@/components/landing/sections/LandingStickyCta';
import { LandingTrustStrip } from '@/components/landing/sections/LandingTrustStrip';
import { LANDING_PRECO_PRO } from '@/lib/marketing/landingCopy';
import { useEditorialTheme } from '@/lib/layout/useEditorialTheme';

export default function LandingHomeClient() {
  useEditorialTheme();

  const scrollToPricing = useCallback(() => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f1f5f9] text-slate-900 selection:bg-[#F26522]/30">
      <LandingHeader onPlansClick={scrollToPricing} />

      <main>
        <LandingHero />
        <LandingTrustStrip />
        <LandingProblema />
        <LandingComparativo />
        <LandingProductChapter />
        <LandingMetodoSteps />
        <LandingMissaoSemanal />
        <LandingRecursos />
        <LandingAutoridade />
        <LandingPricingSplit precoPro={LANDING_PRECO_PRO} />
        <LandingFaq />
        <LandingCtaFinal onPricingClick={scrollToPricing} />
      </main>

      <LandingFooter />
      <LandingStickyCta />
    </div>
  );
}
