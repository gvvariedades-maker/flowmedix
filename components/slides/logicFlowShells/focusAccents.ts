/**
 * Paletas e títulos de passo — shells Focus / Rail (convergência logic_flow).
 * Extraído de LogicFlowStepLadder para reuso sem duplicar accent maps.
 */

export type LogicFlowShellAccent =
  | 'default'
  | 'sonda'
  | 'urgencias'
  | 'xabcde'
  | 'stroke'
  | 'shock'
  | 'choking'
  | 'pediatric'
  | 'cam'
  | 'seguranca'
  | 'clinical';

export const FOCUS_ACCENTS = {
  default: {
    connector: 'from-blue-300/50',
    activeRing: 'ring-blue-200/60',
    activeNode: 'from-blue-500 to-blue-700 shadow-blue-300/50',
    activeCard:
      'border-blue-300/80 border-l-blue-500 from-blue-50 via-white to-sky-50/90 shadow-blue-200/40 ring-blue-200/50',
    activeLabel: 'text-blue-700',
    futureNode: 'border-blue-200/90 from-blue-50 to-white text-blue-400',
    tapBtn: 'from-emerald-600 to-teal-600 shadow-emerald-300/40',
    progressActive: 'bg-blue-500',
    chip: 'bg-blue-100 text-blue-900',
  },
  clinical: {
    connector: 'from-teal-300/50',
    activeRing: 'ring-teal-200/60',
    activeNode: 'from-teal-500 to-cyan-700 shadow-teal-300/50',
    activeCard:
      'border-teal-300/80 border-l-teal-500 from-teal-50 via-white to-cyan-50/90 shadow-teal-200/40 ring-teal-200/50',
    activeLabel: 'text-teal-800',
    futureNode: 'border-teal-200/90 from-teal-50 to-white text-teal-400',
    tapBtn: 'from-teal-600 to-cyan-600 shadow-teal-300/40',
    progressActive: 'bg-teal-500',
    chip: 'bg-teal-100 text-teal-900',
  },
  sonda: {
    connector: 'from-indigo-300/50',
    activeRing: 'ring-indigo-200/60',
    activeNode: 'from-indigo-500 to-violet-700 shadow-indigo-300/50',
    activeCard:
      'border-indigo-300/80 border-l-indigo-500 from-indigo-50 via-white to-violet-50/90 shadow-indigo-200/40 ring-indigo-200/50',
    activeLabel: 'text-indigo-800',
    futureNode: 'border-indigo-200/90 from-indigo-50 to-white text-indigo-400',
    tapBtn: 'from-indigo-600 to-violet-600 shadow-indigo-300/40',
    progressActive: 'bg-indigo-500',
    chip: 'bg-indigo-100 text-indigo-900',
  },
  urgencias: {
    connector: 'from-rose-300/50',
    activeRing: 'ring-rose-200/60',
    activeNode: 'from-rose-500 to-rose-700 shadow-rose-300/50',
    activeCard:
      'border-rose-300/80 border-l-rose-500 from-rose-50 via-white to-pink-50/90 shadow-rose-200/40 ring-rose-200/50',
    activeLabel: 'text-rose-800',
    futureNode: 'border-rose-200/90 from-rose-50 to-white text-rose-400',
    tapBtn: 'from-rose-600 to-red-600 shadow-rose-300/40',
    progressActive: 'bg-rose-500',
    chip: 'bg-rose-100 text-rose-900',
  },
  xabcde: {
    connector: 'from-orange-300/50',
    activeRing: 'ring-orange-200/60',
    activeNode: 'from-orange-500 to-amber-700 shadow-orange-300/50',
    activeCard:
      'border-orange-300/80 border-l-orange-500 from-orange-50 via-white to-amber-50/90 shadow-orange-200/40 ring-orange-200/50',
    activeLabel: 'text-orange-900',
    futureNode: 'border-orange-200/90 from-orange-50 to-white text-orange-400',
    tapBtn: 'from-orange-600 to-amber-600 shadow-orange-300/40',
    progressActive: 'bg-orange-500',
    chip: 'bg-orange-100 text-orange-900',
  },
  stroke: {
    connector: 'from-violet-300/50',
    activeRing: 'ring-violet-200/60',
    activeNode: 'from-violet-500 to-purple-700 shadow-violet-300/50',
    activeCard:
      'border-violet-300/80 border-l-violet-500 from-violet-50 via-white to-purple-50/90 shadow-violet-200/40 ring-violet-200/50',
    activeLabel: 'text-violet-900',
    futureNode: 'border-violet-200/90 from-violet-50 to-white text-violet-400',
    tapBtn: 'from-violet-600 to-purple-600 shadow-violet-300/40',
    progressActive: 'bg-violet-500',
    chip: 'bg-violet-100 text-violet-900',
  },
  shock: {
    connector: 'from-amber-300/50',
    activeRing: 'ring-amber-200/60',
    activeNode: 'from-amber-500 to-yellow-700 shadow-amber-300/50',
    activeCard:
      'border-amber-300/80 border-l-amber-500 from-amber-50 via-white to-yellow-50/90 shadow-amber-200/40 ring-amber-200/50',
    activeLabel: 'text-amber-900',
    futureNode: 'border-amber-200/90 from-amber-50 to-white text-amber-400',
    tapBtn: 'from-amber-600 to-yellow-600 shadow-amber-300/40',
    progressActive: 'bg-amber-500',
    chip: 'bg-amber-100 text-amber-900',
  },
  choking: {
    connector: 'from-cyan-300/50',
    activeRing: 'ring-cyan-200/60',
    activeNode: 'from-cyan-500 to-sky-700 shadow-cyan-300/50',
    activeCard:
      'border-cyan-300/80 border-l-cyan-500 from-cyan-50 via-white to-sky-50/90 shadow-cyan-200/40 ring-cyan-200/50',
    activeLabel: 'text-cyan-900',
    futureNode: 'border-cyan-200/90 from-cyan-50 to-white text-cyan-400',
    tapBtn: 'from-cyan-600 to-sky-600 shadow-cyan-300/40',
    progressActive: 'bg-cyan-500',
    chip: 'bg-cyan-100 text-cyan-900',
  },
  pediatric: {
    connector: 'from-pink-300/50',
    activeRing: 'ring-pink-200/60',
    activeNode: 'from-pink-500 to-rose-700 shadow-pink-300/50',
    activeCard:
      'border-pink-300/80 border-l-pink-500 from-pink-50 via-white to-rose-50/90 shadow-pink-200/40 ring-pink-200/50',
    activeLabel: 'text-pink-900',
    futureNode: 'border-pink-200/90 from-pink-50 to-white text-pink-400',
    tapBtn: 'from-pink-600 to-rose-600 shadow-pink-300/40',
    progressActive: 'bg-pink-500',
    chip: 'bg-pink-100 text-pink-900',
  },
  cam: {
    connector: 'from-amber-300/50',
    activeRing: 'ring-amber-200/60',
    activeNode: 'from-amber-500 to-orange-700 shadow-amber-300/50',
    activeCard:
      'border-amber-300/80 border-l-amber-500 from-amber-50 via-white to-orange-50/90 shadow-amber-200/40 ring-amber-200/50',
    activeLabel: 'text-amber-900',
    futureNode: 'border-amber-200/90 from-amber-50 to-white text-amber-400',
    tapBtn: 'from-amber-600 to-orange-600 shadow-amber-300/40',
    progressActive: 'bg-amber-500',
    chip: 'bg-amber-100 text-amber-900',
  },
  seguranca: {
    connector: 'from-amber-300/50',
    activeRing: 'ring-amber-200/60',
    activeNode: 'from-amber-500 to-amber-700 shadow-amber-300/50',
    activeCard:
      'border-amber-300/80 border-l-amber-500 from-amber-50 via-white to-yellow-50/90 shadow-amber-200/40 ring-amber-200/50',
    activeLabel: 'text-amber-900',
    futureNode: 'border-amber-200/90 from-amber-50 to-white text-amber-400',
    tapBtn: 'from-amber-600 to-yellow-600 shadow-amber-300/40',
    progressActive: 'bg-amber-500',
    chip: 'bg-amber-100 text-amber-900',
  },
} as const satisfies Record<
  LogicFlowShellAccent,
  {
    connector: string;
    activeRing: string;
    activeNode: string;
    activeCard: string;
    activeLabel: string;
    futureNode: string;
    tapBtn: string;
    progressActive: string;
    chip: string;
  }
>;

/** Accents that always apply PROTOCOL_TAP_BUDGET in Focus/Rail shells. */
export const PROTOCOL_SHELL_ACCENTS: ReadonlySet<LogicFlowShellAccent> = new Set([
  'xabcde',
  'urgencias',
  'stroke',
  'shock',
  'choking',
  'pediatric',
  'seguranca',
  'sonda',
  'clinical',
]);

export function focusStepTitle(
  step: string,
  index: number,
  accent: LogicFlowShellAccent,
): string {
  const lower = step.toLowerCase();
  if (accent === 'sonda') {
    if (/julgar\s+i\b|afirmativa i|item i\b/.test(lower)) return 'Julgar afirmativa I';
    if (/julgar\s+ii\b|afirmativa ii/.test(lower)) return 'Julgar afirmativa II';
    if (/julgar\s+iii\b|afirmativa iii/.test(lower)) return 'Julgar afirmativa III';
    if (/nex|xifoide|orelha/.test(lower)) return 'Medida NEX';
    if (/fowler|broncoaspira/.test(lower)) return 'Posição Fowler';
    if (/radiograf|ausculta|padrão-ouro|padrao-ouro/.test(lower)) return 'Confirmação da sonda';
    if (/combinar|eliminar/.test(lower)) return 'Montar combinação V/F';
  }
  if (accent === 'urgencias') {
    if (/seguran[cç]a|responsiv|respira[cç][aã]o|inconsci/i.test(lower)) return 'Segurança + checagem';
    if (/192|samu|socorro|equipe|dea/i.test(lower)) return 'Acionar ajuda';
    if (/compress|100|120|5.?6\s*cm/i.test(lower)) return 'Compressões de qualidade';
    if (/30:2|ventila/i.test(lower)) return 'Ventilar 30:2';
    if (/pulso|ciclo|2\s*min/i.test(lower)) return 'Pulso — pegadinha';
    if (/eliminar|falsa|verdadeira|julgar/i.test(lower)) return 'Julgar afirmativa';
    if (/letra|gabarito|marcar/i.test(lower)) return 'Montar gabarito';
    if (/fixa[cç][aã]o/i.test(lower)) return 'Fixação RCP';
  }
  if (accent === 'xabcde') {
    if (/comando|trauma|pr[eé].?hospitalar/i.test(lower)) return 'Ler o comando trauma';
    if (/^a\b|torniquete|pesco[cç]o|hemorragia/i.test(lower)) return 'Eliminar A — hemorragia';
    if (/^b\b|tra[cç][aã]o|f[eê]mur|fratura|alinhamento/i.test(lower)) return 'Eliminar B — fratura';
    if (/^d\b|objeto|abdome|retirar|encravad/i.test(lower)) return 'Eliminar D — corpo estranho';
    if (/^c\b|queimadura|[áa]gua corrente|verdadeira/i.test(lower)) return 'Validar C — queimadura';
    if (/marcar|gabarito|letra/i.test(lower)) return 'Montar gabarito';
    if (/fixa[cç][aã]o|n[aã]o piorar/i.test(lower)) return 'Fixação trauma';
  }
  if (accent === 'stroke') {
    if (/comando|cincinnati|tr[eê]s itens/i.test(lower)) return 'Ler o comando AVC';
    if (/face|sorriso|bra[cç]o|fala|speech|arms/i.test(lower)) return 'Mnemônico F·A·S';
    if (/men[ií]ngea|cefaleia|nuca|v[oô]mito/i.test(lower)) return 'Eliminar meníngea';
    if (/tor[aá]cic|iam|dispneia|sudorese/i.test(lower)) return 'Eliminar IAM';
    if (/glasgow|gcs|consci[eê]ncia/i.test(lower)) return 'Eliminar Glasgow';
    if (/ssvv|press[aã]o|frequ[eê]ncia/i.test(lower)) return 'Eliminar SSVV';
    if (/marcar|gabarito|letra/i.test(lower)) return 'Montar gabarito';
    if (/fixa[cç][aã]o|samu/i.test(lower)) return 'Fixação Cincinnati';
  }
  if (accent === 'shock') {
    if (/comando|primeira conduta|1ª/i.test(lower)) return 'Ler o comando';
    if (/seguran[cç]a|interromper|n[aã]o tocar|circuito/i.test(lower)) return 'Segurança da cena';
    if (/^a\b|afrouxar|roupa/i.test(lower)) return 'Eliminar A';
    if (/^b\b|rcp|massagem|boca a boca/i.test(lower)) return 'Eliminar B — RCP cedo';
    if (/^c\b|enrolar|pano/i.test(lower)) return 'Eliminar C';
    if (/^d\b|verdadeira|certificar/i.test(lower)) return 'Validar D';
    if (/marcar|gabarito|letra/i.test(lower)) return 'Montar gabarito';
    if (/fixa[cç][aã]o|energia/i.test(lower)) return 'Fixação elétrico';
  }
  if (accent === 'choking') {
    if (/comando|sinal universal|m[aã]os/i.test(lower)) return 'Ler o comando';
    if (/pesco[cç]o|garganta|sufoc/i.test(lower)) return 'Sinal da vítima';
    if (/calc[aâ]neo|joelho|deltoide/i.test(lower)) return 'Eliminar distrator';
    if (/abdome|heimlich/i.test(lower)) return 'Eliminar abdome';
    if (/marcar|gabarito|letra/i.test(lower)) return 'Montar gabarito';
    if (/fixa[cç][aã]o|manobra/i.test(lower)) return 'Fixação sinal × manobra';
  }
  if (accent === 'pediatric') {
    if (/comando|pedi[aá]tr|lactente|pcr/i.test(lower)) return 'Ler o comando pediátrico';
    if (/15:2|propor[cç][aã]o|30:2/i.test(lower)) return 'Eixo proporção';
    if (/ter[cç]o|1\/3|profundidade|metade/i.test(lower)) return 'Eixo profundidade';
    if (/100.?120|frequ[eê]ncia|retorno/i.test(lower)) return 'Qualidade compressão';
    if (/eliminar|falsa|verdadeira/i.test(lower)) return 'Eliminar distrator';
    if (/marcar|gabarito|letra/i.test(lower)) return 'Montar gabarito';
    if (/fixa[cç][aã]o|cruzar/i.test(lower)) return 'Fixação 15:2 × terço';
  }
  if (accent === 'cam') {
    if (/contexto|alto risco|confer[eê]ncia dupla/i.test(lower)) return 'Conferência dupla';
    if (/eliminar letra/i.test(lower)) {
      const m = step.match(/letra\s*([A-E])/i);
      return m ? `Eliminar letra ${m[1].toUpperCase()}` : 'Eliminar distrator';
    }
    if (/confirmar letra/i.test(lower)) {
      const m = step.match(/letra\s*([A-E])/i);
      return m ? `Confirmar letra ${m[1].toUpperCase()}` : 'Confirmar gabarito';
    }
    if (/fixa[cç][aã]o/i.test(lower)) return 'Fixação técnica';
  }
  if (accent === 'seguranca') {
    if (/dois identificador|pulseira|leito/i.test(lower)) return 'Identificação segura';
    if (/\bmorse\b|queda|risco de queda/i.test(lower)) return 'Avaliar risco de queda';
    if (/evento adverso|incidente|near miss|\bpnsp\b/i.test(lower)) return 'Classificar incidente';
    if (/eliminar|falsa|verdadeira|julgar/i.test(lower)) return 'Julgar afirmativa';
    if (/marcar|gabarito|letra/i.test(lower)) return 'Montar gabarito';
    if (/fixa[cç][aã]o/i.test(lower)) return 'Fixação NSP';
  }
  if (index === 0 || /ler o comando|ler a afirmativa|ler o enunciado/i.test(lower)) {
    return 'Ler o comando da questão';
  }
  if (/gabarito|identificar gabarito|marcar letra/i.test(lower)) {
    return 'Identificar o gabarito';
  }
  if (/testar letra|eliminar/i.test(lower)) {
    const m = step.match(/letra\s*([A-E])/i);
    return m ? `Testar letra ${m[1].toUpperCase()}` : 'Eliminar distrator';
  }
  if (/fixação|fixar/i.test(lower)) {
    return 'Fixação do tema';
  }
  return `Passo ${index + 1}`;
}
