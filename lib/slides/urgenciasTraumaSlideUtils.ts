/** Utilitários de slot para moldes L3 — Urgências / trauma pré-hospitalar (XABCDE). */

export type XabcdeLetter = 'x' | 'a' | 'b' | 'c' | 'd' | 'e' | 'alerta' | 'geral';

export const XABCDE_LETTERS: XabcdeLetter[] = ['x', 'a', 'b', 'c', 'd', 'e'];

export type UrgenciasTraumaTrapSlot =
  | 'hemorragia'
  | 'fratura'
  | 'queimadura'
  | 'corpo_estranho'
  | 'imobilizacao'
  | 'transporte';

export const URGENCIAS_TRAUMA_TRAP_SLOTS: UrgenciasTraumaTrapSlot[] = [
  'hemorragia',
  'fratura',
  'queimadura',
  'corpo_estranho',
  'imobilizacao',
  'transporte',
];

export function xabcdeLetterLabel(letter: XabcdeLetter): string {
  const labels: Record<XabcdeLetter, string> = {
    x: 'X — Hemorragia',
    a: 'A — Via aérea',
    b: 'B — Ventilação',
    c: 'C — Circulação',
    d: 'D — Neurológico',
    e: 'E — Exposição',
    alerta: 'Alerta',
    geral: 'Trauma',
  };
  return labels[letter];
}

export function urgenciasTraumaTrapSlotLabel(slot: UrgenciasTraumaTrapSlot): string {
  const labels: Record<UrgenciasTraumaTrapSlot, string> = {
    hemorragia: 'Hemorragia',
    fratura: 'Fratura',
    queimadura: 'Queimadura',
    corpo_estranho: 'Corpo estranho',
    imobilizacao: 'Imobilização',
    transporte: 'Transporte',
  };
  return labels[slot];
}

export function inferXabcdeLetter(title: string, detail: string): XabcdeLetter {
  const text = `${title} ${detail}`.toLowerCase();

  if (/xabcde|^x\b|exsanguin|hemorragia massiva|torniquete|sangramento grave/i.test(text)) {
    return 'x';
  }
  if (/via a[eé]rea|intuba|aspira|obstru[cç][aã]o.*va\b|airway/i.test(text)) {
    return 'a';
  }
  if (/ventila|respira|oxigen|bolsa.?valva|breathing/i.test(text)) {
    return 'b';
  }
  if (/circula|pulso|choque|compress[aã]o tor[aá]cica|parada card/i.test(text)) {
    return 'c';
  }
  if (/neurol|glasgow|pupila|disability|tce|consci[eê]ncia/i.test(text)) {
    return 'd';
  }
  if (/exposi[cç][aã]o|hipoterm|retirar roupa|examinar corpo|escoria/i.test(text)) {
    return 'e';
  }
  if (/pegadinha|erro cl[aá]ssico|n[aã]o piorar|proibido/i.test(text)) {
    return 'alerta';
  }

  if (/queimadura|fratura|imobiliza|corpo estranho|hemorragia|trauma|pr[eé].?hospitalar/i.test(text)) {
    return 'x';
  }

  return 'geral';
}

export function inferUrgenciasTraumaTrapSlot(
  label: string,
  detail: string,
  correct: string,
): UrgenciasTraumaTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();

  if (/pesco[cç]o|car[oó]tid|torniquete.*pesco/i.test(text)) {
    return 'hemorragia';
  }
  if (/hemorragia|sangramento|compress[aã]o direta|exsanguin|torniquete/i.test(text)) {
    return 'hemorragia';
  }
  if (/tra[cç][aã]o|alinhamento|f[eê]mur|fratura|tala/i.test(text)) {
    return /tra[cç][aã]o|alinhamento/i.test(text) ? 'fratura' : 'imobilizacao';
  }
  if (/gelo|manteiga|pasta de dente|caseir|queimadura|água corrente|agua corrente/i.test(text)) {
    return 'queimadura';
  }
  if (/objeto|encravad|penetrante|retirar|abdome|abdominal/i.test(text)) {
    return 'corpo_estranho';
  }
  if (/colar cervical|espinal|transporte|samu|estabilizar/i.test(text)) {
    return 'transporte';
  }
  if (/imobiliza/i.test(text)) {
    return 'imobilizacao';
  }

  return 'hemorragia';
}
