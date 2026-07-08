/** Utilitários de slot — moldes L3 EXCETO/INCORRETA (Urgências). */

export type ExcetoRailSlot =
  | 'comando'
  | 'conduta_correta'
  | 'excecao'
  | 'imobilizacao'
  | 'alerta'
  | 'geral';

export const EXCETO_RAIL_SLOTS: ExcetoRailSlot[] = [
  'comando',
  'conduta_correta',
  'excecao',
  'imobilizacao',
  'alerta',
];

export type UrgenciasExcetoTrapSlot =
  | 'reposicionar_forca'
  | 'imobilizacao_errada'
  | 'excecao_clausula'
  | 'conduta_generica';

export const URGENCIAS_EXCETO_TRAP_SLOTS: UrgenciasExcetoTrapSlot[] = [
  'reposicionar_forca',
  'imobilizacao_errada',
  'excecao_clausula',
  'conduta_generica',
];

export function excetoRailSlotLabel(slot: ExcetoRailSlot): string {
  const labels: Record<ExcetoRailSlot, string> = {
    comando: 'Comando',
    conduta_correta: 'Correta',
    excecao: 'Exceção',
    imobilizacao: 'Imobilizar',
    alerta: 'Alerta',
    geral: 'EXCETO',
  };
  return labels[slot];
}

export function urgenciasExcetoTrapSlotLabel(slot: UrgenciasExcetoTrapSlot): string {
  const labels: Record<UrgenciasExcetoTrapSlot, string> = {
    reposicionar_forca: 'Reposicionar',
    imobilizacao_errada: 'Imobilização',
    excecao_clausula: 'Cláusula',
    conduta_generica: 'Conduta',
  };
  return labels[slot];
}

export function inferExcetoRailSlot(title: string, detail: string): ExcetoRailSlot {
  const text = `${title} ${detail}`.toLowerCase();

  if (/incorreta|exceto|afirmativa\s+falsa|qual\s+n[aã]o|assinale/i.test(text)) return 'comando';
  if (/for[cç]ar|reposicion|reduzir|alinhamento|piorar/i.test(text)) return 'excecao';
  if (/imobiliz|talas|atadura|fratura|exposta|sem\s+mover/i.test(text)) return 'imobilizacao';
  if (/conduta\s+correta|manter|proteger|estabilizar|seguran[cç]a/i.test(text)) return 'conduta_correta';
  if (/pegadinha|exceto|n[aã]o\s+[eé]/i.test(text)) return 'alerta';

  return 'geral';
}

export function inferUrgenciasExcetoTrapSlot(
  label: string,
  detail: string,
  correct: string,
): UrgenciasExcetoTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();

  if (/for[cç]ar|reposicion|alinhamento|reduzir\s+fratura/i.test(text)) return 'reposicionar_forca';
  if (/imobiliz|tala|atadura|prancha|colar/i.test(text)) return 'imobilizacao_errada';
  if (/exceto|incorreta|cl[aá]usula|resist[eê]ncia|dor/i.test(text)) return 'excecao_clausula';

  return 'conduta_generica';
}
