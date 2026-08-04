'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  adolescentCarePillarLabel,
  inferAdolescentCarePillar,
  type AdolescentCarePillar,
} from '@/lib/slides/adolescentSlideUtils';
import { BoardChrome, PillarDeck, type BoardTone, type PillarDeckItem } from '../primitives';

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

/** Terreno do encontro — 4 pilares visíveis (scan). Tap só destaca. */
export function ConceptMapAdolescentCarePillarsDeck({
  concepts,
  theme,
  footerRule,
}: ConceptMapAdolescentCarePillarsDeckProps) {
  const items = useMemo<PillarDeckItem[]>(
    () =>
      concepts.map((c) => {
        const pillar = inferAdolescentCarePillar(`${c.title} ${c.description}`);
        return {
          icon: resolveLucideIcon(c.icon) ?? resolveLucideIcon('HeartHandshake'),
          title: c.title,
          detail: c.description,
          category: adolescentCarePillarLabel(pillar),
          tone: PILLAR_TONE[pillar],
        };
      }),
    [concepts],
  );

  if (concepts.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.35}
      eyebrow="Espaço do adolescente — quatro pilares"
      footerLabel="Transferência de prova"
      footerRule={footerRule}
    >
      <PillarDeck items={items} />
    </BoardChrome>
  );
}
