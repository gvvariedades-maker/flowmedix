'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { BOARD_COLUMN_EYEBROW, boardTone, type BoardTone } from './boardTokens';

export interface TwoColumnBoardProps {
  left: ReactNode;
  right: ReactNode;
  leftTitle?: string;
  rightTitle?: string;
  leftTone?: BoardTone;
  rightTone?: BoardTone;
  className?: string;
}

/**
 * Board duas colunas — speak-barrier, isolate keep×exception, compare.
 */
export function TwoColumnBoard({
  left,
  right,
  leftTitle,
  rightTitle,
  leftTone = 'ok',
  rightTone = 'barrier',
  className,
}: TwoColumnBoardProps) {
  const leftMeta = boardTone(leftTone);
  const rightMeta = boardTone(rightTone);

  return (
    <div className={cn('grid grid-cols-1 gap-3 md:grid-cols-2', className)}>
      <div className="flex flex-col gap-2">
        {leftTitle ? (
          <p className={cn(BOARD_COLUMN_EYEBROW, leftMeta.columnLabel)}>{leftTitle}</p>
        ) : null}
        {left}
      </div>
      <div className="flex flex-col gap-2">
        {rightTitle ? (
          <p className={cn(BOARD_COLUMN_EYEBROW, rightMeta.columnLabel)}>{rightTitle}</p>
        ) : null}
        {right}
      </div>
    </div>
  );
}
