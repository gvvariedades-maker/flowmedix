'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { NeuroSlidesShowcaseGrid } from '@/components/shared/NeuroSlidePreviewCard';

/**
 * Vitrine com screenshots reais do player (`NeuroSlidesShowcaseGrid`).
 */
export function SlideStylePreviews() {
  return (
    <section className="relative py-20 sm:py-28 px-4 sm:px-6 border-y border-white/5 bg-[#020617]/80">
      <div className="max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-400/90 mb-3">
            NeuroSlides do Estudo Reverso
          </p>
          <h2 className="text-3xl sm:text-4xl font-[1000] text-white tracking-tight">
            Mapa, regra de ouro, fluxo e zona de perigo — ao vivo
          </h2>
        </div>

        <NeuroSlidesShowcaseGrid />

        <p className="text-center mt-10 text-sm text-slate-500 font-medium">
          Quer começar por uma questão real?{' '}
          <Link
            href="/register"
            className="text-indigo-400 font-black hover:text-indigo-300 inline-flex items-center gap-1"
          >
            Criar conta grátis
            <ArrowRight size={14} />
          </Link>
        </p>
      </div>
    </section>
  );
}
