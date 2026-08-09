'use client';

import { useMemo, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Check,
  FlaskConical,
  Hospital,
  Pill,
  ShieldAlert,
  Syringe,
  type LucideIcon,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import { cn } from '@/lib/utils';

interface GoldenRuleFarmacoClinicoReferenceBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

const EMPHASIS_RE = /\b(?:não|nao|nunca|sem|sempre|bólus|bolus)\b/gi;

function EmphasisText({ text, className }: { text: string; className?: string }) {
  const nodes: ReactNode[] = [];
  let last = 0;
  const re = new RegExp(EMPHASIS_RE.source, 'gi');
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    nodes.push(
      <span key={`${match.index}-${match[0]}`} className="font-black text-fuchsia-700">
        {match[0]}
      </span>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <span className={className}>{nodes.length > 0 ? nodes : text}</span>;
}

function iconForLabel(label: string): LucideIcon {
  const t = label.toLowerCase();
  if (/dilui|solvent|soro/i.test(t)) return FlaskConical;
  if (/admin|infus|tempo|b[oó]lus/i.test(t)) return Syringe;
  if (/monitor|ph|ajuste/i.test(t)) return Activity;
  if (/via|sc\b|subcut/i.test(t)) return ShieldAlert;
  if (/anti[aá]cid|intera/i.test(t)) return AlertTriangle;
  if (/indica|úlcera|ulcera|hospital/i.test(t)) return Hospital;
  return Pill;
}

function findRow(rows: GoldenRuleRow[], re: RegExp): GoldenRuleRow | undefined {
  return rows.find((r) => re.test(r.label));
}

function shortTitle(content?: string): string {
  const raw = content?.trim() || 'OMEPRAZOL EV';
  return raw
    .replace(/\s*[—–-]\s*QUADRO RÁPIDO\s*/i, '')
    .replace(/\s*QUADRO RÁPIDO\s*[—–-]?\s*/i, '')
    .trim() || raw;
}

/**
 * Referência clínica EV — poster estático 100% barra G2.
 * Herói = monitorização; trilho diluir/infundir; traps ✗ na base.
 * Sem lentes / clique. JSON alimenta tudo.
 */
export function GoldenRuleFarmacoClinicoReferenceBoard({
  content,
  rows,
  theme: _theme,
  footerRule,
}: GoldenRuleFarmacoClinicoReferenceBoardProps) {
  const reduceMotion = useReducedMotion();

  const { title, indicacao, diluicao, administracao, monitor, traps } = useMemo(() => {
    const mon =
      findRow(rows, /monitor/i) ??
      rows.find((r) => r.badge === 'hot' || r.emphasis === 'success');
    const dil = findRow(rows, /dilui/i);
    const adm = findRow(rows, /admin|infus/i);
    const ind = findRow(rows, /indica/i);
    const used = new Set(
      [mon, dil, adm, ind].filter(Boolean).map((r) => r!.label),
    );
    return {
      title: shortTitle(content),
      indicacao: ind,
      diluicao: dil,
      administracao: adm,
      monitor: mon,
      traps: rows.filter((r) => !used.has(r.label)),
    };
  }, [rows, content]);

  if (rows.length === 0) return null;

  const protocolPair = [
    diluicao
      ? {
          row: diluicao,
          left: 'bg-violet-600',
          right: 'bg-violet-100 border-violet-300',
          title: 'text-violet-900',
          Icon: FlaskConical,
        }
      : null,
    administracao
      ? {
          row: administracao,
          left: 'bg-teal-600',
          right: 'bg-teal-100 border-teal-300',
          title: 'text-teal-900',
          Icon: Syringe,
        }
      : null,
  ].filter(Boolean) as Array<{
    row: GoldenRuleRow;
    left: string;
    right: string;
    title: string;
    Icon: LucideIcon;
  }>;

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto bg-[#faf8ff]">
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-col gap-3 px-3 py-3 md:gap-3.5 md:px-4 md:py-4">
        {/* Cabeçalho — massa + contexto */}
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border-2 border-indigo-700 bg-indigo-800 shadow-md"
        >
          <div className="px-3 py-2.5 text-center">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-indigo-200">
              Quadro rápido · IBP EV
            </p>
            <h2 className="font-display text-base font-black uppercase tracking-wide text-white md:text-lg">
              {title}
            </h2>
          </div>
          {indicacao ? (
            <div className="flex items-start gap-2 border-t border-indigo-600/80 bg-indigo-950/40 px-3 py-2">
              <Hospital className="mt-0.5 h-4 w-4 shrink-0 text-indigo-200" aria-hidden />
              <p className="min-w-0 text-left font-body text-xs font-semibold leading-snug text-indigo-50 sm:text-sm">
                <span className="font-black uppercase tracking-wide text-indigo-200">
                  {indicacao.label}:{' '}
                </span>
                {indicacao.value}
              </p>
            </div>
          ) : null}
        </motion.header>

        {/* HERÓI — monitorização (decisão que a banca cobra) */}
        {monitor ? (
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.04 }}
            aria-label={`Herói — ${monitor.label}`}
            className="relative overflow-hidden rounded-2xl border-[3px] border-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-3 shadow-md ring-2 ring-emerald-200/70 md:p-3.5"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm ring-2 ring-white">
                <Check className="h-7 w-7" strokeWidth={3} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-700">
                  Âncora de prova · mantenha
                </p>
                <p className="mt-0.5 font-display text-sm font-black uppercase tracking-wide text-emerald-950 md:text-base">
                  {monitor.label}
                </p>
                <p className="mt-1 font-body text-sm font-bold leading-snug text-slate-900 md:text-[0.95rem]">
                  <EmphasisText text={monitor.value} />
                </p>
              </div>
            </div>
          </motion.section>
        ) : null}

        {/* Trilho protocolo — diluir × infundir */}
        {protocolPair.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-violet-700">
              Trilho seguro
            </p>
            {protocolPair.map(({ row, left, right, title: titleCls, Icon }, index) => (
              <motion.div
                key={`proto-${row.label}`}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.06 + index * 0.03 }}
                className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-1.5 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-2"
              >
                <div
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2.5 text-white shadow-sm',
                    left,
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2.25} aria-hidden />
                  <span className="px-0.5 text-center font-display text-[8px] font-black uppercase leading-none tracking-wide">
                    {row.label.split(/\s+/)[0]}
                  </span>
                </div>
                <div
                  className={cn(
                    'flex min-w-0 items-center rounded-2xl border-2 px-3 py-2.5 shadow-sm',
                    right,
                  )}
                >
                  <p className="font-body text-sm font-semibold leading-snug text-slate-900">
                    <span className={cn('mr-1.5 font-display text-[11px] font-black uppercase', titleCls)}>
                      {row.label}
                    </span>
                    <EmphasisText text={row.value} />
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}

        {/* Traps — polaridade ✗ (o que NÃO fazer) */}
        {traps.length > 0 ? (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.12 }}
            className="flex flex-col gap-1.5"
          >
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-fuchsia-700">
              Vedações — não marque isto
            </p>
            <div className="grid grid-cols-[2.5rem_5.75rem_minmax(0,1fr)] gap-1.5 sm:grid-cols-[2.75rem_6.5rem_minmax(0,1fr)]">
              {['✗', 'Marco', 'Regra'].map((h) => (
                <div
                  key={h}
                  className="rounded-xl bg-violet-950 px-1.5 py-1.5 text-center font-display text-[10px] font-black uppercase tracking-wide text-white"
                >
                  {h}
                </div>
              ))}
            </div>
            {traps.map((row) => {
              const Icon = iconForLabel(row.label);
              return (
                <div
                  key={`trap-${row.label}`}
                  className="grid grid-cols-[2.5rem_5.75rem_minmax(0,1fr)] gap-1.5 sm:grid-cols-[2.75rem_6.5rem_minmax(0,1fr)]"
                >
                  <div className="flex items-center justify-center rounded-xl border-2 border-rose-300 bg-rose-100 text-rose-700">
                    <span className="font-display text-base font-black" aria-label="vedado">
                      ✗
                    </span>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 border-fuchsia-300 bg-fuchsia-100 px-1 py-2 text-fuchsia-950">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    <span className="text-center font-display text-[10px] font-black uppercase leading-tight">
                      {row.label}
                    </span>
                  </div>
                  <div className="flex items-center rounded-xl border-2 border-fuchsia-200 bg-fuchsia-50 px-2.5 py-2 font-body text-xs font-semibold leading-snug text-slate-900 sm:text-sm">
                    <EmphasisText text={row.value} />
                  </div>
                </div>
              );
            })}
          </motion.div>
        ) : null}

        {footerRule ? (
          <div className="rounded-2xl border-2 border-violet-800 bg-violet-950 px-3 py-2.5 text-center shadow-md">
            <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-violet-300">
              Fixação de prova
            </p>
            <p className="mt-0.5 font-body text-sm font-bold leading-snug text-white">
              {footerRule}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
