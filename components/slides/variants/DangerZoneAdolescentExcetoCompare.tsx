'use client';

import { useMemo, type ComponentType, type SVGProps } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRightLeft,
  Heart,
  ShieldAlert,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import type { DangerZoneItem } from './DangerZone';
import { BoardChrome, boardTone } from '../primitives';
import { cn } from '@/lib/utils';

interface DangerZoneAdolescentExcetoCompareProps {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
}

type RowIcon = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;

function isTransferItem(label: string): boolean {
  return /similares|transfer/i.test(label);
}

function iconForLabel(label: string): LucideIcon {
  const t = label.toLowerCase();
  if (/transfer|similar/.test(t)) return ArrowRightLeft;
  if (/contracep|orienta|aconselh/.test(t)) return Heart;
  if (/nutri|micronut|crescimento/.test(t)) return ShieldAlert;
  if (/fam[ií]lia/.test(t)) return Users;
  if (/ist|rastreio|dst/.test(t)) return ShieldAlert;
  if (/jarg|rebuscad|barreira|linguagem/.test(t)) return AlertTriangle;
  return AlertTriangle;
}

/** Uma linha curta para o corpo da faixa (poster). */
function oneLine(text: string, max = 96): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

/**
 * Slide 4 ética — poster clínico (prioridade + 3–4 faixas + tabela 1 col).
 * Economia visual: título + 1 linha; conduta tipográfica; transfer = grade.
 */
export function DangerZoneAdolescentExcetoCompare({
  content,
  items,
  theme,
  footerRule,
}: DangerZoneAdolescentExcetoCompareProps) {
  const reduceMotion = useReducedMotion();

  const { traps, transfers, heroLabel } = useMemo(() => {
    const rows = items.map((item, index) => {
      const label = item.label || item.title || `Item ${index + 1}`;
      const detail = item.detail || item.description || '';
      const correct = typeof item.correct === 'string' ? item.correct.trim() : '';
      const transfer = isTransferItem(label);
      return {
        label,
        detail,
        correct,
        transfer,
        Icon: iconForLabel(label) as RowIcon,
      };
    });
    const trapRows = rows.filter((r) => !r.transfer);
    return {
      traps: trapRows,
      transfers: rows.filter((r) => r.transfer),
      heroLabel: trapRows[0]?.label ?? 'Pegadinha',
    };
  }, [items]);

  if (items.length === 0) return null;

  const exceptionTone = boardTone('exception');
  const transferTone = boardTone('transfer');
  const commandTone = boardTone('command');

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.3}
      eyebrow="Pegadinhas — gravidez / sigilo / escuta"
      title={content || undefined}
      titleClassName="text-sm font-bold uppercase tracking-wide text-rose-900 md:text-base"
      footerLabel="Transferência"
      footerRule={footerRule}
      maxWidth="2xl"
      className="gap-2"
    >
      {/* Prioridade sempre × frase única */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-[auto_1fr] gap-1.5"
      >
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-2.5 py-2 shadow-sm',
            exceptionTone.badge,
            exceptionTone.badgeText,
          )}
        >
          <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
          <span className="whitespace-nowrap font-mono text-[10px] font-black uppercase tracking-wide">
            Pegadinha sempre
          </span>
        </div>
        <div
          className={cn(
            'flex items-center rounded-lg border px-3 py-2',
            exceptionTone.border,
            'bg-rose-50/80',
          )}
        >
          <p className="font-body text-[13px] font-semibold leading-snug text-rose-950">
            Atalho errado × acolher certo — tipo{' '}
            <span className="font-bold text-rose-700">{heroLabel}</span>.
          </p>
        </div>
      </motion.div>

      {/* 3–4 faixas protocolo (altura baixa) */}
      <div className="flex flex-col gap-1.5">
        {traps.map((row, i) => {
          const t = boardTone('exception');
          const Icon = row.Icon;
          const body = row.detail ? oneLine(row.detail, 110) : '';
          const conduta = row.correct ? oneLine(row.correct, 120) : '';
          return (
            <motion.div
              key={`trap-${row.label}-${i}`}
              initial={reduceMotion ? false : { opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduceMotion ? 0 : i * 0.02 }}
              className={cn(
                'grid grid-cols-[2.75rem_1fr] overflow-hidden rounded-lg border shadow-sm',
                t.border,
              )}
            >
              <div className={cn('flex items-center justify-center', t.badge, t.badgeText)}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
              </div>
              <div className="bg-gradient-to-r from-rose-50/70 to-white px-2.5 py-1.5">
                <p className={cn('font-body text-[12px] font-black uppercase tracking-wide', t.text)}>
                  {row.label}
                </p>
                {body ? (
                  <p className="mt-0.5 font-body text-[11px] leading-snug text-rose-900/80">
                    {body}
                  </p>
                ) : null}
                {conduta ? (
                  <p className="mt-0.5 font-body text-[11px] leading-snug text-emerald-800">
                    <span className="font-bold">Conduta: </span>
                    {conduta}
                  </p>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tabela 1 coluna — transferência (fecha o poster) */}
      {(transfers.length > 0 || footerRule) && (
        <div className="overflow-hidden rounded-lg border border-amber-300/80 shadow-sm">
          <div
            className={cn(
              'px-2.5 py-1.5 text-center',
              transferTone.badge,
              transferTone.badgeText,
            )}
          >
            <p className="font-mono text-[10px] font-black uppercase tracking-wider">
              Em similares — mesma regra
            </p>
          </div>
          <div className={cn('grid grid-cols-1', commandTone.badge)}>
            <div className="px-2 py-1 text-center font-mono text-[9px] font-bold uppercase tracking-wider text-white/95">
              Fixação de prova
            </div>
          </div>
          <div className="divide-y divide-amber-100 bg-amber-50/50">
            {transfers.map((row, i) => (
              <div key={`tf-${i}`} className="px-2.5 py-1.5">
                <p className="font-body text-[12px] font-semibold leading-snug text-amber-950">
                  {oneLine(row.correct || row.detail || row.label, 140)}
                </p>
              </div>
            ))}
            {transfers.length === 0 && footerRule ? (
              <div className="px-2.5 py-1.5">
                <p className="font-body text-[12px] font-semibold leading-snug text-amber-950">
                  {oneLine(footerRule, 140)}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </BoardChrome>
  );
}
