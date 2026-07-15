/** Utilitários de slot para moldes L3 bespoke — Assistência Perioperatória (SRPA). */

export type PeriPhase = 'pre' | 'intra' | 'pos' | 'srpa' | 'geral';

export const PERI_PHASES: PeriPhase[] = ['pre', 'intra', 'pos', 'srpa'];

export type PeriSrpaSlot =
  | 'admission'
  | 'monitoring'
  | 'aldrete'
  | 'analgesia'
  | 'exceto'
  | 'geral';

export const PERI_SRPA_SLOTS: PeriSrpaSlot[] = [
  'admission',
  'monitoring',
  'aldrete',
  'analgesia',
  'exceto',
];

export type PeriProtocolSlot =
  | 'signin'
  | 'timeout'
  | 'signout'
  | 'cdc'
  | 'assepsia'
  | 'geral';

export const PERI_PROTOCOL_WHO: PeriProtocolSlot[] = ['signin', 'timeout', 'signout'];

export type PeriVfItem = 'I' | 'II' | 'III' | 'combo' | 'geral';

export const PERI_VF_ITEMS: PeriVfItem[] = ['I', 'II', 'III'];

export type PeriTrapSlot =
  | 'jejum'
  | 'tricotomia'
  | 'aldrete'
  | 'analgesia'
  | 'exceto'
  | 'who'
  | 'isc'
  | 'geral';

export function periPhaseLabel(phase: PeriPhase): string {
  const labels: Record<PeriPhase, string> = {
    pre: 'Pré-operatório',
    intra: 'Transoperatório',
    pos: 'Pós-operatório',
    srpa: 'SRPA',
    geral: 'Perioperatório',
  };
  return labels[phase];
}

export function periPhaseShort(phase: PeriPhase): string {
  const labels: Record<PeriPhase, string> = {
    pre: 'PRÉ',
    intra: 'INTRA',
    pos: 'PÓS',
    srpa: 'SRPA',
    geral: 'PERI',
  };
  return labels[phase];
}

export function periSrpaSlotLabel(slot: PeriSrpaSlot): string {
  const labels: Record<PeriSrpaSlot, string> = {
    admission: 'Admissão',
    monitoring: 'Monitorização',
    aldrete: 'Aldrete',
    analgesia: 'Analgesia',
    exceto: 'EXCETO',
    geral: 'SRPA',
  };
  return labels[slot];
}

export function periProtocolSlotLabel(slot: PeriProtocolSlot): string {
  const labels: Record<PeriProtocolSlot, string> = {
    signin: 'Sign in',
    timeout: 'Time out',
    signout: 'Sign out',
    cdc: 'CDC/ANVISA',
    assepsia: 'Asséptica',
    geral: 'Protocolo',
  };
  return labels[slot];
}

export function periVfItemLabel(item: PeriVfItem): string {
  const labels: Record<PeriVfItem, string> = {
    I: 'Item I',
    II: 'Item II',
    III: 'Item III',
    combo: 'Combinação',
    geral: 'V/F',
  };
  return labels[item];
}

export function inferPeriPhase(title: string, description: string): PeriPhase {
  const text = `${title} ${description}`.toLowerCase();

  if (/\bsrpa\b|recupera[cç][aã]o p[oó]s[\s-]?anest|aldrete|kroulik/i.test(text)) return 'srpa';
  if (/p[oó]s[\s-]?operat|p[oó]s[\s-]?cir[uú]rg|alta da srpa|analgesia p[oó]s/i.test(text)) return 'pos';
  if (/transoperat|intra[\s-]?operat|centro cir[uú]rgico|mesa cir[uú]rgica/i.test(text)) return 'intra';
  if (/pr[eé][\s-]?operat|preparo|jejum|tricotomia|orienta[cç][aã]o ao paciente/i.test(text)) return 'pre';

  return 'geral';
}

export function inferPeriSrpaSlot(title: string, description: string): PeriSrpaSlot {
  const text = `${title} ${description}`.toLowerCase();

  if (/\bexceto\b|incorreta|n[aã]o [eé] conduta/i.test(text)) return 'exceto';
  if (/aldrete|kroulik|escala de recupera[cç][aã]o|pontua[cç][aã]o.*alta/i.test(text)) return 'aldrete';
  if (/analgesia|dor p[oó]s|n[aá]usea|v[oô]mito/i.test(text)) return 'analgesia';
  if (/admiss[aã]o|chegada na srpa|transfer[eê]ncia/i.test(text)) return 'admission';
  if (/monitor|sinais vitais|avalia[cç][aã]o cl[ií]nica|oximetria/i.test(text)) return 'monitoring';

  return 'geral';
}

export function inferPeriProtocolSlot(title: string, description: string): PeriProtocolSlot {
  const text = `${title} ${description}`.toLowerCase();

  if (/sign[\s-]?in|entrada|identifica[cç][aã]o do paciente/i.test(text)) return 'signin';
  if (/time[\s-]?out|pausa cir[uú]rgica|antes da incis[aã]o/i.test(text)) return 'timeout';
  if (/sign[\s-]?out|sa[ií]da|contagem|instrument/i.test(text)) return 'signout';
  if (/\bcdc\b|anvisa|classifica[cç][aã]o de ferida|cirurgia segura/i.test(text)) return 'cdc';
  if (/ass[eé]ptic|antisseps|barreira|campo cir[uú]rgico/i.test(text)) return 'assepsia';

  return 'geral';
}

export function inferPeriVfItem(title: string, description: string): PeriVfItem {
  const text = `${title} ${description}`;

  if (/\biii\b|\biii\s*[-–—]/i.test(text)) return 'III';
  if (/\bii\b|\bii\s*[-–—]/i.test(text)) return 'II';
  if (/\bi\b|\bi\s*[-–—]/i.test(text)) return 'I';
  if (/combina[cç][aã]o|apenas.*corretas|todas.*verdadeiras/i.test(text)) return 'combo';

  return 'geral';
}

export function inferPeriVfChip(text: string): 'V' | 'F' | null {
  const lower = text.toLowerCase();
  if (/^verdadeira|^verdadeiro|\bverdadeira\b|\bverdadeiro\b/.test(lower)) return 'V';
  if (/^falsa|^falso|\bfalsa\b|\bfalso\b/.test(lower)) return 'F';
  return null;
}

export function inferPeriRowPhases(label: string, value: string): PeriPhase[] {
  const phase = inferPeriPhase(label, value);
  return phase === 'geral' ? [] : [phase];
}

export function inferPeriRowSrpaSlots(label: string, value: string): PeriSrpaSlot[] {
  const slot = inferPeriSrpaSlot(label, value);
  return slot === 'geral' ? [] : [slot];
}

export function inferPeriRowProtocolSlots(label: string, value: string): PeriProtocolSlot[] {
  const slot = inferPeriProtocolSlot(label, value);
  return slot === 'geral' ? [] : [slot];
}

export function inferPeriTrapSlot(label: string, detail: string, correct: string): PeriTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();

  if (/jejum|alimenta[cç][aã]o|l[ií]quido claro/i.test(text)) return 'jejum';
  if (/tricotomia|depila[cç][aã]o|pelos/i.test(text)) return 'tricotomia';
  if (/aldrete|kroulik|escala de recupera[cç][aã]o/i.test(text)) return 'aldrete';
  if (/analgesia|dor p[oó]s|bloqueio regional/i.test(text)) return 'analgesia';
  if (/\bexceto\b|incorreta|n[aã]o [eé] conduta/i.test(text)) return 'exceto';
  if (/sign[\s-]?in|time[\s-]?out|sign[\s-]?out|who|cirurgia segura/i.test(text)) return 'who';
  if (/\bisc\b|infec[cç][aã]o de s[ií]tio|deisc[eê]ncia/i.test(text)) return 'isc';

  return 'geral';
}

export function inferPeriTrapLanes(
  label: string,
  detail: string,
  correctText: string,
): { trapSlots: PeriTrapSlot[]; correctSlots: PeriTrapSlot[]; hasRail: boolean } {
  const trapSlots = new Set<PeriTrapSlot>();
  const correctSlots = new Set<PeriTrapSlot>();

  const trap = inferPeriTrapSlot(label, detail, '');
  const correctSlot = inferPeriTrapSlot(label, correctText, correctText);

  if (trap !== 'geral') trapSlots.add(trap);
  if (correctSlot !== 'geral') correctSlots.add(correctSlot);

  const trapArr = [...trapSlots];
  const correctArr = [...correctSlots];
  return { trapSlots: trapArr, correctSlots: correctArr, hasRail: trapArr.length > 0 || correctArr.length > 0 };
}

export type ParsedPeriStep = {
  kind: 'eliminate' | 'locate' | 'fixation' | 'anchor' | 'step';
  text: string;
  title: string;
  letter?: string;
  phases: PeriPhase[];
  srpaSlots: PeriSrpaSlot[];
  protocolSlots: PeriProtocolSlot[];
};

function parsePeriStepBase(raw: string): ParsedPeriStep {
  const text = raw.trim();
  const lower = text.toLowerCase();

  const letterMatch = text.match(/letra\s+([A-E])\b/i);
  const letter = letterMatch?.[1]?.toUpperCase();

  let kind: ParsedPeriStep['kind'] = 'step';
  if (/eliminar|descartar|afastar/i.test(lower)) kind = 'eliminate';
  else if (/localizar|identificar|fase|srpa|protocolo/i.test(lower)) kind = 'locate';
  else if (/fixa[cç][aã]o|gabarito|resposta/i.test(lower)) kind = 'fixation';
  else if (/enquadramento|perioperat|preparo/i.test(lower)) kind = 'anchor';

  const phase = inferPeriPhase(text, text);
  const phases = phase !== 'geral' ? [phase] : [];
  const srpaSlot = inferPeriSrpaSlot(text, text);
  const srpaSlots = srpaSlot !== 'geral' ? [srpaSlot] : [];
  const protocolSlot = inferPeriProtocolSlot(text, text);
  const protocolSlots = protocolSlot !== 'geral' ? [protocolSlot] : [];

  return {
    kind,
    text,
    title: text.length > 72 ? `${text.slice(0, 69)}…` : text,
    letter,
    phases,
    srpaSlots,
    protocolSlots,
  };
}

export function parsePeriPreopStep(raw: string): ParsedPeriStep {
  return parsePeriStepBase(raw);
}

export function parsePeriSrpaStep(raw: string): ParsedPeriStep {
  return parsePeriStepBase(raw);
}

export function parsePeriProtocolStep(raw: string): ParsedPeriStep {
  return parsePeriStepBase(raw);
}

export type ParsedPeriVfStep = {
  kind: 'judgement' | 'combo' | 'fixation' | 'anchor' | 'step';
  text: string;
  title: string;
  letter?: string;
  item: PeriVfItem;
  verdict?: 'V' | 'F';
};

export function parsePeriVfStep(raw: string): ParsedPeriVfStep {
  const text = raw.trim();
  const lower = text.toLowerCase();

  const letterMatch = text.match(/letra\s+([A-E])\b/i);
  const letter = letterMatch?.[1]?.toUpperCase();

  let kind: ParsedPeriVfStep['kind'] = 'step';
  if (/combina[cç][aã]o|apenas.*corretas/i.test(lower)) kind = 'combo';
  else if (/verdadeira|falsa|julgue/i.test(lower)) kind = 'judgement';
  else if (/fixa[cç][aã]o|gabarito|resposta/i.test(lower)) kind = 'fixation';
  else if (/enquadramento|perioperat|srpa/i.test(lower)) kind = 'anchor';

  const item = inferPeriVfItem(text, text);
  const verdict = inferPeriVfChip(text) ?? undefined;

  return {
    kind,
    text,
    title: text.length > 72 ? `${text.slice(0, 69)}…` : text,
    letter,
    item,
    verdict,
  };
}
