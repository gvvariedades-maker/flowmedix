/** Utilitários compartilhados pelos moldes premium Saúde da Criança (L3 bespoke). */

export type CriancaDomain =
  | 'feeding'
  | 'screening'
  | 'pediatric'
  | 'dehydration'
  | 'puericultura'
  | 'neonatal'
  | 'development';

export type CriancaStepKind =
  | 'judgement'
  | 'eliminate'
  | 'locate'
  | 'fixation'
  | 'anchor'
  | 'step';

export interface ParsedCriancaStep {
  kind: CriancaStepKind;
  text: string;
  title: string;
  roman?: string;
  letter?: string;
  marker?: string;
  judgement?: 'true' | 'false';
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'] as const;

export function isCriancaHotRow(
  label: string,
  value: string,
  emphasis?: string,
  badge?: string,
): boolean {
  if (badge === 'hot' || emphasis === 'highlight' || emphasis === 'alert') return true;
  const text = `${label} ${value}`.toLowerCase();
  return /ame|6 meses|pezinho|plano [abc]|marco|gabarito|letra [a-e]/i.test(text);
}

export function isCriancaConclusionRow(label: string, value: string): boolean {
  const text = `${label} ${value}`.toLowerCase();
  return /gabarito|letra [a-e]|combinação|conclus/i.test(text);
}

export function inferCriancaIconName(text: string, domain?: CriancaDomain): string {
  const lower = text.toLowerCase();
  if (/ame|leite|amamenta|lactente|colostro/i.test(lower)) return 'Baby';
  if (/pezinho|tsh|fenil|triagem|oximetria|cora[cç][aã]ozinho/i.test(lower)) return 'Activity';
  if (/desidrata|diarreia|soro|plano [abc]/i.test(lower)) return 'Droplets';
  if (/marco|desenvolv|m-chat|estrabismo/i.test(lower)) return 'Sparkles';
  if (/puericultura|visita|caderneta|consulta/i.test(lower)) return 'Calendar';
  if (/apgar|rn\b|neonatal|rec[eé]m-nascido/i.test(lower)) return 'HeartPulse';
  if (/imun|anticorpo|prote[cç][aã]o/i.test(lower)) return 'Shield';
  if (/mel|alimenta|nutri/i.test(lower)) return 'Utensils';
  if (domain === 'dehydration') return 'Droplets';
  if (domain === 'screening') return 'Scan';
  return 'Heart';
}

function extractRoman(text: string): string | undefined {
  const match = text.match(/\b(I{1,3})\b/i);
  return match?.[1]?.toUpperCase();
}

function extractLetter(text: string): string | undefined {
  const match = text.match(/letra\s+([A-E])\b/i) ?? text.match(/^([A-E])[.:)\s-]/i);
  return match?.[1]?.toUpperCase();
}

export function inferCriancaMarker(
  title: string,
  description: string,
  domain: CriancaDomain,
): { label: string; focus: boolean } {
  const text = `${title} ${description}`.toLowerCase();
  const focus = /marco|foco|gabarito|pegadinha|alerta/i.test(text);

  if (domain === 'feeding') {
    if (/6 meses|ame|exclusivo/i.test(text)) return { label: '6m', focus: focus || /ame|6/i.test(text) };
    if (/mel|1\s*º m[eê]s|botulismo/i.test(text)) return { label: '!', focus: true };
    if (/colostro|imun/i.test(text)) return { label: '0-5d', focus };
    if (/introdu[cç][aã]o/i.test(text)) return { label: '6m+', focus };
    return { label: '•', focus };
  }

  if (domain === 'screening') {
    if (/pezinho|fenil|tsh|pk[uú]/i.test(text)) return { label: 'Pé', focus };
    if (/cora[cç][aã]ozinho|oximetria/i.test(text)) return { label: '♥', focus };
    if (/48\s*h|3\s*d/i.test(text)) return { label: '48h', focus };
    return { label: 'RN', focus };
  }

  if (domain === 'dehydration') {
    if (/plano\s*a|leve/i.test(text)) return { label: 'A', focus };
    if (/plano\s*b|moderad/i.test(text)) return { label: 'B', focus: true };
    if (/plano\s*c|grave|choque/i.test(text)) return { label: 'C', focus: true };
    if (/soro|hidrat/i.test(text)) return { label: 'VO', focus };
    return { label: '•', focus };
  }

  if (domain === 'puericultura') {
    if (/5\s*º dia|primeira semana/i.test(text)) return { label: '5d', focus };
    if (/1\s*m[eê]s|30 dias/i.test(text)) return { label: '1m', focus };
    if (/visita|casa/i.test(text)) return { label: 'VD', focus };
    if (/caderneta/i.test(text)) return { label: 'CAD', focus };
    return { label: 'APS', focus };
  }

  if (domain === 'neonatal') {
    if (/apgar/i.test(text)) return { label: 'APG', focus };
    if (/banho|temperatura/i.test(text)) return { label: 'T°C', focus };
    if (/icter[ií]cia|bilirrub/i.test(text)) return { label: 'ICT', focus };
    if (/glicemia|dm/i.test(text)) return { label: 'GLI', focus };
    return { label: 'RN', focus };
  }

  if (domain === 'development') {
    if (/2 meses|social/i.test(text)) return { label: '2m', focus };
    if (/6 meses|sentar/i.test(text)) return { label: '6m', focus };
    if (/12 meses|andar/i.test(text)) return { label: '12m', focus };
    if (/m-chat|tea/i.test(text)) return { label: 'M-CHAT', focus: true };
    return { label: '•', focus };
  }

  if (/lactente|crian[cç]a|pediatr/i.test(text)) return { label: 'PED', focus };
  return { label: '•', focus };
}

export type CriancaSpectrumZone =
  | 'normal'
  | 'watch'
  | 'alert'
  | 'trap'
  | 'severe';

export function inferCriancaSpectrumZone(
  title: string,
  description: string,
  domain: CriancaDomain,
): CriancaSpectrumZone {
  const text = `${title} ${description}`.toLowerCase();
  if (/pegadinha|falso|errad|contraindic|proibid/i.test(text)) return 'trap';
  if (/grave|choque|severo|emerg/i.test(text)) return 'severe';
  if (/alerta|sinal|vigil/i.test(text)) return 'alert';
  if (/moderad|observ/i.test(text)) return 'watch';
  if (domain === 'dehydration') {
    if (/plano\s*c/i.test(text)) return 'severe';
    if (/plano\s*b/i.test(text)) return 'alert';
    if (/plano\s*a/i.test(text)) return 'watch';
  }
  return 'normal';
}

export function criancaSpectrumZoneLabel(zone: CriancaSpectrumZone): string {
  switch (zone) {
    case 'normal':
      return 'OK';
    case 'watch':
      return 'Vigilar';
    case 'alert':
      return 'Alerta';
    case 'trap':
      return 'Pegadinha';
    case 'severe':
      return 'Grave';
  }
}

export type CriancaDeckSlot =
  | 'slot_a'
  | 'slot_b'
  | 'slot_c'
  | 'slot_d';

export function inferCriancaDeckSlot(title: string, description: string, domain: CriancaDomain): CriancaDeckSlot {
  const text = `${title} ${description}`.toLowerCase();
  if (domain === 'neonatal') {
    if (/1\s*min|primeiro minuto|apgar 1/i.test(text)) return 'slot_a';
    if (/5\s*min|quinto minuto|apgar 5/i.test(text)) return 'slot_b';
    if (/banho|temperatura|pele/i.test(text)) return 'slot_c';
    if (/icter[ií]cia|glicemia|surfactante/i.test(text)) return 'slot_d';
  }
  const slots: CriancaDeckSlot[] = ['slot_a', 'slot_b', 'slot_c', 'slot_d'];
  const hash = (title.length + description.length) % 4;
  return slots[hash] ?? 'slot_a';
}

export function criancaDeckSlotLabel(slot: CriancaDeckSlot, domain: CriancaDomain): string {
  if (domain === 'neonatal') {
    switch (slot) {
      case 'slot_a':
        return '1 min';
      case 'slot_b':
        return '5 min';
      case 'slot_c':
        return 'Cuidados';
      case 'slot_d':
        return 'Risco';
    }
  }
  switch (slot) {
    case 'slot_a':
      return 'I';
    case 'slot_b':
      return 'II';
    case 'slot_c':
      return 'III';
    case 'slot_d':
      return 'IV';
  }
}

export type CriancaRailSlot =
  | 'early'
  | 'mid'
  | 'late'
  | 'milestone'
  | 'trap'
  | 'general';

export function inferCriancaRailSlot(title: string, description: string): CriancaRailSlot {
  const text = `${title} ${description}`.toLowerCase();
  if (/pegadinha|falso|errad/i.test(text)) return 'trap';
  if (/2 meses|3 meses|4 meses/i.test(text)) return 'early';
  if (/6 meses|9 meses/i.test(text)) return 'mid';
  if (/12 meses|18 meses|24 meses|2 anos/i.test(text)) return 'late';
  if (/marco|m-chat|sentar|andar|falar/i.test(text)) return 'milestone';
  return 'general';
}

export function criancaRailSlotLabel(slot: CriancaRailSlot): string {
  switch (slot) {
    case 'early':
      return '0-6m';
    case 'mid':
      return '6-12m';
    case 'late':
      return '12m+';
    case 'milestone':
      return 'Marco';
    case 'trap':
      return '!';
    case 'general':
      return '•';
  }
}

export function parseCriancaTapStep(step: string, index: number): ParsedCriancaStep {
  const trimmed = step.trim();
  const roman = extractRoman(trimmed);
  const letter = extractLetter(trimmed);
  const lower = trimmed.toLowerCase();

  if (/^i\b|^ii\b|^iii\b/i.test(trimmed) || roman) {
    const isFalse = /fals|incorret|errad|não|nao/i.test(lower);
    const isTrue = /verdadeir|corret/i.test(lower);
    return {
      kind: 'judgement',
      text: trimmed,
      title: roman ? `Afirmativa ${roman}` : 'Afirmativa',
      roman,
      judgement: isFalse ? 'false' : isTrue ? 'true' : undefined,
    };
  }

  if (/elimina|descarta|letra [a-e]/i.test(lower) && letter) {
    return { kind: 'eliminate', text: trimmed, title: `Elimina ${letter}`, letter };
  }

  if (/letra [a-e]/i.test(lower) || (letter && index === trimmed.length - 3)) {
    return { kind: 'locate', text: trimmed, title: 'Gabarito', letter };
  }

  if (/fixa[cç][aã]o|decore|lembre/i.test(lower)) {
    return { kind: 'fixation', text: trimmed, title: 'Fixação' };
  }

  if (/ame|6 meses|pezinho|plano [abc]|marco/i.test(lower)) {
    return { kind: 'anchor', text: trimmed, title: 'Âncora', marker: inferCriancaMarker(trimmed, '', 'pediatric').label };
  }

  return { kind: 'step', text: trimmed, title: `Passo ${index + 1}` };
}

export function inferCriancaTrapCategory(
  label: string,
  detail: string,
  correct: string,
  domain: CriancaDomain,
): { trap: string; correct: string } {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();

  if (domain === 'feeding') {
    if (/mel/i.test(trapText)) return { trap: 'Mel precoce', correct: 'Sem mel < 1 ano' };
    if (/3 meses/i.test(trapText)) return { trap: 'AME 3m', correct: 'AME 6 meses' };
  }
  if (domain === 'screening') {
    if (/1 ano|12 meses/i.test(trapText)) return { trap: 'Tardio', correct: 'Neonatal' };
  }
  if (domain === 'dehydration') {
    if (/plano\s*a.*grave|grave.*plano\s*a/i.test(trapText)) return { trap: 'Plano errado', correct: 'Plano C' };
  }

  const trap = trapText.slice(0, 24) || 'Pegadinha';
  const corr = correctText.slice(0, 32) || 'Conduta correta';
  return { trap, correct: corr };
}

export { LETTERS as CRIANCA_LETTERS };
