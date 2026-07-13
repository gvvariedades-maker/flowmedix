/**
 * Inferência para moldes L3 — adolescente_antropometria (escore Z / Caderneta).
 */

export type ZRailSlot =
  | 'tool'
  | 'metric'
  | 'band_overweight'
  | 'action'
  | 'band_severe_low'
  | 'band_severe_high'
  | 'pegadinha'
  | 'general';

export type ZBandId =
  | 'magreza_acentuada'
  | 'magreza'
  | 'eutrofia'
  | 'sobrepeso'
  | 'obesidade'
  | 'obesidade_grave'
  | 'estatura_baixa'
  | 'general';

export type AdolescentZStepKind =
  | 'context'
  | 'classify_ok'
  | 'eliminate'
  | 'threshold'
  | 'mark'
  | 'fixacao'
  | 'step';

export const Z_RAIL_MARKERS = [-3, -2, -1, 0, 1, 2, 3] as const;

export const ADOLESCENT_Z_SCORE_POSITIVE: RegExp[] = [
  /escore\s*z|score\s*z/i,
  /\bz\s*(?:do\s+)?imc|imc\s+com\s+z/i,
  /caderneta\s+do\s+adolescente|curvas?\s+oms/i,
  /classifica[cç][aã]o\s+nutricional/i,
  /desvio[\s-]?padr[aã]o/i,
];

export function inferZRailSlot(title: string, description: string): ZRailSlot {
  const text = `${title} ${description}`.toLowerCase();
  if (/caderneta|curvas?\s*oms|gráfico|grafico/.test(text)) return 'tool';
  if (/escore\s*z|score\s*z|desvio[\s-]?padr[aã]o|mediana/.test(text)) return 'metric';
  if (/sobrepeso|\+1.*\+2|\+1 a \+2/.test(text)) return 'band_overweight';
  if (/alimenta[cç][aã]o|atividade\s+f[ií]sica|conduta|orientar|estilo\s+de\s+vida/.test(text)) {
    return 'action';
  }
  if (/magreza\s+acentuada|muito\s+baixa|<\s*−3|<\s*-3|z\s*<\s*−3|z\s*<\s*-3/.test(text)) {
    return 'band_severe_low';
  }
  if (/obesidade\s+grave|>\s*\+3|z\s*>\s*\+3/.test(text)) return 'band_severe_high';
  if (/deslocar|desvio-padr[aã]o|faixa\s+intermedi[aá]ria|pegadinha|±1/.test(text)) return 'pegadinha';
  return 'general';
}

export function zRailSlotLabel(slot: ZRailSlot): string {
  switch (slot) {
    case 'tool':
      return 'Ferramenta';
    case 'metric':
      return 'Escore Z';
    case 'band_overweight':
      return 'Sobrepeso';
    case 'action':
      return 'Conduta';
    case 'band_severe_low':
      return 'Limite baixo';
    case 'band_severe_high':
      return 'Limite alto';
    case 'pegadinha':
      return 'Pegadinha';
    default:
      return 'Contexto';
  }
}

export function inferZBandId(label: string, value: string): ZBandId {
  const text = `${label} ${value}`.toLowerCase();
  if (/estatura\s+muito\s+baixa|z\s+estatura/.test(text)) return 'estatura_baixa';
  if (/magreza\s+acentuada|z\s*<\s*−3|z\s*<\s*-3/.test(text)) return 'magreza_acentuada';
  if (/^magreza\b|−3\s*≤.*−2|-3\s*<=.*-2/.test(text)) return 'magreza';
  if (/eutrofi/.test(text)) return 'eutrofia';
  if (/sobrepeso|\+1\s*<\s*z\s*≤\s*\+2|\+1 a \+2/.test(text)) return 'sobrepeso';
  if (/obesidade\s+grave|z\s*>\s*\+3/.test(text)) return 'obesidade_grave';
  if (/obesidade/.test(text)) return 'obesidade';
  return 'general';
}

export function zBandRailPosition(band: ZBandId): number {
  switch (band) {
    case 'magreza_acentuada':
      return -3;
    case 'magreza':
      return -2.5;
    case 'eutrofia':
      return 0;
    case 'sobrepeso':
      return 1.5;
    case 'obesidade':
      return 2.5;
    case 'obesidade_grave':
      return 3.5;
    case 'estatura_baixa':
      return -3.5;
    default:
      return 0;
  }
}

export function extractZRange(text: string): { low?: number; high?: number } | null {
  const normalized = text.replace(/−/g, '-').replace(/≤/g, '<=').replace(/≥/g, '>=');
  const between = normalized.match(/([+-]?\d+)\s*(?:a|e)\s*([+-]?\d+)/i);
  if (between) {
    return { low: Number(between[1]), high: Number(between[2]) };
  }
  const lt = normalized.match(/<\s*([+-]?\d+)/);
  if (lt) return { high: Number(lt[1]) - 0.01 };
  const gt = normalized.match(/>\s*([+-]?\d+)/);
  if (gt) return { low: Number(gt[1]) + 0.01 };
  return null;
}

export function parseAdolescentZStep(
  step: string,
  index: number,
): {
  kind: AdolescentZStepKind;
  letter?: string;
  raw: string;
  index: number;
} {
  const raw = step.trim();
  const lower = raw.toLowerCase();

  if (/^comando:/i.test(raw)) {
    return { kind: 'context', raw, index };
  }
  if (/fixa[cç][aã]o:|em similares/i.test(lower)) {
    return { kind: 'fixacao', raw, index };
  }
  if (/marcar\s+([a-e])/i.test(lower)) {
    const m = lower.match(/marcar\s+([a-e])/i);
    return { kind: 'mark', letter: m?.[1]?.toUpperCase(), raw, index };
  }
  if (/elimina|falsa|faixa\s+errada|limiar\s+errado/i.test(lower)) {
    const letter = raw.match(/^([A-E]):/i)?.[1]?.toUpperCase() ?? raw.match(/\b([A-E])\b/i)?.[1]?.toUpperCase();
    return { kind: 'eliminate', letter, raw, index };
  }
  if (/grave|acentuada|muito\s+baixa|<\s*−3|<\s*-3|>\s*\+3/i.test(lower)) {
    const letter = raw.match(/\b([A-E])\b/i)?.[1]?.toUpperCase();
    return { kind: 'threshold', letter, raw, index };
  }
  if (/correta|conforme|mantém|mantem|ms\/oms/i.test(lower)) {
    const letter = raw.match(/^([A-E]):/i)?.[1]?.toUpperCase() ?? raw.match(/\b([A-E])\b/i)?.[1]?.toUpperCase();
    return { kind: 'classify_ok', letter, raw, index };
  }

  return { kind: 'step', raw, index };
}

export function inferZTrapBands(detail: string, correct: string): {
  trapPosition: number;
  correctPosition: number;
  trapLabel: string;
} {
  const trapRange =
    extractZRange(detail) ??
    (() => {
      const m = detail.replace(/−/g, '-').match(/([+-]?\d+)\s*(?:a|e)\s*([+-]?\d+)/i);
      return m ? { low: Number(m[1]), high: Number(m[2]) } : null;
    })();

  let trapPosition = 2;
  if (trapRange?.low != null && trapRange?.high != null) {
    trapPosition = (trapRange.low + trapRange.high) / 2;
  } else if (/grave.*\+2|obesidade\s+grave/i.test(detail)) {
    trapPosition = 2.5;
  } else if (/muito\s+baixa|−1.*−2|-1.*-2/i.test(detail)) {
    trapPosition = -1.5;
  } else if (/severa|−2.*−3|-2.*-3/i.test(detail)) {
    trapPosition = -2.5;
  }

  let correctPosition = trapPosition;
  if (/>\s*\+3|grave\s*=\s*z\s*>/i.test(correct)) correctPosition = 3.5;
  else if (/<\s*−3|<\s*-3|muito\s+baixa/i.test(correct)) correctPosition = -3.5;
  else if (/\+1.*\+2|sobrepeso/i.test(correct)) correctPosition = 1.5;
  else if (/\+2.*\+3/.test(correct) && !/grave/i.test(correct)) correctPosition = 2.5;

  const trapLabel =
    trapRange?.low != null && trapRange?.high != null
      ? `Z ${trapRange.low} a ${trapRange.high}`
      : 'faixa errada';

  return { trapPosition, correctPosition, trapLabel };
}

export function extractLetterFromTrapLabel(label: string): string | undefined {
  const m = label.match(/letra\s+([a-e])/i) ?? label.match(/^([A-E])\b/);
  return m?.[1]?.toUpperCase();
}
