'use client';

import Link from 'next/link';
import { Lightbulb, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFirstSeen } from './useFirstSeen';
import type { ReverseStudyMicrotip } from './reverseStudyMicrotips';

const toneClasses = {
  indigo: {
    shell: 'border-indigo-100 bg-indigo-50/90 text-indigo-950',
    icon: 'bg-indigo-600 text-white',
    link: 'text-indigo-700 hover:text-indigo-900',
  },
  emerald: {
    shell: 'border-emerald-100 bg-emerald-50/90 text-emerald-950',
    icon: 'bg-emerald-600 text-white',
    link: 'text-emerald-700 hover:text-emerald-900',
  },
  amber: {
    shell: 'border-amber-100 bg-amber-50/95 text-amber-950',
    icon: 'bg-amber-500 text-white',
    link: 'text-amber-700 hover:text-amber-950',
  },
} as const;

export function MicroTip({
  storageKey,
  tip,
  enabled = true,
  className,
}: {
  storageKey: string;
  tip: ReverseStudyMicrotip;
  enabled?: boolean;
  className?: string;
}) {
  const { visible, markSeen } = useFirstSeen(storageKey, enabled);
  const tone = toneClasses[tip.tone ?? 'indigo'];

  if (!visible) return null;

  return (
    <aside
      role="status"
      aria-label={tip.title}
      className={cn(
        'rounded-2xl border p-3 text-sm shadow-sm',
        tone.shell,
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full', tone.icon)} aria-hidden>
          <Lightbulb className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-widest opacity-80">{tip.title}</p>
          <p className="mt-1 text-sm font-semibold leading-relaxed">{tip.body}</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button type="button" onClick={markSeen} className="text-xs font-black underline-offset-2 hover:underline">
              Entendi
            </button>
            {tip.learnMoreHref ? (
              <Link href={tip.learnMoreHref} className={cn('text-xs font-black underline-offset-2 hover:underline', tone.link)}>
                Entender melhor o método
              </Link>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={markSeen}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full opacity-65 transition hover:bg-white/70 hover:opacity-100"
          aria-label="Fechar dica"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </aside>
  );
}
