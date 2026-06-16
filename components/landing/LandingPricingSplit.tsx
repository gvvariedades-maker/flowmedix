'use client';

import { CheckCircle2 } from 'lucide-react';
import {
  OutlineCta,
  ProCheckoutCta,
} from '@/components/landing/lp-ui';
import {
  FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT,
  FREEMIUM_PLAN_LIMITS_DESCRIPTION,
  FREEMIUM_SIMULADO_DAILY_LIMIT,
} from '@/lib/freemium/constants';

const FREE_ITEMS = [
  `${FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT} questão de Estudo Reverso/dia`,
  `${FREEMIUM_SIMULADO_DAILY_LIMIT} questões de simulado/dia`,
  'NeuroSlides incluídos',
  'Sem cartão de crédito',
] as const;

type LandingPricingSplitProps = {
  precoPro: string;
};

/** Bloco de pricing estilo Estudei: lista de benefícios + preço lado a lado. */
export function LandingPricingSplit({ precoPro }: LandingPricingSplitProps) {
  const proBenefits = [
    'Questões ilimitadas todo dia',
    'Simulados ilimitados',
    'NeuroSlides após cada questão',
    'Plano diário automático e cadernos',
    'Analytics de desempenho',
    'EBSERH, prefeituras e todas as bancas',
    'Cancela quando quiser — sem fidelidade',
  ] as const;

  return (
    <section id="pricing" className="bg-[#0f172a] px-4 py-16 sm:px-6 sm:py-24" aria-label="Planos AVANT">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8fe020]">Planos</p>
          <h2 className="mt-3 text-2xl font-[1000] tracking-tight text-white sm:text-4xl">
            Foque no que importa: <span className="text-[#8fe020]">estudar.</span>
          </h2>
          <p className="mt-3 text-slate-400">Comece grátis. O resto fica por conta do AVANT.</p>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#8fe020]/30 bg-[#8fe020]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#8fe020]">
              AVANT Pro
            </p>
            <h3 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Veja tudo o que está incluso no seu plano:
            </h3>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {proBenefits.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-slate-200">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-[#8fe020]" size={18} aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-xs text-slate-500">
              Gratuito: {FREEMIUM_PLAN_LIMITS_DESCRIPTION} — sem cartão.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-1 flex-col rounded-[2rem] border border-[#8fe020]/25 bg-[#8fe020]/5 p-8">
              <span className="inline-flex w-fit rounded-full bg-[#8fe020] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#1a2e05]">
                Mais popular
              </span>
              <p className="mt-6 text-sm font-bold uppercase tracking-wider text-[#8fe020]">Pro</p>
              <p className="mt-2 text-5xl font-[1000] text-white">
                R$ {precoPro}
                <span className="text-2xl font-bold text-slate-400">/mês</span>
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-400">Cancela quando quiser</p>
              <ProCheckoutCta
                label={`Assinar AVANT Pro — R$ ${precoPro}/mês`}
                className="mt-8 [&_button]:w-full"
              />
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Gratuito</p>
              <p className="mt-1 text-3xl font-[1000] text-white">R$ 0</p>
              <ul className="mt-4 space-y-2">
                {FREE_ITEMS.map((item) => (
                  <li key={item} className="flex gap-2 text-xs text-slate-400">
                    <CheckCircle2 size={14} className="shrink-0 text-slate-500" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <OutlineCta
                href="/register"
                className="mt-6 w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                Criar conta gratuita
              </OutlineCta>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
