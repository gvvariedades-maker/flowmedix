'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  NEUROSLIDE_ASPECT_CLASS,
  NEUROSLIDE_IMAGE_SIZES,
  NEUROSLIDE_MAX_WIDTH_CLASS,
} from '@/lib/marketing/neuroslideAssets';
import { cn } from '@/lib/utils';

const NEURO_SLIDES = [
  {
    src: '/images/neuroslide-concept-map.jpg',
    label: 'Mapa Mental',
    color: '#00f2ff',
    description: 'Conecta os conceitos que a banca tentou misturar',
    alt: 'NeuroSlide Mapa Mental com quatro conceitos em círculos luminosos ciano',
  },
  {
    src: '/images/neuroslide-golden-rule.jpg',
    label: 'Regra de Ouro',
    color: '#00ff88',
    description: 'Resume o ponto que você precisa lembrar na prova',
    alt: 'NeuroSlide Regra de Ouro com definição da APS como centro ordenador do cuidado',
  },
  {
    src: '/images/neuroslide-logic-flow.jpg',
    label: 'Fluxo Lógico',
    color: '#f59e0b',
    description: 'Sequência de decisão para casos parecidos',
    alt: 'NeuroSlide Fluxo Lógico com pipeline de passos em laranja',
  },
  {
    src: '/images/neuroslide-danger-zone.jpg',
    label: 'Zona de Perigo',
    color: '#ff0055',
    description: 'Pegadinhas que derrubam candidatos preparados',
    alt: 'NeuroSlide Zona de Perigo listando erros comuns na administração da vacina BCG',
  },
] as const;

export type NeuroSlideCarouselProps = {
  className?: string;
};

/** Carrossel de screenshots do player — proporção fixa 487×1024, max 340px de largura. */
export function NeuroSlideCarousel({ className }: NeuroSlideCarouselProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = NEURO_SLIDES[active];

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % NEURO_SLIDES.length), 3000);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'relative mx-auto w-full min-w-0 max-w-full justify-self-center',
        NEUROSLIDE_MAX_WIDTH_CLASS,
        className,
      )}
    >
      <div className="pointer-events-none absolute -inset-4 rounded-full bg-cyan-400/10 blur-3xl sm:-inset-8" />
      <div
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-[0_0_50px_rgba(0,242,255,0.12)] backdrop-blur-xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative w-full p-4">
          {NEURO_SLIDES.map((s, i) => (
            <div
              key={s.src}
              className={
                i === active
                  ? cn('relative w-full', NEUROSLIDE_ASPECT_CLASS)
                  : cn(
                      'pointer-events-none absolute inset-x-4 top-4 w-[calc(100%-2rem)] opacity-0',
                      NEUROSLIDE_ASPECT_CLASS,
                    )
              }
              aria-hidden={i !== active}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes={NEUROSLIDE_IMAGE_SIZES}
                className={cn(
                  'rounded-2xl object-contain transition-opacity duration-500',
                  i === active ? 'opacity-100' : 'opacity-0',
                )}
              />
            </div>
          ))}
          <span
            className="absolute top-7 left-7 z-10 rounded-full border bg-black/60 px-3 py-1 text-xs font-black tracking-wider uppercase backdrop-blur-sm"
            style={{ borderColor: slide.color, color: slide.color }}
          >
            {slide.label}
          </span>
        </div>
        <p className="px-4 py-3 text-sm text-slate-400">{slide.description}</p>
        <div
          className="flex justify-center gap-2 pb-4"
          role="tablist"
          aria-label="Slides do NeuroSlide"
        >
          {NEURO_SLIDES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Slide ${i + 1}: ${s.label}`}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 ${
                i === active ? 'h-2 w-6 bg-[#8fe020]' : 'h-2 w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
