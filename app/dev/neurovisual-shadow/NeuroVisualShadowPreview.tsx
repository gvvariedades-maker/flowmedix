'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check, Monitor, RotateCcw, ShieldAlert, Smartphone } from 'lucide-react';
import { getThemeForSlide } from '@/components/slides/core/themeGenerator';
import {
  AlertCallout,
  BoardChrome,
  CategoryStrip,
  CriticalNumber,
  LabelBodyRow,
  PolarityPanel,
  TwoColumnBoard,
  type BoardTone,
} from '@/components/slides/primitives';
import type { FamilyId } from '@/lib/catalogMigration/classifyFamily';
import { resolveSlideSlots } from '@/lib/neurovisualShadow/bindings';
import type { CapabilityGap } from '@/lib/neurovisualShadow/previewAudit';
import {
  CANONICAL_SLIDE_TYPES,
  type NormalizedQuestion,
  type QuestionPayload,
  type RuntimePlan,
  type RuntimePlanSlide,
  type SlideType,
} from '@/lib/neurovisualShadow/model';
import { cn } from '@/lib/utils';
import { EditorialFoundationRenderer } from './EditorialFoundationRenderer';

const LegacyNeuroSlide = dynamic(
  () => import('@/components/slides/core/NeuroSlide'),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex min-h-[32rem] items-center justify-center rounded-[28px] border border-white/10 bg-slate-950/70 text-sm text-slate-400"
        data-testid="legacy-loading"
      >
        Carregando composição legada…
      </div>
    ),
  },
);

export type AnchorOption = { questionSlug: string; pedagogicalBranch: string };
export type SelectedPreview = {
  questionSlug: string;
  pedagogicalBranch: string;
  source: QuestionPayload;
  projection: NormalizedQuestion;
  plan: RuntimePlan;
  codes: string[];
  gaps: CapabilityGap[];
};

export type PreviewProps = {
  anchors: AnchorOption[];
  selected: SelectedPreview;
};

type DisplayItem = {
  label?: string;
  detail?: string;
  icon?: string;
  correct?: string;
  value?: string;
  emphasis?: string;
  badge?: string;
};

const SLIDE_LABEL: Record<SlideType, string> = {
  concept_map: '01 · Mapa de conceito',
  logic_flow: '02 · Fluxo de raciocínio',
  golden_rule: '03 · Regra de ouro',
  danger_zone: '04 · Zona de perigo',
};

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function itemList(value: unknown): DisplayItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is DisplayItem => typeof item === 'object' && item !== null);
}

function stepList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((step): step is string => typeof step === 'string') : [];
}

function toneForRow(row: DisplayItem): BoardTone {
  if (row.emphasis === 'alert' || row.badge === 'warn') return 'warn';
  if (row.badge === 'ok') return 'ok';
  if (row.badge === 'hot' || row.emphasis === 'highlight') return 'command';
  return 'info';
}

function GapFlag({ gap }: { gap: CapabilityGap }) {
  return (
    <div
      className="mb-3 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-left text-xs text-amber-950"
      data-testid={`capability-gap-${gap.slide_type}`}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <p>
        <strong className="font-mono">CAPABILITY_GAP</strong> · {gap.reason}
      </p>
    </div>
  );
}

function ConceptComposition({
  slots,
  gesture,
  gap,
}: {
  slots: Record<string, unknown>;
  gesture: string;
  gap?: CapabilityGap;
}) {
  const items = itemList(slots.items);
  return (
    <>
      {gap ? <GapFlag gap={gap} /> : null}
      {gesture === 'rail' ? (
        <div className="relative grid gap-3 before:absolute before:bottom-8 before:left-[1.15rem] before:top-8 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-sky-500 before:via-teal-400 before:to-amber-400 sm:grid-cols-4 sm:gap-2 sm:before:left-8 sm:before:right-8 sm:before:top-5 sm:before:h-1 sm:before:w-auto">
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="relative z-10 grid min-w-0 grid-cols-[2.4rem_1fr] items-start gap-3 sm:grid-cols-1 sm:text-center">
              <span className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-4 border-slate-100 font-mono text-sm font-black text-white shadow-lg sm:mx-auto',
                index === 0 ? 'bg-sky-600' : index === items.length - 1 ? 'bg-amber-500' : 'bg-teal-600',
              )}>{index + 1}</span>
              <div className="min-w-0 rounded-2xl border border-slate-200 bg-white/90 p-3 text-left shadow-md sm:mt-2">
                <p className="font-body text-sm font-black leading-tight text-slate-950">{item.label}</p>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-700">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      ) : gesture === 'critical_number' ? (
        <div className="space-y-3">
          {items[0] ? (
            <PolarityPanel tone="command" emphasized>
              <CategoryStrip label={items[0].label ?? 'Marco'} tone="command" />
              <p className="mt-3 font-body text-xl font-black leading-tight tracking-tight text-sky-950 md:text-2xl">
                {items[0].detail}
              </p>
            </PolarityPanel>
          ) : null}
          <div className="grid gap-2.5 min-[390px]:grid-cols-2">
            {items.slice(1).map((item, index) => (
              <LabelBodyRow
                key={`${item.label}-${index}`}
                chip={item.label ?? ''}
                body={item.detail ?? ''}
                tone={index === items.length - 2 ? 'warn' : 'info'}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 min-[390px]:grid-cols-2">
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} className={cn(
              'relative min-h-28 overflow-hidden rounded-2xl border-2 p-4 shadow-md',
              ['border-sky-400 bg-sky-50', 'border-teal-400 bg-teal-50', 'border-indigo-400 bg-indigo-50', 'border-amber-400 bg-amber-50'][index % 4],
            )}>
              <span className="absolute right-2 top-0 font-mono text-5xl font-black text-slate-900/8">{String(index + 1).padStart(2, '0')}</span>
              <p className="relative font-mono text-[10px] font-black uppercase tracking-wider text-slate-600">eixo {index + 1}</p>
              <p className="relative mt-2 font-body text-base font-black leading-tight text-slate-950">{item.label}</p>
              <p className="relative mt-1 text-sm font-medium leading-relaxed text-slate-700">{item.detail}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function LogicComposition({ slots, gesture }: { slots: Record<string, unknown>; gesture: string }) {
  const steps = stepList(slots.steps);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <CategoryStrip label={`${steps.length}/${steps.length}`} tone="command" />
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">
          sequência completa · 0 ações
        </span>
      </div>
      <div
        className="relative flex flex-col gap-2.5"
        aria-label="Raciocínio completo"
        data-declared-gesture={gesture}
      >
        {steps.map((step, index) => (
          <div key={index} className={cn(
            'relative grid min-w-0 grid-cols-[2.25rem_1fr] items-center gap-3 rounded-2xl border px-3 py-2.5 shadow-sm',
            index === steps.length - 1
              ? 'border-emerald-500 bg-emerald-100'
              : index % 2 === 0
                ? 'border-sky-300 bg-sky-50'
                : 'border-teal-300 bg-teal-50',
          )}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 font-mono text-sm font-black text-white">{index + 1}</span>
            <p className="font-body text-sm font-bold leading-snug text-slate-950">{step}</p>
            {index < steps.length - 1 ? <span className="absolute -bottom-3 left-5 z-20 font-black text-sky-700">↓</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function GoldenComposition({
  slots,
  gesture,
  gap,
}: {
  slots: Record<string, unknown>;
  gesture: string;
  gap?: CapabilityGap;
}) {
  const rows = itemList(slots.rows);
  return (
    <div className="space-y-3">
      {gap ? <GapFlag gap={gap} /> : null}
      {stringValue(slots.body) ? (
        <p className="text-center font-mono text-[11px] font-black uppercase tracking-[0.16em] text-sky-800">
          {stringValue(slots.body)}
        </p>
      ) : null}
      {rows[0] ? (
        <div className="rounded-[1.75rem] border-2 border-sky-500 bg-gradient-to-br from-sky-100 via-white to-cyan-100 p-5 text-center shadow-lg ring-4 ring-sky-100">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-sky-700">regra dominante · {rows[0].label}</p>
          <p className="mt-2 font-body text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">{rows[0].value}</p>
        </div>
      ) : null}
      <div className="grid gap-3 min-[390px]:grid-cols-2">
        {rows.slice(1).map((row, index) =>
          gesture === 'critical_number' && index < 2 ? (
              <CriticalNumber
                key={`${row.label}-${index}`}
                label={row.label}
                value={row.value ?? ''}
                emphasis={index === 0 ? 'default' : 'alert'}
                className="w-full [&>span:last-child]:text-xl"
              />
          ) : (
              <LabelBodyRow
                key={`${row.label}-${index}`}
                chip={row.label ?? ''}
                body={row.value ?? ''}
                tone={toneForRow(row)}
                emphasized={row.emphasis === 'alert'}
              />
          ),
        )}
      </div>
    </div>
  );
}

function DangerComposition({ slots }: { slots: Record<string, unknown> }) {
  const items = itemList(slots.corrections);
  return (
    <div className="space-y-3">
      {stringValue(slots.body) ? (
        <AlertCallout tone="warn" icon={ShieldAlert}>
          {stringValue(slots.body)}
        </AlertCallout>
      ) : null}
      <div className="space-y-3">
        {items.map((item, index) => (
          <TwoColumnBoard
            key={`${item.label}-${index}`}
            leftTitle={item.label}
            rightTitle="Correção"
            leftTone="barrier"
            rightTone="ok"
            emphasize="right"
            left={<PolarityPanel tone="barrier"><p className="font-body text-sm font-bold leading-relaxed">{item.detail}</p></PolarityPanel>}
            right={<PolarityPanel tone="ok" emphasized><p className="font-body text-sm font-bold leading-relaxed">{item.correct}</p></PolarityPanel>}
          />
        ))}
      </div>
    </div>
  );
}

function PrenatalConcept({ items }: { items: DisplayItem[] }) {
  return (
    <div className="relative py-2" data-composition-grammar="temporal-rail">
      <div
        className="absolute bottom-5 left-5 top-5 w-1 rounded-full bg-gradient-to-b from-sky-500 via-cyan-400 to-rose-500 min-[620px]:bottom-auto min-[620px]:left-8 min-[620px]:right-8 min-[620px]:top-8 min-[620px]:h-1 min-[620px]:w-auto"
        aria-hidden
      />
      <div className="relative grid gap-5 min-[620px]:grid-cols-4 min-[620px]:gap-3">
        {items.map((item, index) => {
          const danger = index === items.length - 1;
          return (
            <article
              key={`${item.label}-${index}`}
              className="relative grid grid-cols-[2.75rem_1fr] gap-3 min-[620px]:grid-cols-1 min-[620px]:text-center"
            >
              <span
                className={cn(
                  'z-10 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white font-mono text-sm font-black text-white shadow-lg min-[620px]:mx-auto',
                  danger ? 'bg-rose-600' : index === 0 ? 'bg-sky-600' : 'bg-cyan-600',
                )}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className={cn('min-w-0 pt-1 min-[620px]:pt-3', danger && 'text-rose-950')}>
                <p className="font-body text-base font-black leading-tight text-slate-950">{item.label}</p>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-700">{item.detail}</p>
              </div>
              {danger ? (
                <span className="absolute -left-1 top-1/2 h-px w-5 bg-rose-500 min-[620px]:left-1/2 min-[620px]:top-9 min-[620px]:h-5 min-[620px]:w-px" aria-hidden />
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function PartoConcept({ title, items }: { title: string; items: DisplayItem[] }) {
  return (
    <div className="relative mx-auto grid max-w-3xl gap-4 py-2 min-[620px]:grid-cols-[1fr_12rem_1fr] min-[620px]:grid-rows-2 min-[620px]:items-center" data-composition-grammar="focus-orbit">
      <div className="order-first rounded-[999px] bg-slate-950 px-5 py-7 text-center text-white shadow-xl ring-8 ring-cyan-100 min-[620px]:order-none min-[620px]:col-start-2 min-[620px]:row-span-2">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">núcleo</p>
        <p className="mt-2 font-body text-xl font-black leading-tight">{title}</p>
      </div>
      {items.map((item, index) => (
        <article
          key={`${item.label}-${index}`}
          className={cn(
            'relative min-w-0 border-l-4 pl-3 min-[620px]:border-l-0 min-[620px]:px-3',
            index % 2 === 0 ? 'border-sky-500' : 'border-emerald-500',
            index < 2 ? 'min-[620px]:col-start-1' : 'min-[620px]:col-start-3',
            index === 0 || index === 2 ? 'min-[620px]:row-start-1' : 'min-[620px]:row-start-2',
          )}
        >
          <span className={cn('mb-2 block h-2.5 w-12 rounded-full', index % 2 === 0 ? 'bg-sky-500' : 'bg-emerald-500')} aria-hidden />
          <p className="font-body text-base font-black leading-tight text-slate-950">{item.label}</p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-700">{item.detail}</p>
          <span
            className={cn(
              'absolute top-4 hidden h-px w-8 bg-slate-300 min-[620px]:block',
              index < 2 ? '-right-5' : '-left-5',
            )}
            aria-hidden
          />
        </article>
      ))}
    </div>
  );
}

function FunnelLogic({ steps }: { steps: string[] }) {
  const assertionCount = Math.max(1, steps.length - 6);
  const assertions = steps.slice(1, 1 + assertionCount);
  const decisions = steps.slice(1 + assertionCount, -2);
  const result = steps.at(-2);
  const fixation = steps.at(-1);
  return (
    <div className="mx-auto max-w-3xl" data-composition-grammar="decision-funnel" aria-label="Raciocínio completo em funil">
      <div className="rounded-t-[2rem] bg-sky-700 px-4 py-3 text-center text-white">
        <p className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-sky-200">entrada</p>
        <p className="mt-1 text-sm font-bold leading-relaxed">{steps[0]}</p>
      </div>
      <div className="grid gap-px bg-slate-200 min-[620px]:grid-cols-2">
        {assertions.map((step, index) => (
          <div
            key={index}
            className={cn(
              'bg-white px-4 py-3',
              assertions.length % 2 === 1 && index === assertions.length - 1 && 'min-[620px]:col-span-2',
            )}
          >
            <span className="font-mono text-[10px] font-black text-sky-700">TESTE {index + 1}</span>
            <p className="mt-1 text-sm font-bold leading-relaxed text-slate-900">{step}</p>
          </div>
        ))}
      </div>
      <div className="mx-auto h-0 w-0 border-x-[2.5rem] border-t-[1.25rem] border-x-transparent border-t-slate-300 min-[620px]:border-x-[6rem]" aria-hidden />
      <div className="mx-auto flex w-[92%] flex-col gap-1.5">
        {decisions.map((step, index) => (
          <div
            key={index}
            className={cn(
              'mx-auto flex min-h-12 items-center gap-3 bg-gradient-to-r from-cyan-100 to-teal-100 px-4 py-2 text-slate-950 shadow-sm',
              index === 0 ? 'w-full' : index === 1 ? 'w-[90%]' : 'w-[80%]',
            )}
            style={{ clipPath: 'polygon(4% 0, 96% 0, 100% 50%, 96% 100%, 4% 100%, 0 50%)' }}
          >
            <span className="shrink-0 font-mono text-[10px] font-black text-teal-700">{String(index + 1).padStart(2, '0')}</span>
            <p className="text-sm font-bold leading-relaxed">{step}</p>
          </div>
        ))}
      </div>
      <div className="mx-auto h-6 w-px bg-emerald-500" aria-hidden />
      <div className="mx-auto max-w-xl rounded-[2rem] bg-slate-950 px-5 py-4 text-center text-white shadow-xl ring-4 ring-emerald-100">
        <p className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">decisão</p>
        <p className="mt-1 font-body text-base font-black leading-relaxed">{result}</p>
      </div>
      <p className="mx-auto mt-3 max-w-2xl border-t-2 border-emerald-400 pt-3 text-center text-sm font-bold leading-relaxed text-emerald-950">
        {fixation}
      </p>
    </div>
  );
}

function PrenatalGolden({ body, rows }: { body: string; rows: DisplayItem[] }) {
  const hero = rows[0];
  return (
    <div className="mx-auto max-w-3xl" data-composition-grammar="critical-number-axis">
      <p className="text-center font-mono text-[10px] font-black uppercase tracking-[0.2em] text-sky-800">{body}</p>
      {hero ? (
        <div className="mx-auto mt-3 max-w-2xl border-y-4 border-sky-500 py-4 text-center">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-sky-700">{hero.label}</p>
          <p className="mt-2 font-body text-3xl font-black leading-[1.02] tracking-[-0.04em] text-slate-950 min-[620px]:text-5xl">{hero.value}</p>
        </div>
      ) : null}
      <div className="relative mt-5 grid gap-3 min-[620px]:grid-cols-2">
        <div className="absolute bottom-0 left-1/2 top-0 hidden w-px bg-slate-300 min-[620px]:block" aria-hidden />
        {rows.slice(1).map((row, index) => (
          <article
            key={`${row.label}-${index}`}
            className={cn(
              'relative px-4 py-3',
              index % 2 === 0 ? 'border-l-4 border-cyan-500 bg-cyan-50' : 'border-r-4 border-amber-500 bg-amber-50 text-right',
            )}
          >
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.14em] text-slate-600">{row.label}</p>
            <p className="mt-1 font-body text-xl font-black leading-tight text-slate-950 min-[620px]:text-2xl">{row.value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function PartoGolden({ body, rows }: { body: string; rows: DisplayItem[] }) {
  return (
    <div className="mx-auto max-w-3xl" data-composition-grammar="practice-deck">
      <div className="mb-4 flex items-end justify-between gap-3 border-b-4 border-indigo-500 pb-2">
        <p className="font-body text-2xl font-black tracking-[-0.04em] text-slate-950 min-[620px]:text-4xl">{body}</p>
        <span className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-indigo-700">5 práticas</span>
      </div>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <article
            key={`${row.label}-${index}`}
            className={cn(
              'relative grid gap-1 border-l-[0.65rem] px-4 py-3 shadow-[0_8px_20px_rgba(15,23,42,0.08)] min-[620px]:grid-cols-[12rem_1fr] min-[620px]:items-center',
              index % 2 === 0 ? 'mr-5 border-indigo-500 bg-indigo-50' : 'ml-5 border-emerald-500 bg-emerald-50',
            )}
          >
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.12em] text-slate-600">{row.label}</p>
            <p className="font-body text-base font-black leading-snug text-slate-950 min-[620px]:text-lg">{row.value}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function DangerArena({ body, items }: { body: string; items: DisplayItem[] }) {
  return (
    <div className="mx-auto max-w-3xl" data-composition-grammar="error-correction-arena">
      <p className="mb-4 text-center font-body text-xl font-black tracking-tight text-rose-950">{body}</p>
      <div className="hidden grid-cols-[1fr_3rem_1fr] border-y-2 border-slate-900 py-2 text-center font-mono text-[10px] font-black uppercase tracking-[0.18em] min-[620px]:grid">
        <span className="text-rose-700">erro da alternativa</span><span aria-hidden>→</span><span className="text-emerald-700">conduta correta</span>
      </div>
      <div className="divide-y-2 divide-slate-200">
        {items.map((item, index) => (
          <article key={`${item.label}-${index}`} className="grid gap-2 py-4 min-[620px]:grid-cols-[1fr_3rem_1fr] min-[620px]:items-center">
            <div className="border-l-4 border-rose-500 bg-rose-50 px-4 py-3">
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-rose-700">{item.label}</p>
              <p className="mt-1 text-sm font-bold leading-relaxed text-rose-950">{item.detail}</p>
            </div>
            <span className="mx-auto flex h-8 w-8 rotate-90 items-center justify-center rounded-full bg-slate-950 text-white min-[620px]:rotate-0" aria-hidden>→</span>
            <div className="border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 min-[620px]:border-l-0 min-[620px]:border-r-4">
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-emerald-700">correção</p>
              <p className="mt-1 text-sm font-bold leading-relaxed text-emerald-950">{item.correct}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function EditorialSampleComposition({
  compositionId,
  slideType,
  slots,
}: {
  compositionId: string;
  slideType: SlideType;
  slots: Record<string, unknown>;
}) {
  const gesture = compositionId.split('.').at(-1);
  if (slideType === 'concept_map') {
    const items = itemList(slots.items);
    return gesture === 'rail' ? (
      <PrenatalConcept items={items} />
    ) : (
      <PartoConcept title={stringValue(slots.title)} items={items} />
    );
  }
  if (slideType === 'logic_flow') return <FunnelLogic steps={stepList(slots.steps)} />;
  if (slideType === 'golden_rule') {
    const rows = itemList(slots.rows);
    return gesture === 'critical_number' ? (
      <PrenatalGolden body={stringValue(slots.body)} rows={rows} />
    ) : (
      <PartoGolden body={stringValue(slots.body)} rows={rows} />
    );
  }
  return <DangerArena body={stringValue(slots.body)} items={itemList(slots.corrections)} />;
}

function PlanSlide({
  questionSlug,
  sourceSlide,
  projection,
  planSlide,
  slideIndex,
  gap,
}: {
  questionSlug: string;
  sourceSlide: Record<string, unknown>;
  projection: NormalizedQuestion;
  planSlide: RuntimePlanSlide;
  slideIndex: number;
  gap?: CapabilityGap;
}) {
  const slots = useMemo(
    () => resolveSlideSlots(projection, planSlide),
    [projection, planSlide],
  );
  const gesture = planSlide.composition_id.split('.').at(-1) ?? 'unknown';
  const theme = getThemeForSlide(sourceSlide, questionSlug, slideIndex);
  const footer = stringValue(slots.footer);
  const editorialSample = Boolean(planSlide.editorial_synthesis);
  const editorialFoundation = planSlide.editorial_synthesis;

  if (editorialFoundation) {
    return (
      <div
        className="w-full"
        data-visual-sample="editorial-foundation-v1"
        data-interaction-policy={planSlide.interaction_policy}
        data-internal-action-count={planSlide.internal_action_count}
        data-initial-state={planSlide.initial_state}
        data-hidden-content={String(planSlide.hidden_content)}
        data-player-navigation-only={String(planSlide.player_navigation_only)}
      >
        <EditorialFoundationRenderer
          slideType={planSlide.slide_type}
          compositionId={planSlide.composition_id}
          synthesis={editorialFoundation}
        />
      </div>
    );
  }

  return (
    <div
      className="flex min-h-[560px] w-full flex-col overflow-hidden rounded-[1.75rem] border border-cyan-300/30 bg-slate-100 shadow-2xl shadow-cyan-950/20"
      data-interaction-policy={planSlide.interaction_policy}
      data-internal-action-count={planSlide.internal_action_count}
      data-initial-state={planSlide.initial_state}
      data-hidden-content={String(planSlide.hidden_content)}
      data-player-navigation-only={String(planSlide.player_navigation_only)}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-slate-950 px-4 py-3 text-white">
        <div>
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">
            plano v1 · {gesture}
          </span>
          <p className="mt-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            static_complete · 0 ações
          </p>
        </div>
        <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 font-mono text-[9px] text-cyan-100">
          {planSlide.composition_id}
        </span>
      </div>
      {editorialSample ? (
        <div className="relative flex w-full min-w-0 flex-1 flex-col p-4 sm:p-6" data-visual-sample="editorial-v2">
          <div className={cn('absolute inset-0 bg-gradient-to-br opacity-30', theme.bgGradient)} aria-hidden />
          <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-4">
            <div className="text-center">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-sky-800">{SLIDE_LABEL[planSlide.slide_type]}</p>
              {stringValue(slots.title) ? (
                <h2 className="mt-1 font-body text-2xl font-black leading-tight tracking-[-0.035em] text-slate-950 sm:text-3xl">{stringValue(slots.title)}</h2>
              ) : null}
            </div>
            {gap ? <GapFlag gap={gap} /> : null}
            <EditorialSampleComposition compositionId={planSlide.composition_id} slideType={planSlide.slide_type} slots={slots} />
            {footer ? (
              <div className="mt-1 border-t-4 border-slate-950 bg-slate-950 px-4 py-3 text-center text-white">
                <span className="font-mono text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">fixação</span>
                <p className="mt-1 font-body text-sm font-black leading-relaxed sm:text-base">{footer}</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : (
        <BoardChrome
          theme={theme}
          washOpacity={0.34}
          eyebrow={SLIDE_LABEL[planSlide.slide_type]}
          title={stringValue(slots.title)}
          footerRule={footer}
          footerLabel={footer ? 'FIXAÇÃO' : undefined}
          maxWidth="2xl"
          className="py-1"
        >
          {planSlide.slide_type === 'concept_map' ? (
            <ConceptComposition slots={slots} gesture={gesture} gap={gap} />
          ) : planSlide.slide_type === 'logic_flow' ? (
            <LogicComposition slots={slots} gesture={gesture} />
          ) : planSlide.slide_type === 'golden_rule' ? (
            <GoldenComposition slots={slots} gesture={gesture} gap={gap} />
          ) : (
            <DangerComposition slots={slots} />
          )}
        </BoardChrome>
      )}
    </div>
  );
}

function LegacySlide({
  slide,
  selected,
  slideIndex,
}: {
  slide: Record<string, unknown>;
  selected: SelectedPreview;
  slideIndex: number;
}) {
  const slides = selected.source.reverse_study_slides ?? [];
  const meta = selected.source.meta ?? {};
  return (
    <div className="min-h-[560px] overflow-visible rounded-[1.75rem] border border-slate-700 bg-[#010409] shadow-2xl shadow-slate-950/20">
      <LegacyNeuroSlide
        data={slide}
        questionHash={selected.questionSlug}
        questionSlug={selected.questionSlug}
        questionFamilyId={meta.family as FamilyId | undefined}
        questionInstruction={stringValue(selected.source.question_data?.instruction)}
        questionSlides={slides}
        questionMeta={{
          subtopico: stringValue(meta.subtopico),
          pedagogical_branch: selected.pedagogicalBranch,
        }}
        questionOptions={selected.source.question_data?.options as never}
        slideIndex={slideIndex}
        standalone
      />
    </div>
  );
}

export function NeuroVisualShadowPreview({ anchors, selected }: PreviewProps) {
  const router = useRouter();
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [forceFailure, setForceFailure] = useState(false);
  const sourceSlides = selected.source.reverse_study_slides ?? [];
  const sourceByType = new Map(sourceSlides.map((slide) => [String(slide.type), slide]));
  const orderedSlides = CANONICAL_SLIDE_TYPES.map((type) => sourceByType.get(type)).filter(
    (slide): slide is Record<string, unknown> => Boolean(slide),
  );
  const displayedCodes = forceFailure
    ? ['NV_BINDING_INVALID', 'NV_ROLLOUT_OFF']
    : selected.codes;

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,#12304a_0,#07111f_34%,#020617_78%)] text-slate-100"
      data-testid="neurovisual-shadow-root"
      data-cohort="saude-da-mulher-anchors-v1"
      data-rollout="off"
    >
      <div className="mx-auto max-w-[1680px] px-3 py-5 sm:px-5 lg:px-8">
        <header className="rounded-[2rem] border border-cyan-300/15 bg-slate-950/75 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-cyan-300">
              NeuroVisual · shadow mode
            </span>
            <span className="rounded-full border border-rose-300/30 bg-rose-300/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-rose-200">
              rollout off
            </span>
          </div>
          <h1 className="mt-4 max-w-4xl font-body text-3xl font-black leading-[0.98] tracking-[-0.04em] text-white sm:text-5xl">
            O mesmo conteúdo. Duas decisões visuais.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
            Compare o resolver legado com a composição v1. O painel expõe gaps e códigos; nenhum plano é lido pelo player de produção.
          </p>

          <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
            <label className="block min-w-0">
              <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Âncora 1–6
              </span>
              <select
                value={selected.questionSlug}
                onChange={(event) =>
                  router.push(`/dev/neurovisual-shadow?anchor=${encodeURIComponent(event.target.value)}`)
                }
                className="min-h-12 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-sm font-semibold text-white outline-none focus:border-cyan-400"
                data-testid="anchor-select"
              >
                {anchors.map((anchor, index) => (
                  <option key={anchor.questionSlug} value={anchor.questionSlug}>
                    {index + 1}. {anchor.questionSlug}
                  </option>
                ))}
              </select>
            </label>

            <div>
              <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Moldura
              </span>
              <div className="flex rounded-xl border border-slate-700 bg-slate-900 p-1">
                <button
                  type="button"
                  onClick={() => setViewport('desktop')}
                  aria-pressed={viewport === 'desktop'}
                  className={cn(
                    'flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-bold',
                    viewport === 'desktop' ? 'bg-cyan-400 text-slate-950' : 'text-slate-300',
                  )}
                  data-testid="viewport-desktop"
                >
                  <Monitor className="h-4 w-4" aria-hidden /> Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setViewport('mobile')}
                  aria-pressed={viewport === 'mobile'}
                  className={cn(
                    'flex min-h-10 items-center gap-2 rounded-lg px-3 text-xs font-bold',
                    viewport === 'mobile' ? 'bg-cyan-400 text-slate-950' : 'text-slate-300',
                  )}
                  data-testid="viewport-mobile"
                >
                  <Smartphone className="h-4 w-4" aria-hidden /> Mobile
                </button>
              </div>
            </div>

            <div>
              <span className="mb-1 block font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Atomicidade
              </span>
              <button
                type="button"
                onClick={() => setForceFailure((current) => !current)}
                aria-pressed={forceFailure}
                className={cn(
                  'flex min-h-12 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition',
                  forceFailure
                    ? 'border-rose-400 bg-rose-500/20 text-rose-100'
                    : 'border-slate-700 bg-slate-900 text-slate-200',
                )}
                data-testid="force-fallback"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                {forceFailure ? 'Fallback integral ativo' : 'Simular falha obrigatória'}
              </button>
            </div>
          </div>
        </header>

        <section className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.7fr)]">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">Questão</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-200">
              {stringValue(selected.source.question_data?.instruction)}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 font-mono text-[10px] leading-relaxed text-slate-400">
            <p><strong className="text-cyan-300">plan_id</strong> {selected.plan.plan_id}</p>
            <p className="break-all"><strong className="text-cyan-300">content_hash</strong> {selected.plan.content_hash}</p>
            <p className="break-all"><strong className="text-cyan-300">profile_hash</strong> {selected.plan.profile_hash}</p>
            <div className="mt-2 flex flex-wrap gap-1.5" data-testid="nv-codes">
              {displayedCodes.map((code) => (
                <span key={code} className="rounded-md border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-amber-200">
                  {code}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8 space-y-10" data-testid="slide-pairs">
          {selected.plan.slides.map((planSlide, index) => {
            const sourceSlide = orderedSlides[index];
            if (!sourceSlide) return null;
            const gap = selected.gaps.find((candidate) => candidate.slide_type === planSlide.slide_type);
            const frameClass = viewport === 'mobile' ? 'mx-auto min-w-0 w-full max-w-[419px]' : 'min-w-0 w-full';
            return (
              <section
                key={planSlide.slide_type}
                className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-3 sm:p-5"
                data-testid={`slide-pair-${index + 1}`}
                data-slide-type={planSlide.slide_type}
                data-content-hash={selected.plan.content_hash}
                data-overflow-check
              >
                <div className="mb-4 flex min-w-0 flex-wrap items-end justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">
                      {SLIDE_LABEL[planSlide.slide_type]}
                    </p>
                    <h2 className="mt-1 text-xl font-black tracking-tight text-white sm:text-2xl">
                      legado <span className="text-slate-600">×</span> plano v1
                    </h2>
                  </div>
                  <div className="flex min-w-0 max-w-full flex-wrap gap-2 font-mono text-[9px]">
                    <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2 py-1 text-sky-200">
                      gesto {planSlide.composition_id.split('.').at(-1)}
                    </span>
                    <span className="max-w-full rounded-full border border-slate-600 px-2 py-1 text-slate-300 [overflow-wrap:anywhere]">
                      {planSlide.composition_id}
                    </span>
                    {gap ? (
                      <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-amber-200">
                        CAPABILITY_GAP
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2 py-1 text-emerald-200">
                        <Check className="h-3 w-3" aria-hidden /> capability ok
                      </span>
                    )}
                  </div>
                </div>

                <div className={cn('grid min-w-0 items-start gap-5 xl:grid-cols-2', viewport === 'mobile' && 'xl:grid-cols-2')}>
                  <article className={frameClass} data-testid={`legacy-slide-${index + 1}`} data-renderer="legacy">
                    <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Legado atual</p>
                    <LegacySlide slide={sourceSlide} selected={selected} slideIndex={index} />
                  </article>
                  <article
                    className={frameClass}
                    data-testid={`v1-slide-${index + 1}`}
                    data-renderer={forceFailure ? 'legacy' : 'plan-v1'}
                  >
                    <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {forceFailure ? 'Fallback legado integral' : 'Composição v1 shadow'}
                    </p>
                    {forceFailure ? (
                      <LegacySlide slide={sourceSlide} selected={selected} slideIndex={index} />
                    ) : (
                      <PlanSlide
                        questionSlug={selected.questionSlug}
                        sourceSlide={sourceSlide}
                        projection={selected.projection}
                        planSlide={planSlide}
                        slideIndex={index}
                        gap={gap}
                      />
                    )}
                  </article>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}
