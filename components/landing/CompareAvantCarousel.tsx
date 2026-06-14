'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const AVANT_SLIDE_ASPECT = { width: 750, height: 1334 } as const;

const COMPARE_AVANT_SLIDES = [
  {
    src: '/images/compare-avant-1.jpg',
    alt: 'NeuroSlide AVANT — pipeline cognitivo laranja: avaliar compatibilidade da solução, escolher veia, punção asséptica e infusão controlada',
  },
  {
    src: '/images/compare-avant-2.jpg',
    alt: 'NeuroSlide AVANT — pipeline cognitivo roxo: verificação de sinais vitais, checklist cirúrgico, monitoramento transoperatório e avaliação na SRPA',
  },
  {
    src: '/images/compare-avant-3.jpg',
    alt: 'NeuroSlide AVANT — zona de perigo vermelha: contraindicações e riscos da via de administração',
  },
] as const;

export function CompareAvantCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % COMPARE_AVANT_SLIDES.length), 2500);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      className="relative w-full px-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative w-full">
        {COMPARE_AVANT_SLIDES.map((s, i) => (
          <div
            key={s.src}
            className={
              i === active
                ? 'relative'
                : 'pointer-events-none absolute inset-x-0 top-0 opacity-0'
            }
            aria-hidden={i !== active}
          >
            <Image
              src={s.src}
              alt={s.alt}
              width={AVANT_SLIDE_ASPECT.width}
              height={AVANT_SLIDE_ASPECT.height}
              priority={i === 0}
              className={`h-auto w-full rounded-2xl border border-[#8fe020]/20 shadow-xl shadow-[#8fe020]/10 transition-opacity duration-500 ${
                i === active ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ objectFit: 'contain' }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-2 py-4" role="tablist" aria-label="Slides AVANT">
        {COMPARE_AVANT_SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`rounded-full transition-all duration-300 ${
              i === active ? 'h-2 w-6 bg-[#8fe020]' : 'h-2 w-2 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
