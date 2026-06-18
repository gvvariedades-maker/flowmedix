'use client';

import { BookOpen, ChevronRight, Star, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_SUBJECTS = [
  {
    id: 'calc',
    title: 'Cálculo de Administração de Medicamentos e Infusões',
    done: 28,
    total: 124,
    accent: 'bg-[#22c55e]',
    chip: 'bg-emerald-100 text-emerald-800',
    highlight: true,
  },
  {
    id: 'oxi',
    title: 'Oxigenoterapia e Cuidados Respiratórios',
    done: 6,
    total: 89,
    accent: 'bg-cyan-500',
    chip: 'bg-cyan-100 text-cyan-800',
    highlight: false,
  },
  {
    id: 'urg',
    title: 'Urgências e Emergências',
    done: 41,
    total: 156,
    accent: 'bg-rose-500',
    chip: 'bg-rose-100 text-rose-800',
    highlight: false,
  },
  {
    id: 'farm',
    title: 'Farmacologia e Administração de Medicamentos',
    done: 12,
    total: 98,
    accent: 'bg-violet-500',
    chip: 'bg-violet-100 text-violet-800',
    highlight: false,
  },
] as const;

const WEEK_DAYS = [
  { label: 'S', done: true, color: 'bg-[#8fe020]' },
  { label: 'T', done: true, color: 'bg-cyan-400' },
  { label: 'Q', done: true, color: 'bg-violet-400' },
  { label: 'Q', done: true, color: 'bg-amber-400' },
  { label: 'S', done: true, color: 'bg-rose-400' },
  { label: 'S', done: false, color: 'bg-slate-200' },
  { label: 'D', done: false, color: 'bg-slate-200' },
] as const;

function AppNavBar() {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-[#8fe020]/15 p-1.5">
          <BookOpen size={14} className="text-[#3d6b0f]" aria-hidden />
        </span>
        <span className="text-[13px] font-black text-slate-900">AVANT</span>
        <span className="rounded-full bg-[#8fe020]/15 px-2 py-0.5 text-[9px] font-bold text-[#3d6b0f]">
          Técnico Enfermagem
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <Star size={11} className="fill-amber-400 text-amber-400" aria-hidden />
          <span className="text-[11px] font-bold text-slate-700">1.240 pts</span>
        </div>
        <div className="h-7 w-7 rounded-full bg-[#8fe020]/20 ring-2 ring-[#8fe020]/30" />
      </div>
    </div>
  );
}

function StatsBar() {
  return (
    <div className="flex items-center gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-2.5">
      <div className="flex items-center gap-1.5">
        <Trophy size={11} className="text-amber-500" aria-hidden />
        <span className="text-[10px] font-bold text-slate-600">Rank #3 na turma</span>
      </div>
      <div className="h-3 w-px bg-slate-200" />
      <span className="rounded-full bg-[#8fe020]/15 px-2 py-0.5 text-[9px] font-bold text-[#3d6b0f]">
        89 questões esta semana
      </span>
    </div>
  );
}

function WeekStrip() {
  return (
    <div className="border-b border-slate-100 bg-white px-4 py-3">
      <p className="mb-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
        Plano da semana
      </p>
      <div className="flex gap-1.5">
        {WEEK_DAYS.map((day, i) => (
          <div key={`${day.label}-${i}`} className="flex flex-1 flex-col items-center gap-1">
            <div className={cn('h-8 w-full rounded-lg', day.color, !day.done && 'opacity-50')} />
            <span className="text-[8px] font-bold text-slate-500">{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SubjectRow({
  title,
  done,
  total,
  accent,
  chip,
  highlight,
}: (typeof MOCK_SUBJECTS)[number]) {
  const pct = Math.round((done / total) * 100);

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm',
        highlight && 'border-[#8fe020]/40 ring-1 ring-[#8fe020]/15',
      )}
    >
      <div className={cn('h-10 w-1 shrink-0 rounded-full', accent)} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={cn('rounded-md px-1.5 py-0.5 text-[7px] font-bold uppercase', chip)}>
            {pct}%
          </span>
          <p className="line-clamp-1 text-[12px] font-bold text-slate-900">{title}</p>
        </div>
        <div className="mt-1.5 h-[5px] overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-[#22c55e]" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-[10px] font-medium text-slate-500">
          {done}/{total} questões
        </p>
      </div>
      <ChevronRight size={15} className="shrink-0 text-slate-300" aria-hidden />
    </div>
  );
}

/** Preview estático da vitrine editorial para moldura laptop. */
export function LandingVitrinePreview({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none select-none bg-[#f1f5f9]', className)} aria-hidden>
      <AppNavBar />
      <StatsBar />
      <WeekStrip />
      <div className="space-y-2 p-4">
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
          Seus assuntos — EBSERH 2025
        </p>
        {MOCK_SUBJECTS.map((subject) => (
          <SubjectRow key={subject.id} {...subject} />
        ))}
      </div>
    </div>
  );
}
