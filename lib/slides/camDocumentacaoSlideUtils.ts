/** Utilitários — moldes L3 documentação / Registro certo (CAM). */

import type { CamChipColor, CamThemeChip } from '@/lib/slides/camSlideUtils';

export type CamDocumentacaoCategory =
  | 'apos_administrar'
  | 'antecipado'
  | 'postergado'
  | 'registro_campo'
  | 'pegadinha'
  | 'geral';

export function inferCamDocumentacaoCategory(text: string): CamDocumentacaoCategory {
  const lower = text.toLowerCase();
  if (/^i\s*[—–-]|afirmativa\s+i\b|ap[oó]s administrar|somente ap[oó]s|depois da dose/i.test(lower)) {
    return 'apos_administrar';
  }
  if (/^ii\s*[—–-]|afirmativa\s+ii\b|antes de administrar|antecipad|preparad.*sala/i.test(lower)) {
    return 'antecipado';
  }
  if (/^iii\s*[—–-]|afirmativa\s+iii\b|posterg|final do plant[aã]o|lembrar a hora/i.test(lower)) {
    return 'postergado';
  }
  if (/hor[aá]rio|dose|via|identifica[cç][aã]o do profissional|prontu[aá]rio|prescri[cç][aã]o/i.test(lower)) {
    return 'registro_campo';
  }
  if (/pegadinha|banca|mistura preparo|registro certo/i.test(lower)) return 'pegadinha';
  return 'geral';
}

export function inferCamDocumentacaoRowBadge(label: string, value: string, emphasis?: string): string {
  const text = `${label} ${value}`.toLowerCase();
  if (emphasis === 'alert' || /falsa|incorret|n[aã]o pode|proibid/i.test(text)) return 'ALERTA';
  if (/ap[oó]s administrar|certo 6|registro certo/i.test(text)) return '6';
  if (/^i\b|^ii\b|^iii\b|afirmativa/i.test(text)) return 'V/F';
  return 'REGISTRO';
}

export function inferCamDocumentacaoIconName(text: string): string {
  switch (inferCamDocumentacaoCategory(text)) {
    case 'apos_administrar':
      return 'ClipboardCheck';
    case 'antecipado':
      return 'FileX';
    case 'postergado':
      return 'Clock';
    case 'registro_campo':
      return 'FileText';
    case 'pegadinha':
      return 'AlertTriangle';
    default:
      return 'ClipboardList';
  }
}

export type CamDocumentacaoTrapSlot =
  | 'registro_antecipado'
  | 'postergar_plantao'
  | 'preparo_confundido'
  | 'conduta_correta';

export const CAM_DOCUMENTACAO_TRAP_SLOTS: CamDocumentacaoTrapSlot[] = [
  'registro_antecipado',
  'postergar_plantao',
  'preparo_confundido',
  'conduta_correta',
];

export function camDocumentacaoTrapSlotLabel(slot: CamDocumentacaoTrapSlot): string {
  const labels: Record<CamDocumentacaoTrapSlot, string> = {
    registro_antecipado: 'Antecipado',
    postergar_plantao: 'Postergar',
    preparo_confundido: 'Preparo',
    conduta_correta: 'Correto',
  };
  return labels[slot];
}

export function inferCamDocumentacaoTrapSlot(
  label: string,
  detail: string,
  correct: string,
): CamDocumentacaoTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();

  if (/antes de administrar|antecipad|j[aá] preparad/i.test(text)) return 'registro_antecipado';
  if (/posterg|final do plant[aã]o|lembrar a hora/i.test(text)) return 'postergar_plantao';
  if (/preparo|sala de medica|mistura preparo/i.test(text)) return 'preparo_confundido';

  return 'conduta_correta';
}

export function inferCamDocumentacaoTrapSlots(
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

  if (/antes de administrar|antecipad/i.test(combined)) push('antecipado', 'rose');
  if (/posterg|plant[aã]o/i.test(combined)) push('postergar', 'amber');
  if (/preparo|sala de medica/i.test(combined)) push('preparo ≠ registro', 'amber');
  if (/ap[oó]s administrar|certo 6/i.test(combined)) push('após dose', 'teal');
  if (/s[oó]\s+i\b|ii e iii/i.test(combined)) push('só I', 'sky');

  return { chips, hasChips: chips.length > 0 };
}
