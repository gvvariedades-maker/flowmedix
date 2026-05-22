'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

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

const AVANT_SLIDE_ASPECT = { width: 750, height: 1334 } as const;

/** Carrossel de screenshots do player — mesmo visual/tamanho da homepage. */
export function NeuroSlideCarousel() {
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
      className="relative mx-auto max-w-[340px] overflow-visible"
    >
      <div className="absolute -inset-8 rounded-full bg-cyan-400/10 blur-3xl" />
      <div
        className="relative overflow-visible rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-[0_0_50px_rgba(0,242,255,0.12)] backdrop-blur-xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative w-full p-4">
          {NEURO_SLIDES.map((s, i) => (
            <div
              key={s.src}
              className={
                i === active
                  ? 'relative'
                  : 'pointer-events-none absolute inset-x-4 top-4 opacity-0'
              }
              aria-hidden={i !== active}
            >
              <Image
                src={s.src}
                alt={s.alt}
                width={AVANT_SLIDE_ASPECT.width}
                height={AVANT_SLIDE_ASPECT.height}
                priority={i === 0}
                className={`h-auto w-full rounded-2xl transition-opacity duration-500 ${
                  i === active ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ objectFit: 'contain' }}
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
                i === active ? 'h-2 w-6 bg-[#BEF264]' : 'h-2 w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
