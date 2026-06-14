'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { ProSubscribeCtaLink } from '@/components/pro/ProSubscribeCtaLink';
import {
  FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT,
  FREEMIUM_SIMULADO_DAILY_LIMIT,
} from '@/lib/freemium/constants';

const FREE_FEATURES = [
  `${FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT} questão de Estudo Reverso/dia`,
  `${FREEMIUM_SIMULADO_DAILY_LIMIT} questões de simulado/dia`,
  'NeuroSlides incluídos',
  'Sem cartão de crédito',
] as const;

const PRO_FEATURES = [
  'Questões ilimitadas todo dia',
  'Simulados ilimitados',
  'Plano diário automático',
  'Cadernos de revisão',
  'Analytics de desempenho',
  'Acesso a todos os concursos',
] as const;

export function LandingPricing() {
  return (
    <section id="planos" className="px-4 py-20 sm:px-6 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">
            Planos
          </p>
          <h2 className="text-3xl font-[1000] tracking-tight text-white sm:text-4xl">
            Comece grátis. Vá fundo quando fizer sentido.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-slate-400">Gratuito</p>
            <p className="mb-6 text-4xl font-[1000] text-white">R$ 0</p>
            <ul className="mb-8 space-y-3">
              {FREE_FEATURES.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <CheckCircle2 size={15} className="shrink-0 text-slate-500" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/register"
              className="block w-full rounded-2xl border border-white/15 bg-white/5 py-3.5 text-center text-sm font-black text-white transition hover:bg-white/10"
            >
              Criar conta gratuita
            </Link>
          </div>

          <div className="relative rounded-[2rem] border border-[#8fe020]/30 bg-[#8fe020]/5 p-8">
            <span className="absolute -top-3 left-8 rounded-full bg-[#8fe020] px-4 py-1 text-[10px] font-black uppercase tracking-widest text-slate-950">
              Mais popular
            </span>
            <p className="mb-1 text-xs font-black uppercase tracking-widest text-[#8fe020]">Pro</p>
            <div className="mb-1 flex items-end gap-2">
              <p className="text-4xl font-[1000] text-white">R$ 14,90</p>
              <span className="mb-1 text-sm font-bold text-slate-400">/mês</span>
            </div>
            <p className="mb-6 text-xs font-medium text-slate-500">Cancela quando quiser</p>
            <ul className="mb-8 space-y-3">
              {PRO_FEATURES.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm font-medium text-slate-300">
                  <CheckCircle2 size={15} className="shrink-0 text-[#8fe020]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <ProSubscribeCtaLink variant="button" className="w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
