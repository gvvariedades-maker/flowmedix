'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { CadernoProntoCover } from '@/components/dashboard/cadernos/CadernoProntoCover';
import { vitrineItemVariants } from '@/components/vitrine/vitrineMotion';
import type { ResolvedPack } from '@/lib/cadernos/resolvePacks';
import { phraseCountQuestoes } from '@/lib/labelQuestoes';
import { cn } from '@/lib/utils';

export type CadernoProntoCardProps = {
  pack: ResolvedPack;
  /** Clone em voo (pack ainda não clonado). */
  loading?: boolean;
  onStart?: (pack: ResolvedPack) => void;
  className?: string;
};

function ctaLabel(cta: ResolvedPack['cta']): string {
  if (cta === 'continue') return 'Continuar';
  if (cta === 'review') return 'Revisar';
  return 'Começar agora';
}

function resolveBadge(pack: ResolvedPack): { label: string; className: string } | null {
  if (pack.cta === 'continue') {
    return {
      label: 'Continuar',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    };
  }
  if (pack.def.family === 'edital') {
    return {
      label: 'Do seu edital',
      className: 'border-amber-200 bg-amber-50 text-amber-800',
    };
  }
  if (!pack.clonedNotebookId) {
    return {
      label: 'Novo',
      className: 'border-green-200 bg-green-50 text-green-700',
    };
  }
  return null;
}

function assuntoTituloAula(pack: ResolvedPack): string | null {
  const { rule } = pack.def;
  if (rule.kind === 'assunto') return rule.tituloAula;
  return pack.items[0]?.titulo_aula ?? null;
}

function studyHref(pack: ResolvedPack): string | null {
  if (!pack.clonedNotebookId || !pack.entrySlug) return null;
  return `/estudar/${pack.entrySlug}?from=caderno&caderno_id=${pack.clonedNotebookId}`;
}

/**
 * Card de Caderno Pronto — capa → badge → título → promessa → meta → CTA único.
 * Pack clonado: `<Link>` direto. Pack novo: botão que dispara `onStart`.
 */
export function CadernoProntoCard({
  pack,
  loading = false,
  onStart,
  className,
}: CadernoProntoCardProps) {
  const badge = resolveBadge(pack);
  const href = studyHref(pack);
  const label = ctaLabel(pack.cta);
  const meta = `${phraseCountQuestoes(pack.slugs.length)} · ~${pack.estimatedMinutes} min`;
  const ctaClassName = cn(
    'btn-editorial-primary mt-auto flex min-h-12 w-full items-center justify-center rounded-xl px-4 text-sm font-bold',
  );

  return (
    <motion.article
      variants={vitrineItemVariants}
      className={cn(
        'card-elevated relative flex h-full flex-col overflow-hidden rounded-2xl',
        className,
      )}
    >
      <CadernoProntoCover family={pack.def.family} tituloAula={assuntoTituloAula(pack)} />

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
        {badge ? (
          <span
            className={cn(
              'w-fit rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:text-[11px]',
              badge.className,
            )}
          >
            {badge.label}
          </span>
        ) : (
          <span className="h-[22px]" aria-hidden />
        )}

        <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900">{pack.title}</h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-600">{pack.def.promise}</p>
        <p className="text-xs font-medium tabular-nums text-slate-500">{meta}</p>

        {href ? (
          <Link href={href} className={ctaClassName}>
            {label}
          </Link>
        ) : (
          <button
            type="button"
            disabled={loading || !pack.entrySlug}
            onClick={() => onStart?.(pack)}
            className={ctaClassName}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden />
                Preparando…
              </>
            ) : (
              label
            )}
          </button>
        )}
      </div>
    </motion.article>
  );
}
