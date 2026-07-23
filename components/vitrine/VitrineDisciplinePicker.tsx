'use client';

import { useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { vitrineBrand } from '@/lib/vitrine/vitrineBrand';
import {
  disciplinasVisiveisNoPicker,
  getVitrineDisciplinaMeta,
  isVitrineDisciplineHubMode,
  type VitrineDisciplinaId,
  type VitrineDisciplinaSummary,
} from '@/lib/vitrine/disciplina';
import VitrineDisciplineCard from '@/components/vitrine/VitrineDisciplineCard';

export type VitrineDisciplinePickerProps = {
  summaries: VitrineDisciplinaSummary[];
  selected: VitrineDisciplinaId | null;
  onSelect: (id: VitrineDisciplinaId | null) => void;
  /** Hover/focus — aquece a lista da disciplina antes do clique. */
  onPrefetch?: (id: VitrineDisciplinaId) => void;
};

/**
 * Hub: cards de disciplina (grid escondido no client).
 * Drill-down: breadcrumb “← Disciplinas” + label da disciplina ativa.
 * Some se houver ≤1 disciplina com assuntos.
 *
 * Foco: ao entrar no drill-down (card some), move para o breadcrumb;
 * ao voltar ao hub, move para o título “Disciplinas”.
 */
export function VitrineDisciplinePicker({
  summaries,
  selected,
  onSelect,
  onPrefetch,
}: VitrineDisciplinePickerProps) {
  const breadcrumbRef = useRef<HTMLButtonElement>(null);
  const hubHeadingRef = useRef<HTMLHeadingElement>(null);
  const prevSelectedRef = useRef(selected);

  const visible = disciplinasVisiveisNoPicker(summaries);
  const hubMode = isVitrineDisciplineHubMode(summaries, selected);

  useEffect(() => {
    if (visible.length <= 1) {
      prevSelectedRef.current = selected;
      return;
    }

    const prev = prevSelectedRef.current;
    prevSelectedRef.current = selected;
    if (prev === selected) return;

    if (selected && !prev) {
      breadcrumbRef.current?.focus();
    } else if (!selected && prev) {
      hubHeadingRef.current?.focus();
    }
  }, [selected, visible.length]);

  if (visible.length <= 1) return null;

  if (!hubMode && selected) {
    const meta = getVitrineDisciplinaMeta(selected);
    return (
      <div
        data-testid="vitrine-discipline-breadcrumb"
        className="flex flex-wrap items-center gap-2"
      >
        <button
          ref={breadcrumbRef}
          type="button"
          onClick={() => onSelect(null)}
          aria-label="Voltar às disciplinas"
          className={cn(
            'inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm',
            'hover:border-slate-300 hover:text-slate-900',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0cc93a]/40',
            vitrineBrand.hoverBorder,
          )}
        >
          <ArrowLeft size={16} aria-hidden />
          Disciplinas
        </button>
        <span className="text-slate-300" aria-hidden>
          /
        </span>
        <span className={cn('text-sm font-bold', vitrineBrand.text)}>{meta.label}</span>
      </div>
    );
  }

  return (
    <section
      data-testid="vitrine-discipline-picker"
      aria-label="Disciplinas"
      className="space-y-4"
    >
      <h2
        ref={hubHeadingRef}
        tabIndex={-1}
        className="text-sm font-bold tracking-tight text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-[#0cc93a]/40 focus-visible:ring-offset-2"
      >
        Disciplinas
      </h2>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:gap-6">
        {visible.map((summary) => (
          <VitrineDisciplineCard
            key={summary.id}
            summary={summary}
            selected={false}
            prominent
            onSelect={(id) => onSelect(id)}
            onPrefetch={onPrefetch}
          />
        ))}
      </div>
    </section>
  );
}

export default VitrineDisciplinePicker;
