/** Utilitários de slot — moldes L3 EXCETO/INCORRETA (Cuidados na Administração). */

export type CamExcetoRailSlot =
  | 'comando'
  | 'conduta_correta'
  | 'excecao'
  | 'preparo'
  | 'alerta'
  | 'geral';

export const CAM_EXCETO_RAIL_SLOTS: CamExcetoRailSlot[] = [
  'comando',
  'conduta_correta',
  'excecao',
  'preparo',
  'alerta',
];

export type CamExcetoTrapSlot =
  | 'vo_fisiologica'
  | 'preparo_errado'
  | 'excecao_clausula'
  | 'conduta_correta_distrator';

export const CAM_EXCETO_TRAP_SLOTS: CamExcetoTrapSlot[] = [
  'vo_fisiologica',
  'preparo_errado',
  'excecao_clausula',
  'conduta_correta_distrator',
];

export function camExcetoRailSlotLabel(slot: CamExcetoRailSlot): string {
  const labels: Record<CamExcetoRailSlot, string> = {
    comando: 'Comando',
    conduta_correta: 'Correta',
    excecao: 'Exceção',
    preparo: 'Preparo',
    alerta: 'Alerta',
    geral: 'EXCETO',
  };
  return labels[slot];
}

export function camExcetoTrapSlotLabel(slot: CamExcetoTrapSlot): string {
  const labels: Record<CamExcetoTrapSlot, string> = {
    vo_fisiologica: 'VO + SF',
    preparo_errado: 'Preparo',
    excecao_clausula: 'Cláusula',
    conduta_correta_distrator: 'Conduta',
  };
  return labels[slot];
}

export function inferCamExcetoRailSlot(title: string, detail: string): CamExcetoRailSlot {
  const text = `${title} ${detail}`.toLowerCase();

  if (/incorreta|exceto|afirmativa\s+falsa|qual\s+n[aã]o|assinale/i.test(text)) return 'comando';
  if (/via oral.*fisiol[oó]gica|vo\s*\+\s*sf|solu[cç][aã]o fisiol[oó]gica.*oral/i.test(text)) {
    return 'excecao';
  }
  if (/misturar|dilui[cç][aã]o|sala de medica[cç][aã]o|preparo|higieniza[cç][aã]o|lavar as m[aã]os/i.test(text)) {
    return 'preparo';
  }
  if (/prescri[cç][aã]o|protocolo|manter com o profissional|n[aã]o misturar/i.test(text)) {
    return 'conduta_correta';
  }
  if (/pegadinha|exceto|n[aã]o\s+[eé]|uso habitual|leito/i.test(text)) return 'alerta';

  return 'geral';
}

export function inferCamExcetoTrapSlot(
  label: string,
  detail: string,
  correct: string,
): CamExcetoTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();

  if (/via oral|fisiol[oó]gica|vo\s*\+\s*sf|diluir.*oral/i.test(text)) return 'vo_fisiologica';
  if (/preparo|sala de medica|misturar|dilui[cç][aã]o|higieniza/i.test(text)) return 'preparo_errado';
  if (/exceto|incorreta|cl[aá]usula|uso habitual|leito|n[uú]mero do quarto/i.test(text)) {
    return 'excecao_clausula';
  }

  return 'conduta_correta_distrator';
}
