/** Utilitários compartilhados pelos moldes premium de Imunização (PNI). */

export type PniCategory = 'calendario' | 'intervalo' | 'rede_frio' | 'cuidado' | 'gabarito' | 'geral';

export type PniChipColor = 'lime' | 'sky' | 'amber' | 'teal' | 'emerald';

export interface PniIntervalChip {
  label: string;
  color: PniChipColor;
}

export type VfJudgement = 'true' | 'false' | null;

export type PniVfStepKind = 'judgement' | 'combine' | 'locate' | 'fixation' | 'eliminate' | 'step';

export interface ParsedPniVfStep {
  kind: PniVfStepKind;
  text: string;
  title: string;
  roman?: string;
  judgement?: VfJudgement;
  question?: string;
}

const PNI_MONTHS = [0, 2, 3, 4, 5, 6, 12] as const;

export function inferPniCategory(text: string): PniCategory {
  const lower = text.toLowerCase();
  if (/gabarito|combinação correta|combinação —|letra [a-e]|marcar/.test(lower)) return 'gabarito';
  if (/gestante|imunodeprim|contraindicat|corticoide|vivo atenuado/.test(lower)) return 'cuidado';
  if (/2\s*°c|8\s*°c|cadeia de frio|termômetro|isopor|freezer|termoláb|rede de frio/.test(lower)) {
    return 'rede_frio';
  }
  if (
    /grace|4\s*dia|intervalo|semana|8sem|30\s*dia|1\s*ano|simultâneo|vpc13|vpp23|oral ×|injetável/.test(
      lower,
    )
  ) {
    return 'intervalo';
  }
  if (/\d+\s*m[eê]s|ao nascer|calendário|bcg|meningo|pentavalente|rotavírus|pneumo/.test(lower)) {
    return 'calendario';
  }
  return 'geral';
}

export function inferPniIconName(text: string): string {
  switch (inferPniCategory(text)) {
    case 'calendario':
      return 'Calendar';
    case 'intervalo':
      return 'Clock';
    case 'rede_frio':
      return 'Thermometer';
    case 'cuidado':
      return 'ShieldAlert';
    case 'gabarito':
      return 'CheckCircle';
    default:
      return 'Syringe';
  }
}

export function inferIntervalChips(text: string): PniIntervalChip[] {
  const lower = text.toLowerCase();
  const chips: PniIntervalChip[] = [];
  const seen = new Set<string>();

  const push = (label: string, color: PniChipColor) => {
    if (seen.has(label)) return;
    seen.add(label);
    chips.push({ label, color });
  };

  if (/grace|4\s*dia|≤4|até 4/.test(lower)) push('4D', 'amber');
  if (/30\s*dia|30d/.test(lower)) push('30D', 'sky');
  if (/8\s*sem|8sem/.test(lower)) push('8SEM', 'sky');
  if (/1\s*ano|12\s*mes/.test(lower) && /vpc|vpp|intervalo|ano/.test(lower)) push('1A', 'sky');
  if (/2\s*.*8\s*°c|cadeia de frio|termoláb/.test(lower)) push('2–8°C', 'teal');
  if (/4\s*sem|semanas entre/.test(lower) && /viral|vivo/.test(lower)) push('4SEM', 'sky');

  for (const month of PNI_MONTHS) {
    if (month === 0 && /ao nascer|nascimento|neonatal/.test(lower)) {
      push('0', 'lime');
      continue;
    }
    if (new RegExp(`${month}\\s*(?:º|o)?\\s*m[eê]s`).test(lower)) {
      push(`${month}M`, 'lime');
    }
  }

  if (/3-5-12|3 · 5 · 12|3, 5 e 12/.test(lower)) {
    push('3M', 'lime');
    push('5M', 'lime');
    push('12M', 'lime');
  }

  return chips;
}

export function inferPniRowChip(text: string): string {
  const chips = inferIntervalChips(text);
  if (chips.length > 0) return chips[0].label;
  const lower = text.toLowerCase();
  if (/falsa|falso/.test(lower)) return 'F';
  if (/verdadeira|verdadeiro/.test(lower)) return 'V';
  if (/gabarito|letra/.test(lower)) return '✓';
  return 'PNI';
}

export function isPniConclusionRow(label: string, value: string): boolean {
  const text = `${label} ${value}`.toLowerCase();
  return /combinação|gabarito|letra [a-e]|conclus|marcar/.test(text);
}

export type PniMatrixRowBadge = 'FALSA' | 'VERDADEIRA' | 'REFERÊNCIA';

/** Badge V/F/REFERÊNCIA para linhas do molde pni-interval-matrix (V/F e MCQ). */
export function inferPniMatrixRowBadge(
  label: string,
  value: string,
  emphasis?: string,
): PniMatrixRowBadge {
  const combined = `${label} ${value}`.toLowerCase();

  if (emphasis === 'alert' || /\(incorreta\)/i.test(label)) return 'FALSA';
  if (
    (/\bfalsa\b|\bfalso\b/.test(combined) && !/verdadeir/.test(combined)) ||
    /→\s*falso|→\s*f\b/.test(combined)
  ) {
    return 'FALSA';
  }

  if (emphasis === 'success' || /\(correta\)/i.test(label)) return 'VERDADEIRA';
  if (/verdadeira|verdadeiro|gabarito|letra [a-e]|→\s*verdadeiro|→\s*v\b/.test(combined)) {
    return 'VERDADEIRA';
  }

  return 'REFERÊNCIA';
}

export function inferVfJudgement(text: string): VfJudgement {
  const lower = text.toLowerCase();
  if (/→\s*falso|→\s*f\b|= falso|é falsa|falso —|falsa —|falso\.|falsa\./.test(lower)) return 'false';
  if (/→\s*verdadeiro|→\s*v\b|= verdadeiro|é verdadeira|verdadeiro —|verdadeira —/.test(lower)) {
    return 'true';
  }
  if (/\bfalsa\b|\bfalso\b/.test(lower) && !/verdadeir/.test(lower)) return 'false';
  if (/\bverdadeira\b|\bverdadeiro\b/.test(lower)) return 'true';
  return null;
}

function extractRoman(text: string): string | undefined {
  const match = text.match(/\b(I{1,3}|IV)\b/);
  return match?.[1];
}

function extractJudgementQuestion(step: string): string {
  const quoted = step.match(/['"]([^'"]{10,})['"]/);
  if (quoted) return quoted[1].trim();

  const cleaned = step
    .replace(/^(?:julgar|avaliar)\s+(?:a\s+)?(?:afirmativa\s+)?/i, '')
    .replace(/^identificar formato:.*$/i, step)
    .trim();
  const qMatch = cleaned.match(/(.+?\?)/);
  if (qMatch) return qMatch[1].trim();
  const arrowIdx = cleaned.indexOf('→');
  if (arrowIdx > 0) return `${cleaned.slice(0, arrowIdx).trim().replace(/\?$/, '')}?`;
  const withoutPrefix = cleaned.replace(/^[^:]+:\s*/, '').trim();
  const dashIdx = withoutPrefix.indexOf(' — ');
  const body = dashIdx > 40 ? withoutPrefix.slice(0, dashIdx).trim() : withoutPrefix;
  if (body.length <= 500) return body;
  return `${body.slice(0, 497)}…`;
}

export function parsePniVfStep(step: string, index: number): ParsedPniVfStep {
  const lower = step.toLowerCase();
  const roman = extractRoman(step);
  const judgement = inferVfJudgement(step);

  if (/^(?:julgar|avaliar)\s/i.test(step) || (/afirmativa\s/i.test(step) && judgement)) {
    return {
      kind: 'judgement',
      text: step,
      title: roman ? `Afirmativa ${roman}` : `Julgamento ${index + 1}`,
      roman,
      judgement,
      question: extractJudgementQuestion(step),
    };
  }

  if (/montar conjunto|combinação|conjunto verdadeiro/i.test(lower)) {
    return { kind: 'combine', text: step, title: 'Montar combinação', roman, judgement };
  }

  if (/localizar|alternativa|letra [a-e]/i.test(lower) && /marcar|localizar|buscar/i.test(lower)) {
    return { kind: 'locate', text: step, title: 'Localizar letra', roman, judgement };
  }

  if (/eliminar/i.test(lower)) {
    return { kind: 'eliminate', text: step, title: 'Eliminar alternativas', roman, judgement };
  }

  if (/fixação|fixar|decore/i.test(lower)) {
    return { kind: 'fixation', text: step, title: 'Fixação', roman, judgement };
  }

  if (/marcar [a-e]/i.test(lower)) {
    return { kind: 'locate', text: step, title: 'Marcar gabarito', roman, judgement };
  }

  let title = `Passo ${index + 1}`;
  if (/identificar formato/i.test(lower)) title = 'Formato da questão';

  return { kind: 'step', text: step, title, roman, judgement };
}

export function extractPniMonths(text: string): number[] {
  const lower = text.toLowerCase();
  const found = new Set<number>();
  if (/ao nascer|nascimento|neonatal/.test(lower)) found.add(0);
  for (const match of lower.matchAll(/(\d+)\s*(?:º|o)?\s*m[eê]s/g)) {
    const n = Number.parseInt(match[1], 10);
    if ((PNI_MONTHS as readonly number[]).includes(n)) found.add(n);
  }
  if (/3-5-12|3 · 5 · 12|3, 5 e 12/.test(lower)) {
    found.add(3);
    found.add(5);
    found.add(12);
  }
  if (/2, 4 e 12|2 · 4 · 12|2 e 4 meses/.test(lower)) {
    found.add(2);
    found.add(4);
    if (/12/.test(lower)) found.add(12);
  }
  if (/2, 4 e 6|2-4-6|2, 4 e 6 meses/.test(lower)) {
    found.add(2);
    found.add(4);
    found.add(6);
  }
  return [...found];
}

export function inferPniTrapSlots(
  label: string,
  detail: string,
  correct: string,
): {
  trapMonths: number[];
  correctMonths: number[];
  chips: PniIntervalChip[];
  hasRail: boolean;
  hasChips: boolean;
} {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();
  const combined = `${label} ${detail} ${correct}`;

  let trapMonths = extractPniMonths(`${label} ${detail}`);
  let correctMonths = extractPniMonths(correct);
  const chips = inferIntervalChips(combined);

  if (trapMonths.length === 0 && /3\s*m/.test(trapText)) trapMonths = [3];
  if (/bcg/.test(trapText) && trapMonths.includes(3)) {
    correctMonths = correctMonths.length > 0 ? correctMonths : [0];
  }
  if (/rotav/.test(trapText) && trapMonths.includes(3)) {
    correctMonths = correctMonths.length > 0 ? correctMonths : [2, 4];
  }
  if (/pneumo/.test(trapText) && trapMonths.includes(3)) {
    correctMonths = correctMonths.length > 0 ? correctMonths : [2, 4, 12];
  }
  if (/difteria|pentavalente|dtp/.test(trapText) && trapMonths.includes(3)) {
    correctMonths = correctMonths.length > 0 ? correctMonths : [2, 4, 6];
  }
  if (/meningo|men c/.test(trapText) && !/acwy/.test(trapText)) {
    if (trapMonths.length === 0 && /3/.test(trapText)) trapMonths = [3];
    if (correctMonths.length === 0) correctMonths = [3, 5, 12];
  }
  if (/3ª dose/.test(trapText)) {
    trapMonths = [3];
    correctMonths = correctMonths.length > 0 ? correctMonths : [6];
  }

  const hasRail = trapMonths.length > 0 || correctMonths.length > 0;
  const hasChips = chips.length > 0;

  return { trapMonths, correctMonths, chips, hasRail, hasChips };
}

export const PNI_MONTH_SLOTS = PNI_MONTHS;

export function pniMonthLabel(month: number): string {
  return month === 0 ? '0' : `${month}M`;
}

export type PniCalendarStepKind =
  | 'anchor_age'
  | 'eliminate'
  | 'locate'
  | 'catchup_eliminate'
  | 'fixation'
  | 'scenario'
  | 'step';

export interface ParsedPniCalendarStep {
  kind: PniCalendarStepKind;
  text: string;
  title: string;
  letter?: string;
  months?: number[];
}

/** Detecta modo catch-up (cartão perdido / sem comprovação) — oculta trilho de meses. */
export function isPniCatchUpCorpus(text: string): boolean {
  return /cart[aã]o perdido|sem comprova[cç][aã]o|catch-?up|hist[oó]rico incompleto|esquema incompleto/i.test(
    text,
  );
}

export function inferCalendarRowMonths(label: string, value: string): number[] {
  return extractPniMonths(`${label} ${value}`);
}

export function isCalendarHotRow(
  label: string,
  value: string,
  emphasis?: string,
  badge?: string,
): boolean {
  if (emphasis === 'highlight' || badge === 'hot') return true;
  const text = `${label} ${value}`.toLowerCase();
  return /quest[aã]o|gabarito|conduta desta|letra [a-e]/.test(text);
}

export function extractPniOptionLetter(text: string): string | null {
  const patterns = [
    /\btestar\s+([A-E])\b/i,
    /\beliminar\s+([A-E])\b/i,
    /\bmarcar\s+([A-E])\b/i,
    /\bletra\s+([A-E])\b/i,
    /\b([A-E])\s+sorologia/i,
    /\b([A-E])\s+teste/i,
    /\b([A-E])\s+ig\b/i,
    /\b([A-E])\s*[—–-]/i,
    /\(([A-E])\)/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].toUpperCase();
  }
  return null;
}

export function parsePniCalendarStep(step: string, index: number): ParsedPniCalendarStep {
  const lower = step.toLowerCase();
  const letter = extractPniOptionLetter(step);
  const months = extractPniMonths(step);

  if (/^cen[aá]rio:/i.test(step) || /adolescente|cart[aã]o perdido|sem comprova/i.test(lower)) {
    return { kind: 'scenario', text: step, title: 'Cenário', letter, months };
  }

  if (/fixar|fixa[cç][aã]o|ler o marco|3º mês|marco et[aá]rio/i.test(lower)) {
    return { kind: 'anchor_age', text: step, title: 'Marco etário', letter, months };
  }

  if (/eliminar|testar [a-e]|→ eliminar/i.test(lower)) {
    const kind =
      /sorologia|teste de sensibilidade|imunoglobulina|arquivo|ig\b/i.test(lower) &&
      !/m[eê]s|bcg|rotav|pneumo/i.test(lower)
        ? 'catchup_eliminate'
        : 'eliminate';
    return {
      kind,
      text: step,
      title: kind === 'catchup_eliminate' ? 'Eliminar conduta' : 'Eliminar alternativa',
      letter,
      months,
    };
  }

  if (/marcar|localizar alternativa/i.test(lower)) {
    return { kind: 'locate', text: step, title: 'Gabarito', letter, months };
  }

  if (/fixação|fundatec|meses vizinhos|estrat[eé]gia/i.test(lower)) {
    return { kind: 'fixation', text: step, title: 'Fixação', letter, months };
  }

  if (/abrir mentalmente|recuperar:|pn[ií]:/i.test(lower)) {
    return { kind: 'step', text: step, title: `Passo ${index + 1}`, letter, months };
  }

  return { kind: 'step', text: step, title: `Passo ${index + 1}`, letter, months };
}

// ---- Cadeia de frio / rede de frio PNI ----

export const PNI_TEMP_MARKERS = [0, 2, 8, 12] as const;

export type PniTempMarker = (typeof PNI_TEMP_MARKERS)[number];

export type ColdChainMode = 'vf' | 'mcq_temp' | 'exceto';

export function detectColdChainMode(text: string): ColdChainMode {
  if (/\( \)|sequ[eê]ncia|registre\s+v\s*\(|de cima para baixo/i.test(text)) return 'vf';
  if (/INCORRETA|EXCETO/i.test(text) && /cadeia|conserva|frio|termo|imunobiol/i.test(text)) {
    return 'exceto';
  }
  return 'mcq_temp';
}

export function isPniVfColdChainCorpus(text: string): boolean {
  return detectColdChainMode(text) === 'vf';
}

export function isPniTemperatureMcqCorpus(text: string): boolean {
  const mode = detectColdChainMode(text);
  return mode === 'mcq_temp' || mode === 'exceto';
}

export function pniTempLabel(marker: number): string {
  return marker === 0 ? '0' : `${marker}`;
}

export function extractTempMarkers(text: string): number[] {
  const lower = text.toLowerCase();
  const found = new Set<number>();

  if (/2\s*°c.*8\s*°c|2\s*-\s*8|2\s*·\s*8|entre\s*2|decore.*2|faixa da prova|positiva\s*=/.test(lower)) {
    found.add(2);
    found.add(8);
  }
  if (/piso|limite inferior|abaixo de 2|antes de 2|0\s*°c/.test(lower)) found.add(0);
  if (/\b2\s*°c\b|piso.*2/.test(lower)) found.add(2);
  if (/\b8\s*°c\b|teto|acima de 8/.test(lower)) found.add(8);
  if (/12\s*°c|faixa quente|muito acima/.test(lower)) found.add(12);
  if (/congel|negativ|freezer|gelo/.test(lower) && !/2\s*°c.*8/.test(lower)) found.add(0);

  return PNI_TEMP_MARKERS.filter((m) => found.has(m));
}

export function inferTemperatureRowMarkers(label: string, value: string): number[] {
  return extractTempMarkers(`${label} ${value}`);
}

export function isTemperatureHotRow(
  label: string,
  value: string,
  emphasis?: string,
  badge?: string,
): boolean {
  return isCalendarHotRow(label, value, emphasis, badge);
}

export type PniColdChainStepKind =
  | 'vf_judge'
  | 'vf_combine'
  | 'temp_anchor'
  | 'eliminate'
  | 'locate'
  | 'exceto'
  | 'fixation'
  | 'step';

export interface ParsedPniColdChainStep {
  kind: PniColdChainStepKind;
  text: string;
  title: string;
  letter?: string;
  markers?: number[];
}

export function parsePniColdChainStep(step: string, index: number): ParsedPniColdChainStep {
  const lower = step.toLowerCase();
  const letter = extractPniOptionLetter(step);
  const markers = extractTempMarkers(step);

  if (/decore|recuperar|temperatura positiva|2\s*°c.*8/i.test(lower)) {
    return { kind: 'temp_anchor', text: step, title: 'Decore PNI', letter, markers };
  }

  if (
    /^[IVX]+ —/i.test(step.trim()) ||
    (/→\s*[vf]\.?$/i.test(step) && /bcg|agitar|pentavalente|t[eé]cnico|cadeia/i.test(lower))
  ) {
    return { kind: 'vf_judge', text: step, title: 'Julgar assertiva', letter, markers };
  }

  if (/sequ[eê]ncia|v,\s*f,\s*v/i.test(lower)) {
    return { kind: 'vf_combine', text: step, title: 'Combinar V/F', letter, markers };
  }

  if (/INCORRETA|exceto|alternativa falsa/i.test(lower)) {
    return { kind: 'exceto', text: step, title: 'EXCETO', letter, markers };
  }

  if (/eliminar|piso|teto|congelamento|faixa quente/i.test(lower)) {
    return { kind: 'eliminate', text: step, title: 'Eliminar', letter, markers };
  }

  if (/marcar|sobra/i.test(lower)) {
    return { kind: 'locate', text: step, title: 'Gabarito', letter, markers };
  }

  if (/estrat[eé]gia|fixação|leia “positiva”/i.test(lower)) {
    return { kind: 'fixation', text: step, title: 'Fixação', letter, markers };
  }

  if (/^comando/i.test(lower) && index === 0) {
    return { kind: 'step', text: step, title: 'Comando', letter, markers };
  }

  return { kind: 'step', text: step, title: `Passo ${index + 1}`, letter, markers };
}

export function inferTemperatureSlots(
  label: string,
  detail: string,
  correct: string,
): { trapMarkers: number[]; correctMarkers: number[]; hasRail: boolean } {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();
  const combined = `${label} ${detail} ${correct}`;

  if (/transfer[eê]ncia|geladeira|porta|monitorar/i.test(combined)) {
    return { trapMarkers: [], correctMarkers: [2, 8], hasRail: false };
  }

  if (/sequ[eê]ncia|letra [a-d] —/i.test(label) && /bcg|agitar|pentavalente|t[eé]cnico/i.test(combined)) {
    return { trapMarkers: [], correctMarkers: [], hasRail: false };
  }

  let trapMarkers = extractTempMarkers(`${label} ${detail}`);
  let correctMarkers = extractTempMarkers(correct);

  if (/limite inferior|piso|abaixo de 2|letra a/i.test(trapText)) {
    trapMarkers = trapMarkers.length > 0 ? trapMarkers : [0, 2];
    correctMarkers = correctMarkers.length > 0 ? correctMarkers : [2, 8];
  }
  if (/limite superior|teto|acima de 8|letra c/i.test(trapText)) {
    trapMarkers = trapMarkers.length > 0 ? trapMarkers : [8, 12];
    correctMarkers = correctMarkers.length > 0 ? correctMarkers : [2, 8];
  }
  if (/congelamento|negativ|letra d/i.test(trapText)) {
    trapMarkers = [0];
    correctMarkers = correctMarkers.length > 0 ? correctMarkers : [2, 8];
  }
  if (/quente|ambiente|letra e|muito acima/i.test(trapText)) {
    trapMarkers = trapMarkers.length > 0 ? trapMarkers : [12];
    correctMarkers = correctMarkers.length > 0 ? correctMarkers : [2, 8];
  }

  const hasRail = trapMarkers.length > 0 || correctMarkers.length > 0;
  return { trapMarkers, correctMarkers, hasRail };
}
