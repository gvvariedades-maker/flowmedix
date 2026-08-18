'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  adolescentCarePillarLabel,
  inferAdolescentCarePillar,
  type AdolescentCarePillar,
} from '@/lib/slides/adolescentSlideUtils';
import { BoardChrome, LabelBodyRow, type BoardTone } from '../primitives';

export interface CarePillarConcept {
  icon: string;
  title: string;
  description: string;
}

const PILLAR_TONE: Record<AdolescentCarePillar, BoardTone> = {
  vinculo: 'command',
  rede: 'teal',
  sigilo: 'rights',
  linguagem: 'ok',
  geral: 'neutral',
};

interface ConceptMapAdolescentCarePillarsDeckProps {
  concepts: CarePillarConcept[];
  theme: ThemeColors;
  footerRule?: string;
}

/** Só o card cujo título é a pegadinha — não vazar por verbo no detail (ex. “não protelar”). */
function isTrapConcept(c: CarePillarConcept): boolean {
  return /^(pegadinha|armadilha)\b/i.test(c.title.trim());
}

/**
 * Terreno do encontro — trilho label×corpo (scan vertical).
 * Pilares primeiro; um único card pegadinha no fim (herói, sem hint repetido).
 */
export function ConceptMapAdolescentCarePillarsDeck({
  concepts,
  theme,
  footerRule,
}: ConceptMapAdolescentCarePillarsDeckProps) {
  const reduceMotion = useReducedMotion();

  const rows = useMemo(() => {
    const mapped = concepts.map((c, index) => {
      const pillar = inferAdolescentCarePillar(`${c.title} ${c.description}`);
      const trap = isTrapConcept(c);
      return {
        key: `${c.title}-${index}`,
        title: c.title,
        detail: c.description,
        category: trap ? 'Pegadinha' : adolescentCarePillarLabel(pillar),
        tone: (trap ? 'exception' : PILLAR_TONE[pillar]) as BoardTone,
        trap,
        icon: resolveLucideIcon(c.icon) ?? resolveLucideIcon('Heart'),
      };
    });
    const traps = mapped.filter((r) => r.trap);
    const rest = mapped.filter((r) => !r.trap);
    /** Uma pegadinha no máximo — evita hint duplicado se o JSON repetir o card. */
    return [...rest, ...traps.slice(0, 1)];
  }, [concepts]);

  if (concepts.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow="Espaço do adolescente — pilares do encontro"
      title="Acolher · proteger · articular · falar claro"
      footerLabel="Transferência de prova"
      footerRule={footerRule}
    >
      <div className="flex flex-col gap-2.5">
        {rows.map((row, index) => {
          const Icon = row.icon;
          return (
            <motion.div
              key={row.key}
              initial={reduceMotion ? false : { opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduceMotion ? 0 : index * 0.04 }}
            >
              <LabelBodyRow
                layout="rail"
                chip={row.title}
                body={row.detail}
                tone={row.tone}
                icon={Icon ?? undefined}
                bodyStrong={row.trap}
                emphasized={row.trap}
                hint={
                  row.trap ? (
                    <span className="font-bold uppercase tracking-wide text-rose-700">
                      Banca testa isto
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {row.category}
                    </span>
                  )
                }
              />
            </motion.div>
          );
        })}
      </div>
    </BoardChrome>
  );
}
