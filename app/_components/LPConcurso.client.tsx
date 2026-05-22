'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';
import { useProCheckout } from '@/components/pro/useProCheckout';
import { AVANT_PRO_LP_HREF } from '@/lib/pro/constants';

const lpNavLinkClass =
  'rounded-lg px-2 py-2 text-xs font-bold text-slate-300 transition-colors hover:text-white sm:px-3 sm:text-sm';

const ONE_DAY_IN_MS = 1000 * 60 * 60 * 24;

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
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        {/* Mobile: logo + Assinar Pro; depois faixa de navegação */}
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="group flex shrink-0 items-center gap-2" aria-label="AVANT — início">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/40">
                <Zap size={22} className="text-[#BEF264]" fill="currentColor" aria-hidden />
              </div>
              <span className="text-xl font-[1000] tracking-tighter text-white italic">AVANT</span>
            </Link>
            <LPCheckoutButton label={ctaLabel} compactLabel="Assinar Pro" compact />
          </div>
          <nav
            className="flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-white/8 pt-2"
            aria-label="Navegação principal"
          >
            <Link href="/planos" className={`${lpNavLinkClass} shrink-0 text-[11px]`}>
              Concursos abertos
            </Link>
            <Link href={AVANT_PRO_LP_HREF} className={`${lpNavLinkClass} shrink-0 text-[11px]`}>
              AVANT Pro
            </Link>
          </nav>
        </div>

        {/* Desktop / tablet */}
        <div className="hidden items-center justify-between gap-3 sm:flex">
          <Link href="/" className="group flex shrink-0 items-center gap-2" aria-label="AVANT — início">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/40 transition-transform group-hover:scale-105">
              <Zap size={22} className="text-[#BEF264]" fill="currentColor" aria-hidden />
            </div>
            <span className="text-xl font-[1000] tracking-tighter text-white italic">AVANT</span>
          </Link>

          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-2 md:gap-3">
            <nav
              className="flex flex-wrap items-center gap-0.5 md:gap-1"
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

            <div className="relative shrink-0">
              <LPCheckoutButton label={ctaLabel} compact />
            </div>
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
  compactLabel,
}: {
  label: string;
  className?: string;
  compact?: boolean;
  /** Texto curto no header mobile (ex.: «Assinar Pro»). */
  compactLabel?: string;
}) {
  const { handleCheckout, loading, error } = useProCheckout();

  const baseClassName = compact
    ? 'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-[#BEF264] px-3 py-2 text-[10px] font-black text-slate-950 transition-all hover:bg-[#d4f879] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-2.5 sm:text-xs'
    : 'inline-flex w-full max-w-full items-center justify-center gap-2 rounded-2xl bg-[#BEF264] px-4 py-3.5 text-center text-sm font-black leading-snug text-slate-950 transition-all hover:bg-[#d4f879] disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-4 sm:text-base';

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
        ) : compact && compactLabel ? (
          <>
            <span className="sm:hidden">{compactLabel}</span>
            <span className="hidden sm:inline">{label}</span>
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
          <p className="text-xs font-black leading-snug break-words text-white sm:text-base">{metric}</p>
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
