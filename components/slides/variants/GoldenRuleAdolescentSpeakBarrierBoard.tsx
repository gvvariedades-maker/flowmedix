'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import {
  inferSpeakBarrierSide,
  type SpeakBarrierSide,
} from '@/lib/slides/adolescentSlideUtils';
import {
  BoardChrome,
  LabelBodyRow,
  TwoColumnBoard,
  boardEmptyPlaceholder,
  showBoardAuthoringHints,
  type BoardTone,
} from '../primitives';

interface GoldenRuleAdolescentSpeakBarrierBoardProps {
  content?: string;
  rows: GoldenRuleRow[];
  theme: ThemeColors;
  footerRule?: string;
}

function sideTone(side: SpeakBarrierSide): BoardTone {
  switch (side) {
    case 'barrier':
      return 'barrier';
    case 'rights':
      return 'rights';
    case 'ok':
      return 'ok';
    default:
      return 'neutral';
  }
}

/** Contraste “como falar × como NÃO falar” — scan em uma tela. */
export function GoldenRuleAdolescentSpeakBarrierBoard({
  content,
  rows,
  theme,
  footerRule,
}: GoldenRuleAdolescentSpeakBarrierBoardProps) {
  const reduceMotion = useReducedMotion();

  const enriched = useMemo(
    () =>
      rows.map((row) => ({
        row,
        side: inferSpeakBarrierSide(row.label ?? '', row.value ?? ''),
      })),
    [rows],
  );

  const barrier = enriched.filter((e) => e.side === 'barrier');
  const okish = enriched.filter((e) => e.side !== 'barrier');

  if (rows.length === 0) return null;

  return (
    <BoardChrome
      theme={theme}
      title={content}
      eyebrow="Informação completa ≠ jargão"
      footerLabel="Decore"
      footerRule={footerRule}
    >
      <TwoColumnBoard
        leftTitle="Como falar / o que informar"
        rightTitle="Como NÃO falar"
        leftTone="ok"
        rightTone="barrier"
        emphasize="right"
        left={
          <>
            {okish.map(({ row, side }, i) => (
              <motion.div
                key={`ok-${i}`}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <LabelBodyRow
                  layout="rail"
                  chip={row.label || 'Falar'}
                  body={row.value}
                  tone={sideTone(side)}
                  hint={row.exam_hint}
                />
              </motion.div>
            ))}
          </>
        }
        right={
          <>
            {(barrier.length > 0 ? barrier : []).map(({ row }, i) => (
              <motion.div
                key={`bad-${i}`}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <LabelBodyRow
                  layout="rail"
                  chip={row.label || 'Barreira'}
                  body={row.value}
                  tone="barrier"
                  bodyStrong
                  hint={row.exam_hint}
                />
              </motion.div>
            ))}
            {barrier.length === 0 && showBoardAuthoringHints() ? (
              <p className={`${boardEmptyPlaceholder('barrier')} py-4 text-center`}>
                Marque a row com ênfase alert / “não falar” no JSON para destacar a barreira.
              </p>
            ) : null}
          </>
        }
      />
    </BoardChrome>
  );
}
