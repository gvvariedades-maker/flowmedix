'use client';

import type { LucideIcon } from 'lucide-react';
import { GitBranch, Lightbulb, Network, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { NeuroSlideCarousel } from '@/components/marketing/NeuroSlideCarousel';
import { LANDING_NEUROSLIDES } from '@/lib/marketing/landingCopy';
import { landingFadeUp } from '@/lib/marketing/landingMotion';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<(typeof LANDING_NEUROSLIDES.cards)[number]['icon'], LucideIcon> = {
  network: Network,
  lightbulb: Lightbulb,
  'git-branch': GitBranch,
  'shield-alert': ShieldAlert,
};

const ICON_COLOR: Record<(typeof LANDING_NEUROSLIDES.cards)[number]['icon'], string> = {
  network: 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,242,255,0.35)]',
  lightbulb: 'text-[#8fe020]',
  'git-branch': 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,242,255,0.35)]',
  'shield-alert': 'text-rose-400',
};

type LandingNeuroSlidesProps = {
  /** Dentro de `LandingProductChapter` — sem section/bg próprios. */
  embedded?: boolean;
};

export function LandingNeuroSlides({ embedded = false }: LandingNeuroSlidesProps) {
  const content = (
    <div className={cn('mx-auto max-w-6xl', embedded ? 'px-4 py-16 sm:px-6 sm:py-20' : undefined)}>
      <div className="text-center lg:text-left">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">
          {LANDING_NEUROSLIDES.label}
        </p>
        <h2
          id="landing-neuroslides-heading"
          className="mt-3 text-2xl font-[1000] tracking-tight text-white sm:text-4xl"
        >
          {LANDING_NEUROSLIDES.h2}
        </h2>
        <p className="mt-3 text-slate-400">{LANDING_NEUROSLIDES.sub}</p>
      </div>

      <div className="mt-12 grid items-start gap-10 lg:grid-cols-2">
        <ul className="grid gap-4 sm:grid-cols-2">
          {LANDING_NEUROSLIDES.cards.map((card, i) => {
            const Icon = ICON_MAP[card.icon];
            return (
              <motion.li
                key={card.title}
                className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={landingFadeUp}
                custom={i}
              >
                <Icon className={cn('mb-3', ICON_COLOR[card.icon])} size={24} aria-hidden />
                <h3 className="font-bold text-white">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{card.text}</p>
              </motion.li>
            );
          })}
        </ul>

        <NeuroSlideCarousel className="mx-auto w-full max-w-[340px] lg:justify-self-end" />
      </div>

      {!embedded ? (
        <p className="mt-16 text-center text-sm uppercase tracking-widest text-slate-500">
          {LANDING_NEUROSLIDES.transition}
        </p>
      ) : null}
    </div>
  );

  if (embedded) {
    return <div id="neuroslides">{content}</div>;
  }

  return (
    <section id="neuroslides" aria-labelledby="landing-neuroslides-heading">
      <div className="bg-[#010409] px-4 py-24 text-white sm:px-6">{content}</div>
    </section>
  );
}
