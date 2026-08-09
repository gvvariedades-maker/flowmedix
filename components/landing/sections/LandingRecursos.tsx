'use client';

import { Brain, CalendarDays, Eye, LayoutDashboard } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionLabel } from '@/components/landing/lp-ui';
import { LANDING_RECURSOS } from '@/lib/marketing/landingCopy';
import { landingFadeUp } from '@/lib/marketing/landingMotion';

const FEATURE_ICONS: LucideIcon[] = [LayoutDashboard, Brain, Eye, CalendarDays];

export function LandingRecursos() {
  return (
    <section className="bg-[#f1f5f9] px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionLabel>{LANDING_RECURSOS.label}</SectionLabel>
        <h2 className="text-2xl font-[1000] tracking-tight text-slate-900 sm:text-3xl">
          {LANDING_RECURSOS.h2}
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LANDING_RECURSOS.features.map((f, i) => {
            const Icon = FEATURE_ICONS[i] ?? LayoutDashboard;
            const accent = i % 2 === 1;
            return (
              <motion.div
                key={f.title}
                className="card-elevated rounded-2xl p-5"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={landingFadeUp}
                custom={i}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-[#F26522]/25 bg-[#F26522]/10">
                  <Icon className={accent ? 'text-[#9A3412]' : 'text-slate-600'} size={22} aria-hidden />
                </div>
                <h3 className="font-black text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{f.text}</p>
              </motion.div>
            );
          })}
        </div>
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-slate-600">
          {LANDING_RECURSOS.proParagraph}
        </p>
      </div>
    </section>
  );
}
