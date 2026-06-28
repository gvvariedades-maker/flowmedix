/** Utilitários de slot para moldes L3 — Doenças Respiratórias Crônicas (Asma, DPOC). */

export type RespiratorioLane = 'asma' | 'dpoc' | 'monitor' | 'crise' | 'educacao' | 'gabarito' | 'geral';

export const RESPIRATORIO_DUEL_LANES: RespiratorioLane[] = ['asma', 'dpoc', 'monitor', 'crise', 'educacao'];

export type RespiratorioTrapSlot =
  | 'spo2_alvo'
  | 'oxigenio'
  | 'asma_resgate'
  | 'tabagismo'
  | 'exacerbacao'
  | 'dispositivo';

export const RESPIRATORIO_TRAP_SLOTS: RespiratorioTrapSlot[] = [
  'spo2_alvo',
  'oxigenio',
  'asma_resgate',
  'tabagismo',
  'exacerbacao',
  'dispositivo',
];

export function respiratorioLaneLabel(lane: RespiratorioLane): string {
  const labels: Record<RespiratorioLane, string> = {
    asma: 'Asma',
    dpoc: 'DPOC',
    monitor: 'Monitor',
    crise: 'Crise',
    educacao: 'Educação',
    gabarito: 'Gabarito',
    geral: 'Geral',
  };
  return labels[lane];
}

export function respiratorioTrapSlotLabel(slot: RespiratorioTrapSlot): string {
  const labels: Record<RespiratorioTrapSlot, string> = {
    spo2_alvo: 'SpO₂ alvo',
    oxigenio: 'O₂ titulado',
    asma_resgate: 'Resgate',
    tabagismo: 'Tabagismo',
    exacerbacao: 'Exacerbação',
    dispositivo: 'Dispositivo',
  };
  return labels[slot];
}

export function inferRespiratorioLane(title: string, description: string): RespiratorioLane {
  const text = `${title} ${description}`.toLowerCase();

  if (/gabarito|letra\s+[a-e]|resposta da prova/i.test(text)) return 'gabarito';
  if (/\bdpoc\b|enfisema|bronquite cr[oô]nica|retentor|hipercapnia|88.?92|titulad/i.test(text)) {
    return 'dpoc';
  }
  if (/\basma\b|broncoespasmo|beta[\s-]?2|salbutamol|inalador de resgate|peak flow|pico de fluxo|espacador|espaçador/i.test(text)) {
    return 'asma';
  }
  if (/spo2|sato2|oximetria|ox[ií]metro|hipoxemia|saturac/i.test(text)) return 'monitor';
  if (/crise|exacerba|descompens|falta de ar|dispneia|acess[oó]ria/i.test(text)) return 'crise';
  if (/educa|tabag|dispositivo|inala|aero|t[eé]cnica|ades[aã]o/i.test(text)) return 'educacao';

  return 'geral';
}

export function inferRespiratorioTrapSlot(
  label: string,
  detail: string,
  correct: string,
): RespiratorioTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();

  if (/spo2|88.?92|95%|hiper[oó]xia|saturac/i.test(text)) return 'spo2_alvo';
  if (/o2\b|oxig[eê]nio|titulad|cat[eé]ter nasal|m[aá]scara|alto fluxo|venturi/i.test(text)) {
    return 'oxigenio';
  }
  if (/asma|beta[\s-]?2|salbutamol|resgate|broncodilat/i.test(text)) return 'asma_resgate';
  if (/tabag|cigarro|cessa[cç][aã]o|n[aã]o fume/i.test(text)) return 'tabagismo';
  if (/exacerba|descompens|crise|falta de ar|dispneia/i.test(text)) return 'exacerbacao';
  if (/espacador|espaçador|inalador|aero|dispositivo|pico de fluxo|peak flow/i.test(text)) {
    return 'dispositivo';
  }

  return 'spo2_alvo';
}

export function inferRespiratorioTrapLanes(
  label: string,
  detail: string,
  correct: string,
): { trapLanes: RespiratorioLane[]; correctLanes: RespiratorioLane[]; hasRail: boolean } {
  const trapLanes = new Set<RespiratorioLane>();
  const correctLanes = new Set<RespiratorioLane>();

  const trapLane = inferRespiratorioLane(label, detail);
  const correctLane = inferRespiratorioLane(label, correct);

  if (trapLane !== 'gabarito' && trapLane !== 'geral') trapLanes.add(trapLane);
  if (correctLane !== 'gabarito' && correctLane !== 'geral') correctLanes.add(correctLane);

  if (trapLanes.size === 0 && /dpoc|asma/i.test(`${label} ${detail}`)) {
    trapLanes.add(/dpoc/i.test(detail) ? 'dpoc' : 'asma');
  }
  if (correctLanes.size === 0 && /dpoc|asma/i.test(correct)) {
    correctLanes.add(/dpoc/i.test(correct) ? 'dpoc' : 'asma');
  }

  const trapArr = [...trapLanes];
  const correctArr = [...correctLanes];
  return {
    trapLanes: trapArr,
    correctLanes: correctArr,
    hasRail: trapArr.length > 0 || correctArr.length > 0,
  };
}
