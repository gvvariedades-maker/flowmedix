/** Utilitários compartilhados pelos moldes premium de Cuidados na Administração de Medicamentos (CAM). */

export type CamCategory =
  | 'identificacao'
  | 'alto_risco'
  | 'duvida'
  | 'certos'
  | 'regra_ouro'
  | 'pegadinha'
  | 'geral';

export type CamChipColor = 'teal' | 'emerald' | 'rose' | 'amber' | 'sky';

export interface CamThemeChip {
  label: string;
  color: CamChipColor;
}

export { parsePniVfStep as parseCamVfStep } from '@/lib/slides/pniSlideUtils';

export function inferCamCategory(text: string): CamCategory {
  const lower = text.toLowerCase();
  if (/^i\s*[—–-]|afirmativa\s+i\b|identifica[cç][aã]o|dois identificador|paciente certo/.test(lower)) {
    return 'identificacao';
  }
  if (/^ii\s*[—–-]|afirmativa\s+ii\b|alto risco|heparina|insulina|confer[eê]ncia dupla|quimioter[aá]pico/.test(lower)) {
    return 'alto_risco';
  }
  if (/^iii\s*[—–-]|afirmativa\s+iii\b|d[uú]vida|ileg[ií]vel|dose duvidosa|uso habitual|prescri[cç][aã]o/.test(lower)) {
    return 'duvida';
  }
  if (/9 certos|nove certos|p·m·d·v|paciente.*medicamento.*dose|listchecks/.test(lower)) {
    return 'certos';
  }
  if (/regra de ouro|suspender|comunicar|aguardar|n[aã]o administrar/.test(lower)) {
    return 'regra_ouro';
  }
  if (/pegadinha|padr[aã]o banca|libera administra[cç][aã]o|leito|n[uú]mero do quarto/.test(lower)) {
    return 'pegadinha';
  }
  return 'geral';
}

export function inferVfChip(text: string): 'V' | 'F' | null {
  const lower = text.toLowerCase();
  if (/\(v\)|\bverdadeira\b|\bverdadeiro\b/.test(lower)) return 'V';
  if (/\(f\)|\bfalsa\b|\bfalso\b/.test(lower)) return 'F';
  return null;
}

export function extractCertoNumber(label: string): number | null {
  const match = label.match(/^(\d+)\./);
  if (!match) return null;
  const n = Number.parseInt(match[1], 10);
  return n >= 1 && n <= 9 ? n : null;
}

export function inferCamRowBadge(
  label: string,
  value: string,
  emphasis?: string,
): string {
  const text = `${label} ${value}`.toLowerCase();
  if (emphasis === 'alert' || /alto risco|dupla checagem|d[uú]vida|suspender/.test(text)) {
    return 'ALERTA';
  }
  if (/dose certa|via certa|mg|ml|ui\b/.test(text)) return 'HOT';
  if (/regra de ouro|suspender|comunicar/.test(text)) return 'DÚVIDA';
  const certo = extractCertoNumber(label);
  if (certo) return `${certo}`;
  return 'CERTO';
}

export function inferCamIconName(text: string): string {
  switch (inferCamCategory(text)) {
    case 'identificacao':
      return 'UserCheck';
    case 'alto_risco':
      return 'ShieldAlert';
    case 'duvida':
      return 'Ban';
    case 'certos':
      return 'ListChecks';
    case 'regra_ouro':
      return 'AlertCircle';
    case 'pegadinha':
      return 'Pill';
    default:
      return 'Clock';
  }
}

export function inferCamTrapSlots(
  label: string,
  detail: string,
  correct: string,
): { chips: CamThemeChip[]; hasChips: boolean } {
  const combined = `${label} ${detail} ${correct}`.toLowerCase();
  const chips: CamThemeChip[] = [];
  const seen = new Set<string>();

  const push = (chipLabel: string, color: CamChipColor) => {
    if (seen.has(chipLabel)) return;
    seen.add(chipLabel);
    chips.push({ label: chipLabel, color });
  };

  if (/uso habitual|h[aá]bito local/.test(combined)) push('uso habitual', 'rose');
  if (/leito|n[uú]mero do quarto|quarto/.test(combined)) push('só leito', 'amber');
  if (/dupla checagem|confer[eê]ncia dupla|dois profissionais/.test(combined)) {
    push('dupla checagem', 'teal');
  }
  if (/ileg[ií]vel|dose duvidosa|d[uú]vida/.test(combined)) push('dúvida', 'rose');
  if (/s[oó]\s+i\b|ignora ii|apenas i\b/.test(combined)) push('só I', 'amber');
  if (/ii\s+e\s+iii|iii parece/.test(combined)) push('II+III', 'amber');

  return { chips, hasChips: chips.length > 0 };
}

export function extractLetterFromLabel(label: string): string | null {
  const match = label.match(/(?:^Letra\s+|^)([A-E])\b/i);
  return match?.[1]?.toUpperCase() ?? null;
}

// ---- Alto risco (cam_alto_risco) ----

export type HighRiskCategory =
  | 'dupla_checagem'
  | 'insulina'
  | 'heparina'
  | 'tecnica_sc'
  | 'medicamento'
  | 'pegadinha'
  | 'geral';

export function inferHighRiskCategory(text: string): HighRiskCategory {
  const lower = text.toLowerCase();
  if (/confer[eê]ncia dupla|dois profissionais|dupla checagem/.test(lower)) return 'dupla_checagem';
  if (/insulina|nph|regular|homogeneizar|seringa/.test(lower)) return 'insulina';
  if (/heparina|anticoagulante|varfarina/.test(lower)) return 'heparina';
  if (/subcut[aâ]nea|\bsc\b|massagear|10\s*seg|agulha|picada|abdome|coxa/.test(lower)) {
    return 'tecnica_sc';
  }
  if (/alto risco|quimioter[aá]pico|eletr[oó]litos|vasoativ/.test(lower)) return 'medicamento';
  if (/pegadinha|banca|confund/.test(lower)) return 'pegadinha';
  return 'geral';
}

export function inferHighRiskRowBadge(
  label: string,
  value: string,
  emphasis?: string,
): string {
  const text = `${label} ${value}`.toLowerCase();
  if (emphasis === 'alert' || /alto risco|confer[eê]ncia dupla|dupla checagem/.test(text)) {
    return 'ALERTA';
  }
  if (/nph|homogeneizar|10\s*s|mistura/.test(text)) return 'HOT';
  if (/regular|cristalina|n[aã]o massagear/.test(text)) return 'OK';
  const step = label.match(/^(\d+)\./);
  if (step) return step[1];
  return 'PROTOCOLO';
}

export function inferHighRiskIconName(text: string): string {
  switch (inferHighRiskCategory(text)) {
    case 'dupla_checagem':
      return 'Users';
    case 'insulina':
      return 'Syringe';
    case 'heparina':
      return 'Droplet';
    case 'tecnica_sc':
      return 'ShieldAlert';
    case 'medicamento':
      return 'Pill';
    case 'pegadinha':
      return 'AlertTriangle';
    default:
      return 'Shield';
  }
}

export function inferHighRiskTrapSlots(
  label: string,
  detail: string,
  correct: string,
): { chips: CamThemeChip[]; hasChips: boolean } {
  const combined = `${label} ${detail} ${correct}`.toLowerCase();
  const chips: CamThemeChip[] = [];
  const seen = new Set<string>();

  const push = (chipLabel: string, color: CamChipColor) => {
    if (seen.has(chipLabel)) return;
    seen.add(chipLabel);
    chips.push({ label: chipLabel, color });
  };

  if (/massagear|friccionar/.test(combined)) push('massagear', 'rose');
  if (/nph|leitosa/.test(combined)) push('NPH', 'amber');
  if (/regular|cristalina/.test(combined)) push('regular', 'sky');
  if (/homogeneizar|agitar|rolar/.test(combined)) push('homogeneizar', 'amber');
  if (/seringa separada|sempre separadas/.test(combined)) push('seringas', 'rose');
  if (/10\s*seg|dez segundos/.test(combined)) push('10s', 'teal');
  if (/parte interna|coxa interna/.test(combined)) push('locais SC', 'amber');
  if (/dupla checagem|confer[eê]ncia dupla/.test(combined)) push('dupla checagem', 'teal');

  return { chips, hasChips: chips.length > 0 };
}
