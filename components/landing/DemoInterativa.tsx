'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { landingDemoQuestao } from '@/lib/landingDemoQuestao';

const AvantLessonPlayer = dynamic(() => import('@/components/lesson/AvantLessonPlayer'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-white/10 bg-[#010409] text-sm font-medium text-slate-400">
      Carregando demo…
    </div>
  ),
});

export function DemoInterativa() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">Demo interativa</p>
          <h2 className="mb-4 text-3xl font-[1000] tracking-tight text-white sm:text-4xl">
            Experimente uma questão real antes de criar conta.
          </h2>
          <p className="text-base font-medium leading-relaxed text-slate-400 sm:text-lg">
            O mesmo player do app: responda, veja o gabarito e percorra os NeuroSlides de estudo reverso.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#010409] shadow-2xl shadow-black/40">
          <div className="relative flex min-h-[70vh] flex-col px-3 py-3 sm:px-4 md:px-6 md:py-6">
            <AvantLessonPlayer
              dados={landingDemoQuestao}
              mode="preview"
              moduloSlug="demo-landing-gluconato"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#BEF264] px-8 py-4 text-sm font-black uppercase tracking-widest text-slate-950 shadow-xl shadow-lime-400/20 transition-all hover:scale-[1.02] hover:bg-[#d4f879]"
          >
            Testar grátis agora
            <ArrowRight size={18} />
          </Link>
          <p className="text-center text-sm font-medium text-slate-500 sm:text-left">
            1 questão grátis por dia após cadastro · sem cartão
          </p>
        </div>
      </div>
    </section>
  );
}
