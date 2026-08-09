'use client';

import { CheckCircle2 } from 'lucide-react';
import { OutlineCta, ProCheckoutCta, SectionLabel } from '@/components/landing/lp-ui';
import {
  FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT,
  FREEMIUM_PLAN_LIMITS_DESCRIPTION,
  FREEMIUM_SIMULADO_DAILY_LIMIT,
  FREEMIUM_SIMULADOS_PERSONALIZADOS_COMPACT,
} from '@/lib/freemium/constants';
import { LANDING_PRICING } from '@/lib/marketing/landingCopy';

const FREE_ITEMS = [
  FREEMIUM_SIMULADOS_PERSONALIZADOS_COMPACT,
  `${FREEMIUM_ESTUDO_REVERSO_DAILY_LIMIT} questão de Estudo Reverso/dia`,
  `${FREEMIUM_SIMULADO_DAILY_LIMIT} questões de simulado/dia`,
  'NeuroSlides incluídos',
  'Sem cartão de crédito',
] as const;

type LandingPricingSplitProps = {
  precoPro: string;
};

/** Pricing editorial claro — conversão em contexto de confiança. */
export function LandingPricingSplit({ precoPro }: LandingPricingSplitProps) {
  return (
    <section id="pricing" className="bg-[#f1f5f9] px-4 py-16 sm:px-6 sm:py-24" aria-label="Planos AVANT enf">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <SectionLabel>{LANDING_PRICING.label}</SectionLabel>
          <h2 className="mt-3 text-2xl font-[1000] tracking-tight text-slate-900 sm:text-4xl">
            {LANDING_PRICING.h2Prefix}{' '}
            <span className="text-[#9A3412]">{LANDING_PRICING.h2Accent}</span>
          </h2>
          <p className="mt-3 text-slate-600">{LANDING_PRICING.sub}</p>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="card-elevated-lg rounded-[2rem] border-slate-200 p-8">
            <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
              {LANDING_PRICING.proTitle}
            </h3>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {LANDING_PRICING.proBenefits.map((item) => (
                <li key={item} className="flex gap-2.5 text-sm text-slate-700">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-[#9A3412]" size={18} aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-xs text-slate-500">
              Gratuito: {FREEMIUM_PLAN_LIMITS_DESCRIPTION} — sem cartão.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="card-elevated-lg flex flex-1 flex-col rounded-[2rem] border-[#F26522]/40 p-8 ring-2 ring-[#F26522]/20">
              <span className="inline-flex w-fit rounded-full bg-[#F26522] px-3 py-1 text-xs font-bold text-[#0F172A]">
                Mais popular
              </span>
              <p className="mt-6 text-sm font-bold uppercase tracking-wider text-[#9A3412]">Pro</p>
              <p className="mt-2 text-4xl font-[1000] text-slate-900">
                R$ {precoPro}
                <span className="text-xl font-bold text-slate-500">/mês · cancela quando quiser</span>
              </p>
              <ProCheckoutCta
                label={LANDING_PRICING.proCta}
                className="mt-8 [&_button]:w-full"
              />
            </div>

            <div className="card-elevated rounded-[2rem] border-slate-200 p-8">
              <p className="text-xl font-bold text-slate-900">Grátis</p>
              <p className="mt-1 text-3xl font-[1000] text-slate-800">R$ 0</p>
              <ul className="mt-4 space-y-2">
                {FREE_ITEMS.map((item) => (
                  <li key={item} className="flex gap-2 text-xs text-slate-600">
                    <CheckCircle2 size={14} className="shrink-0 text-[#9A3412]" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
              <OutlineCta href="/register" className="mt-6 w-full" data-analytics="lp-pricing-free-cta">
                {LANDING_PRICING.freeCta}
              </OutlineCta>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
