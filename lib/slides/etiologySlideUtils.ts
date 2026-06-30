/** Reinos etiológicos para moldes L3 — classificação bactéria × vírus × protozoário × fungo. */

export type EtiologyKingdom =
  | 'bacteria'
  | 'virus'
  | 'protozoan'
  | 'fungus'
  | 'command'
  | 'pattern'
  | 'general';

export const ETIOLOGY_KINGDOM_SLOTS: readonly EtiologyKingdom[] = [
  'bacteria',
  'virus',
  'protozoan',
  'fungus',
] as const;

const KINGDOM_LABEL: Record<EtiologyKingdom, string> = {
  bacteria: 'Bactéria',
  virus: 'Vírus',
  protozoan: 'Protozoário',
  fungus: 'Fungo',
  command: 'Comando',
  pattern: 'Padrão',
  general: 'Geral',
};

export function etiologyKingdomLabel(k: EtiologyKingdom): string {
  return KINGDOM_LABEL[k] ?? 'Geral';
}

export function inferEtiologyKingdom(title: string, description: string): EtiologyKingdom {
  const text = `${title} ${description}`.toLowerCase();

  if (/comando\s+todas|quantificador|todas as doenças|nenhum intruso/i.test(text)) {
    return 'command';
  }
  if (/padr[aã]o|banca|ibgp|item a item/i.test(text)) {
    return 'pattern';
  }

  if (
    /\b(v[ií]rus|viral|virose|arbovirose|herpes|varicela|dengue|raiva|hpv|condiloma|resfriado)\b/i.test(
      text,
    ) ||
    /intruso.*v[ií]rus|elimina.*v[ií]rus/i.test(text)
  ) {
    return 'virus';
  }

  if (
    /\b(protozo[aá]rio|plasmodium|mal[aá]ria|giardia|ameb[ií])\b/i.test(text) ||
    /elimina.*protozo/i.test(text)
  ) {
    return 'protozoan';
  }

  if (/\b(fungo|fungic|candid[ií]ase|micose|dermatofito)\b/i.test(text)) {
    return 'fungus';
  }

  if (
    /\b(bact[eé]ri|bacterian|rickettsia|vibrio|corynebacterium|clostridium|mycobacterium|treponema|chlamydia|borrelia|bordetella|neisseria|salmonella|shigella|escherichia|gonorreia|tifoide|coqueluche|hans[eê]n|tuberculose|t[eé]tano|difteria|c[oó]lera|s[ií]filis|tracoma|lyme)\b/i.test(
      text,
    ) ||
    /100% bacterian|gabarito\s*a|rickettsia\s*=/i.test(text)
  ) {
    return 'bacteria';
  }

  return 'general';
}

export function extractLetterFromText(text: string): string | null {
  const m = text.match(/\bletra\s*([a-e])\b/i) || text.match(/\b([a-e])\s*[-–—]/i);
  return m ? m[1].toUpperCase() : null;
}

export type EtiologyLetterStatus = 'correct' | 'eliminated' | 'neutral';

export function inferEtiologyLetterStatus(
  label: string,
  value: string,
  badge?: string,
): EtiologyLetterStatus {
  const blob = `${label} ${value}`.toLowerCase();
  if (badge === 'hot' || /gabarito|100% bacterian|alternativa a/i.test(blob)) {
    return 'correct';
  }
  if (badge === 'warn' || /elimina|descarta|v[ií]rus|protozo/i.test(blob)) {
    return 'eliminated';
  }
  return 'neutral';
}

export function inferEtiologyIntruderKingdoms(
  label: string,
  detail: string,
  correct: string,
): { intruder: EtiologyKingdom[]; answer: EtiologyKingdom[] } {
  const trap = `${label} ${detail}`.toLowerCase();
  const fix = correct.toLowerCase();

  const intruder: EtiologyKingdom[] = [];
  if (/dengue|varicela|herpes|raiva|hpv|resfriado|v[ií]rus|arbovirose/i.test(trap)) {
    intruder.push('virus');
  }
  if (/mal[aá]ria|plasmodium|protozo/i.test(trap)) {
    intruder.push('protozoan');
  }
  if (/candid|fungo|micose/i.test(trap)) {
    intruder.push('fungus');
  }

  const answer: EtiologyKingdom[] = [];
  if (/bact[eé]ri|rickettsia|gabarito letra a/i.test(fix)) {
    answer.push('bacteria');
  }
  if (/v[ií]rus/i.test(fix) && intruder.includes('virus')) {
    answer.push('virus');
  }

  return { intruder, answer };
}
