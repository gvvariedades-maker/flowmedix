/** Slots semânticos — ramos L3 Punção Venosa (dispositivo, EXCETO, tempo, periférica, IPCS). */

// ---- Dispositivo / calibre ----
export type IvGaugeSlot = 'dispositivo' | 'calibre' | 'indicacao' | 'pediatrico' | 'pegadinha' | 'geral';

export const IV_GAUGE_VALUES = [14, 16, 18, 20, 22, 24] as const;

export function inferIvGaugeSlot(title: string, detail: string): IvGaugeSlot {
  const text = `${title} ${detail}`.toLowerCase();
  if (/gabarito|letra\s*[a-e]/.test(text)) return 'geral';
  if (/pegadinha|confund|invert|grosso.*fr[aá]gil/i.test(text)) return 'pegadinha';
  if (/pedi[aá]tr|neonat|crian[cç]a|scalp/i.test(text)) return 'pediatrico';
  if (/\b(14|16|18|20|22|24)\s*g\b|calibre|gauge|jelco/i.test(text)) return 'calibre';
  if (/volume|hemotransfus|trauma|fluxo|r[aá]pido/i.test(text)) return 'indicacao';
  if (/jelco|scalp|dispositivo|cateter perif/i.test(text)) return 'dispositivo';
  return 'geral';
}

export function extractGaugeFromText(text: string): number | null {
  const m = text.toLowerCase().match(/\b(14|16|18|20|22|24)\s*g\b/);
  return m ? Number(m[1]) : null;
}

// ---- EXCETO punção ----
export type IvExcetoSpectrumSlot = 'comando' | 'tecnica' | 'antissepsia' | 'selecao_veia' | 'intrusa' | 'geral';

export type IvExcetoTrapSlot = 'intrusa' | 'conduta_correta' | 'transferencia' | 'tecnica_errada';

export function inferIvExcetoSpectrumSlot(title: string, detail: string): IvExcetoSpectrumSlot {
  const text = `${title} ${detail}`.toLowerCase();
  if (/\bexceto\b|incorret[oa]|afirmativa\s+falsa/i.test(text)) return 'comando';
  if (/menos proeminente|intrusa|exce[cç][aã]o|errad/i.test(text)) return 'intrusa';
  if (/antissepsia|álcool|70\s*%|clorexidina/i.test(text)) return 'antissepsia';
  if (/veia|proeminente|firme|tortuosa|sele[cç][aã]o/i.test(text)) return 'selecao_veia';
  if (/bisel|pun[cç][aã]o|cateter|tentativa/i.test(text)) return 'tecnica';
  return 'geral';
}

export function inferIvExcetoTrapSlot(label: string, detail: string, correct: string): IvExcetoTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();
  if (/outra banca|em similares|transfer/i.test(text)) return 'transferencia';
  if (/menos proeminente|intrusa|exce[cç][aã]o|incorret/i.test(text)) return 'intrusa';
  if (/bisel|antissepsia|invert|errad/i.test(text)) return 'tecnica_errada';
  return 'conduta_correta';
}

// ---- Tempo / intervalos ----
export type IvIntervalSlot = 'punção' | 'equipo' | 'curativo' | 'cateter' | 'observacao' | 'geral';

export const IV_INTERVAL_MARKERS: { id: IvIntervalSlot; label: string; hours?: number }[] = [
  { id: 'punção', label: '0h', hours: 0 },
  { id: 'equipo', label: '24h', hours: 24 },
  { id: 'curativo', label: '72h', hours: 72 },
  { id: 'cateter', label: '96h+', hours: 96 },
];

export function inferIvIntervalSlot(title: string, detail: string): IvIntervalSlot {
  const text = `${title} ${detail}`.toLowerCase();
  if (/gabarito|letra\s*[a-e]/.test(text)) return 'geral';
  if (/observa[cç][aã]o|sinais|p[oó]s.?procedimento/i.test(text)) return 'observacao';
  if (/equipo|administra[cç][aã]o intermitente|sistema fechado/i.test(text)) return 'equipo';
  if (/curativo|dressing|semiperme[aá]vel/i.test(text)) return 'curativo';
  if (/perman[eê]ncia|retirada|remo[cç][aã]o.*cateter/i.test(text)) return 'cateter';
  if (/pun[cç][aã]o|inser[cç][aã]o/i.test(text)) return 'punção';
  return 'geral';
}

export function extractHoursFromText(text: string): number | null {
  const m = text.toLowerCase().match(/(\d+)\s*h(?:oras?)?/);
  return m ? Number(m[1]) : null;
}

// ---- Periférica / antissepsia ----
export type IvPunctureRailSlot =
  | 'higiene'
  | 'antissepsia'
  | 'secar'
  | 'selecao_veia'
  | 'bisel'
  | 'puncionar'
  | 'fixar'
  | 'identificar'
  | 'geral';

export const IV_PUNCTURE_RAIL_ORDER: IvPunctureRailSlot[] = [
  'higiene',
  'antissepsia',
  'secar',
  'selecao_veia',
  'bisel',
  'puncionar',
  'fixar',
  'identificar',
];

export function ivPunctureRailSlotLabel(slot: IvPunctureRailSlot): string {
  const labels: Record<IvPunctureRailSlot, string> = {
    higiene: 'Higiene',
    antissepsia: 'Antissepsia',
    secar: 'Secar',
    selecao_veia: 'Seleção',
    bisel: 'Bisel ↑',
    puncionar: 'Puncionar',
    fixar: 'Fixar',
    identificar: 'Identificar',
    geral: 'Etapa',
  };
  return labels[slot];
}

export function inferIvPunctureRailSlot(title: string, detail: string): IvPunctureRailSlot {
  const text = `${title} ${detail}`.toLowerCase();
  if (/gabarito|letra\s*[a-e]/.test(text)) return 'geral';
  if (/higieniza[cç][aã]o.*m[aã]os|lavar as m[aã]os/i.test(text)) return 'higiene';
  if (/antissepsia|álcool\s*70|clorexidina|fric[cç][aã]o/i.test(text)) return 'antissepsia';
  if (/secar|aguardar.*sec/i.test(text)) return 'secar';
  if (/veia|proeminente|firme|tortuosa|sele[cç][aã]o/i.test(text)) return 'selecao_veia';
  if (/bisel.*cima|bisel.*superior/i.test(text)) return 'bisel';
  if (/pun[cç][aã]o|inserir|avan[cç]ar/i.test(text)) return 'puncionar';
  if (/fixa[cç][aã]o|curativo|adesivo/i.test(text)) return 'fixar';
  if (/etiqueta|identifica[cç][aã]o|data.*hora/i.test(text)) return 'identificar';
  return 'geral';
}

export type IvOrderTrapSlot = 'ordem_invertida' | 'bisel' | 'cateter_reuso' | 'secagem' | 'transferencia';

export function inferIvOrderTrapSlot(label: string, detail: string, correct: string): IvOrderTrapSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();
  if (/outra banca|em similares|transfer/i.test(text)) return 'transferencia';
  if (/distal.*proximal|proximal.*distal|ordem|invert/i.test(text)) return 'ordem_invertida';
  if (/bisel.*baixo|bisel.*inferior/i.test(text)) return 'bisel';
  if (/mesmo cateter|reuso|nova tentativa/i.test(text)) return 'cateter_reuso';
  if (/sem secar|pun[cç][aã]o.*[uú]mido/i.test(text)) return 'secagem';
  return 'ordem_invertida';
}

// ---- IPCS / bundle CVC ----
export type IvBundleSlot = 'higiene' | 'barreira' | 'antissepsia' | 'curativo' | 'revisao' | 'geral';

export function inferIvBundleSlot(title: string, detail: string): IvBundleSlot {
  const text = `${title} ${detail}`.toLowerCase();
  if (/gabarito|letra\s*[a-e]/.test(text)) return 'geral';
  if (/higieniza[cç][aã]o.*m[aã]os/i.test(text)) return 'higiene';
  if (/barreira.*m[aá]xima|campo est[eé]ril|assepsia/i.test(text)) return 'barreira';
  if (/clorexidina|antissepsia/i.test(text)) return 'antissepsia';
  if (/curativo|transparente|dressing/i.test(text)) return 'curativo';
  if (/revis[aã]o|s[ií]tio|inspe[cç][aã]o di[aá]ria/i.test(text)) return 'revisao';
  return 'geral';
}

export type IvBundleBreakSlot = 'barreira' | 'curativo' | 'prazo' | 'assepsia' | 'transferencia';

export function inferIvBundleBreakSlot(label: string, detail: string, correct: string): IvBundleBreakSlot {
  const text = `${label} ${detail} ${correct}`.toLowerCase();
  if (/outra banca|em similares/i.test(text)) return 'transferencia';
  if (/barreira|campo|esteril/i.test(text)) return 'barreira';
  if (/curativo|[uú]mido|72\s*h|prazo/i.test(text)) return 'curativo';
  if (/prazo|trocar.*antes|nunca trocar/i.test(text)) return 'prazo';
  return 'assepsia';
}
