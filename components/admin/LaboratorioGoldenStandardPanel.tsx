'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, BookOpen, ChevronDown, ChevronUp, X } from 'lucide-react';
import type { GoldenContentLintIssue } from '@/lib/goldenContentStandard';

interface LaboratorioGoldenStandardPanelProps {
  issues: GoldenContentLintIssue[];
  onClose?: () => void;
}

export function LaboratorioGoldenStandardPanel({
  issues,
  onClose,
}: LaboratorioGoldenStandardPanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (issues.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 overflow-hidden rounded-xl border border-amber-500/30 bg-amber-950/40"
    >
      <div className="flex items-center justify-between gap-3 border-b border-amber-500/20 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <span className="text-sm font-medium text-amber-100">
            GOLDEN v1 — {issues.length} aviso{issues.length === 1 ? '' : 's'}
          </span>
          <span className="text-xs text-amber-200/70">(não bloqueia salvamento)</span>
          {expanded ? (
            <ChevronUp className="ml-auto h-4 w-4 text-amber-300" />
          ) : (
            <ChevronDown className="ml-auto h-4 w-4 text-amber-300" />
          )}
        </button>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-amber-300 hover:bg-amber-500/10"
            aria-label="Fechar avisos GOLDEN"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      <AnimatePresence>
        {expanded ? (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="divide-y divide-amber-500/10"
          >
            {issues.map((issue, index) => (
              <li key={`${issue.code}-${index}`} className="px-4 py-3">
                <div className="flex items-start gap-2">
                  <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400/80" />
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-amber-300/90">{issue.code}</p>
                    <p className="text-sm text-amber-50/90">{issue.message}</p>
                    {issue.path ? (
                      <p className="mt-1 text-xs text-amber-200/60">{issue.path}</p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
