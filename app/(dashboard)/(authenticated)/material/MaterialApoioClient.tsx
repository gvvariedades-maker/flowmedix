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
    <div className={cn('min-h-full bg-background text-slate-900', pageBottomPadding)}>
      <section className="relative overflow-hidden border-b border-slate-200 px-4 py-16 sm:px-6 md:py-24">
        <div className="absolute left-1/2 top-[-12rem] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-[rgba(143,224,32,0.08)] blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(143,224,32,0.35)] bg-[rgba(143,224,32,0.1)] px-4 py-1.5"
          >
            <Sparkles size={14} className="text-[#3d6b0f]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#3d6b0f]">
              Material de Apoio
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-editorial-title text-3xl md:text-5xl"
          >
            Estudo com{' '}
            <span className="text-[#3d6b0f]">NeuroSlides</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="mx-auto mt-5 text-sm font-medium leading-relaxed text-slate-600 sm:text-base"
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
            <Link href="/material/neuroslides" className="btn-editorial-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-black uppercase tracking-widest">
              Abrir NeuroSlide
              <ArrowRight size={16} aria-hidden />
            </Link>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-600 sm:text-sm">
              <BookOpen size={16} className="text-[#3d6b0f]" aria-hidden />
              {TOTAL_MATERIAL_SLIDES} slides · 7 coleções
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
