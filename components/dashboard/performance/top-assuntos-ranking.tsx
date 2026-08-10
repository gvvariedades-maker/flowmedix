'use client';

import { motion } from 'framer-motion';
import { BookMarked, Heart, Pill, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AssuntoTop } from './types';

function iconForAssunto(nome: string): LucideIcon {
  const n = nome.toLowerCase();
  if (n.includes('anatom')) return Heart;
  if (n.includes('farma')) return Pill;
  return BookMarked;
}

export function TopAssuntosRanking({ assuntos }: { assuntos: AssuntoTop[] }) {
  if (assuntos.length === 0) return null;
  const ref = assuntos[0].count;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <TrendingUp
          className="h-4 w-4 text-[var(--color-success-text)]"
          aria-hidden
        />
        <span className="text-sm font-semibold text-foreground">Assuntos mais estudados</span>
        <span className="text-xs text-muted-foreground">últimos 30 dias</span>
      </div>
      <ul className="space-y-3">
        {assuntos.map((a, i) => {
          const Icon = iconForAssunto(a.nome);
          const pct = ref > 0 ? Math.round((a.count / ref) * 100) : 0;
          return (
            <li key={a.nome} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[10px] font-semibold text-muted-foreground">
                    {i + 1}
                  </span>
                  <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="truncate text-sm font-medium text-foreground">{a.nome}</span>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--color-success-text)]">
                  {a.count}
                </span>
              </div>
              <div className="ml-8 h-1.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.2, delay: 0.05 + i * 0.04, ease: 'easeOut' }}
                  className="h-full rounded-full bg-[var(--color-success)]"
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
