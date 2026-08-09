'use client';

import dynamic from 'next/dynamic';
import { ArrowRight, LockKeyhole, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { BrandCta, OutlineCta } from '@/components/landing/lp-ui';
import {
  LANDING_HERO,
  landingHeroMicrocopy,
} from '@/lib/marketing/landingCopy';
import { landingBlobPulse, landingFadeUp } from '@/lib/marketing/landingMotion';

const LandingHeroShowcase = dynamic(
  () =>
    import('@/components/marketing/LandingHeroShowcase').then((m) => ({
      default: m.LandingHeroShowcase,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="mx-auto flex h-[420px] w-full max-w-sm items-center justify-center rounded-[2rem] border border-slate-200 bg-white text-sm text-slate-400">
        Carregando preview…
      </div>
    ),
  },
);

export function LandingHero() {
  const microcopy = landingHeroMicrocopy();

  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-10 sm:px-6 sm:pb-24 sm:pt-16">
      <motion.div
        className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-[#F26522]/15 blur-3xl"
        animate={landingBlobPulse.animate}
        transition={landingBlobPulse.transition}
      />
      <motion.div
        className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-slate-300/40 blur-3xl"
        animate={landingBlobPulse.animate}
        transition={{ ...landingBlobPulse.transition, delay: 2 }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <motion.div initial="hidden" animate="visible" variants={landingFadeUp} custom={0}>
          <p className="mb-4 inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-[#9A3412]/20 bg-[#9A3412]/10 px-4 py-1.5 text-sm font-semibold text-[#9A3412]">
            <Shield size={14} aria-hidden />
            {LANDING_HERO.badge}
          </p>

          <h1 className="text-3xl font-[1000] leading-[1.08] tracking-tight text-[#0f172a] sm:text-5xl lg:text-[3.25rem]">
            {LANDING_HERO.h1Lines.map((line, i) => (
              <span key={line} className={i > 0 ? 'block' : undefined}>
                {line.includes(LANDING_HERO.h1AccentWord) ? (
                  <>
                    para{' '}
                    <span className="text-[#9A3412]">{LANDING_HERO.h1AccentWord}</span>.
                  </>
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            {LANDING_HERO.subheadline}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <BrandCta href="/register" size="lg" className="w-full sm:w-auto">
              {LANDING_HERO.ctaPrimary}
              <ArrowRight size={18} aria-hidden />
            </BrandCta>
            <OutlineCta href="#demo" size="lg" className="w-full sm:w-auto">
              {LANDING_HERO.ctaSecondary}
            </OutlineCta>
          </div>

          <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
            <LockKeyhole size={14} aria-hidden />
            {microcopy}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full lg:justify-self-end"
        >
          <LandingHeroShowcase />
        </motion.div>
      </div>
    </section>
  );
}
