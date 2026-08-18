'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { AvantBrandMark } from '@/components/brand/AvantBrandMark';
import { Button } from '@/components/ui/button';
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

/** Bloco compacto — texto explícito, sem ping e sem badge isolado. */
function ProStatusStrip({ inviteExpiry }: { inviteExpiry: string | null }) {
  return (
    <div
      role="status"
      className="rounded-xl border border-[var(--color-border-default)] bg-[var(--color-brand-dim)] px-3 py-2.5"
    >
      <p className="text-xs font-semibold leading-snug text-[var(--color-brand-text)]">
        Plano PRO · Ativo
      </p>
      {inviteExpiry ? (
        <p className="mt-1 text-[10px] text-slate-500">
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
      className="overflow-hidden rounded-xl border border-[var(--color-border-default)] bg-white p-3 shadow-sm"
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-slate-500">Assinatura</p>
      {showSeuPlano ? (
        <p className="mt-1 text-sm font-bold text-slate-900">
          Plano{' '}
          <span className="text-[var(--color-brand-text)]">gratuito</span>
        </p>
      ) : (
        <p className="mt-1 text-sm font-bold leading-snug text-slate-900">
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
        className="mt-3 h-9 w-full rounded-xl bg-[var(--color-brand)] font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-primary)] shadow-sm hover:brightness-[0.95]"
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
            'focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]/50',
          )}
        >
          {brandMark}
        </Link>
      ) : (
        brandMark
      )}
      {isPro ? (
        <ProStatusStrip inviteExpiry={inviteExpiry} />
      ) : (
        <FreePlanPromo cidadeExibicao={cidadeExibicao} />
      )}
    </div>
  );
}
