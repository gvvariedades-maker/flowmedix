'use client';

import { QuestaoFilterChipsRow } from '@/components/questao-filter/QuestaoFilterChipsRow';
import type { QuestaoFilterChipsRowProps } from '@/components/questao-filter/QuestaoFilterChipsRow';

export type QuestaoFilterMobileRowProps = QuestaoFilterChipsRowProps;

/** @deprecated Use QuestaoFilterChipsRow */
export function QuestaoFilterMobileRow(props: QuestaoFilterMobileRowProps) {
  return <QuestaoFilterChipsRow {...props} />;
}
