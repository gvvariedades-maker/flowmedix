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
import { SlideSurface } from '@/components/slides/focus/SlideSurface';
import { getSlideArcLabel, getSlideChipLabel } from '@/components/slides/core/slideLabels';
import { PREVIEW_FOCUS_ACCENT, type FocusAccent } from '@/lib/slides/focusAccent';
import { cn } from '@/lib/utils';
import type { SlideType } from '@/types/lesson';

const TOTAL_SLIDES = 4;
const BANCA = 'INSTITUTO VERBENA';
const ACCENT = PREVIEW_FOCUS_ACCENT;

const SLIDE_META: Array<{
  type: SlideType;
  title: string;
}> = [
  { type: 'concept_map', title: 'MAPA — VERIFICAÇÃO DE SINAIS VITAIS' },
  { type: 'golden_rule', title: 'REFERÊNCIA — VERIFICAÇÃO DE SINAIS VITAIS' },
  { type: 'logic_flow', title: 'ESTRATÉGIA — VERIFICAÇÃO DE SINAIS VITAIS' },
  { type: 'danger_zone', title: 'PEGADINHAS — VERIFICAÇÃO DE SINAIS VITAIS' },
];

function FocusChip({
  type,
  accent,
}: {
  type: SlideType;
  accent: FocusAccent;
}) {
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

function FocusShellHeader({
  slideIndex,
  type,
  title,
  accent,
}: {
  slideIndex: number;
  type: SlideType;
  title: string;
  accent: FocusAccent;
}) {
  const arc = getSlideArcLabel(type, slideIndex, TOTAL_SLIDES);
  return (
    <header className="mb-3 shrink-0 space-y-2 border-b border-white/8 px-1 pb-3 sm:mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <FocusChip type={type} accent={accent} />
        <span className="inline-flex max-w-[min(100%,14rem)] shrink-0 items-center truncate rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">
          {BANCA}
        </span>
      </div>
      <h2 className="font-display text-sm font-extrabold uppercase leading-tight tracking-tight text-[var(--color-text-primary)] sm:text-base md:text-lg">
        {title}
      </h2>
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] sm:text-[11px]">
        <span className="font-mono tabular-nums text-[var(--color-text-secondary)]">
          Slide {slideIndex + 1} de {TOTAL_SLIDES}
        </span>
        <span className="mx-2 text-white/20" aria-hidden>
          —
        </span>
        <span className="font-body normal-case tracking-normal">{arc}</span>
      </p>
    </header>
  );
}

function ConceptMapPreview({ accent }: { accent: FocusAccent }) {
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
    <SlideSurface accent={accent}>
      <div className="flex flex-1 flex-col p-4 md:p-6">
        <div className="grid flex-1 grid-cols-1 gap-3 min-[520px]:grid-cols-3 md:gap-4">
          {items.map((item) => (
            <div
              key={item.title}
              className={cn(
                'flex flex-col gap-3 rounded-2xl border p-4 md:p-5',
                accent.border,
              )}
              style={{ backgroundColor: 'var(--color-surface-1)' }}
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
                <h3 className="font-body text-base font-bold text-[var(--color-text-primary)] md:text-lg">
                  {item.title}
                </h3>
                <p className="mt-1.5 font-body text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SlideSurface>
  );
}

function GoldenRulePreview({ accent }: { accent: FocusAccent }) {
  const content =
    'Tudo o que foi feito deve ser registrado; tudo o que foi observado deve ser documentado com precisão e sem rasuras.';

  return (
    <SlideSurface accent={accent}>
      <div className="flex flex-1 items-center justify-center p-4 md:p-8">
        <div
          className={cn(
            'w-full max-w-3xl rounded-2xl border p-6 text-center md:rounded-3xl md:p-10',
            accent.border,
          )}
          style={{ backgroundColor: 'var(--color-surface-1)' }}
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
          <p className="font-display text-lg font-extrabold uppercase leading-snug tracking-tight text-[var(--color-text-primary)] hyphens-none md:text-2xl lg:text-3xl">
            {content}
          </p>
        </div>
      </div>
    </SlideSurface>
  );
}

function LogicFlowPreview({ accent }: { accent: FocusAccent }) {
  const steps = [
    'Ler o comando: paciente idoso com DM2 e HAS apresenta sinais de hipoglicemia no turno da tarde.',
    'Fixar o que a banca pede em Processo de Enfermagem.',
    'Identificar gabarito: letra C — registro completo e preciso dos sinais, sintomas e condutas com horários.',
  ];

  return (
    <SlideSurface accent={accent}>
      <div className="flex flex-1 flex-col gap-3 p-4 md:max-w-2xl md:p-6">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'flex w-full min-w-0 items-start gap-3 rounded-xl border p-3 md:p-4',
                accent.border,
              )}
              style={{ backgroundColor: 'var(--color-surface-1)' }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-slate-900"
                style={{ backgroundColor: 'var(--color-brand)' }}
              >
                <CheckCircle2 size={18} aria-hidden />
              </span>
              <p className="font-body min-w-0 flex-1 text-sm font-medium leading-relaxed text-[var(--color-text-primary)] md:text-base">
                {step}
              </p>
            </div>
            {index < steps.length - 1 ? (
              <div className="h-4 w-px bg-white/10" aria-hidden />
            ) : null}
          </div>
        ))}
      </div>
    </SlideSurface>
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
    <SlideSurface accent={ACCENT} semantic="danger">
      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <p
          className="rounded-xl border px-4 py-3 text-center text-sm font-semibold text-[var(--color-text-primary)] md:text-base"
          style={{
            backgroundColor: 'var(--color-danger-dim)',
            borderColor: 'rgba(248, 113, 113, 0.25)',
          }}
        >
          PEGADINHAS — PROCESSO DE ENFERMAGEM (CONCEITO)
        </p>
        <div className="hidden grid-cols-2 gap-3 px-1 font-mono text-[10px] uppercase tracking-widest md:grid">
          <span style={{ color: 'var(--color-danger)' }}>Pegadinha</span>
          <span style={{ color: 'var(--color-success)' }}>Correto</span>
        </div>
        {items.map((item) => (
          <div key={item.label} className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div
              className="rounded-xl border-l-4 p-3 md:p-4"
              style={{
                backgroundColor: 'var(--color-surface-1)',
                borderLeftColor: 'var(--color-danger)',
              }}
            >
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[var(--color-danger)] md:hidden">
                Pegadinha
              </p>
              <h4 className="mb-1.5 font-display text-sm font-bold text-[var(--color-danger)]">
                {item.label}
              </h4>
              <p className="font-body text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {item.trap}
              </p>
            </div>
            <div
              className="rounded-xl border-l-4 p-3 md:p-4"
              style={{
                backgroundColor: 'var(--color-surface-1)',
                borderLeftColor: 'var(--color-success)',
              }}
            >
              <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-[var(--color-success)] md:hidden">
                Correto
              </p>
              <h4 className="mb-1.5 font-display text-sm font-bold text-[var(--color-success)]">
                {item.label}
              </h4>
              <p className="font-body text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {item.correct}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SlideSurface>
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

export default function OpcaoAPreviewClient() {
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
    <div
      data-surface="focus"
      className="flex min-h-[100dvh] flex-col text-[var(--color-text-primary)]"
      style={{ backgroundColor: 'var(--color-surface-0)' }}
    >
      {/* Banner de preview */}
      <p className="shrink-0 border-b border-white/8 bg-[var(--color-surface-1)] px-4 py-2 text-center text-[11px] text-[var(--color-text-tertiary)]">
        Preview Opção A — linguagem única · modo foco escuro-suave ·{' '}
        <span className="text-[var(--color-brand-text)]">não é o player em produção</span>
        {' · '}
        <Link href="/neuroslide-opcao-b-preview" className="underline hover:text-[var(--color-text-secondary)]">
          comparar com Opção B
        </Link>
      </p>

      {/* Chrome (header do estudo reverso) */}
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:px-6 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="shrink-0 rounded-lg p-2 text-slate-900"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            <Lightbulb size={20} fill="currentColor" aria-hidden />
          </div>
          <span className="hidden truncate text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] sm:inline">
            Avant Neuro-Learning
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="flex items-baseline gap-0.5 font-mono tabular-nums">
            <span className="text-xl font-black sm:text-2xl" style={{ color: ACCENT.hex }}>
              {slideIndex + 1}
            </span>
            <span className="text-sm font-bold text-[var(--color-text-tertiary)]">/{TOTAL_SLIDES}</span>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 sm:px-6 md:px-8">
        <FocusShellHeader
          slideIndex={slideIndex}
          type={meta.type}
          title={meta.title}
          accent={ACCENT}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/8">
          <SlideBody slideIndex={slideIndex} />
        </div>
      </div>

      {/* Footer navegação */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/8 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:px-6 md:px-8">
        <button
          type="button"
          onClick={goPrev}
          disabled={slideIndex === 0}
          className="min-h-11 rounded-full px-4 text-xs font-bold uppercase tracking-widest text-[var(--color-text-tertiary)] transition-colors hover:text-[var(--color-text-primary)] disabled:opacity-30"
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
                i === slideIndex ? 'w-8' : 'w-2 bg-white/20 hover:bg-white/35',
              )}
              style={
                i === slideIndex ? { backgroundColor: 'var(--color-brand)' } : undefined
              }
            />
          ))}
        </div>

        {isLast ? (
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-xs font-black uppercase tracking-wide text-slate-900"
            style={{ backgroundColor: 'var(--color-brand)' }}
          >
            <Check size={16} aria-hidden />
            Marcar como estudado
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-xs font-black uppercase tracking-wide text-slate-900 transition-opacity hover:opacity-90"
          >
            Próximo
            <ArrowRight size={16} aria-hidden />
          </button>
        )}
      </div>

      {/* Comparativo rápido */}
      <details className="shrink-0 border-t border-white/8 px-4 py-3 text-[11px] text-[var(--color-text-tertiary)] sm:px-6">
        <summary className="cursor-pointer font-semibold text-[var(--color-text-secondary)]">
          O que mudou vs. produção atual?
        </summary>
        <ul className="mt-2 list-inside list-disc space-y-1 leading-relaxed">
          <li>Fundo slate #0f172a (não OLED #010409 + listras)</li>
          <li>Marca verde única no lightbulb, progresso e CTA final</li>
          <li>Cor rose só como acento (chip, borda, ícones) — não gradiente de tela inteira</li>
          <li>Mesma superfície nos 4 slides; danger usa semântica vermelho/verde, não fundo vermelho cheio</li>
        </ul>
      </details>
    </div>
  );
}
