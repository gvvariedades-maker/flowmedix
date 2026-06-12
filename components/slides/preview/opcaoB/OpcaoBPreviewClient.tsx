'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Gauge,
  GitBranch,
  HeartPulse,
  Lightbulb,
  Network,
  ShieldAlert,
  Sparkles,
  Thermometer,
} from 'lucide-react';
import { EditorialSlideSurface } from '@/components/slides/focus/EditorialSlideSurface';
import { getSlideArcLabel, getSlideChipLabel } from '@/components/slides/core/slideLabels';
import { PREVIEW_EDITORIAL_ACCENT, type EditorialAccent } from '@/lib/slides/editorialAccent';
import { cn } from '@/lib/utils';
import type { SlideType } from '@/types/lesson';

const TOTAL_SLIDES = 4;
const BANCA = 'INSTITUTO VERBENA';
const ACCENT = PREVIEW_EDITORIAL_ACCENT;

const SLIDE_META: Array<{ type: SlideType; title: string }> = [
  { type: 'concept_map', title: 'MAPA — VERIFICAÇÃO DE SINAIS VITAIS' },
  { type: 'golden_rule', title: 'REFERÊNCIA — VERIFICAÇÃO DE SINAIS VITAIS' },
  { type: 'logic_flow', title: 'ESTRATÉGIA — VERIFICAÇÃO DE SINAIS VITAIS' },
  { type: 'danger_zone', title: 'PEGADINHAS — VERIFICAÇÃO DE SINAIS VITAIS' },
];

function EditorialChip({ type, accent }: { type: SlideType; accent: EditorialAccent }) {
  const Icon =
    type === 'concept_map'
      ? Network
      : type === 'golden_rule'
        ? Sparkles
        : type === 'logic_flow'
          ? GitBranch
          : ShieldAlert;

  return (
    <span
      className={cn(
        'inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[11px] font-black uppercase tracking-widest ring-1',
        accent.chipBg,
        accent.chipText,
        accent.chipRing,
      )}
    >
      <Icon size={11} className="shrink-0" aria-hidden />
      <span className="truncate">{getSlideChipLabel(type)}</span>
    </span>
  );
}

function EditorialShellHeader({
  slideIndex,
  type,
  title,
  accent,
}: {
  slideIndex: number;
  type: SlideType;
  title: string;
  accent: EditorialAccent;
}) {
  const arc = getSlideArcLabel(type, slideIndex, TOTAL_SLIDES);
  return (
    <header className="mb-3 shrink-0 space-y-2 border-b border-slate-200 px-1 pb-3 sm:mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <EditorialChip type={type} accent={accent} />
        <span className="inline-flex max-w-[min(100%,14rem)] shrink-0 items-center truncate rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-widest text-slate-500">
          {BANCA}
        </span>
      </div>
      <h2 className="font-display text-sm font-extrabold uppercase leading-tight tracking-tight text-slate-900 sm:text-base md:text-lg">
        {title}
      </h2>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:text-[11px]">
        <span className="font-mono tabular-nums text-slate-600">
          Slide {slideIndex + 1} de {TOTAL_SLIDES}
        </span>
        <span className="mx-2 text-slate-300" aria-hidden>
          —
        </span>
        <span className="font-body normal-case tracking-normal text-slate-500">{arc}</span>
      </p>
    </header>
  );
}

function ConceptMapPreview({ accent }: { accent: EditorialAccent }) {
  const items = [
    {
      icon: HeartPulse,
      title: 'Frequência Cardíaca',
      detail: '60–100 bpm no adulto; avaliar ritmo e amplitude do pulso.',
    },
    {
      icon: Gauge,
      title: 'Pressão Arterial',
      detail: 'Manguito no nível do coração; registrar valores em mmHg.',
    },
    {
      icon: Thermometer,
      title: 'Temperatura',
      detail: '36–37,5°C; via e horário interferem na leitura.',
    },
  ];

  return (
    <EditorialSlideSurface accent={accent}>
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <div className="grid flex-1 grid-cols-1 gap-3 min-[520px]:grid-cols-3 md:gap-4">
          {items.map((item) => (
            <div
              key={item.title}
              className={cn(
                'card-elevated flex flex-col gap-3 rounded-2xl border p-4 md:p-5',
                accent.border,
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  accent.iconBg,
                  accent.iconText,
                )}
              >
                <item.icon size={22} aria-hidden />
              </div>
              <div>
                <h3 className="font-body text-base font-bold text-slate-900 md:text-lg">{item.title}</h3>
                <p className="mt-1.5 font-body text-sm leading-relaxed text-slate-600">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </EditorialSlideSurface>
  );
}

function GoldenRulePreview({ accent }: { accent: EditorialAccent }) {
  const content =
    'Tudo o que foi feito deve ser registrado; tudo o que foi observado deve ser documentado com precisão e sem rasuras.';

  return (
    <EditorialSlideSurface accent={accent}>
      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div
          className={cn(
            'card-elevated-lg w-full max-w-3xl rounded-2xl border p-6 text-center md:rounded-3xl md:p-10',
            accent.border,
          )}
        >
          <div
            className={cn(
              'mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-xl',
              accent.iconBg,
              accent.iconText,
            )}
          >
            <Sparkles size={20} aria-hidden />
          </div>
          <p className="font-display text-lg font-extrabold uppercase leading-snug tracking-tight text-slate-900 hyphens-none md:text-2xl lg:text-3xl">
            {content}
          </p>
        </div>
      </div>
    </EditorialSlideSurface>
  );
}

function LogicFlowPreview({ accent }: { accent: EditorialAccent }) {
  const steps = [
    'Ler o comando: paciente idoso com DM2 e HAS apresenta sinais de hipoglicemia no turno da tarde.',
    'Fixar o que a banca pede em Processo de Enfermagem.',
    'Identificar gabarito: letra C — registro completo e preciso dos sinais, sintomas e condutas com horários.',
  ];

  return (
    <EditorialSlideSurface accent={accent}>
      <div className="flex flex-1 flex-col gap-3 p-4 md:max-w-2xl md:p-6">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'card-elevated flex w-full min-w-0 items-start gap-3 rounded-xl border p-3 md:p-4',
                accent.border,
              )}
            >
              <span className="btn-editorial-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg p-0">
                <CheckCircle2 size={18} className="text-[#1a2e05]" aria-hidden />
              </span>
              <p className="font-body min-w-0 flex-1 text-sm font-medium leading-relaxed text-slate-800 md:text-base">
                {step}
              </p>
            </div>
            {index < steps.length - 1 ? (
              <div className="h-4 w-px bg-slate-200" aria-hidden />
            ) : null}
          </div>
        ))}
      </div>
    </EditorialSlideSurface>
  );
}

function DangerZonePreview() {
  const items = [
    {
      label: 'Letra A',
      trap: 'Descrever apenas os sinais vitais numéricos, sem contexto clínico.',
      correct: 'Registro deve incluir sinais, sintomas, condutas e horários — não só números.',
    },
    {
      label: 'Letra B',
      trap: 'Registrar só a administração de glicose, omitindo demais achados.',
      correct: 'Documentar o quadro completo: observação + intervenção + resposta do paciente.',
    },
  ];

  return (
    <EditorialSlideSurface accent={ACCENT} semantic="danger">
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-900 md:text-base">
          PEGADINHAS — PROCESSO DE ENFERMAGEM (CONCEITO)
        </p>
        <div className="hidden grid-cols-2 gap-3 px-1 font-mono text-[10px] uppercase tracking-widest md:grid">
          <span className="text-red-600">Pegadinha</span>
          <span className="text-green-700">Correto</span>
        </div>
        {items.map((item) => (
          <div key={item.label} className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="card-elevated rounded-xl border border-red-200 border-l-4 border-l-red-500 bg-red-50/50 p-3 md:p-4">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-red-600 md:hidden">
                Pegadinha
              </p>
              <h4 className="mb-1.5 font-display text-sm font-bold text-red-800">{item.label}</h4>
              <p className="font-body text-sm leading-relaxed text-red-900/80">{item.trap}</p>
            </div>
            <div className="card-elevated rounded-xl border border-green-200 border-l-4 border-l-green-600 bg-green-50/50 p-3 md:p-4">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-green-700 md:hidden">
                Correto
              </p>
              <h4 className="mb-1.5 font-display text-sm font-bold text-green-800">{item.label}</h4>
              <p className="font-body text-sm leading-relaxed text-green-900/80">{item.correct}</p>
            </div>
          </div>
        ))}
      </div>
    </EditorialSlideSurface>
  );
}

function SlideBody({ slideIndex }: { slideIndex: number }) {
  switch (slideIndex) {
    case 0:
      return <ConceptMapPreview accent={ACCENT} />;
    case 1:
      return <GoldenRulePreview accent={ACCENT} />;
    case 2:
      return <LogicFlowPreview accent={ACCENT} />;
    case 3:
      return <DangerZonePreview />;
    default:
      return null;
  }
}

export default function OpcaoBPreviewClient() {
  const [slideIndex, setSlideIndex] = useState(0);
  const meta = SLIDE_META[slideIndex];
  const isLast = slideIndex === TOTAL_SLIDES - 1;

  const goPrev = useCallback(() => {
    setSlideIndex((i) => Math.max(0, i - 1));
  }, []);

  const goNext = useCallback(() => {
    setSlideIndex((i) => Math.min(TOTAL_SLIDES - 1, i + 1));
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-100 text-slate-900">
      <p className="shrink-0 border-b border-slate-200 bg-white px-4 py-2 text-center text-[11px] text-slate-500">
        Preview Opção B — linguagem única 100% clara (editorial) ·{' '}
        <span className="font-semibold text-[#166534]">não é o player em produção</span>
        {' · '}
        <Link href="/neuroslide-opcao-a-preview" className="underline hover:text-slate-700">
          comparar com Opção A
        </Link>
      </p>

      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:px-6 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="btn-editorial-primary shrink-0 rounded-lg p-2">
            <Lightbulb size={20} className="text-[#1a2e05]" aria-hidden />
          </div>
          <span className="hidden truncate text-xs font-bold uppercase tracking-widest text-slate-500 sm:inline">
            Avant Neuro-Learning
          </span>
        </div>
        <div className="flex shrink-0 items-baseline gap-0.5 font-mono tabular-nums">
          <span className="text-xl font-black text-rose-600 sm:text-2xl">{slideIndex + 1}</span>
          <span className="text-sm font-bold text-slate-400">/{TOTAL_SLIDES}</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 sm:px-6 md:px-8">
        <div className="card-elevated-lg mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:mt-4 sm:p-5">
          <EditorialShellHeader
            slideIndex={slideIndex}
            type={meta.type}
            title={meta.title}
            accent={ACCENT}
          />
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-100">
            <SlideBody slideIndex={slideIndex} />
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-6 md:px-8">
        <button
          type="button"
          onClick={goPrev}
          disabled={slideIndex === 0}
          className="btn-editorial-outline min-h-11 rounded-full px-4 text-xs font-bold uppercase tracking-widest disabled:opacity-40"
        >
          Voltar
        </button>

        <div className="flex items-center gap-1.5" role="tablist" aria-label="Progresso dos slides">
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === slideIndex}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setSlideIndex(i)}
              className={cn(
                'h-2 rounded-full transition-all',
                i === slideIndex ? 'w-8 bg-[#22c55e]' : 'w-2 bg-slate-200 hover:bg-slate-300',
              )}
            />
          ))}
        </div>

        {isLast ? (
          <button type="button" className="btn-editorial-primary inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-xs font-black uppercase tracking-wide">
            <Check size={16} aria-hidden />
            Marcar como estudado
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="btn-editorial-primary inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-xs font-black uppercase tracking-wide"
          >
            Próximo
            <ArrowRight size={16} aria-hidden />
          </button>
        )}
      </div>

      <details className="shrink-0 border-t border-slate-200 bg-slate-50 px-4 py-3 text-[11px] text-slate-500 sm:px-6">
        <summary className="cursor-pointer font-semibold text-slate-600">
          O que muda vs. produção e vs. Opção A?
        </summary>
        <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
          <li>Mesmo fundo e cards do dashboard (`#f1f5f9` + branco + sombra editorial)</li>
          <li>Sem ruptura claro→escuro: estudo reverso parece extensão do player</li>
          <li>Acento rose só em chip, borda e ícones — texto sempre slate escuro legível</li>
          <li>Danger zone: `red-50` / `green-50` semânticos, não fundo vermelho cheio</li>
        </ul>
      </details>
    </div>
  );
}
