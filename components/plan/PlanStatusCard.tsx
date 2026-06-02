'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ProSource } from '@/lib/freemium';

export type PlanStatusCardProps = {
  cidadeExibicao: string;
  isPro: boolean;
  proSource: ProSource;
  proExpiresAt: string | null;
};

const cardEnter = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
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

function subscriptionLinkLabel(proSource: ProSource): string | null {
  if (proSource === 'stripe') return 'Gerenciar assinatura';
  if (proSource === 'invite') return 'Ver assinatura';
  return null;
}

export function PlanStatusCard({
  cidadeExibicao,
  isPro,
  proSource,
  proExpiresAt,
}: PlanStatusCardProps) {
  const reducedMotion = useReducedMotion();
  const inviteExpiry = proSource === 'invite' ? formatProExpiryShort(proExpiresAt) : null;
  const { dynamicName, showSeuPlano } = resolvePlanTitle(cidadeExibicao);
  const assinaturaLabel = subscriptionLinkLabel(proSource);
  const showAssinaturaLink = isPro && (proSource === 'stripe' || proSource === 'invite');

  return (
    <div className="mb-1 px-3">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={cardEnter}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-[0_0_24px_rgba(0,242,255,0.06)] backdrop-blur-xl"
      >
        {/* Brand chip */}
        <div className="relative flex items-center gap-3 border-b border-white/[0.06] px-4 py-3">
          <div
            className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-[#00f2ff] to-[#00ff88]"
            aria-hidden
          />
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3d35ff] to-[#7b2fff] text-base shadow-[0_0_16px_rgba(61,53,255,0.35)]"
            aria-hidden
          >
            ⚡
          </div>
          <span
            className="text-sm font-extrabold tracking-[0.12em] text-[#00ff88] drop-shadow-[0_0_20px_rgba(0,255,136,0.5)]"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            AVANT
          </span>
        </div>

        {isPro ? (
          <div className="border-b border-[#00f2ff]/10 bg-gradient-to-br from-[#00f2ff]/[0.08] to-[#00ff88]/[0.05] px-4 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-[#00f2ff]">
                AVANT PRO
              </span>
              <span className="font-mono text-[10px] text-white/50">Técnico de Enfermagem</span>
            </div>
          </div>
        ) : null}

        <div className="space-y-4 p-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">Assinatura</p>
            {showSeuPlano ? (
              <h3
                className="mt-1 text-[26px] font-extrabold leading-tight tracking-tight text-white"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                Seu{' '}
                <span className="bg-gradient-to-r from-[#00f2ff] to-[#00ff88] bg-clip-text text-transparent">
                  Plano
                </span>
              </h3>
            ) : (
              <h3
                className="mt-1 text-balance text-lg font-bold leading-snug tracking-tight text-white"
                style={{ fontFamily: 'var(--font-plus-jakarta-sans)' }}
              >
                {dynamicName}
              </h3>
            )}
          </div>

          {isPro ? (
            <div
              role="status"
              className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-full border border-[#00ff88]/20 bg-[#00ff88]/[0.06] px-3 py-1.5"
            >
              <span className="relative flex h-2 w-2 shrink-0">
                {!reducedMotion ? (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ff88] opacity-60" />
                ) : null}
                <span
                  className="relative inline-flex h-2 w-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,0.8)]"
                  aria-label="Assinatura ativa"
                />
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wide text-[#00ff88]">
                Pro ativo
              </span>
              <span className="text-xs font-light text-white/40">· acesso completo</span>
            </div>
          ) : (
            <div
              role="status"
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5"
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Plano gratuito
              </span>
            </div>
          )}

          {inviteExpiry ? (
            <p className="text-center text-xs font-medium text-slate-500">
              Pro por convite até {inviteExpiry}
            </p>
          ) : null}

          {isPro ? (
            showAssinaturaLink && assinaturaLabel ? (
              <Button
                asChild
                variant="outline"
                className="h-10 w-full rounded-xl border-[#00f2ff]/20 bg-[#00f2ff]/[0.04] font-mono text-[10px] font-bold uppercase tracking-wider text-[#00f2ff] transition-colors hover:border-[#00f2ff]/30 hover:bg-[#00f2ff]/10 hover:text-[#00f2ff] hover:shadow-[0_0_20px_rgba(0,242,255,0.1)]"
              >
                <Link href="/conta/assinatura">{assinaturaLabel}</Link>
              </Button>
            ) : null
          ) : (
            <Button
              asChild
              className="h-10 w-full rounded-xl bg-[#BEF264] font-mono text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md shadow-lime-400/20 shadow-[0_0_20px_rgba(190,242,100,0.25)] hover:bg-[#d4f879]"
            >
              <Link href="/assinar-pro" className="gap-1.5">
                <Zap size={12} fill="currentColor" aria-hidden />
                Assinar Pro
              </Link>
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
