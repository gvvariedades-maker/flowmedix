'use client';

import Link from 'next/link';
import { BookMarked, X } from 'lucide-react';
import type { ProSource } from '@/lib/freemium/constants';
import { cn } from '@/lib/utils';
import type { CadernoBannerEdital } from '@/components/onboarding/useCadernoOnboarding';

export type CadernoOnboardingBannerProps = {
  isPro: boolean;
  proSource: ProSource;
  editalAtivo?: CadernoBannerEdital | null;
  ctaHref: string;
  ctaLabel: string;
  onSnooze: () => void;
  className?: string;
};

export function getCadernoBannerCopy({
  isPro,
  proSource,
  editalBanca,
}: {
  isPro: boolean;
  proSource: ProSource;
  editalBanca: string | null;
}): { title: string; subtitle: string | null } {
  const title =
    isPro && proSource === 'invite'
      ? 'Monte seu caderno do edital e use seu acesso completo com foco'
      : 'Organize suas questões — 1 estudo reverso grátis por dia, no seu ritmo';

  const subtitle = editalBanca?.trim()
    ? `Sua banca: ${editalBanca.trim()}`
    : null;

  return { title, subtitle };
}

export function CadernoOnboardingBanner({
  isPro,
  proSource,
  editalAtivo,
  ctaHref,
  ctaLabel,
  onSnooze,
  className,
}: CadernoOnboardingBannerProps) {
  const { title, subtitle } = getCadernoBannerCopy({
    isPro,
    proSource,
    editalBanca: editalAtivo?.banca ?? null,
  });

  return (
    <div
      role="region"
      aria-label="Começar com cadernos de estudo"
      className={cn(
        'shrink-0 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/[0.08] via-[#010409]/95 to-[#010409]/95 px-4 py-3 backdrop-blur-xl sm:px-6',
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300"
            aria-hidden
          >
            <BookMarked size={18} />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="text-sm font-bold leading-snug text-white">{title}</p>
            {subtitle ? (
              <p className="text-xs font-medium text-slate-400">{subtitle}</p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
          <Link
            href={ctaHref}
            className="inline-flex min-h-[40px] items-center justify-center rounded-full bg-cyan-500 px-4 text-sm font-bold text-slate-950 transition-colors hover:bg-cyan-400"
          >
            {ctaLabel}
          </Link>
          <button
            type="button"
            onClick={onSnooze}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-white/10 px-3 text-xs font-semibold text-slate-400 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-slate-200"
          >
            <X size={14} aria-hidden />
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
