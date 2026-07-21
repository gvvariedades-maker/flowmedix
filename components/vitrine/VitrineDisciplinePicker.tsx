'use client';

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
};

/**
 * Hub: cards de disciplina (grid escondido no client).
 * Drill-down: breadcrumb “← Disciplinas” + label da disciplina ativa.
 * Some se houver ≤1 disciplina com assuntos.
 */
export function VitrineDisciplinePicker({
  summaries,
  selected,
  onSelect,
}: VitrineDisciplinePickerProps) {
  const visible = disciplinasVisiveisNoPicker(summaries);
  if (visible.length <= 1) return null;

  const hubMode = isVitrineDisciplineHubMode(summaries, selected);

  if (!hubMode && selected) {
    const meta = getVitrineDisciplinaMeta(selected);
    return (
      <div
        data-testid="vitrine-discipline-breadcrumb"
        className="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          onClick={() => onSelect(null)}
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
      <h2 className="text-sm font-bold tracking-tight text-slate-900">Disciplinas</h2>

      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:gap-6">
        {visible.map((summary) => (
          <VitrineDisciplineCard
            key={summary.id}
            summary={summary}
            selected={false}
            prominent
            onSelect={(id) => onSelect(id)}
          />
        ))}
      </div>
    </section>
  );
}

export default VitrineDisciplinePicker;
