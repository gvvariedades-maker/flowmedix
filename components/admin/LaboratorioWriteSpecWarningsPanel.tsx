'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldCheck, X } from 'lucide-react';
import type { QuestaoWriteIssue } from '@/lib/questaoSpec';

interface LaboratorioWriteSpecWarningsPanelProps {
  warnings: QuestaoWriteIssue[];
  specVersion: string;
  onClose?: () => void;
}

const LAYER_LABEL: Record<string, string> = {
  premium_gate: 'Premium gate',
  golden_v1: 'GOLDEN v1',
};

export function LaboratorioWriteSpecWarningsPanel({
  warnings,
  specVersion,
  onClose,
}: LaboratorioWriteSpecWarningsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (warnings.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 overflow-hidden rounded-xl border border-sky-500/30 bg-sky-950/30"
    >
      <div className="flex items-center justify-between gap-3 border-b border-sky-500/20 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <ShieldCheck className="h-4 w-4 shrink-0 text-sky-400" />
          <span className="text-sm font-medium text-sky-100">
            Write spec {specVersion} — {warnings.length} aviso{warnings.length === 1 ? '' : 's'}
          </span>
          <span className="text-xs text-sky-200/70">(não bloqueia publicação)</span>
          {expanded ? (
            <ChevronUp className="ml-auto h-4 w-4 text-sky-300" />
          ) : (
            <ChevronDown className="ml-auto h-4 w-4 text-sky-300" />
          )}
        </button>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-sky-300 hover:bg-sky-500/10"
            aria-label="Fechar avisos do write spec"
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
            className="divide-y divide-sky-500/10"
          >
            {warnings.map((issue, index) => (
              <li key={`${issue.code}-${index}`} className="px-4 py-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-400/80" />
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-sky-300/90">
                      {LAYER_LABEL[issue.layer] ?? issue.layer} · {issue.code}
                    </p>
                    <p className="text-sm text-sky-50/90">{issue.message}</p>
                    {issue.path ? (
                      <p className="mt-1 text-xs text-sky-200/60">{issue.path}</p>
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
