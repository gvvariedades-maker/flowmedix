/** Bundle de cateter vesical / prevenção de ITU — moldes L3 IRAS. */

export type ItuBundleSlot =
  | 'iras'
  | 'meato'
  | 'fluxo'
  | 'fechado'
  | 'posicao'
  | 'exceto'
  | 'comando'
  | 'gabarito'
  | 'geral';

export const ITU_BUNDLE_RAIL_SLOTS: readonly ItuBundleSlot[] = [
  'meato',
  'fechado',
  'fluxo',
  'posicao',
] as const;

const SLOT_LABEL: Record<ItuBundleSlot, string> = {
  iras: 'IRAS',
  meato: 'Meato',
  fluxo: 'Fluxo',
  fechado: 'Fechado',
  posicao: 'Bolsa',
  exceto: 'EXCETO',
  comando: 'Comando',
  gabarito: 'Gabarito',
  geral: 'Cuidado',
};

export function ituBundleSlotLabel(slot: ItuBundleSlot): string {
  return SLOT_LABEL[slot] ?? 'Cuidado';
}

export function inferItuBundleSlot(title: string, description: string): ItuBundleSlot {
  const text = `${title} ${description}`.toLowerCase();

  if (/comando\s+exceto|n[aã]o condiz|marque a (?:alternativa|exce)/i.test(text)) {
    return 'comando';
  }
  if (/gabarito|letra\s*[a-e]\s*[-–—]|exceto\s*[-–—]\s*letra/i.test(text)) {
    return 'gabarito';
  }
  if (
    /pin[cç]ar|fechar.*cateter|clamp|antes da remo[cç][aã]o|interromper.*drenagem/i.test(
      text,
    )
  ) {
    return 'exceto';
  }
  if (/iras|itu|infec[cç][aã]o relacionada|cateteriza[cç][aã]o vesical|sonda vesical/i.test(text)) {
    return 'iras';
  }
  if (/meato|higiene.*urin|perineal/i.test(text)) {
    return 'meato';
  }
  if (/fluxo.*desobstru|obstru[cç][aã]o|kink|torcer.*tubo/i.test(text)) {
    return 'fluxo';
  }
  if (/sistema.*fechado|drenagem fechada|est[eé]ril|barreira.*fechada/i.test(text)) {
    return 'fechado';
  }
  if (/bolsa.*abaixo|n[ií]vel da bexiga|gravidade|coletora/i.test(text)) {
    return 'posicao';
  }

  return 'geral';
}

export function extractLetterFromText(text: string): string | null {
  const m = text.match(/\bletra\s*([a-e])\b/i) || text.match(/\b([a-e])\s*[-–—]/i);
  return m ? m[1].toUpperCase() : null;
}

export type ItuLetterStatus = 'bundle_ok' | 'exceto' | 'neutral';

export function inferItuLetterStatus(
  label: string,
  value: string,
  badge?: string,
): ItuLetterStatus {
  const text = `${label} ${value}`.toLowerCase();
  if (badge === 'hot' || badge === 'warn' || /exceto|gabarito.*letra\s*d/i.test(text)) {
    return 'exceto';
  }
  if (
    badge === 'ok' ||
    /meato|fluxo|fechado|est[eé]ril|bolsa|abaixo da bexiga|cuidado correto/i.test(text)
  ) {
    return 'bundle_ok';
  }
  if (/pin[cç]ar|fechar.*cateter|remo[cç][aã]o/i.test(text)) {
    return 'exceto';
  }
  return 'neutral';
}

/** Qual elo do bundle a pegadinha viola (para danger rail). */
export function inferItuBundleViolation(
  label: string,
  detail: string,
  correct: string,
): { violated: ItuBundleSlot[]; restored: ItuBundleSlot[] } {
  const trapText = `${label} ${detail}`.toLowerCase();
  const correctText = correct.toLowerCase();

  const violated = new Set<ItuBundleSlot>();
  const restored = new Set<ItuBundleSlot>();

  if (/pin[cç]ar|fechar|clamp|remo[cç][aã]o/i.test(trapText)) {
    violated.add('fechado');
    violated.add('fluxo');
  }
  if (/meato|higiene/i.test(trapText) && !/pin[cç]ar|fechar/i.test(trapText)) {
    violated.add('meato');
  }
  if (/bolsa.*acima|n[ií]vel.*bexiga/i.test(trapText)) {
    violated.add('posicao');
  }

  if (/sistema fechado|n[aã]o pin[cç]ar|fluxo livre/i.test(correctText)) {
    restored.add('fechado');
    restored.add('fluxo');
  }
  if (/meato|higiene/i.test(correctText)) {
    restored.add('meato');
  }
  if (/abaixo da bexiga|gravidade/i.test(correctText)) {
    restored.add('posicao');
  }

  if (violated.size === 0) {
    const slot = inferItuBundleSlot(label, detail);
    if (slot !== 'geral' && slot !== 'comando' && slot !== 'gabarito' && slot !== 'iras') {
      violated.add(slot);
    }
  }

  return { violated: [...violated], restored: [...restored] };
}

/** Letra gabarito inferida dos passos do logic_flow. */
export function inferExcetoGabaritoLetter(steps: string[]): string | null {
  for (const step of steps) {
    const lower = step.toLowerCase();
    if (/gabarito|marcar letra|resposta\s*:/i.test(lower)) {
      const letter = extractLetterFromText(step);
      if (letter) return letter;
    }
  }
  for (const step of [...steps].reverse()) {
    if (/exceto|exce[cç][aã]o|falsa|incorreta/i.test(step.toLowerCase())) {
      const letter = extractLetterFromText(step);
      if (letter) return letter;
    }
  }
  return null;
}
