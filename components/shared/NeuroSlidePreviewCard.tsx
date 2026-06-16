'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LandingNeuroSlideLive } from '@/components/marketing/LandingNeuroSlideLive';
import { LANDING_NEUROSLIDE_SHOWCASE } from '@/lib/marketing/landingNeuroSlides';
import { NEUROSLIDE_ASPECT_CLASS } from '@/lib/marketing/neuroslideAssets';

export interface NeuroCardProps {
  tipo: string;
  badgeColor: string;
  titulo: string;
  conteudo: React.ReactNode;
  icone: React.ReactNode;
  gradiente: string;
}

/** Card de pré-visualização de NeuroSlide — mesmo padrão visual do Material de Apoio */
export function NeuroSlidePreview({
  tipo,
  badgeColor,
  titulo,
  conteudo,
  icone,
  gradiente,
}: NeuroCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative rounded-2xl overflow-hidden border border-white/10 shadow-xl ${gradiente} p-5 space-y-4`}
    >
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${badgeColor}`}>
          {tipo}
        </span>
        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/70">{icone}</div>
      </div>

      <div className="text-white">
        <h3 className="text-sm font-black uppercase tracking-tight mb-3 leading-tight">{titulo}</h3>
        {conteudo}
      </div>
    </motion.div>
  );
}

/** Card com NeuroSlide real do player (landing / estudo reverso). */
export function NeuroSlideLiveCard({
  tipo,
  badgeColor,
  titulo,
  slideIndex,
}: {
  tipo: string;
  badgeColor: string;
  titulo: string;
  slideIndex: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/90 shadow-xl shadow-black/30"
    >
      <div className="flex items-center justify-between px-4 pt-4">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${badgeColor}`}>
          {tipo}
        </span>
      </div>
      <div
        className={`relative mx-4 mb-3 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#f8fafc] ${NEUROSLIDE_ASPECT_CLASS}`}
      >
        <LandingNeuroSlideLive slideIndex={slideIndex} />
      </div>
      <p className="px-4 pb-4 text-sm font-black leading-tight tracking-tight text-white">{titulo}</p>
    </motion.div>
  );
}

/**
 * Vitrine da landing com NeuroSlides reais (formato novo do player).
 * Material de Apoio continua usando `NeuroSlidePreview` (cards ilustrativos).
 */
export function NeuroSlidesShowcaseGrid({ className = '' }: { className?: string }) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${className}`}>
      {LANDING_NEUROSLIDE_SHOWCASE.map((item) => (
        <NeuroSlideLiveCard key={item.slideIndex} {...item} />
      ))}
    </div>
  );
}

/** @deprecated Use `NeuroSlideLiveCard` — screenshots JPG foram substituídos por slides reais. */
export const NeuroSlideScreenshotCard = NeuroSlideLiveCard;
