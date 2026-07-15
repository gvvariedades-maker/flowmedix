/** Utilitários de slot para moldes L3 bespoke — Saúde Mental (RAPS/legis + crise/CAPS). */

export type MentalRapsNode =
  | 'raps'
  | 'caps'
  | 'hospital_dia'
  | 'srt'
  | 'ab'
  | 'urgencia'
  | 'hospital'
  | 'legado'
  | 'geral';

export const MENTAL_RAPS_NODES: MentalRapsNode[] = [
  'ab',
  'caps',
  'hospital_dia',
  'srt',
  'urgencia',
  'hospital',
];

export type MentalCrisisStep =
  | 'acolhimento'
  | 'vinculo'
  | 'equipe'
  | 'medicacao'
  | 'contencao'
  | 'internacao'
  | 'geral';

export const MENTAL_CRISIS_LADDER: MentalCrisisStep[] = [
  'acolhimento',
  'vinculo',
  'equipe',
  'medicacao',
  'contencao',
  'internacao',
];

export type MentalCrisisTrapSlot =
  | 'contencao_imediata'
  | 'internacao_rotina'
  | 'punicao'
  | 'isolamento'
  | 'so_medicacao'
  | 'sem_equipe';

export const MENTAL_CRISIS_TRAP_SLOTS: MentalCrisisTrapSlot[] = [
  'contencao_imediata',
  'internacao_rotina',
  'punicao',
  'isolamento',
  'so_medicacao',
  'sem_equipe',
];

export function mentalRapsNodeLabel(node: MentalRapsNode): string {
  const labels: Record<MentalRapsNode, string> = {
    raps: 'RAPS',
    caps: 'CAPS',
    hospital_dia: 'Hospital-dia',
    srt: 'SRT',
    ab: 'Atenção Básica',
    urgencia: 'Urgência',
    hospital: 'Hospital',
    legado: 'Asilo',
    geral: 'Rede',
  };
  return labels[node];
}

export function mentalCrisisStepLabel(step: MentalCrisisStep): string {
  const labels: Record<MentalCrisisStep, string> = {
    acolhimento: 'Acolhimento',
    vinculo: 'Vínculo',
    equipe: 'Equipe',
    medicacao: 'Medicação',
    contencao: 'Contenção',
    internacao: 'Internação',
    geral: 'Crise',
  };
  return labels[step];
}

export function mentalCrisisTrapSlotLabel(slot: MentalCrisisTrapSlot): string {
  const labels: Record<MentalCrisisTrapSlot, string> = {
    contencao_imediata: 'Contenção 1ª',
    internacao_rotina: 'Internação rotina',
    punicao: 'Punição',
    isolamento: 'Isolamento',
    so_medicacao: 'Só medicação',
    sem_equipe: 'Sem equipe',
  };
  return labels[slot];
}

export function inferMentalRapsNode(title: string, description: string): MentalRapsNode {
  const text = `${title} ${description}`.toLowerCase();

  if (/\braps\b|aten[cç][aã]o psicossocial|rede de aten[cç][aã]o|portaria.*3088|reforma psiqui[aá]trica/i.test(text)) {
    return 'raps';
  }
  if (/\bcaps\b|centro de aten[cç][aã]o psicossocial/i.test(text)) return 'caps';
  if (/hospital[\s-]?dia|interna[cç][aã]o breve|leito psiqui[aá]trico/i.test(text)) return 'hospital_dia';
  if (/\bsrt\b|servi[cç]o residencial terap[eê]utico|moradia terap[eê]utica/i.test(text)) return 'srt';
  if (/aten[cç][aã]o b[aá]sica|\besf\b|aps\b|estrat[eé]gia sa[uú]de da fam[ií]lia/i.test(text)) return 'ab';
  if (/urg[eê]ncia|emerg[eê]ncia|pronto[\s-]?socorro|samu/i.test(text)) return 'urgencia';
  if (/hospitaliza[cç][aã]o mental|hospital geral|interna[cç][aã]o compuls[oó]ria|enfermaria/i.test(text)) {
    return 'hospital';
  }
  if (/manic[oô]mio|asil|exclus[aã]o|hospital psiqui[aá]trico rotineiro|reps\b|rehosp/i.test(text)) {
    return 'legado';
  }

  return 'geral';
}

export function inferMentalRapsRowNodes(label: string, value: string): MentalRapsNode[] {
  const node = inferMentalRapsNode(label, value);
  return node === 'geral' ? [] : [node];
}

export function inferMentalCrisisStep(title: string, description: string): MentalCrisisStep {
  const text = `${title} ${description}`.toLowerCase();

  if (/conten[cç][aã]o|restri[cç][aã]o f[ií]sica|coer[cç][aã]o|imobiliza[cç][aã]o/i.test(text)) return 'contencao';
  if (/interna[cç][aã]o|hospitaliza[cç][aã]o|leito psiqui[aá]trico/i.test(text)) return 'internacao';
  if (/medica[cç][aã]o|psicof[aá]rmaco|farmacol[oó]gic/i.test(text)) return 'medicacao';
  if (/equipe|multiprofissional|fam[ií]lia|articula[cç][aã]o/i.test(text)) return 'equipe';
  if (/comunica[cç][aã]o terap[eê]utica|v[ií]nculo|escuta qualificada|acolhimento/i.test(text)) {
    return /acolhimento|escuta/i.test(text) ? 'acolhimento' : 'vinculo';
  }
  if (/acolh|escuta|abordagem n[aã]o coercitiva/i.test(text)) return 'acolhimento';

  return 'geral';
}

export function inferMentalCrisisTrapSlot(label: string, detail: string, correct: string): MentalCrisisTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();

  if (/conten[cç][aã]o imediata|conten[cç][aã]o f[ií]sica.*primeir|padr[aã]o para garantir seguran[cç]a/i.test(text)) {
    return 'contencao_imediata';
  }
  if (/interna[cç][aã]o compuls[oó]ria|interna[cç][aã]o autom[aá]tica|hospital rotineiro/i.test(text)) {
    return 'internacao_rotina';
  }
  if (/insubordina[cç][aã]o|disciplinar|puni[cç][aã]o/i.test(text)) return 'punicao';
  if (/isolamento|seclus[aã]o/i.test(text)) return 'isolamento';
  if (/s[oó] medica[cç][aã]o|controle medicamentoso exclusivo/i.test(text)) return 'so_medicacao';
  if (/sem equipe|sem fam[ií]lia|procedimentos exclusivamente/i.test(text)) return 'sem_equipe';

  return 'contencao_imediata';
}

export function inferMentalRapsTrapNodes(
  label: string,
  detail: string,
  correct: string,
): { trapNodes: MentalRapsNode[]; correctNodes: MentalRapsNode[]; hasRail: boolean } {
  const trapNodes = new Set<MentalRapsNode>();
  const correctNodes = new Set<MentalRapsNode>();

  const trapNode = inferMentalRapsNode(label, detail);
  const correctNode = inferMentalRapsNode(label, correct);

  if (trapNode !== 'geral' && trapNode !== 'raps') trapNodes.add(trapNode);
  if (correctNode !== 'geral') correctNodes.add(correctNode);

  if (trapNodes.size === 0 && /hospital|asilo|exclus/i.test(detail)) trapNodes.add('legado');
  if (correctNodes.size === 0 && /raps|aten[cç][aã]o psicossocial/i.test(correct)) correctNodes.add('raps');

  const trapArr = [...trapNodes];
  const correctArr = [...correctNodes];
  return { trapNodes: trapArr, correctNodes: correctArr, hasRail: trapArr.length > 0 || correctArr.length > 0 };
}

export function inferMentalCrisisTrapLanes(
  label: string,
  detail: string,
  correct: string,
): { trapSteps: MentalCrisisStep[]; correctSteps: MentalCrisisStep[]; hasRail: boolean } {
  const trapSteps = new Set<MentalCrisisStep>();
  const correctSteps = new Set<MentalCrisisStep>();

  const trapStep = inferMentalCrisisStep(label, detail);
  const correctStep = inferMentalCrisisStep(label, correct);

  if (trapStep !== 'geral') trapSteps.add(trapStep);
  if (correctStep !== 'geral') correctSteps.add(correctStep);

  if (trapSteps.size === 0 && /conten[cç][aã]o|coer[cç]/i.test(detail)) trapSteps.add('contencao');
  if (correctSteps.size === 0 && /acolh|escuta|v[ií]nculo/i.test(correct)) correctSteps.add('acolhimento');

  const trapArr = [...trapSteps];
  const correctArr = [...correctSteps];
  return { trapSteps: trapArr, correctSteps: correctArr, hasRail: trapArr.length > 0 || correctArr.length > 0 };
}

export type ParsedMentalRapsStep = {
  kind: 'eliminate' | 'locate' | 'fixation' | 'anchor' | 'step';
  text: string;
  title: string;
  letter?: string;
  nodes: MentalRapsNode[];
};

export function parseMentalRapsStep(raw: string): ParsedMentalRapsStep {
  const text = raw.trim();
  const lower = text.toLowerCase();

  const letterMatch = text.match(/letra\s+([A-E])\b/i);
  const letter = letterMatch?.[1]?.toUpperCase();

  let kind: ParsedMentalRapsStep['kind'] = 'step';
  if (/eliminar|descartar|afastar/i.test(lower)) kind = 'eliminate';
  else if (/localizar|identificar|nome da rede|sigla/i.test(lower)) kind = 'locate';
  else if (/fixa[cç][aã]o|gabarito|resposta/i.test(lower)) kind = 'fixation';
  else if (/enquadramento|reforma|pol[ií]tica/i.test(lower)) kind = 'anchor';

  const nodes = MENTAL_RAPS_NODES.filter((node) => {
    const probe = inferMentalRapsNode(node, text);
    return probe === node;
  });
  const inferred = inferMentalRapsNode(text, text);
  const merged = nodes.length > 0 ? nodes : inferred !== 'geral' ? [inferred] : [];

  return {
    kind,
    text,
    title: text.length > 72 ? `${text.slice(0, 69)}…` : text,
    letter,
    nodes: merged,
  };
}

export type ParsedMentalCrisisStep = {
  kind: 'eliminate' | 'prioritize' | 'fixation' | 'anchor' | 'step';
  text: string;
  title: string;
  letter?: string;
  steps: MentalCrisisStep[];
};

export function parseMentalCrisisStep(raw: string): ParsedMentalCrisisStep {
  const text = raw.trim();
  const lower = text.toLowerCase();

  const letterMatch = text.match(/letra\s+([A-E])\b/i);
  const letter = letterMatch?.[1]?.toUpperCase();

  let kind: ParsedMentalCrisisStep['kind'] = 'step';
  if (/eliminar|descartar|afastar/i.test(lower)) kind = 'eliminate';
  else if (/priorizar|primeiro|1[aª]\s*linha|escuta|acolh/i.test(lower)) kind = 'prioritize';
  else if (/fixa[cç][aã]o|gabarito|resposta/i.test(lower)) kind = 'fixation';
  else if (/enquadramento|caps|crise/i.test(lower)) kind = 'anchor';

  const step = inferMentalCrisisStep(text, text);
  const steps = step !== 'geral' ? [step] : [];

  return { kind, text, title: text.length > 72 ? `${text.slice(0, 69)}…` : text, letter, steps };
}
