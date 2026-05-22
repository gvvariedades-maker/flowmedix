'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';
import { useProCheckout } from '@/components/pro/useProCheckout';
import { AVANT_PRO_LP_HREF } from '@/lib/pro/constants';

const lpNavLinkClass =
  'rounded-lg px-2 py-2 text-xs font-bold text-slate-300 transition-colors hover:text-white sm:px-3 sm:text-sm';

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

const NEURO_SLIDES = [
  {
    src: '/images/neuroslide-concept-map.jpg',
    label: 'Mapa Mental',
    color: '#00f2ff',
    description: 'Conecta os conceitos que a banca tentou misturar',
    alt: 'NeuroSlide Mapa Mental',
  },
  {
    src: '/images/neuroslide-golden-rule.jpg',
    label: 'Regra de Ouro',
    color: '#00ff88',
    description: 'Resume o ponto que você precisa levar para a prova',
    alt: 'NeuroSlide Regra de Ouro',
  },
  {
    src: '/images/neuroslide-logic-flow.jpg',
    label: 'Fluxo Lógico',
    color: '#BEF264',
    description: 'Sequência de decisão na ordem que a banca cobra',
    alt: 'NeuroSlide Fluxo Lógico',
  },
  {
    src: '/images/neuroslide-danger-zone.jpg',
    label: 'Zona de Perigo',
    color: '#ff0055',
    description: 'Pegadinhas que derrubam candidato preparado',
    alt: 'NeuroSlide Zona de Perigo',
  },
] as const;

/** Proporção real dos screenshots do player (~487×1024). */
const AVANT_SLIDE_ASPECT = { width: 487, height: 1024 } as const;

function parseLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getDaysUntilProva(isoDate: string): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = parseLocalDate(isoDate);
  const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  return Math.ceil((targetDay.getTime() - today.getTime()) / ONE_DAY_IN_MS);
}

export function useDiasRestantes(dataProva: string): number {
  const [dias, setDias] = useState(() => getDaysUntilProva(dataProva));

  useEffect(() => {
    const refresh = () => setDias(getDaysUntilProva(dataProva));
    refresh();

    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    const timeoutId = window.setTimeout(refresh, msUntilMidnight);
    return () => window.clearTimeout(timeoutId);
  }, [dataProva]);

  return dias;
}

export function LPMotionSection({
  children,
  className = '',
  id,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  ariaLabel?: string;
}) {
  return (
    <motion.section
      id={id}
      role="region"
      aria-label={ariaLabel}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export function LPNeuroSlideCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = NEURO_SLIDES[active];

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setActive((i) => (i + 1) % NEURO_SLIDES.length), 3000);
    return () => window.clearInterval(id);
  }, [paused]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.12, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto w-full max-w-[min(100%,340px)] justify-self-center overflow-visible lg:max-w-[360px]"
    >
      <div className="absolute -inset-8 rounded-full bg-cyan-400/10 blur-3xl" />
      <div
        className="relative overflow-visible rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-[0_0_50px_rgba(0,242,255,0.12)] backdrop-blur-xl"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="relative w-full p-4">
          {NEURO_SLIDES.map((s, i) => (
            <div
              key={s.src}
              className={
                i === active
                  ? 'relative aspect-[487/1024] w-full'
                  : 'pointer-events-none absolute inset-x-4 top-4 aspect-[487/1024] w-[calc(100%-2rem)] opacity-0'
              }
              aria-hidden={i !== active}
            >
              <Image
                src={s.src}
                alt={s.alt}
                width={AVANT_SLIDE_ASPECT.width}
                height={AVANT_SLIDE_ASPECT.height}
                priority={i === 0}
                sizes="(max-width: 1024px) 100vw, 360px"
                className={`h-full w-full rounded-2xl object-contain transition-opacity duration-500 ${
                  i === active ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          ))}
          <span
            className="absolute top-7 left-7 z-10 rounded-full border bg-black/60 px-3 py-1 text-xs font-black tracking-wider uppercase backdrop-blur-sm"
            style={{ borderColor: slide.color, color: slide.color }}
          >
            {slide.label}
          </span>
        </div>
        <p className="px-4 py-3 text-sm text-slate-400">{slide.description}</p>
        <div
          className="flex justify-center gap-2 pb-4"
          role="tablist"
          aria-label="Slides do NeuroSlide"
        >
          {NEURO_SLIDES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Slide ${i + 1}: ${s.label}`}
              onClick={() => setActive(i)}
              className={`rounded-full transition-all duration-300 ${
                i === active ? 'h-2 w-6 bg-[#BEF264]' : 'h-2 w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function LPNavbar({
  statusInscricoes,
  dataProva,
  ctaLabel,
}: {
  statusInscricoes: string;
  dataProva: string;
  ctaLabel: string;
}) {
  const diasRestantes = useDiasRestantes(dataProva);
  const diasLabel =
    diasRestantes <= 0
      ? 'Prova realizada'
      : `Faltam ${diasRestantes} dias`;

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/8 bg-[#010409]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="group flex shrink-0 items-center gap-2" aria-label="AVANT — início">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/40 transition-transform group-hover:scale-105">
              <Zap size={22} className="text-[#BEF264]" fill="currentColor" aria-hidden />
            </div>
            <span className="text-xl font-[1000] tracking-tighter text-white italic">AVANT</span>
          </Link>
          <div className="relative shrink-0 sm:hidden">
            <LPCheckoutButton label={ctaLabel} compact />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-end sm:gap-3">
          <nav
            className="flex flex-wrap items-center gap-0.5 sm:gap-1"
            aria-label="Navegação principal"
          >
            <Link href="/planos" className={`${lpNavLinkClass} shrink-0`}>
              Concursos abertos
            </Link>
            <Link href={AVANT_PRO_LP_HREF} className={`${lpNavLinkClass} shrink-0`}>
              AVANT Pro
            </Link>
          </nav>

          <p className="hidden min-w-0 truncate text-xs font-bold text-cyan-100 md:block md:max-w-[14rem] lg:max-w-none lg:text-sm">
            <Zap size={12} className="mr-1 inline text-[#BEF264]" aria-hidden />
            {diasLabel} · {statusInscricoes}
          </p>

          <div className="relative hidden shrink-0 sm:block">
            <LPCheckoutButton label={ctaLabel} compact />
          </div>
        </div>
      </div>
    </header>
  );
}

export function LPCheckoutButton({
  label,
  className = '',
  compact = false,
}: {
  label: string;
  className?: string;
  compact?: boolean;
}) {
  const { handleCheckout, loading, error } = useProCheckout();

  const baseClassName = compact
    ? 'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-[#BEF264] px-3 py-2 text-[10px] font-black text-slate-950 transition-all hover:bg-[#d4f879] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-2.5 sm:text-xs'
    : 'inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#BEF264] px-6 py-4 text-base font-black text-slate-950 transition-all hover:bg-[#d4f879] disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <div className={compact ? 'relative' : 'space-y-3'}>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={`${baseClassName} ${className}`}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <Loader2 size={compact ? 14 : 18} className="animate-spin" aria-hidden />
            {compact ? 'Abrindo…' : 'Abrindo pagamento...'}
          </>
        ) : (
          label
        )}
      </button>
      {error ? (
        <p
          className={
            compact
              ? 'absolute top-full right-0 z-50 mt-2 w-64 rounded-xl border border-rose-500/20 bg-slate-950 p-3 text-sm font-medium text-rose-300 shadow-xl'
              : 'text-sm font-medium text-rose-300'
          }
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function LPImpactMetrics({
  vagas,
  dataProva,
  preco,
}: {
  vagas: string;
  dataProva: string;
  preco: string;
}) {
  const diasRestantes = useDiasRestantes(dataProva);
  const diasLabel =
    diasRestantes <= 0 ? 'Prova realizada' : `${diasRestantes} dias para a prova`;

  const metrics = [
    `${vagas} vagas imediatas`,
    diasLabel,
    '40 pontos em jogo',
    `R$ ${preco}/mês · cancela quando quiser`,
  ];

  return (
    <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric}
          className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-center backdrop-blur-xl"
        >
          <p className="text-sm font-black text-white sm:text-base">{metric}</p>
        </div>
      ))}
    </div>
  );
}

export function LPCountdownDays({
  dataProva,
  dataProvaFormatada,
  variant = 'hero',
}: {
  dataProva: string;
  dataProvaFormatada: string;
  variant?: 'hero' | 'cta';
}) {
  const diasRestantes = useDiasRestantes(dataProva);
  const isPast = diasRestantes <= 0;

  if (variant === 'hero') {
    return (
      <p className="text-lg font-black tracking-tight text-cyan-100 sm:text-xl">
        {isPast ? 'Prova realizada' : `Faltam ${diasRestantes} dias para a prova`}
      </p>
    );
  }

  return (
    <p className="text-center text-base font-semibold text-slate-300 sm:text-lg">
      {isPast
        ? `A prova era em ${dataProvaFormatada}.`
        : `A prova é em ${dataProvaFormatada}. Faltam ${diasRestantes} dias.`}
    </p>
  );
}
