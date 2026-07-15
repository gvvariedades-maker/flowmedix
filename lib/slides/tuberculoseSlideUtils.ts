/** Utilitários L3 — molde bespoke Tuberculose (vigilância × transmissão × precaução). */

export type TbVigilanceSlot = 'notificacao' | 'baar' | 'transmissao' | 'precaucao' | 'tdo' | 'geral';

export const TB_VIGILANCE_SLOTS: TbVigilanceSlot[] = [
  'notificacao',
  'baar',
  'transmissao',
  'precaucao',
];

export function tbVigilanceLabel(slot: TbVigilanceSlot): string {
  switch (slot) {
    case 'notificacao':
      return 'Notificação';
    case 'baar':
      return 'BAAR';
    case 'transmissao':
      return 'Transmissão';
    case 'precaucao':
      return 'Precaução';
    case 'tdo':
      return 'TDO';
    default:
      return 'TB';
  }
}

export function inferTbVigilanceSlot(label: string, detail = ''): TbVigilanceSlot {
  const blob = `${label} ${detail}`.toLowerCase();
  if (/notifica|contactante|vigil[aâ]ncia|sinan/i.test(blob)) return 'notificacao';
  if (/baar|escarro|bacilo|koch|mycobacter/i.test(blob)) return 'baar';
  if (/aeross[oó]l|got[ií]cula|transmiss|contato.*pele|via respirat/i.test(blob)) return 'transmissao';
  if (/precau[cç][aã]o|m[aá]scara|quarto|bacil[ií]fer/i.test(blob)) return 'precaucao';
  if (/tdo|dot|tratamento diretamente observado|isoniazida|rifampicina/i.test(blob)) return 'tdo';
  return 'geral';
}

export type TbTransmissionMode = 'aerossol' | 'contato' | 'falso';

export function inferTbTransmissionTrap(label: string, detail: string, correct: string): TbTransmissionMode {
  const blob = `${label} ${detail} ${correct}`.toLowerCase();
  if (/contato.*pele|pele.*contato|cut[aâ]ne|sem aeross/i.test(blob)) return 'falso';
  if (/aeross[oó]l|got[ií]cula|respirat/i.test(blob)) return 'aerossol';
  if (/contato/i.test(blob)) return 'contato';
  return 'aerossol';
}

export type TbVfItemStatus = 'verdadeira' | 'falsa' | 'neutra';

export function inferTbVfItemStatus(step: string): TbVfItemStatus {
  const lower = step.toLowerCase();
  if (/\bfals[ao]\b|incorret|errad|n[aã]o precisa|inverte/i.test(lower)) return 'falsa';
  if (/\bverdadeir[ao]\b|corret|compuls[oó]ri|exige|bacil[ií]fer/i.test(lower)) return 'verdadeira';
  return 'neutra';
}

export function extractRomanFromText(text: string): 'I' | 'II' | 'III' | null {
  const m = text.match(/\b(I{1,3})\b/);
  if (!m) return null;
  const r = m[1];
  if (r === 'I' || r === 'II' || r === 'III') return r;
  return null;
}
