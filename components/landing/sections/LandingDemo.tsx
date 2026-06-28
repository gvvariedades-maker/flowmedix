'use client';

import dynamic from 'next/dynamic';
import { Zap } from 'lucide-react';
import { BrandCta } from '@/components/landing/lp-ui';
import { LANDING_DEMO } from '@/lib/marketing/landingCopy';

const DemoInterativa = dynamic(
  () => import('@/components/landing/DemoInterativa').then((m) => ({ default: m.DemoInterativa })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[280px] items-center justify-center bg-[#010409] px-4 py-16">
        <p className="text-sm font-medium text-slate-500" aria-busy="true">
          Carregando demo interativa…
        </p>
      </div>
    ),
  },
);

export function LandingDemo() {
  const chips = LANDING_DEMO.chips.split(' · ');

  return (
    <section className="bg-[#0f172a] px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">
          {LANDING_DEMO.label}
        </p>
        <h2 className="mt-3 text-2xl font-[1000] tracking-tight text-white sm:text-4xl">
          {LANDING_DEMO.h2}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">{LANDING_DEMO.copy}</p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {chips.map((item) => (
            <li
              key={item}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm text-slate-300"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-12">
        <DemoInterativa embedded />
      </div>

      <div className="mx-auto mt-12 flex max-w-4xl justify-center">
        <BrandCta href="/register" size="lg">
          {LANDING_DEMO.cta}
          <Zap size={18} aria-hidden />
        </BrandCta>
      </div>
    </section>
  );
}
