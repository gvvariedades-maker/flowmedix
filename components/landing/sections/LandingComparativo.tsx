'use client';

import Image from 'next/image';
import { CheckCircle2, FileText, X } from 'lucide-react';
import { AvantLogo } from '@/components/brand/AvantLogo';
import { CompareAvantCarousel } from '@/components/landing/CompareAvantCarousel';
import { SectionLabel } from '@/components/landing/lp-ui';
import { LANDING_COMPARATIVO } from '@/lib/marketing/landingCopy';

export function LandingComparativo() {
  return (
    <section id="comparacao" className="bg-[#fff7ed] px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <SectionLabel>{LANDING_COMPARATIVO.label}</SectionLabel>
        <h2 className="max-w-3xl text-2xl font-[1000] tracking-tight text-slate-900 sm:text-4xl">
          {LANDING_COMPARATIVO.h2}
        </h2>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-2">
          <div className="card-elevated overflow-hidden rounded-[2rem] border-rose-100">
            <div className="rounded-t-xl border border-rose-200 bg-rose-50 px-6 py-4">
              <span className="inline-flex items-center gap-2 text-sm font-black text-rose-600">
                <FileText size={18} aria-hidden />
                {LANDING_COMPARATIVO.apostilaLabel}
              </span>
            </div>
            <div className="relative h-48 w-full sm:h-56">
              <Image
                src="/images/compare-apostila.jpg"
                alt="Apostila densa de enfermagem"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover opacity-80 grayscale-[20%]"
              />
            </div>
            <ul className="space-y-3 p-6">
              {LANDING_COMPARATIVO.apostilaItems.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-slate-600">
                  <X size={15} className="mt-0.5 shrink-0 text-rose-500" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="card-elevated-lg overflow-hidden rounded-[2rem] border-[#F26522]/20">
            <div className="rounded-t-xl border border-[#F26522]/30 bg-[#F26522]/10 px-6 py-4">
              <AvantLogo size="md" tone="light" animated={false} />
            </div>
            <ul className="space-y-3 p-6">
              {LANDING_COMPARATIVO.avantItems.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-slate-700">
                  <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#9A3412]" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
          <CompareAvantCarousel />
        </div>
      </div>
    </section>
  );
}
