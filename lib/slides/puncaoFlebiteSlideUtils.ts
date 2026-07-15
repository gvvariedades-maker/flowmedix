/** Slots semânticos — complicações IV (ramo puncao_flebite). */

export type IvComplicationSlot =
  | 'contexto'
  | 'infiltracao'
  | 'flebite'
  | 'hematoma'
  | 'extravasamento'
  | 'esclerose'
  | 'pegadinha'
  | 'geral';

export const IV_COMPLICATION_LAYER_SLOTS: IvComplicationSlot[] = [
  'contexto',
  'infiltracao',
  'flebite',
  'hematoma',
  'extravasamento',
  'esclerose',
  'pegadinha',
];

export type IvLabelSwapSlot =
  | 'infiltracao'
  | 'flebite'
  | 'hematoma'
  | 'extravasamento'
  | 'esclerose'
  | 'transferencia';

export const IV_LABEL_SWAP_SLOTS: IvLabelSwapSlot[] = [
  'infiltracao',
  'flebite',
  'hematoma',
  'extravasamento',
  'esclerose',
  'transferencia',
];

export function ivComplicationSlotLabel(slot: IvComplicationSlot): string {
  const labels: Record<IvComplicationSlot, string> = {
    contexto: 'Contexto',
    infiltracao: 'Infiltração',
    flebite: 'Flebite',
    hematoma: 'Hematoma',
    extravasamento: 'Extravasamento',
    esclerose: 'Esclerose',
    pegadinha: 'Pegadinha',
    geral: 'Tema',
  };
  return labels[slot];
}

export function ivLabelSwapSlotLabel(slot: IvLabelSwapSlot): string {
  const labels: Record<IvLabelSwapSlot, string> = {
    infiltracao: 'Infiltração',
    flebite: 'Flebite',
    hematoma: 'Hematoma',
    extravasamento: 'Extravasamento',
    esclerose: 'Esclerose',
    transferencia: 'Transferência',
  };
  return labels[slot];
}

export function inferIvComplicationSlot(title: string, detail: string): IvComplicationSlot {
  const text = `${title} ${detail}`.toLowerCase();
  if (/gabarito|letra\s*[a-e]|combina[cç][aã]o/.test(text)) return 'geral';
  if (/pegadinha|confund|troca|parece|banca/.test(text)) return 'pegadinha';
  if (/infiltra[cç][aã]o|subcut[aâ]neo|fora do vaso|l[ií]quido.*tecido/.test(text)) {
    return 'infiltracao';
  }
  if (/flebite|inflama[cç][aã]o.*veia|cord[aã]o|calor.*rubor/.test(text)) return 'flebite';
  if (/hematoma|equimose|sangue.*extrav/.test(text)) return 'hematoma';
  if (/extravasamento|vesicante|quimioter[aá]pico/.test(text)) return 'extravasamento';
  if (/esclerose|endurecimento.*veia/.test(text)) return 'esclerose';
  if (/contexto|enunciado|mecanismo|deslocamento|agulha/.test(text)) return 'contexto';
  return 'geral';
}

export function inferIvLabelSwapSlot(
  label: string,
  detail: string,
  correct: string,
): IvLabelSwapSlot {
  const blob = `${label} ${detail} ${correct}`.toLowerCase();
  if (/outra banca|em similares|transfer|trocam/.test(blob)) return 'transferencia';
  if (/infiltra[cç][aã]o|subcut[aâ]neo/.test(blob)) return 'infiltracao';
  if (/flebite|inflama[cç][aã]o.*veia/.test(blob)) return 'flebite';
  if (/hematoma|equimose/.test(blob)) return 'hematoma';
  if (/extravasamento|vesicante/.test(blob)) return 'extravasamento';
  if (/esclerose/.test(blob)) return 'esclerose';
  return 'flebite';
}

export function extractIvComplicationSlots(text: string): IvLabelSwapSlot[] {
  const lower = text.toLowerCase();
  const found = new Set<IvLabelSwapSlot>();
  if (/infiltra[cç][aã]o|subcut[aâ]neo/.test(lower)) found.add('infiltracao');
  if (/flebite|inflama[cç][aã]o.*veia/.test(lower)) found.add('flebite');
  if (/hematoma|equimose/.test(lower)) found.add('hematoma');
  if (/extravasamento|vesicante/.test(lower)) found.add('extravasamento');
  if (/esclerose/.test(lower)) found.add('esclerose');
  return [...found];
}
