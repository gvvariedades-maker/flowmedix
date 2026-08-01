'use client';

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, MessageCircleWarning, Shield } from 'lucide-react';
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

function sideIcon(side: SpeakBarrierSide) {
  switch (side) {
    case 'barrier':
      return MessageCircleWarning;
    case 'rights':
      return Shield;
    default:
      return Check;
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
      footerRule={footerRule}
    >
      <TwoColumnBoard
        leftTitle="Como falar / o que informar"
        rightTitle="Como NÃO falar"
        leftTone="ok"
        rightTone="barrier"
        left={
          <>
            {okish.map(({ row, side }, i) => (
              <motion.div
                key={`ok-${i}`}
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <LabelBodyRow
                  chip={row.label}
                  body={row.value}
                  tone={sideTone(side)}
                  icon={sideIcon(side)}
                  iconClassName="text-emerald-700"
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
                  chip={row.label}
                  body={row.value}
                  tone="barrier"
                  icon={MessageCircleWarning}
                  iconClassName="text-rose-700"
                  bodyStrong
                  hint={row.exam_hint}
                  className="ring-1 ring-rose-200"
                />
              </motion.div>
            ))}
            {barrier.length === 0 ? (
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
