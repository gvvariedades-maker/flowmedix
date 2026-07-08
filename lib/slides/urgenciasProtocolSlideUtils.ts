/** Utilitários de slot — moldes L3 protocolo/VF/convulsão/anafilaxia/queimadura (Urgências). */

export type ProtocolDeckSlot =
  | 'comando'
  | 'vf_item'
  | 'protocolo'
  | 'conduta'
  | 'pegadinha'
  | 'geral';

export const PROTOCOL_DECK_SLOTS: ProtocolDeckSlot[] = [
  'comando',
  'vf_item',
  'protocolo',
  'conduta',
  'pegadinha',
];

export type UrgenciasProtocolTrapSlot =
  | 'vf_inversao'
  | 'sequencia_errada'
  | 'conduta_mito'
  | 'via_timing'
  | 'primeiro_socorro';

export const URGENCIAS_PROTOCOL_TRAP_SLOTS: UrgenciasProtocolTrapSlot[] = [
  'vf_inversao',
  'sequencia_errada',
  'conduta_mito',
  'via_timing',
  'primeiro_socorro',
];

export function protocolDeckSlotLabel(slot: ProtocolDeckSlot): string {
  const labels: Record<ProtocolDeckSlot, string> = {
    comando: 'Comando',
    vf_item: 'V/F',
    protocolo: 'Protocolo',
    conduta: 'Conduta',
    pegadinha: 'Pegadinha',
    geral: 'Emergência',
  };
  return labels[slot];
}

export function urgenciasProtocolTrapSlotLabel(slot: UrgenciasProtocolTrapSlot): string {
  const labels: Record<UrgenciasProtocolTrapSlot, string> = {
    vf_inversao: 'V/F invertido',
    sequencia_errada: 'Sequência',
    conduta_mito: 'Mito',
    via_timing: 'Via/tempo',
    primeiro_socorro: '1º socorro',
  };
  return labels[slot];
}

export function inferProtocolDeckSlot(title: string, detail: string): ProtocolDeckSlot {
  const text = `${title} ${detail}`.toLowerCase();

  if (/incorreta|exceto|afirmativa\s+falsa|qual\s+n[aã]o|assinale/i.test(text)) return 'comando';
  if (
    /^i\b|^ii\b|^iii\b|^iv\b|verdadeira|falsa|v,\s*f|sequ[eê]ncia|julgar\s+antes/i.test(text)
  ) {
    return 'vf_item';
  }
  if (/convuls|crise|epil[eé]pt|proteger\s+cabe[cç]a|boca|objeto/i.test(text)) return 'protocolo';
  if (/anafilax|epinefrina|adrenalina|im\b|intramuscular|coxa/i.test(text)) return 'conduta';
  if (/queimadura|pasta|manteiga|gelo|caseir|resfriar|primeiros\s+socorros/i.test(text)) {
    return 'conduta';
  }
  if (/pegadinha|mito|confund|troca|n[aã]o\s+[eé]/i.test(text)) return 'pegadinha';

  return 'geral';
}

export function inferUrgenciasProtocolTrapSlot(
  label: string,
  detail: string,
  correct: string,
): UrgenciasProtocolTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();

  if (/pasta|manteiga|gelo|caseir|dent[eé]|queimadura/i.test(text)) return 'primeiro_socorro';
  if (/boca|objeto|pano|colher|imobiliz|convuls/i.test(text)) return 'conduta_mito';
  if (/intravenosa|iv\b|imediata.*iv|coxa|intramuscular|epinefrina|adrenalina/i.test(text)) {
    return 'via_timing';
  }
  if (/sequ[eê]ncia|v,\s*f|i,\s*ii|combinar|julgar/i.test(text)) return 'sequencia_errada';
  if (/verdadeira|falsa|inverte|troca\s+v/i.test(text)) return 'vf_inversao';

  return 'conduta_mito';
}

export function inferVfChipFromText(text: string): 'V' | 'F' | null {
  const lower = text.toLowerCase();
  if (/^verdadeira|^verdadeiro|\bverdadeira\b|\bverdadeiro\b/.test(lower)) return 'V';
  if (/^falsa|^falso|\bfalsa\b|\bfalso\b/.test(lower)) return 'F';
  return null;
}
