/** Utilitários de slot para moldes L3 — Urgências / Manchester · triagem. */

export type TriageColor =
  | 'vermelho'
  | 'amarelo'
  | 'verde'
  | 'azul'
  | 'preto'
  | 'alerta'
  | 'geral';

export const TRIAGE_COLORS: TriageColor[] = ['vermelho', 'amarelo', 'verde', 'azul'];

export type UrgenciasManchesterTrapSlot =
  | 'amarelo_monitor'
  | 'azul_instabilidade'
  | 'verde_transporte'
  | 'transferencia_ps';

export const URGENCIAS_MANCHESTER_TRAP_SLOTS: UrgenciasManchesterTrapSlot[] = [
  'amarelo_monitor',
  'azul_instabilidade',
  'verde_transporte',
  'transferencia_ps',
];

export function triageColorLabel(color: TriageColor): string {
  const labels: Record<TriageColor, string> = {
    vermelho: 'Vermelho',
    amarelo: 'Amarelo',
    verde: 'Verde',
    azul: 'Azul',
    preto: 'Preto',
    alerta: 'Alerta',
    geral: 'Triagem',
  };
  return labels[color];
}

export function urgenciasManchesterTrapSlotLabel(slot: UrgenciasManchesterTrapSlot): string {
  const labels: Record<UrgenciasManchesterTrapSlot, string> = {
    amarelo_monitor: 'Amarelo',
    azul_instabilidade: 'Azul',
    verde_transporte: 'Verde',
    transferencia_ps: 'PS',
  };
  return labels[slot];
}

export function inferTriageColor(title: string, detail: string): TriageColor {
  const text = `${title} ${detail}`.toLowerCase();

  if (/vermelh|imediato|emerg[eê]ncia|risco de morte/i.test(text)) return 'vermelho';
  if (/azul|n[aã]o urgente/i.test(text)) return 'azul';
  if (/amarel|urgente.*monitor|retardado/i.test(text)) return 'amarelo';
  if (/verde|leve|ambulante|pouco urgente/i.test(text)) return 'verde';
  if (/preto|[óo]bito|expectante/i.test(text)) return 'preto';
  if (/pegadinha|inverte|confund/i.test(text)) return 'alerta';

  return 'geral';
}

export function inferUrgenciasManchesterTrapSlot(
  label: string,
  detail: string,
  correct: string,
): UrgenciasManchesterTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();

  if (/amarel|monitor|dispensa/i.test(text)) return 'amarelo_monitor';
  if (/azul|inst[aá]vel|instabilidade/i.test(text)) return 'azul_instabilidade';
  if (/verde|transporte|agilidade/i.test(text)) return 'verde_transporte';
  if (/transfer|pronto.?socorro|ps\b|manchester.*tempo/i.test(text)) {
    return 'transferencia_ps';
  }

  return 'amarelo_monitor';
}
