'use client';

import { BrandCta, OutlineCta } from '@/components/landing/lp-ui';
import { LANDING_CTA_FINAL, LANDING_PRECO_PRO } from '@/lib/marketing/landingCopy';

type LandingCtaFinalProps = {
  onPricingClick: () => void;
};

export function LandingCtaFinal({ onPricingClick }: LandingCtaFinalProps) {
  return (
    <section className="bg-[#F26522]/15 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-[1000] tracking-tight text-[#0f172a] sm:text-4xl">
          {LANDING_CTA_FINAL.h2Prefix}{' '}
          <span className="text-[#9A3412]">{LANDING_CTA_FINAL.h2Accent}</span>
        </h2>
        <div className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          {LANDING_CTA_FINAL.subLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p>{LANDING_CTA_FINAL.proLine(LANDING_PRECO_PRO)}</p>
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <BrandCta href="/register" size="lg">
            {LANDING_CTA_FINAL.ctaPrimary}
          </BrandCta>
          <OutlineCta onClick={onPricingClick} size="lg">
            {LANDING_CTA_FINAL.ctaSecondary}
          </OutlineCta>
        </div>
      </div>
    </section>
  );
}
