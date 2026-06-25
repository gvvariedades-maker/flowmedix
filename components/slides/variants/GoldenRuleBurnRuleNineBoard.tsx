'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Flame, Hand } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow, GoldenRuleRowEmphasis } from './GoldenRule';

const TONE_BY_EMPHASIS: Record<
  GoldenRuleRowEmphasis,
  {
    pill: string;
    pillActive: string;
    panelBg: string;
    panelBorder: string;
    panelInset: string;
    label: string;
    badge: string;
  }
> = {
  default: {
    pill: 'bg-slate-100/95 text-slate-800 border-slate-200/90',
    pillActive: 'bg-slate-200/90 text-slate-900 border-slate-300 ring-slate-300/50',
    panelBg: 'bg-slate-200/90',
    panelBorder: 'border-slate-300/90',
    panelInset: 'bg-slate-100/80 border-slate-200/70',
    label: 'text-slate-600',
    badge: 'bg-slate-200/80 text-slate-700',
  },
  highlight: {
    pill: 'bg-orange-100/95 text-orange-900 border-orange-200/90',
    pillActive: 'bg-orange-200/85 text-orange-950 border-orange-300 ring-orange-300/55',
    panelBg: 'bg-orange-200/85',
    panelBorder: 'border-orange-300/90',
    panelInset: 'bg-orange-100/75 border-orange-200/70',
    label: 'text-orange-700',
    badge: 'bg-orange-200/75 text-orange-800',
  },
  alert: {
    pill: 'bg-rose-100/95 text-rose-900 border-rose-200/90',
    pillActive: 'bg-rose-200/85 text-rose-950 border-rose-300 ring-rose-300/50',
    panelBg: 'bg-rose-200/85',
    panelBorder: 'border-rose-300/90',
    panelInset: 'bg-rose-100/75 border-rose-200/70',
    label: 'text-rose-700',
    badge: 'bg-rose-200/75 text-rose-800',
  },
  success: {
    pill: 'bg-teal-100/95 text-teal-900 border-teal-200/90',
    pillActive: 'bg-teal-200/85 text-teal-950 border-teal-300 ring-teal-300/50',
    panelBg: 'bg-teal-200/85',
    panelBorder: 'border-teal-300/90',
    panelInset: 'bg-teal-100/75 border-teal-200/70',
    label: 'text-teal-700',
    badge: 'bg-teal-200/75 text-teal-800',
  },
};

type BodyZone = 'cabeca' | 'tronco_ant' | 'tronco_post' | 'braco' | 'perna' | 'genital' | 'palma' | 'meta';

const ZONE_META: Record<
  BodyZone,
  { short: string; tag: string; pctAdult: string; pctChild?: string }
> = {
  cabeca: { short: 'Cabeça', tag: '9%', pctAdult: '9%', pctChild: '18%' },
  tronco_ant: { short: 'Tronco ant.', tag: '18%', pctAdult: '18%', pctChild: '18%' },
  tronco_post: { short: 'Tronco post.', tag: '18%', pctAdult: '18%', pctChild: '18%' },
  braco: { short: 'Membro sup.', tag: '9%', pctAdult: '9% cada', pctChild: '9% cada' },
  perna: { short: 'Membro inf.', tag: '18%', pctAdult: '18% cada', pctChild: '14% cada' },
  genital: { short: 'Genital', tag: '1%', pctAdult: '1%', pctChild: '1%' },
  palma: { short: 'Palma', tag: '1%', pctAdult: '1% (≈ SCQ)', pctChild: '1%' },
  meta: { short: 'Referência', tag: 'SCQ', pctAdult: '—', pctChild: '—' },
};

function inferZone(label: string, value: string): BodyZone {
  const text = `${label} ${value}`.toLowerCase();
  if (/cabeça|cabeça|face|couro cabeludo|crânio|cranio/.test(text)) return 'cabeca';
  if (/tronco anterior|abdome|tórax anterior|torax anterior|peito/.test(text)) return 'tronco_ant';
  if (/tronco posterior|dorso|costas|nuca/.test(text)) return 'tronco_post';
  if (/membro superior|braço|braco|antebraço|antebraco|mão|mao/.test(text)) return 'braco';
  if (/membro inferior|perna|coxa|panturrilha|tíbia|tibia/.test(text)) return 'perna';
  if (/genital|perineo|períneo/.test(text)) return 'genital';
  if (/palma|mão inteira|mao inteira|1%/.test(text)) return 'palma';
  return 'meta';
}

function inferBurnHint(row: GoldenRuleRow): string {
  const text = `${row.label} ${row.value}`.toLowerCase();
  if (/criança|crianca|pediátr|pediatric/.test(text)) {
    return 'Na criança, cabeça e pernas têm proporções diferentes — a banca troca 9% por 18% na cabeça.';
  }
  if (/cabeça|9%|18%/.test(text)) {
    return 'Adulto: cabeça = 9%. Criança: cabeça = 18% — pegadinha clássica da regra dos 9.';
  }
  if (/membro inferior|perna|18%|14%/.test(text)) {
    return 'Cada perna inteira = 18% no adulto; na criança cada perna ≈ 14%.';
  }
  if (/membro superior|braço|9%/.test(text)) {
    return 'Cada membro superior inteiro (braço + antebraço + mão) = 9%.';
  }
  if (/tronco|36%|18%/.test(text)) {
    return 'Tronco anterior + posterior somam 36% no adulto (18% + 18%).';
  }
  if (/tétano|tetano|vacina|soro/.test(text)) {
    return 'Profilaxia antitetânica depende do esquema vacinal e do tipo de ferida — queimadura exige atenção.';
  }
  if (/resfriar|água corrente|agua corrente|15 min|20 min/.test(text)) {
    return 'Resfriamento imediato com água corrente morna (15–20 min) — gelo direto é pegadinha.';
  }
  if (/gabarito|letra|resposta/.test(text)) {
    return 'Some os segmentos queimados antes de marcar a alternativa — SCQ guia gravidade e encaminhamento.';
  }
  return 'Relacione cada região com seu percentual antes de calcular a SCQ total.';
}

function inferBurnFixation(row: GoldenRuleRow, index: number, total: number): string {
  const emphasis = row.emphasis ?? 'default';
  if (emphasis === 'alert') return 'Percentual ou conduta errada — marque como falsa na prova.';
  if (emphasis === 'success' || emphasis === 'highlight') {
    return 'Referência correta — entra no cálculo da SCQ ou no gabarito.';
  }
  if (index === total - 1) return 'Última célula: some os % e volte às alternativas.';
  return `Zona ${index + 1}/${total} — decore o par região × percentual.`;
}

function defaultSelectedIndex(rows: GoldenRuleRow[]): number {
  const alertIdx = rows.findIndex((r) => r.emphasis === 'alert');
  if (alertIdx >= 0) return alertIdx;
  const successIdx = rows.findIndex((r) => r.emphasis === 'success');
  if (successIdx >= 0) return successIdx;
  return 0;
}

interface GoldenRuleBurnRuleNineBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

export function GoldenRuleBurnRuleNineBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleBurnRuleNineBoardProps) {
  const reduceMotion = useReducedMotion();
  const [selected, setSelected] = useState(() => defaultSelectedIndex(rows));
  const activeRow = rows[selected];
  const emphasis = activeRow?.emphasis ?? 'default';
  const tone = TONE_BY_EMPHASIS[emphasis];
  const zone = activeRow ? inferZone(activeRow.label, activeRow.value) : 'meta';
  const zoneMeta = ZONE_META[zone];

  const selectRow = useCallback((index: number) => {
    setSelected(index);
  }, []);

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-30`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-3.5">
        <div className="flex flex-col gap-1.5">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-200/80 bg-white/90 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-widest text-orange-700 shadow-sm">
            <Flame className="h-3 w-3" aria-hidden />
            Rule of 9
          </span>
          {content ? (
            <h2 className="font-display text-lg font-black leading-tight text-slate-900 md:text-xl">{content}</h2>
          ) : null}
          <p className="flex items-center gap-1.5 font-body text-xs font-medium text-slate-600">
            <Hand className="h-3.5 w-3.5 shrink-0 text-orange-600" aria-hidden />
            Toque cada região para ver o percentual de SCQ
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {rows.map((row, index) => {
            const isActive = selected === index;
            const rowEmphasis = row.emphasis ?? 'default';
            const rowTone = TONE_BY_EMPHASIS[rowEmphasis];
            const rowZone = inferZone(row.label, row.value);
            const rowZoneMeta = ZONE_META[rowZone];
            return (
              <button
                key={`${row.label}-${index}`}
                type="button"
                onClick={() => selectRow(index)}
                className={`cursor-pointer rounded-full border px-3 py-1.5 font-body text-xs font-semibold transition-all ${
                  isActive ? `${rowTone.pillActive} ring-2` : `${rowTone.pill} hover:shadow-sm active:scale-[0.98]`
                }`}
              >
                {rowZoneMeta.short}
                <span className="ml-1 font-mono text-[9px] opacity-70">{rowZoneMeta.tag}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeRow ? (
            <motion.div
              key={selected}
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              className={`overflow-hidden rounded-2xl border-2 shadow-xl ${tone.panelBorder} ${tone.panelBg}`}
            >
              <div className="border-b border-black/5 bg-white/60 px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`font-mono text-[9px] font-extrabold uppercase tracking-widest ${tone.label}`}>
                      {zoneMeta.short} · adulto {zoneMeta.pctAdult}
                      {zoneMeta.pctChild ? ` · criança ${zoneMeta.pctChild}` : ''}
                    </p>
                    <p className="font-display text-base font-black text-slate-900">{activeRow.label}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${tone.badge}`}>
                    {zoneMeta.tag}
                  </span>
                </div>
              </div>
              <div className={`mx-4 my-3 rounded-xl border px-3 py-2.5 ${tone.panelInset}`}>
                <p className="font-display text-sm font-extrabold leading-snug text-slate-900">{activeRow.value}</p>
              </div>
              <div className="space-y-2 px-4 pb-4">
                <p className="font-body text-sm leading-relaxed text-slate-800">{inferBurnHint(activeRow)}</p>
                <p className="flex items-center gap-1 font-body text-xs font-medium text-slate-500">
                  <ChevronDown className="h-3.5 w-3.5 rotate-[-90deg]" aria-hidden />
                  {inferBurnFixation(activeRow, selected, rows.length)}
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {footerRule ? (
          <p className="rounded-xl border border-orange-200/70 bg-white/90 px-3 py-2.5 text-center font-body text-xs italic text-orange-900/90 shadow-sm">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
