'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { LandingMissaoSemanalPreview } from '@/components/marketing/LandingMissaoSemanalPreview';
import { BrandCta } from '@/components/landing/lp-ui';
import { LANDING_MISSAO_SEMANAL } from '@/lib/marketing/landingCopy';
import { landingFadeUp } from '@/lib/marketing/landingMotion';

export function LandingMissaoSemanal() {
  return (
    <section
      id="missao-semanal"
      data-testid="landing-missao-semanal"
      className="bg-white px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={landingFadeUp}
          custom={0}
          className="min-w-0"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#9A3412]">
            {LANDING_MISSAO_SEMANAL.label}
          </p>
          <h2 className="mt-3 text-2xl font-[1000] tracking-tight text-slate-900 sm:text-4xl">
            {LANDING_MISSAO_SEMANAL.h2}
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            {LANDING_MISSAO_SEMANAL.sub}
          </p>

          <ul className="mt-8 space-y-4">
            {LANDING_MISSAO_SEMANAL.bullets.map((item) => (
              <li key={item.title} className="flex gap-3">
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-[#9A3412]"
                  size={20}
                  aria-hidden
                />
                <div>
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs text-slate-500">{LANDING_MISSAO_SEMANAL.microcopy}</p>

          <div className="mt-8">
            <BrandCta
              href="/register"
              className="w-full sm:w-auto"
              data-analytics="lp-missao-cta"
            >
              {LANDING_MISSAO_SEMANAL.cta}
            </BrandCta>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={landingFadeUp}
          custom={1}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-[#0f172a] shadow-2xl shadow-slate-900/20">
            <div className="border-b border-white/10 px-4 py-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Missão da semana · preview
              </p>
            </div>
            <LandingMissaoSemanalPreview />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
