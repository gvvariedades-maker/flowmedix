/** Utilitários de slot — moldes L3 farmaco_clinico_protocolo (infusão EV). */

export type EvStationSlot =
  | 'preparo'
  | 'diluicao'
  | 'via'
  | 'tempo'
  | 'monitor'
  | 'classe'
  | 'cenario'
  | 'geral';

export type FarmacoClinicoTrapSlot =
  | 'diluente'
  | 'via'
  | 'tempo'
  | 'monitor'
  | 'interacao'
  | 'transferencia'
  | 'geral';

export const EV_STATION_ORDER: EvStationSlot[] = [
  'preparo',
  'classe',
  'cenario',
  'diluicao',
  'via',
  'tempo',
  'monitor',
];

export const FARMACO_CLINICO_TRAP_SLOTS: FarmacoClinicoTrapSlot[] = [
  'diluente',
  'via',
  'tempo',
  'monitor',
  'interacao',
  'transferencia',
];

export function evStationSlotLabel(slot: EvStationSlot): string {
  const labels: Record<EvStationSlot, string> = {
    preparo: 'Preparo',
    diluicao: 'Diluente',
    via: 'Via',
    tempo: 'Tempo',
    monitor: 'Monitor',
    classe: 'Classe',
    cenario: 'Cenário',
    geral: 'Contexto',
  };
  return labels[slot];
}

export function farmacoClinicoTrapSlotLabel(slot: FarmacoClinicoTrapSlot): string {
  const labels: Record<FarmacoClinicoTrapSlot, string> = {
    diluente: 'Diluente',
    via: 'Via',
    tempo: 'Infusão',
    monitor: 'Monitor',
    interacao: 'Interação',
    transferencia: 'Transferência',
    geral: 'Pegadinha',
  };
  return labels[slot];
}

export function inferEvStationSlot(title: string, detail: string): EvStationSlot {
  const text = `${title} ${detail}`.toLowerCase();

  if (/comando|adequad|marque|opção|opcoes|avaliar/i.test(text)) return 'preparo';
  if (/ibp|inibidor|bomba de prótons|classe farmacol|fármaco/i.test(text)) return 'classe';
  if (/úlcera|hospitaliz|uti|cenário|cenario|paciente/i.test(text)) return 'cenario';
  if (/dilui|diluent|soro|glicose|fosfato|solução/i.test(text)) return 'diluicao';
  if (/subcut|endoven|intraven|via\s|parenteral|\bev\b|\biv\b/i.test(text)) return 'via';
  if (/infus|bólus|bolus|lenta|contínua|continua|tempo/i.test(text)) return 'tempo';
  if (/monitor|ph g[aá]stric|ajuste de dose|resposta clínica|titular/i.test(text)) return 'monitor';
  if (/enfermagem|papel|núcleo|padrão|banca/i.test(text)) return 'geral';

  return 'geral';
}

export function inferFarmacoClinicoTrapSlot(
  label: string,
  detail: string,
  correct: string,
): FarmacoClinicoTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();

  if (/transfer|outras bancas|outras drogas|quadro via/i.test(text)) return 'transferencia';
  if (/fosfato|dilui|soro|glicose|solução|diluent/i.test(text)) return 'diluente';
  if (/subcut|sc\b|endoven|intraven|via\s|parenteral/i.test(text)) return 'via';
  if (/bólus|bolus|rápid|rapido|infus|tempo|contínua|continua/i.test(text)) return 'tempo';
  if (/ph g[aá]stric|monitor|ajuste|titular|gabarito|letra b/i.test(text)) return 'monitor';
  if (/alumínio|aluminio|antiácido|antiacido|potencializ|intera[cç]/i.test(text)) return 'interacao';
  if (/mecanismo|técnica|tecnica|confundir/i.test(text)) return 'transferencia';

  return 'geral';
}
