'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Zap } from 'lucide-react';
import { useProCheckout } from '@/components/pro/useProCheckout';
import { AVANT_PRO_LP_HREF } from '@/lib/pro/constants';

const lpNavLinkClass =
  'rounded-lg px-2 py-2 text-xs font-bold text-slate-300 transition-colors hover:text-white sm:px-3 sm:text-sm';

const lpFreeCtaClass =
  'inline-flex shrink-0 items-center justify-center rounded-2xl bg-[#BEF264] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-lg shadow-lime-400/20 transition-all hover:bg-[#d4f879] sm:px-4 sm:py-2.5 sm:text-xs';

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

export function LPNavbar({ ctaLabel }: { ctaLabel: string }) {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/8 bg-[#010409]/90 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
        {/* Mobile: logo + CTAs; depois faixa de navegação */}
        <div className="flex flex-col gap-2 sm:hidden">
          <div className="flex items-center justify-between gap-2">
            <Link href="/" className="group flex min-w-0 shrink items-center gap-2" aria-label="AVANT — início">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/40">
                <Zap size={22} className="text-[#BEF264]" fill="currentColor" aria-hidden />
              </div>
              <span className="truncate text-xl font-[1000] tracking-tighter text-white italic">AVANT</span>
            </Link>
            <div className="flex shrink-0 items-center gap-1.5">
              <Link href="/register" className={lpFreeCtaClass}>
                <span className="sm:hidden">Grátis</span>
                <span className="hidden sm:inline">Comece grátis</span>
              </Link>
              <LPCheckoutButton label={ctaLabel} compactLabel="Assinar Pro" compact />
            </div>
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

            <Link href="/register" className={lpFreeCtaClass}>
              Comece grátis
            </Link>

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
  const isPast = diasRestantes <= 0;

  const metrics: Array<{ key: string; highlight?: boolean; dias?: number; label: string; sub?: string }> = [
    { key: 'vagas', label: `${vagas} vagas imediatas` },
    {
      key: 'dias',
      highlight: true,
      dias: diasRestantes,
      label: isPast ? 'Prova realizada' : 'dias para a prova',
      sub: isPast ? undefined : 'até o dia da prova',
    },
    { key: 'pontos', label: '40 pontos em jogo' },
    { key: 'preco', label: `R$ ${preco}/mês`, sub: 'cancela quando quiser' },
  ];

  return (
    <div className="mx-auto grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.key}
          className={
            metric.highlight
              ? 'rounded-2xl border border-cyan-400/35 bg-gradient-to-br from-cyan-500/20 via-slate-900/90 to-emerald-500/10 p-5 text-center shadow-lg shadow-cyan-500/10 backdrop-blur-xl sm:col-span-2 lg:col-span-1'
              : 'rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-center backdrop-blur-xl'
          }
        >
          {metric.highlight && !isPast && metric.dias !== undefined ? (
            <>
              <p className="text-4xl font-[1000] tracking-tight text-[#BEF264] sm:text-5xl">{metric.dias}</p>
              <p className="mt-1 text-sm font-black uppercase tracking-wider text-white sm:text-base">
                {metric.label}
              </p>
              {metric.sub ? (
                <p className="mt-1 text-xs font-semibold text-cyan-200/90">{metric.sub}</p>
              ) : null}
            </>
          ) : (
            <p className="text-xs font-black leading-snug break-words text-white sm:text-base">
              {metric.label}
              {metric.sub ? (
                <>
                  <br />
                  <span className="text-[10px] font-semibold text-slate-400 sm:text-xs">{metric.sub}</span>
                </>
              ) : null}
            </p>
          )}
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
    if (isPast) {
      return (
        <div className="inline-flex max-w-full rounded-2xl border border-white/15 bg-slate-900/80 px-5 py-4">
          <p className="text-lg font-black text-slate-300 sm:text-xl">Prova realizada</p>
        </div>
      );
    }

    return (
      <div
        className="inline-flex max-w-full flex-wrap items-center gap-4 rounded-2xl border border-cyan-400/40 bg-gradient-to-r from-cyan-500/15 via-slate-900/80 to-emerald-500/10 px-5 py-4 shadow-lg shadow-cyan-500/10"
        role="status"
        aria-live="polite"
      >
        <p className="text-5xl font-[1000] leading-none tracking-tight text-[#BEF264] sm:text-6xl">
          {diasRestantes}
        </p>
        <div className="min-w-0 text-left">
          <p className="text-base font-black uppercase tracking-wide text-white sm:text-lg">
            dias para a prova
          </p>
          <p className="mt-1 text-sm font-semibold text-cyan-200">
            Prova em {dataProvaFormatada}
          </p>
        </div>
      </div>
    );
  }

  if (isPast) {
    return (
      <p className="text-center text-base font-semibold text-slate-400 sm:text-lg">
        A prova era em {dataProvaFormatada}.
      </p>
    );
  }

  return (
    <div
      className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-emerald-500/5 px-6 py-5 text-center"
      role="status"
      aria-live="polite"
    >
      <p className="text-5xl font-[1000] leading-none tracking-tight text-[#BEF264] sm:text-6xl">
        {diasRestantes}
      </p>
      <p className="mt-2 text-lg font-black text-white">dias restantes</p>
      <p className="mt-2 text-sm font-semibold text-cyan-200 sm:text-base">
        Prova em {dataProvaFormatada}
      </p>
    </div>
  );
}
