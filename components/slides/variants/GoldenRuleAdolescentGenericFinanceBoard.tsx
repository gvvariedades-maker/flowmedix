'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { BoardChrome, SoftRealIcon } from '../primitives';
import { cn } from '@/lib/utils';

type HubRow = {
  label?: string;
  value?: string;
  badge?: string;
};

interface GoldenRuleAdolescentGenericFinanceBoardProps {
  content?: string;
  rows?: HubRow[];
  theme: ThemeColors;
  footerRule?: string;
}

/**
 * Slide 3 genérico — checklist estilo “financiamento SUS” + caixa destaque. Estático.
 */
export function GoldenRuleAdolescentGenericFinanceBoard({
  content,
  rows = [],
  theme,
  footerRule,
}: GoldenRuleAdolescentGenericFinanceBoardProps) {
  const reduceMotion = useReducedMotion();

  const items = useMemo(
    () =>
      rows.slice(0, 6).map((row, index) => ({
        key: `${row.label}-${index}`,
        label: (row.label || `Item ${index + 1}`).trim(),
        value: (row.value || '').trim(),
      })),
    [rows],
  );

  if (items.length === 0 && !content) return null;

  return (
    <BoardChrome theme={theme} washOpacity={0.12} maxWidth="lg">
      <header className="text-center">
        <h2 className="font-display text-lg font-black leading-snug text-[#0B3A6E] md:text-xl">
          {content ? (
            <>
              <span className="text-[#0B3A6E]">{content.split(':')[0]}</span>
              {content.includes(':') ? (
                <span className="text-[#1A73E8]">:{content.slice(content.indexOf(':') + 1)}</span>
              ) : null}
            </>
          ) : (
            'Decore o que a banca cobra'
          )}
        </h2>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white px-3 py-3 shadow-lg shadow-slate-900/5 sm:px-4">
        <ul className="flex flex-col gap-2.5">
          {items.map((item, index) => (
            <motion.li
              key={item.key}
              initial={reduceMotion ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.035 }}
              className="flex items-start gap-3"
            >
              <SoftRealIcon name="Check" tone="sky" size="sm" className="mt-0.5" />
              <div className="min-w-0">
                <p className="font-display text-sm font-black text-[#0B3A6E]">{item.label}</p>
                {item.value ? (
                  <p className="mt-0.5 font-body text-sm font-semibold leading-snug text-slate-700">
                    {item.value}
                  </p>
                ) : null}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      {footerRule ? (
        <div
          className={cn(
            'flex items-start gap-3 rounded-2xl border-2 border-[#D4A017] bg-white px-3 py-3 shadow-sm',
          )}
        >
          <SoftRealIcon name="Shield" tone="teal" size="md" />
          <p className="font-body text-sm font-bold leading-snug text-[#0B3A6E]">{footerRule}</p>
        </div>
      ) : null}
    </BoardChrome>
  );
}
