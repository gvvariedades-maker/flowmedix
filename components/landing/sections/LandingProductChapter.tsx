'use client';

import dynamic from 'next/dynamic';
import { Zap } from 'lucide-react';
import { BrandCta } from '@/components/landing/lp-ui';
import { LandingNeuroSlides } from '@/components/landing/sections/LandingNeuroSlides';
import { LANDING_DEMO } from '@/lib/marketing/landingCopy';
import { useInViewOnce } from '@/lib/hooks/useInViewOnce';

const DemoInterativa = dynamic(
  () => import('@/components/landing/DemoInterativa').then((m) => ({ default: m.DemoInterativa })),
  {
    ssr: false,
    loading: () => <DemoPlayerSkeleton />,
  },
);

function DemoPlayerSkeleton() {
  return (
    <div
      className="mx-auto flex min-h-[min(60vh,520px)] max-w-6xl items-center justify-center rounded-[2rem] border border-white/10 bg-[#010409] px-4"
      aria-busy="true"
    >
      <p className="text-sm font-medium text-slate-500">Carregando demo interativa…</p>
    </div>
  );
}

/**
 * Capítulo único escuro: demo (player) + NeuroSlides.
 * Intro da demo em fundo claro; ponte suave a partir do comparativo (#fff7ed).
 */
export function LandingProductChapter() {
  const chips = LANDING_DEMO.chips.split(' · ');
  const { ref: demoMountRef, inView: demoInView } = useInViewOnce<HTMLDivElement>('280px 0px');

  return (
    <section id="demo" data-testid="landing-product-chapter" aria-labelledby="landing-demo-heading">
      {/* Ponte comparativo (creme) → editorial */}
      <div
        aria-hidden
        className="h-16 bg-gradient-to-b from-[#fff7ed] to-[#f1f5f9] sm:h-20"
      />

      {/* Intro demo — leitura confortável */}
      <div className="bg-[#f1f5f9] px-4 pb-10 pt-2 text-slate-900 sm:px-6 sm:pb-14">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#9A3412]">
            {LANDING_DEMO.label}
          </p>
          <h2
            id="landing-demo-heading"
            className="mt-3 text-2xl font-[1000] tracking-tight text-slate-900 sm:text-4xl"
          >
            {LANDING_DEMO.h2}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">{LANDING_DEMO.copy}</p>
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {chips.map((item) => (
              <li
                key={item}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Capítulo escuro contínuo — player + NeuroSlides */}
      <div className="overflow-hidden rounded-t-[2rem] bg-[#0f172a] text-white shadow-[0_-12px_40px_rgba(15,23,42,0.12)] sm:rounded-t-[2.5rem]">
        <div ref={demoMountRef} className="px-4 pt-10 sm:px-6 sm:pt-12">
          {demoInView ? (
            <DemoInterativa embedded showCta={false} />
          ) : (
            <DemoPlayerSkeleton />
          )}

          <div className="mx-auto mt-14 flex max-w-4xl justify-center pb-4">
            <BrandCta href="/register" size="lg" data-analytics="lp-demo-cta">
              {LANDING_DEMO.cta}
              <Zap size={18} aria-hidden />
            </BrandCta>
          </div>
        </div>

        <div className="border-t border-white/10" aria-hidden />

        <LandingNeuroSlides embedded />

        {/* Saída suave para seções claras */}
        <div
          aria-hidden
          className="h-16 bg-gradient-to-b from-[#0f172a] to-[#f1f5f9] sm:h-20"
        />
      </div>
    </section>
  );
}
