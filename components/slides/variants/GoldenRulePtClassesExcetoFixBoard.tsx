'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, HelpCircle, X } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { BoardChrome } from '../primitives';

interface GoldenRulePtClassesExcetoFixBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

type Skin = {
  ruleBg: string;
  ruleText: string;
  accent: string;
  ring: string;
};

const SKINS: Skin[] = [
  {
    ruleBg: 'bg-[#7c5cbf]',
    ruleText: 'text-white',
    accent: 'text-[#7c5cbf]',
    ring: 'ring-[#7c5cbf]/30',
  },
  {
    ruleBg: 'bg-[#f08a24]',
    ruleText: 'text-white',
    accent: 'text-[#e67e22]',
    ring: 'ring-[#f08a24]/30',
  },
  {
    ruleBg: 'bg-[#4a9fe0]',
    ruleText: 'text-white',
    accent: 'text-[#2980b9]',
    ring: 'ring-[#4a9fe0]/30',
  },
  {
    ruleBg: 'bg-rose-600',
    ruleText: 'text-white',
    accent: 'text-rose-700',
    ring: 'ring-rose-300/40',
  },
];

function stripNum(label: string): string {
  return label.replace(/^\d+\s*[.)·\-–—]\s*/i, '').trim();
}

function renderRich(text: string, accent: string): ReactNode {
  const parts = text.split(/(«[^»]+»)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith('«') && part.endsWith('»')) {
      return (
        <strong key={i} className={`font-black ${accent}`}>
          {part.slice(1, -1)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function rowKind(label: string): 'teste' | 'locucao' | 'substantivo' | 'exceto' | 'other' {
  const t = stripNum(label)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (/teste|pergunte|funcao|troque/.test(t)) return 'teste';
  if (/locucao|adverb|causal|comparat|advers/.test(t)) return 'locucao';
  if (/substant|nucleo|nomeia|explicat/.test(t)) return 'substantivo';
  if (/exceto|excecao|intruso|incorreto/.test(t)) return 'exceto';
  return 'other';
}

/**
 * Slide 3 EXCETO — mesma família visual do print (regra colorida + FIXAÇÃO).
 * Protocolo rows: TESTE · LOCUÇÃO · SUBSTANTIVO · EXCETO · footer_rule.
 */
export function GoldenRulePtClassesExcetoFixBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRulePtClassesExcetoFixBoardProps) {
  const reduceMotion = useReducedMotion();

  const { teste, locucao, substantivo, exceto, rest } = useMemo(() => {
    let testeR: GoldenRuleRow | undefined;
    let locucaoR: GoldenRuleRow | undefined;
    let substantivoR: GoldenRuleRow | undefined;
    let excetoR: GoldenRuleRow | undefined;
    const other: GoldenRuleRow[] = [];
    for (const row of rows) {
      const k = rowKind(row.label);
      if (k === 'teste' && !testeR) testeR = row;
      else if (k === 'locucao' && !locucaoR) locucaoR = row;
      else if (k === 'substantivo' && !substantivoR) substantivoR = row;
      else if (k === 'exceto' && !excetoR) excetoR = row;
      else other.push(row);
    }
    return {
      teste: testeR,
      locucao: locucaoR,
      substantivo: substantivoR,
      exceto: excetoR,
      rest: other,
    };
  }, [rows]);

  if (rows.length === 0) return null;

  const valorMode = /causa|explica|valor|como/i.test(
    `${content || ''} ${rows.map((r) => `${r.label} ${r.value}`).join(' ')}`,
  );

  const pairRows = [
    locucao
      ? {
          key: 'loc',
          title: stripNum(locucao.label),
          rule: valorMode ? 'Uso que bate — manter' : 'Modifica o verbo — manter',
          value: locucao.value,
          ok: true,
          skin: SKINS[0]!,
        }
      : null,
    substantivo
      ? {
          key: 'sub',
          title: stripNum(substantivo.label),
          // valor_incorreto: definição correta do explicativo (✓) — a pegadinha fica no banner INCORRETO
          rule: valorMode
            ? 'Explicativo de verdade — afirmativa'
            : 'Nomeia o período — EXCEÇÃO',
          value: substantivo.value,
          ok: valorMode ? true : false,
          skin: SKINS[2]!,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    title: string;
    rule: string;
    value: string;
    ok: boolean;
    skin: Skin;
  }>;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.2}
      footerRule={undefined}
      maxWidth="2xl"
      className="gap-3"
    >
      <h2 className="text-center font-display text-xl font-black uppercase tracking-wide text-slate-900 md:text-2xl">
        {(content || 'ADVÉRBIO × SUBSTANTIVO').split(/\s*[×x]\s*/).map((part, i, arr) => (
          <span key={i}>
            {i === arr.length - 1 ? (
              <span className="text-emerald-600">{part.trim()}</span>
            ) : (
              <span>
                {part.trim()} <span className="text-slate-400">×</span>{' '}
              </span>
            )}
          </span>
        ))}
      </h2>

      {teste ? (
        <div className="flex items-start gap-3 rounded-2xl border border-violet-200/80 bg-violet-50/95 px-3 py-3 shadow-sm">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7c5cbf] text-white shadow-sm">
            <HelpCircle className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-black uppercase tracking-wider text-violet-800">
              {stripNum(teste.label)}
            </p>
            <p className="mt-0.5 font-display text-base font-bold leading-snug text-slate-900">
              {renderRich(teste.value, 'text-[#7c5cbf]')}
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2.5">
        {pairRows.map((row, index) => (
          <motion.div
            key={row.key}
            initial={reduceMotion ? false : { y: 8 }}
            animate={{ y: 0 }}
            transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.15) }}
            className="grid grid-cols-1 items-stretch gap-2 md:grid-cols-[minmax(9rem,0.9fr)_1fr]"
          >
            <div
              className={`flex flex-col justify-center rounded-2xl px-3 py-3 shadow-md ${row.skin.ruleBg} ${row.skin.ruleText}`}
            >
              <p className="font-mono text-[9px] font-black uppercase tracking-wider opacity-90">
                {row.title}
              </p>
              <p className="mt-1 font-display text-sm font-bold leading-snug">{row.rule}</p>
            </div>
            <div
              className={`relative flex items-center rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm ring-1 ${row.skin.ring}`}
            >
              <p className="pr-8 font-body text-sm font-semibold leading-snug text-slate-800">
                {renderRich(row.value, row.skin.accent)}
              </p>
              <span
                className={`absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-sm ${
                  row.ok ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              >
                {row.ok ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                ) : (
                  <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                )}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {exceto ? (
        <div
          className={`rounded-2xl px-3 py-3 shadow-md ring-1 ${SKINS[3]!.ruleBg} ${SKINS[3]!.ruleText} ${SKINS[3]!.ring}`}
        >
          <p className="font-mono text-[9px] font-black uppercase tracking-wider opacity-90">
            {stripNum(exceto.label)}
          </p>
          <p className="mt-1 font-display text-sm font-bold leading-snug">
            {renderRich(exceto.value, 'text-amber-200')}
          </p>
        </div>
      ) : null}

      {rest.map((row, i) => (
        <div
          key={`rest-${i}`}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
        >
          <span className="font-mono text-[10px] font-black uppercase text-slate-500">
            {stripNum(row.label)} —{' '}
          </span>
          {row.value}
        </div>
      ))}

      {footerRule ? (
        <div className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-md">
          <p className="bg-slate-900 px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-widest text-amber-300">
            Fixação
          </p>
          <p className="px-3 py-3 text-center font-display text-base font-black uppercase tracking-wide md:text-lg">
            {footerRule}
          </p>
        </div>
      ) : null}
    </BoardChrome>
  );
}
