/** Utilitários de slot para moldes L3 — Urgências / RCP pediátrica. */

export type PediatricRcpDeckSlot =
  | 'proporcao'
  | 'profundidade'
  | 'frequencia'
  | 'retorno'
  | 'alerta'
  | 'geral';

export const PEDIATRIC_RCP_DECK_SLOTS: PediatricRcpDeckSlot[] = [
  'proporcao',
  'profundidade',
  'frequencia',
  'retorno',
];

export type UrgenciasPediatricTrapSlot =
  | 'proporcao_adulta'
  | 'profundidade_excesso'
  | 'proporcao_certa_prof_errada'
  | 'transferencia_adulto';

export const URGENCIAS_PEDIATRIC_TRAP_SLOTS: UrgenciasPediatricTrapSlot[] = [
  'proporcao_adulta',
  'profundidade_excesso',
  'proporcao_certa_prof_errada',
  'transferencia_adulto',
];

export function pediatricRcpDeckSlotLabel(slot: PediatricRcpDeckSlot): string {
  const labels: Record<PediatricRcpDeckSlot, string> = {
    proporcao: '15:2',
    profundidade: 'Profundidade',
    frequencia: 'Frequência',
    retorno: 'Retorno',
    alerta: 'Alerta',
    geral: 'Pediatria',
  };
  return labels[slot];
}

export function urgenciasPediatricTrapSlotLabel(slot: UrgenciasPediatricTrapSlot): string {
  const labels: Record<UrgenciasPediatricTrapSlot, string> = {
    proporcao_adulta: '30:2 adulto',
    profundidade_excesso: '½ tórax',
    proporcao_certa_prof_errada: '15:2 + prof.',
    transferencia_adulto: 'Adulto',
  };
  return labels[slot];
}

export function inferPediatricRcpDeckSlot(title: string, detail: string): PediatricRcpDeckSlot {
  const text = `${title} ${detail}`.toLowerCase();

  if (/15:2|propor[cç][aã]o|30:2|dois socorristas|um socorrista/i.test(text)) {
    return 'proporcao';
  }
  if (/profundidade|ter[cç]o|1\/3|metade|di[aâ]metro|ap\b/i.test(text)) {
    return 'profundidade';
  }
  if (/100.?120|frequ[eê]ncia|minuto/i.test(text)) {
    return 'frequencia';
  }
  if (/retorno|t[oó]rax completo|reexpans/i.test(text)) {
    return 'retorno';
  }
  if (/pegadinha|adulto|n[aã]o transfer/i.test(text)) {
    return 'alerta';
  }

  return 'geral';
}

export function inferUrgenciasPediatricTrapSlot(
  label: string,
  detail: string,
  correct: string,
): UrgenciasPediatricTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();

  if (/transfer[eê]ncia|adulto.*30:2|30:2.*adulto/i.test(text)) {
    return 'transferencia_adulto';
  }
  if (/15:2/i.test(text) && /metade|1\/2|profundidade|ter[cç]o/i.test(text)) {
    return 'proporcao_certa_prof_errada';
  }
  if (/metade|1\/2|profundidade excess/i.test(text)) {
    return 'profundidade_excesso';
  }
  if (/30:2|propor[cç][aã]o adulta/i.test(text)) {
    return 'proporcao_adulta';
  }

  return 'proporcao_adulta';
}
