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
  const cleaned = step
    .replace(/^julgar\s+(?:a\s+)?(?:afirmativa\s+)?/i, '')
    .replace(/^identificar formato:.*$/i, step)
    .trim();
  const qMatch = cleaned.match(/(.+?\?)/);
  if (qMatch) return qMatch[1].trim();
  const arrowIdx = cleaned.indexOf('→');
  if (arrowIdx > 0) return cleaned.slice(0, arrowIdx).trim().replace(/\?$/, '') + '?';
  return cleaned.replace(/^[^:]+:\s*/, '').slice(0, 120);
}

export function parsePniVfStep(step: string, index: number): ParsedPniVfStep {
  const lower = step.toLowerCase();
  const roman = extractRoman(step);
  const judgement = inferVfJudgement(step);

  if (/julgar\s/i.test(step) || (/afirmativa\s/i.test(step) && judgement)) {
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
