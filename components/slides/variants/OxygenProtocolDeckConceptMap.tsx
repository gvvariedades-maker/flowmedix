'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';

export interface ProtocolDeckConcept {
  icon: string;
  title: string;
  description: string;
}

type DeckSlot = 'prompt' | 'answer' | 'tag' | 'extra';

function inferSlot(title: string, description: string): DeckSlot {
  const text = `${title} ${description}`.toLowerCase();
  if (/gabarito|resposta|letra\s*[a-e]\s*—/i.test(text)) return 'answer';
  if (/parâmetro|parametro|enunciado|comando/i.test(text)) return 'prompt';
  if (/protocolo|prioridade|comparativo|dispositivo/i.test(text)) return 'tag';
  return 'extra';
}

const TAG_COLORS = [
  'bg-gradient-to-br from-sky-100 to-blue-100/90 text-blue-900 border-blue-300/70 shadow-sm shadow-blue-100/50',
  'bg-gradient-to-br from-violet-100 to-purple-100/90 text-violet-900 border-violet-300/70 shadow-sm shadow-violet-100/50',
  'bg-gradient-to-br from-teal-100 to-cyan-100/90 text-teal-900 border-teal-300/70 shadow-sm shadow-teal-100/50',
];

interface OxygenProtocolDeckConceptMapProps {
  concepts: ProtocolDeckConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

export function OxygenProtocolDeckConceptMap({
  concepts,
  theme,
  footerRule,
}: OxygenProtocolDeckConceptMapProps) {
  const [expanded, setExpanded] = useState(false);

  const { prompt, answer, tags, extras } = useMemo(() => {
    const promptItem = concepts.find((c) => inferSlot(c.title, c.description) === 'prompt');
    const answerItem = concepts.find((c) => inferSlot(c.title, c.description) === 'answer');
    const tagItems = concepts.filter((c) => inferSlot(c.title, c.description) === 'tag');
    const extraItems = concepts.filter(
      (c) => inferSlot(c.title, c.description) === 'extra' && c !== promptItem && c !== answerItem,
    );
    return {
      prompt: promptItem ?? concepts[0],
      answer: answerItem ?? concepts.find((c) => /letra/i.test(c.description)),
      tags: tagItems.length > 0 ? tagItems : concepts.slice(0, 3).filter((c) => c !== promptItem && c !== answerItem),
      extras: extraItems,
    };
  }, [concepts]);

  const toggleExpand = useCallback(() => setExpanded((v) => !v), []);

  const PromptIcon = resolveLucideIcon(prompt?.icon ?? 'Gauge');

  return (
    <div className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-y-auto p-4 md:p-6">
      <motion.div className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} opacity-40`} />

      <div className="relative z-10 mx-auto flex w-full max-w-lg flex-col gap-3.5">
        {prompt ? (
          <div className="overflow-hidden rounded-2xl border border-violet-300/70 bg-gradient-to-br from-violet-50 via-white to-indigo-50/80 shadow-lg shadow-violet-200/40 ring-1 ring-violet-200/50">
            <div className="border-l-[5px] border-violet-500 p-4 md:p-5">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-200 to-indigo-200/90 shadow-inner shadow-violet-300/30">
                  <PromptIcon className="h-5 w-5 text-violet-800" aria-hidden />
                </div>
                <span className="font-body text-sm font-bold text-slate-900 md:text-base">{prompt.title}</span>
              </div>
              <p className="line-clamp-3 font-body text-sm leading-relaxed text-slate-600">{prompt.description}</p>
              <button
                type="button"
                onClick={toggleExpand}
                className="mt-3 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wide text-violet-600"
              >
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  aria-hidden
                />
                {expanded ? 'Recolher' : 'Expandir'}
              </button>
              <AnimatePresence initial={false}>
                {expanded ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 rounded-xl border border-violet-200/80 bg-gradient-to-br from-violet-100/70 to-indigo-50/90 p-3 shadow-inner">
                      <p className="font-body text-sm leading-relaxed text-slate-700">{prompt.description}</p>
                      {extras.map((item) => (
                        <p key={item.title} className="mt-2 font-body text-xs text-slate-600">
                          <strong className="text-slate-800">{item.title}:</strong> {item.description}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        ) : null}

        {answer ? (
          <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-100/90 via-emerald-50 to-teal-100/70 p-4 shadow-lg shadow-emerald-200/45 ring-1 ring-emerald-200/60 md:p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-300/40">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800">Resposta da prova</p>
              <p className="font-body text-sm font-bold leading-snug text-emerald-950 md:text-base">
                {answer.description.replace(/^Letra\s+[A-E]\s*—\s*/i, 'Letra ').startsWith('Letra ')
                  ? answer.description
                  : `${answer.title} — ${answer.description}`}
              </p>
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50 via-white to-blue-50/60 p-4 shadow-md shadow-slate-200/40 ring-1 ring-slate-200/50">
          <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Habilidades avaliadas
          </p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, i) => {
              const Icon = resolveLucideIcon(tag.icon);
              return (
                <span
                  key={tag.title}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${TAG_COLORS[i % TAG_COLORS.length]}`}
                >
                  <Icon className="h-3 w-3 shrink-0 opacity-80" aria-hidden />
                  {tag.title}
                </span>
              );
            })}
          </div>
        </div>

        {footerRule ? (
          <p className="rounded-xl border border-violet-200/60 bg-gradient-to-r from-violet-50/90 to-indigo-50/80 px-3 py-2.5 text-center font-body text-xs italic leading-relaxed text-violet-900/80 shadow-sm">
            {footerRule}
          </p>
        ) : null}
      </div>
    </div>
  );
}
