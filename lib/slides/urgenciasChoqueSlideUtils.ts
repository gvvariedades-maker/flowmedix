/** Utilitários de slot para moldes L3 — Urgências / choque (elétrico × hipoperfusão). */

export type ShockDeckSlot =
  | 'eletrico'
  | 'hipovolemico'
  | 'cardiogenico'
  | 'distributivo'
  | 'seguranca'
  | 'alerta'
  | 'geral';

export const SHOCK_DECK_SLOTS: ShockDeckSlot[] = [
  'seguranca',
  'eletrico',
  'hipovolemico',
  'cardiogenico',
  'distributivo',
];

export type UrgenciasShockTrapSlot =
  | 'seguranca_cena'
  | 'rcp_prematura'
  | 'conduta_tardia'
  | 'tipo_confusao';

export const URGENCIAS_SHOCK_TRAP_SLOTS: UrgenciasShockTrapSlot[] = [
  'seguranca_cena',
  'rcp_prematura',
  'conduta_tardia',
  'tipo_confusao',
];

export function shockDeckSlotLabel(slot: ShockDeckSlot): string {
  const labels: Record<ShockDeckSlot, string> = {
    eletrico: 'Elétrico',
    hipovolemico: 'Hipovolêmico',
    cardiogenico: 'Cardiogênico',
    distributivo: 'Distributivo',
    seguranca: 'Segurança',
    alerta: 'Alerta',
    geral: 'Choque',
  };
  return labels[slot];
}

export function urgenciasShockTrapSlotLabel(slot: UrgenciasShockTrapSlot): string {
  const labels: Record<UrgenciasShockTrapSlot, string> = {
    seguranca_cena: 'Cena',
    rcp_prematura: 'RCP cedo',
    conduta_tardia: 'Conduta tardia',
    tipo_confusao: 'Semântica',
  };
  return labels[slot];
}

export function inferShockDeckSlot(title: string, detail: string): ShockDeckSlot {
  const text = `${title} ${detail}`.toLowerCase();

  if (/seguran[cç]a|interromper|desligar|n[aã]o tocar|circuito|fonte energ/i.test(text)) {
    return 'seguranca';
  }
  if (/el[eé]tric|corrente|energiza|eletrocut/i.test(text)) return 'eletrico';
  if (/hipovol[eê]m|sangramento|hemorragia|desidrata/i.test(text)) return 'hipovolemico';
  if (/cardiog[eê]n|infarto|iam|bomba/i.test(text)) return 'cardiogenico';
  if (/distribut|s[eé]ptico|anafilax/i.test(text)) return 'distributivo';
  if (/pegadinha|confundir|n[aã]o [eé]/i.test(text)) return 'alerta';

  return 'geral';
}

export function inferUrgenciasShockTrapSlot(
  label: string,
  detail: string,
  correct: string,
): UrgenciasShockTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();

  if (/afrouxar|enrolar|pano|roupa/i.test(text)) return 'conduta_tardia';
  if (/rcp|massagem|boca a boca|respira[cç][aã]o.*n[aã]o/i.test(text)) return 'rcp_prematura';
  if (/hipovol[eê]m|circulat[oó]rio|taquicardia.*fria|fluido/i.test(text)) {
    return 'tipo_confusao';
  }
  if (/n[aã]o tocar|interromper|desligar|seguran[cç]a|circuito/i.test(text)) {
    return 'seguranca_cena';
  }

  return 'seguranca_cena';
}
