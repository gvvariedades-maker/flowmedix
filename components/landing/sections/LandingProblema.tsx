'use client';

import { CircleAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionLabel } from '@/components/landing/lp-ui';
import { LANDING_PROBLEMA } from '@/lib/marketing/landingCopy';
import { landingFadeUp } from '@/lib/marketing/landingMotion';

export function LandingProblema() {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionLabel>{LANDING_PROBLEMA.label}</SectionLabel>
        <h2 className="max-w-3xl text-2xl font-[1000] tracking-tight text-slate-900 sm:text-4xl">
          {LANDING_PROBLEMA.h2}
        </h2>
        <ul className="mt-12 grid gap-6 sm:grid-cols-3">
          {LANDING_PROBLEMA.cards.map((card, i) => (
            <motion.li
              key={card.title}
              className="card-elevated rounded-2xl border-slate-200 p-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={landingFadeUp}
              custom={i}
            >
              <CircleAlert className="mb-4 text-rose-500" size={22} aria-hidden />
              <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-slate-600">{card.text}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
