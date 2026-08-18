'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Check, AlertTriangle, Target } from 'lucide-react';
import { SlideLucideIcon } from '../core/SlideLucideIcon';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  extractMeasuredValue,
  inferSvIconName,
  inferSvReferenceRange,
  inferSvShortLabel,
  isConclusionRow,
  isSvNormativeRangeText,
  resolveSvKindForRow,
  rowHasMeasuredVital,
  shouldShowSvReferenceRange,
  svDisplayTextsNearDuplicate,
} from '@/lib/slides/vitalsSlideUtils';

interface GoldenRuleVitalsReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

type CardTone = {
  card: string;
  badge: string;
  badgeText: string;
  value: string;
  iconWrap: string;
  Icon: typeof Check;
};

/** Eixos Glasgow / meta com massa colorida distinta (anti-monocromia TÉCNICA). */
function glasgowMetaTone(label: string, badge?: GoldenRuleRow['badge']): CardTone | null {
  const L = label.toLowerCase();
  if (/ocular|olhos?|abertura ocular/.test(L)) {
    return {
      card: 'border-2 border-sky-300 border-l-[5px] border-l-sky-500 bg-gradient-to-br from-sky-100 via-cyan-50 to-sky-50 shadow-md shadow-sky-500/15',
      badge: 'bg-sky-600 text-white',
      badgeText: 'OCULAR',
      value: 'text-sky-950',
      iconWrap: 'bg-sky-600 text-white shadow-md shadow-sky-500/30',
      Icon: Target,
    };
  }
  if (/verbal|fala|resposta verbal/.test(L)) {
    return {
      card: 'border-2 border-violet-300 border-l-[5px] border-l-violet-500 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-violet-50 shadow-md shadow-violet-500/15',
      badge: 'bg-violet-700 text-white',
      badgeText: 'VERBAL',
      value: 'text-violet-950',
      iconWrap: 'bg-violet-700 text-white shadow-md shadow-violet-500/30',
      Icon: Target,
    };
  }
  if (/motor|resposta motora/.test(L)) {
    return {
      card: 'border-2 border-emerald-300 border-l-[5px] border-l-emerald-500 bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-50 shadow-md shadow-emerald-500/15',
      badge: 'bg-emerald-600 text-white',
      badgeText: 'MOTOR',
      value: 'text-emerald-950',
      iconWrap: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30',
      Icon: Check,
    };
  }
  if (/este caso|soma|pontua/.test(L) || badge === 'hot') {
    return {
      card: 'border-2 border-amber-300 border-l-[5px] border-l-amber-500 bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-50 shadow-md shadow-amber-500/20',
      badge: 'bg-amber-600 text-white',
      badgeText: 'ESTE CASO',
      value: 'text-amber-950',
      iconWrap: 'bg-amber-600 text-white shadow-md shadow-amber-500/30',
      Icon: AlertTriangle,
    };
  }
  if (/classifica|faixa|total\b|grave|moderado|leve/.test(L)) {
    return {
      card: 'border-2 border-indigo-300 border-l-[5px] border-l-indigo-500 bg-gradient-to-br from-indigo-100 via-slate-50 to-indigo-50 shadow-md shadow-indigo-500/15',
      badge: 'bg-indigo-700 text-white',
      badgeText: 'FAIXA',
      value: 'text-indigo-950',
      iconWrap: 'bg-indigo-700 text-white shadow-md shadow-indigo-500/30',
      Icon: Target,
    };
  }
  return null;
}

function statusTone(
  emphasis: GoldenRuleRow['emphasis'],
  row?: GoldenRuleRow,
): CardTone {
  const glasgow = row ? glasgowMetaTone(row.label, row.badge) : null;
  if (glasgow) return glasgow;

  if (emphasis === 'alert') {
    return {
      card: 'border-2 border-amber-300 border-l-[5px] border-l-amber-500 bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50 shadow-md shadow-amber-500/15',
      badge: 'bg-amber-600 text-white',
      badgeText: 'ALTERADO',
      value: 'text-amber-950',
      iconWrap: 'bg-amber-600 text-white shadow-md shadow-amber-500/30',
      Icon: AlertTriangle,
    };
  }
  if (emphasis === 'success') {
    return {
      card: 'border-2 border-emerald-300 border-l-[5px] border-l-emerald-500 bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-50 shadow-md shadow-emerald-500/15',
      badge: 'bg-emerald-600 text-white',
      badgeText: 'NORMAL',
      value: 'text-emerald-950',
      iconWrap: 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30',
      Icon: Check,
    };
  }
  if (row?.badge === 'warn') {
    return {
      card: 'border-2 border-violet-300 border-l-[5px] border-l-violet-500 bg-gradient-to-br from-violet-100 via-fuchsia-50 to-amber-50 shadow-md shadow-violet-500/15',
      badge: 'bg-violet-700 text-white',
      badgeText: 'ALERTA',
      value: 'text-violet-950',
      iconWrap: 'bg-violet-700 text-white shadow-md shadow-violet-500/30',
      Icon: AlertTriangle,
    };
  }
  return {
    card: 'border-2 border-rose-300 border-l-[5px] border-l-rose-500 bg-gradient-to-br from-rose-100 via-pink-50 to-sky-50 shadow-md shadow-rose-500/15',
    badge: 'bg-rose-600 text-white',
    badgeText: 'REFERÊNCIA',
    value: 'text-rose-950',
    iconWrap: 'bg-rose-600 text-white shadow-md shadow-rose-500/30',
    Icon: Target,
  };
}

/** Destaque full-width: cálculo do caso / classificação (evita card órfão no grid 2). */
function isSpotlightMetaRow(label: string, value: string): boolean {
  const text = `${label} ${value}`.toLowerCase();
  return /este caso|classifica\w*|faixa glasgow/.test(text);
}

function splitGlasgowScaleLines(value: string): string[] | null {
  const parts = value
    .split(/\s*[·•|]\s*/)
    .map((p) => p.trim())
    .filter(Boolean);
  // Escala O/V/M: "4 espontânea · 3 à voz · …"
  if (parts.length >= 3 && parts.every((p) => /^\d+\b/.test(p))) {
    return parts;
  }
  // Classificação: "Grave ≤8 · moderado 9–12 · leve 13–15"
  if (
    parts.length >= 2 &&
    /grave|moderado|leve|≤|<=|\d+\s*[–-]\s*\d+/i.test(value)
  ) {
    return parts;
  }
  return null;
}

function VitalReferenceCard({
  row,
  index,
  fullWidth = false,
}: {
  row: GoldenRuleRow;
  index: number;
  fullWidth?: boolean;
}) {
  const svKind = resolveSvKindForRow(row);
  const hasMeasured = rowHasMeasuredVital(row.label, row.value);
  const isMeta = svKind === 'meta' || svKind === 'other' || !hasMeasured;
  const normativeRange = isSvNormativeRangeText(`${row.label} ${row.value}`);
  // Tabela normativa ≠ status do paciente: não pintar NORMAL/ALTERADO em faixa de referência
  const emphasis =
    isMeta || normativeRange
      ? row.emphasis === 'alert'
        ? 'alert'
        : 'default'
      : (row.emphasis ?? 'default');
  const tone = statusTone(emphasis, row);
  const StatusIcon = tone.Icon;
  const iconName = inferSvIconName(`${row.label} ${row.value}`, svKind);
  const measured = isMeta ? row.value : extractMeasuredValue(row.label, row.value);
  const referenceRaw = shouldShowSvReferenceRange(row.label, row.value, svKind)
    ? inferSvReferenceRange(`${row.label} ${row.value}`, svKind)
    : '';
  const reference =
    referenceRaw && !svDisplayTextsNearDuplicate(referenceRaw, measured) ? referenceRaw : '';
  const svLabel = isConclusionRow(row.label, row.value)
    ? 'Gabarito'
    : isMeta
      ? row.label
      : inferSvShortLabel(`${row.label} ${row.value}`, svKind);
  const glasgowTone = glasgowMetaTone(row.label, row.badge);
  const badgeText = isConclusionRow(row.label, row.value)
    ? 'GABARITO'
    : glasgowTone
      ? glasgowTone.badgeText
      : isMeta
        ? emphasis === 'alert'
          ? 'ALERTA'
          : 'TÉCNICA'
        : normativeRange
          ? 'REFERÊNCIA'
          : tone.badgeText;
  const showValueDetail =
    Boolean(row.value?.trim()) &&
    !svDisplayTextsNearDuplicate(row.value, measured) &&
    !(reference && svDisplayTextsNearDuplicate(row.value, reference));
  const reduceMotion = useReducedMotion();
  // Faixa normativa ou prosa técnica NÃO usa tipografia de número aferido (evita "36–37,5 °C normotermia…" gigante)
  const heroIsProse =
    isMeta ||
    !hasMeasured ||
    normativeRange ||
    /normoterm|leitura|r[aá]pida|lenta|exige|colabor|core|meses|pavilh|custo|intermedi/i.test(
      row.value,
    );
  const heroText = isMeta || heroIsProse ? row.value : measured;
  const scaleLines = heroIsProse ? splitGlasgowScaleLines(row.value) : null;

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : index * 0.06 }}
      className={`min-w-0 w-full overflow-hidden rounded-[1.25rem] ${tone.card} ${
        fullWidth ? 'sm:col-span-2' : ''
      }`}
    >
      <div className="flex min-w-0 flex-col gap-2.5 p-3.5 md:p-4">
        <div className="flex min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.iconWrap}`}
            >
              <SlideLucideIcon name={iconName} className="h-5 w-5 text-white" />
            </div>
            <p className="min-w-0 truncate font-mono text-[10px] font-bold uppercase tracking-widest text-slate-600 md:text-[11px]">
              {svLabel}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest shadow-sm ${tone.badge}`}
          >
            {badgeText}
          </span>
        </div>

        {scaleLines ? (
          <ul className="flex min-w-0 list-none flex-col gap-1.5 pl-0">
            {scaleLines.map((line) => (
              <li
                key={line}
                className={`min-w-0 break-words rounded-lg border border-white/70 bg-white/75 px-3 py-1.5 font-display text-sm font-extrabold leading-snug ${tone.value} md:text-[0.95rem]`}
              >
                {line}
              </li>
            ))}
          </ul>
        ) : (
          <p
            className={`min-w-0 break-words font-display font-extrabold leading-snug ${tone.value} ${
              heroIsProse ? 'text-sm md:text-[0.95rem] normal-case' : 'text-lg tabular-nums md:text-xl'
            }`}
          >
            {heroText}
          </p>
        )}

        {reference && !heroIsProse ? (
          <p className="break-words font-body text-xs text-slate-500">
            Faixa de referência:{' '}
            <span className="font-semibold text-slate-700">{reference}</span>
          </p>
        ) : null}

        {showValueDetail && !heroIsProse ? (
          <div className="flex min-w-0 items-start gap-2 rounded-xl border border-white/80 bg-white/70 px-3 py-2.5">
            <StatusIcon className={`mt-0.5 h-4 w-4 shrink-0 ${tone.value}`} aria-hidden />
            <p
              className={`min-w-0 break-words font-display text-sm font-extrabold leading-snug tracking-wide md:text-base ${tone.value}`}
            >
              {row.value}
            </p>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export function GoldenRuleVitalsReferenceBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleVitalsReferenceBoardProps) {
  const reduceMotion = useReducedMotion();
  const vitalRows = rows.filter((row) => !isConclusionRow(row.label, row.value));
  const conclusionRows = rows.filter((row) => isConclusionRow(row.label, row.value));
  const axisRows = vitalRows.filter((row) => !isSpotlightMetaRow(row.label, row.value));
  const spotlightRows = vitalRows.filter((row) => isSpotlightMetaRow(row.label, row.value));
  const title = content?.trim();
  // Sempre 1 coluna: texto legível (evita quebra letra-a-letra em grid 3 col estreito)
  const hasGlasgowAxes = axisRows.some((row) => glasgowMetaTone(row.label, row.badge));

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-3 md:p-5">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-3 md:gap-4">
        {title ? (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-full border border-rose-200/80 bg-white/80 px-4 py-2 text-center font-mono text-[10px] font-bold uppercase tracking-widest text-rose-800 shadow-sm md:text-[11px]"
          >
            {title.length <= 72 ? title : 'Referência de sinais vitais'}
          </motion.p>
        ) : null}

        {axisRows.length > 0 ? (
          <div
            className={`grid grid-cols-1 gap-3 md:gap-4 ${
              hasGlasgowAxes ? '' : 'sm:grid-cols-2'
            }`}
          >
            {axisRows.map((row, index) => (
              <VitalReferenceCard key={`${row.label}-${index}`} row={row} index={index} />
            ))}
          </div>
        ) : null}

        {spotlightRows.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 md:gap-4">
            {spotlightRows.map((row, index) => (
              <VitalReferenceCard
                key={`spotlight-${row.label}-${index}`}
                row={row}
                index={axisRows.length + index}
                fullWidth
              />
            ))}
          </div>
        ) : null}

        {conclusionRows.map((row, index) => (
          <motion.div
            key={`conclusion-${index}`}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: reduceMotion ? 0 : 0.2 + index * 0.05 }}
            className="rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50 via-white to-yellow-50 px-4 py-4 text-center shadow-md ring-1 ring-amber-200/50 md:px-6 md:py-5"
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-amber-700">
              {row.label || 'Conclusão'}
            </p>
            <p className="mt-1 font-display text-xl font-black uppercase tracking-wide text-amber-900 md:text-2xl">
              {row.value}
            </p>
          </motion.div>
        ))}

        {footerRule ? (
          <p
            className={`rounded-xl border px-4 py-3 text-center font-body text-sm italic leading-relaxed md:text-base ${theme.borderColor} ${theme.iconBg} ${theme.textSecondary}`}
          >
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
