'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { AvantBrandMark } from '@/components/brand/AvantBrandMark';
import { Button } from '@/components/ui/button';
import { EDITORIAL_BRAND } from '@/lib/brand/avantBrandPalette';
import { cn } from '@/lib/utils';
import type { ProSource } from '@/lib/freemium/constants';

export type PlanStatusCardProps = {
  cidadeExibicao: string;
  isPro: boolean;
  proSource: ProSource;
  proExpiresAt: string | null;
  /** Quando definido, o logo navega para a vitrine (preserva query de concurso/cidade). */
  brandHref?: string;
};

const cardEnter = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function formatProExpiryShort(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  });
}

function resolvePlanTitle(cidadeExibicao: string): {
  dynamicName: string | null;
  showSeuPlano: boolean;
} {
  const trimmed = cidadeExibicao.trim();
  const dynamicName =
    trimmed && !/^geral$/i.test(trimmed) && !/^técnico de enfermagem$/i.test(trimmed)
      ? trimmed
      : null;
  return { dynamicName, showSeuPlano: !dynamicName };
}

function ProStatusStrip({
  inviteExpiry,
  reducedMotion,
}: {
  inviteExpiry: string | null;
  reducedMotion: boolean | null;
}) {
  return (
    <div
      role="status"
      className="rounded-xl border px-3 py-2.5"
      style={{
        borderColor: 'rgba(242, 101, 34, 0.35)',
        backgroundColor: EDITORIAL_BRAND.dim,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2 shrink-0">
          {!reducedMotion ? (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: EDITORIAL_BRAND.hex }}
            />
          ) : null}
          <span
            className="relative inline-flex h-2 w-2 rounded-full"
            style={{ backgroundColor: EDITORIAL_BRAND.hex }}
            aria-label="Assinatura ativa"
          />
        </span>
        <span
          className="text-[11px] font-bold uppercase tracking-[0.1em]"
          style={{ color: EDITORIAL_BRAND.textOnLight }}
        >
          PRO Ativo
        </span>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold"
          style={{
            backgroundColor: 'rgba(242, 101, 34, 0.12)',
            color: EDITORIAL_BRAND.textOnLight,
            boxShadow: '0 0 0 1px rgba(242, 101, 34, 0.25)',
          }}
        >
          Acesso completo
        </span>
      </div>
      {inviteExpiry ? (
        <p className="mt-1.5 text-[10px] text-slate-500">
          Convite válido até {inviteExpiry}
        </p>
      ) : null}
    </div>
  );
}

function FreePlanPromo({ cidadeExibicao }: { cidadeExibicao: string }) {
  const { dynamicName, showSeuPlano } = resolvePlanTitle(cidadeExibicao);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={cardEnter}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">Assinatura</p>
      {showSeuPlano ? (
        <p className="mt-1 text-sm font-bold text-slate-900">
          Plano{' '}
          <span className="text-[#9A3412]">gratuito</span>
        </p>
      ) : (
        <p
          className="mt-1 text-sm font-bold leading-snug text-slate-900"
          style={{ fontFamily: 'var(--font-plus-jakarta-sans)' }}
        >
          {dynamicName}
        </p>
      )}
      <div
        role="status"
        className="mt-2 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1"
      >
        <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Acesso limitado
        </span>
      </div>
      <Button
        asChild
        className="mt-3 h-9 w-full rounded-xl bg-[#F26522] font-mono text-[10px] font-bold uppercase tracking-wider text-[#0F172A] shadow-sm hover:bg-[#E05518]"
      >
        <Link href="/assinar-pro" className="gap-1.5">
          <Zap size={12} fill="currentColor" aria-hidden />
          Assinar Pro
        </Link>
      </Button>
    </motion.div>
  );
}

export function PlanStatusCard({
  cidadeExibicao,
  isPro,
  proSource,
  proExpiresAt,
  brandHref,
}: PlanStatusCardProps) {
  const reducedMotion = useReducedMotion();
  const inviteExpiry = proSource === 'invite' ? formatProExpiryShort(proExpiresAt) : null;

  const brandMark = <AvantBrandMark className="overflow-visible" />;

  return (
    <div className="space-y-2 overflow-visible px-2 pt-3 pb-1">
      {brandHref ? (
        <Link
          href={brandHref}
          aria-label="Ir para vitrine de aulas"
          className={cn(
            'inline-flex rounded-lg outline-none transition-shadow',
            'focus-visible:ring-2 focus-visible:ring-[#F26522]/50',
          )}
        >
          {brandMark}
        </Link>
      ) : (
        brandMark
      )}
      {isPro ? (
        <ProStatusStrip inviteExpiry={inviteExpiry} reducedMotion={reducedMotion} />
      ) : (
        <FreePlanPromo cidadeExibicao={cidadeExibicao} />
      )}
    </div>
  );
}
