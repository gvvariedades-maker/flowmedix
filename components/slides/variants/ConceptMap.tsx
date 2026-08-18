'use client';

import { useMemo } from 'react';
import type { ThemeColors } from '../core/themeGenerator';
import { resolveLucideIcon } from '../core/lucideIcon';
import {
  BoardChrome,
  LabelBodyRow,
  PillarDeck,
  type BoardTone,
  type PillarDeckItem,
} from '../primitives';

// ============================================================================
// INTERFACES
// ============================================================================
export interface Concept {
  icon: string;
  title: string;
  description: string;
}

interface ConceptMapProps {
  concepts: Concept[];
  theme: ThemeColors;
  layoutVariant?: string;
  footerRule?: string;
}

const PILLAR_TONES: BoardTone[] = ['command', 'teal', 'warn', 'rights', 'accent', 'ok'];

function toPillarItems(concepts: Concept[]): PillarDeckItem[] {
  return concepts.map((concept, index) => ({
    icon: resolveLucideIcon(concept.icon),
    title: concept.title,
    detail: concept.description,
    tone: PILLAR_TONES[index % PILLAR_TONES.length],
  }));
}

/**
 * Concept map genérico — chassis G2 (BoardChrome + PillarDeck / LabelBodyRow).
 * layout_variant: grid | molecular | bridge | stack (+ fallback).
 */
export const ConceptMap = ({
  concepts,
  theme,
  layoutVariant,
  footerRule,
}: ConceptMapProps) => {
  const variant = layoutVariant || 'grid';
  const items = useMemo(() => toPillarItems(concepts), [concepts]);

  if (concepts.length === 0) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        <p className="font-body text-slate-400">Nenhum conceito definido</p>
      </div>
    );
  }

  // BRIDGE — rótulo × exigência (LabelBodyRow rail)
  if (variant === 'bridge') {
    return (
      <BoardChrome
        theme={theme}
        washOpacity={0.4}
        eyebrow="Mapa da cobrança"
        title="Ponte conceitual"
        footerRule={footerRule}
        footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
        maxWidth="3xl"
      >
        <div className="flex flex-col gap-3">
          {concepts.map((concept, index) => (
            <LabelBodyRow
              key={index}
              layout="rail"
              chip={concept.title}
              body={concept.description}
              tone={PILLAR_TONES[index % PILLAR_TONES.length]}
            />
          ))}
        </div>
      </BoardChrome>
    );
  }

  // STACK — coluna (≤2 itens típico)
  if (variant === 'stack') {
    return (
      <BoardChrome
        theme={theme}
        washOpacity={0.4}
        eyebrow="Mapa da cobrança"
        footerRule={footerRule}
        footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
        maxWidth="2xl"
      >
        <PillarDeck items={items} className="!grid-cols-1" />
      </BoardChrome>
    );
  }

  // MOLECULAR + GRID + fallback — deck com massa (barra G2)
  return (
    <BoardChrome
      theme={theme}
      washOpacity={0.4}
      eyebrow="Mapa da cobrança"
      footerRule={footerRule}
      footerLabel={footerRule ? 'TRANSFERÊNCIA' : undefined}
      maxWidth="5xl"
    >
      <PillarDeck items={items} />
    </BoardChrome>
  );
};
