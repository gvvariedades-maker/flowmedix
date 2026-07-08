/** Utilitários de slot para moldes L3 — Urgências / engasgo · obstrução VA. */

export type ChokingDeckSlot =
  | 'sinal'
  | 'heimlich'
  | 'ovace'
  | 'inconsciente'
  | 'lactente'
  | 'alerta'
  | 'geral';

export const CHOKING_DECK_SLOTS: ChokingDeckSlot[] = [
  'sinal',
  'heimlich',
  'ovace',
  'inconsciente',
  'lactente',
];

export type UrgenciasChokingTrapSlot =
  | 'local_corpo'
  | 'sinal_vs_manobra'
  | 'inconsciente'
  | 'transferencia';

export const URGENCIAS_CHOKING_TRAP_SLOTS: UrgenciasChokingTrapSlot[] = [
  'local_corpo',
  'sinal_vs_manobra',
  'inconsciente',
  'transferencia',
];

export function chokingDeckSlotLabel(slot: ChokingDeckSlot): string {
  const labels: Record<ChokingDeckSlot, string> = {
    sinal: 'Sinal',
    heimlich: 'Heimlich',
    ovace: 'OVACE',
    inconsciente: 'Inconsciente',
    lactente: 'Lactente',
    alerta: 'Alerta',
    geral: 'Engasgo',
  };
  return labels[slot];
}

export function urgenciasChokingTrapSlotLabel(slot: UrgenciasChokingTrapSlot): string {
  const labels: Record<UrgenciasChokingTrapSlot, string> = {
    local_corpo: 'Local',
    sinal_vs_manobra: 'Sinal × manobra',
    inconsciente: 'PCR',
    transferencia: 'Sequência',
  };
  return labels[slot];
}

export function inferChokingDeckSlot(title: string, detail: string): ChokingDeckSlot {
  const text = `${title} ${detail}`.toLowerCase();

  if (/sinal universal|m[aã]os ao pesco[cç]o|garganta|sufoc/i.test(text)) return 'sinal';
  if (/heimlich|abdominal|compress[oõ]es abdom/i.test(text)) return 'heimlich';
  if (/gestante|obeso|interescapular|tor[aá]cic/i.test(text)) return 'ovace';
  if (/inconsciente|pcr|rcp|n[aã]o responde/i.test(text)) return 'inconsciente';
  if (/lactente|beb[eê]|crian[cç]a pequena|costas/i.test(text)) return 'lactente';
  if (/pegadinha|abdome.*n[aã]o|confund/i.test(text)) return 'alerta';

  return 'geral';
}

export function inferUrgenciasChokingTrapSlot(
  label: string,
  detail: string,
  correct: string,
): UrgenciasChokingTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();

  if (/calc[aâ]neo|joelho|deltoide|abdome|pesco[cç]o/i.test(text)) {
    return /abdome/i.test(text) && /socorrista|heimlich|comprime/i.test(text)
      ? 'sinal_vs_manobra'
      : 'local_corpo';
  }
  if (/heimlich|manobra|sequ[eê]ncia|expuls/i.test(text)) return 'transferencia';
  if (/inconsciente|rcp|ventilar/i.test(text)) return 'inconsciente';

  return 'local_corpo';
}
