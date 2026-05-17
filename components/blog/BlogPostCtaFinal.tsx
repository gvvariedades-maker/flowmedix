'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function BlogPostCtaFinal() {
  return (
    <section className="px-4 pb-24 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border border-cyan-400/25 bg-gradient-to-br from-cyan-950/40 via-slate-900/90 to-slate-950 p-10 text-center sm:p-14"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent" />
        <div className="relative z-10">
          <h2 className="mb-4 text-2xl font-[1000] tracking-tight text-white sm:text-3xl md:text-4xl">
            Sua próxima questão pode ser o avanço que faltava.
          </h2>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#BEF264] px-10 py-4 text-sm font-black tracking-widest text-slate-950 uppercase shadow-lg shadow-lime-400/25 transition-all hover:bg-[#d4f879] sm:w-auto"
            >
              Começar grátis
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/login"
              className="text-sm font-bold text-indigo-300 underline underline-offset-4 hover:text-indigo-200"
            >
              Acessar minha conta
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
