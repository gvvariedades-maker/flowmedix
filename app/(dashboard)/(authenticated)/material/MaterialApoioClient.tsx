'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { TOTAL_MATERIAL_SLIDES } from '@/components/material/materialSlideLots';
import { useDashboardBottomInset } from '@/lib/layout/useDashboardBottomInset';
import { cn } from '@/lib/utils';

export default function MaterialApoioClient() {
  const { pageBottomPadding } = useDashboardBottomInset('default');

  return (
    <div className={cn('min-h-full bg-[#010409] text-white', pageBottomPadding)}>
      <section className="relative overflow-hidden border-b border-white/10 px-4 py-16 sm:px-6 md:py-24">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.18) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        <div className="absolute left-1/2 top-[-12rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[120px]" />
        <div className="absolute bottom-[-12rem] right-[-8rem] h-[30rem] w-[30rem] rounded-full bg-[#BEF264]/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#BEF264]/30 bg-[#BEF264]/10 px-4 py-1.5"
          >
            <Sparkles size={14} className="text-[#BEF264]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#BEF264]">
              Material de Apoio
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-3xl font-[1000] leading-tight tracking-tight text-white md:text-5xl"
          >
            Estudo com{' '}
            <span className="bg-gradient-to-r from-cyan-200 to-[#BEF264] bg-clip-text text-transparent">
              NeuroSlides
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mx-auto mt-5 text-sm font-medium leading-relaxed text-slate-400 sm:text-base"
          >
            {TOTAL_MATERIAL_SLIDES} slides em 7 coleções para Técnico em Enfermagem. Escolha o tema e estude no
            formato visual NeuroSlide.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="mt-10 flex flex-col items-center justify-center gap-3"
          >
            <Link
              href="/material/neuroslides"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#BEF264] px-8 py-3.5 text-sm font-black uppercase tracking-widest text-slate-950 shadow-lg shadow-lime-400/20 transition-all hover:-translate-y-0.5 hover:bg-[#d4f879]"
            >
              Abrir NeuroSlide
              <ArrowRight size={16} aria-hidden />
            </Link>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-400 sm:text-sm">
              <BookOpen size={16} className="text-cyan-300" aria-hidden />
              {TOTAL_MATERIAL_SLIDES} slides · 7 coleções
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
