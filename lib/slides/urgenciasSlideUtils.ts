/** Utilitários de slot para moldes L3 — Urgências e Emergências (RCP/SBV adulto). */

export type UrgenciasSurvivalLink =
  | 'reconhecimento'
  | 'acionamento'
  | 'compressao'
  | 'ventilacao'
  | 'dea'
  | 'pos_rcp'
  | 'alerta'
  | 'geral';

export const URGENCIAS_SURVIVAL_LINKS: UrgenciasSurvivalLink[] = [
  'reconhecimento',
  'acionamento',
  'compressao',
  'ventilacao',
  'dea',
  'pos_rcp',
];

export type UrgenciasRcpTrapSlot =
  | 'pulso_intervalo'
  | 'frequencia'
  | 'profundidade'
  | 'dea_atraso'
  | 'hiperventilacao'
  | 'alternancia';

export const URGENCIAS_RCP_TRAP_SLOTS: UrgenciasRcpTrapSlot[] = [
  'pulso_intervalo',
  'frequencia',
  'profundidade',
  'dea_atraso',
  'hiperventilacao',
  'alternancia',
];

export function urgenciasSurvivalLinkLabel(link: UrgenciasSurvivalLink): string {
  const labels: Record<UrgenciasSurvivalLink, string> = {
    reconhecimento: 'Reconhecer',
    acionamento: 'Acionar',
    compressao: 'Compressões',
    ventilacao: 'Ventilar',
    dea: 'DEA',
    pos_rcp: 'Reavaliar',
    alerta: 'Alerta',
    geral: 'SBV',
  };
  return labels[link];
}

export function urgenciasRcpTrapSlotLabel(slot: UrgenciasRcpTrapSlot): string {
  const labels: Record<UrgenciasRcpTrapSlot, string> = {
    pulso_intervalo: 'Pulso',
    frequencia: 'Frequência',
    profundidade: 'Profundidade',
    dea_atraso: 'DEA',
    hiperventilacao: 'Ventilação',
    alternancia: 'Alternância',
  };
  return labels[slot];
}

export function inferUrgenciasSurvivalLink(title: string, detail: string): UrgenciasSurvivalLink {
  const text = `${title} ${detail}`.toLowerCase();

  if (/reconhec|inconsci|respira|gasps|pcr|parada card|sem pulso/i.test(text)) {
    return 'reconhecimento';
  }
  if (/192|samu|socorro|equipe|acionar|emerg[eê]ncia/i.test(text)) {
    return 'acionamento';
  }
  if (/compress|tor[aá]c|100|120|5.?6\s*cm|profundidade|retorno completo/i.test(text)) {
    return 'compressao';
  }
  if (/ventila|30:2|dois socorristas|bolsa|mascara/i.test(text)) {
    return 'ventilacao';
  }
  if (/dea|desfibril|choque|fibrila/i.test(text)) {
    return 'dea';
  }
  if (/2\s*min|reavali|transporte|p[oó]s[\s-]?rcp|alternar compressor/i.test(text)) {
    return 'pos_rcp';
  }
  if (/pegadinha|pulso.*ciclo|80.?100|4\s*cm|hiperventila/i.test(text)) {
    return 'alerta';
  }

  return 'geral';
}

export function inferUrgenciasRcpTrapSlot(
  label: string,
  detail: string,
  correct: string,
): UrgenciasRcpTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();

  if (/dea|desfibril|atras|choque/i.test(text) && !/pulso.*ciclo|ciclo.*pulso/i.test(text)) {
    return 'dea_atraso';
  }
  if (/pulso|ciclo|2\s*min|minuto/i.test(text)) return 'pulso_intervalo';
  if (/80.?100|frequ[eê]ncia|batimento|compress[oõ]es\/min|100.?120/i.test(text)) {
    return 'frequencia';
  }
  if (/4\s*cm|profundidade|5.?6\s*cm|retorno completo/i.test(text)) {
    return 'profundidade';
  }
  if (/hiperventila|excesso.*ventila|muitas ventila/i.test(text)) {
    return 'hiperventilacao';
  }
  if (/alternar|5\s*min|compressor|fadiga/i.test(text)) return 'alternancia';

  return 'pulso_intervalo';
}
